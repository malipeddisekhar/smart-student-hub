import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AdminDashboard = ({ adminData, onLogout, onAdminUpdate }) => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [teachers, setTeachers] = useState([]);
  const [totalTeachers, setTotalTeachers] = useState(0);
  const [allStudents, setAllStudents] = useState([]);
  const [allTeachers, setAllTeachers] = useState([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [teacherSearch, setTeacherSearch] = useState('');
  const [groupSearch, setGroupSearch] = useState('');
  const [groupStudentSearch, setGroupStudentSearch] = useState('');
  const [editGroupStudentSearch, setEditGroupStudentSearch] = useState('');
  const [groupFormYearFilter, setGroupFormYearFilter] = useState('ALL');
  const [editFormYearFilter, setEditFormYearFilter] = useState('ALL');
  const [showAllCreateGroupStudents, setShowAllCreateGroupStudents] = useState(false);
  const [showAllEditGroupStudents, setShowAllEditGroupStudents] = useState(false);
  const [colleges, setColleges] = useState([]);
  const [groups, setGroups] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [groupForm, setGroupForm] = useState({ name: '', college: 'gmrit', department: '', teacher: '', students: [] });
  const [editingGroup, setEditingGroup] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', college: 'gmrit', department: '', teacher: '', students: [] });
  const [showAdminEditModal, setShowAdminEditModal] = useState(false);
  const [savingAdminProfile, setSavingAdminProfile] = useState(false);
  const [showAllStudents, setShowAllStudents] = useState(true);
  const [selectedStudentBranch, setSelectedStudentBranch] = useState('ALL');
  const [selectedStudentGroup, setSelectedStudentGroup] = useState('ALL');
  const [lastGroupCreated, setLastGroupCreated] = useState(null);
  const [teacherDetailsForStudents, setTeacherDetailsForStudents] = useState(null);
  const [showTeacherStudentModal, setShowTeacherStudentModal] = useState(false);
  const [facultyFilterCollege, setFacultyFilterCollege] = useState('gmrit');
  const [facultyFilterDepartment, setFacultyFilterDepartment] = useState('ALL');
  const [adminProfileForm, setAdminProfileForm] = useState({
    name: '',
    email: '',
    institution: '',
    department: '',
    role: 'Super Admin',
  });
  const [dark, setDark] = useState(() => {
    try { return JSON.parse(localStorage.getItem('admin-dark-mode')) ?? true; } catch { return true; }
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  useEffect(() => { localStorage.setItem('admin-dark-mode', JSON.stringify(dark)); }, [dark]);

  useEffect(() => {
    if (!lastGroupCreated) return;
    const timer = setTimeout(() => setLastGroupCreated(null), 4000);
    return () => clearTimeout(timer);
  }, [lastGroupCreated]);

  useEffect(() => {
    fetchData();
  }, [adminData?.adminId, adminData?.institution, adminData?.department]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchData();
    }, 10000);

    const onFocus = () => fetchData();
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', onFocus);
    };
  }, [adminData?.adminId, adminData?.institution, adminData?.department]);

  const normalize = useCallback((value) => String(value || '').trim().toLowerCase(), []);

  const getSearchableStudentFields = useCallback((student) => [
    student.studentId,
    student.name,
    student.email,
    student.rollNumber,
    student.department,
    student.college,
    student.year,
    student.semester,
    student.section,
    student.cgpa,
    student.profile?.mobileNumber,
    student.profile?.collegeEmail,
  ], []);

  const matchesStudentSearch = useCallback((student, query) => {
    if (!query) return true;
    const fields = getSearchableStudentFields(student);
    return fields.some((value) => normalize(value).includes(query));
  }, [getSearchableStudentFields, normalize]);

  const getBranchCode = useCallback((department) => {
    const d = normalize(department);
    if (d.includes('aiml') || d.includes('ai ml') || d.includes('artificial intelligence')) return 'AIML';
    if (d.includes('aids') || d.includes('ai ds') || d.includes('data science')) return 'AIDS';
    if (d.includes('cse') || d.includes('computer science')) return 'CSE';
    if (d.includes('mech') || d.includes('mec') || d.includes('mechanical')) return 'MECH';
    if (d.includes('eee') || d.includes('electrical')) return 'EEE';
    if (d.includes('ece') || d.includes('electronics')) return 'ECE';
    if (d === 'it' || d.includes('information technology')) return 'IT';
    return 'OTHER';
  }, [normalize]);

  const facultyColleges = useMemo(() => {
    return ['gmrit'];
  }, []);

  const facultyDepartments = useMemo(() => {
    let departments = new Map();
    const filteredTeachers = facultyFilterCollege === 'ALL'
      ? allTeachers
      : allTeachers.filter(t => normalize(t.college) === normalize(facultyFilterCollege));
    
    filteredTeachers.forEach(teacher => {
      if (teacher.department) {
        const upperDept = String(teacher.department).trim().toUpperCase();
        if (!departments.has(upperDept)) {
          departments.set(upperDept, upperDept);
        }
      }
    });
    return Array.from(departments.values()).sort();
  }, [allTeachers, facultyFilterCollege, normalize]);

  const groupFormDepartments = useMemo(() => {
    if (!groupForm.college) return [];
    
    const deptMap = new Map();
    
    // Get departments from students
    allStudents.forEach(student => {
      if (student.college && student.department) {
        if (normalize(student.college) === normalize(groupForm.college)) {
          const upperDept = String(student.department).trim().toUpperCase();
          if (!deptMap.has(upperDept)) {
            deptMap.set(upperDept, upperDept);
          }
        }
      }
    });
    
    // Get departments from teachers
    allTeachers.forEach(teacher => {
      if (teacher.college && teacher.department) {
        if (normalize(teacher.college) === normalize(groupForm.college)) {
          const upperDept = String(teacher.department).trim().toUpperCase();
          if (!deptMap.has(upperDept)) {
            deptMap.set(upperDept, upperDept);
          }
        }
      }
    });
    
    return Array.from(deptMap.values()).sort();
  }, [groupForm.college, allStudents, allTeachers, normalize]);

  const editFormDepartments = useMemo(() => {
    if (!editForm.college) return [];
    
    const deptMap = new Map();
    
    // Get departments from students
    allStudents.forEach(student => {
      if (student.college && student.department) {
        if (normalize(student.college) === normalize(editForm.college)) {
          const upperDept = String(student.department).trim().toUpperCase();
          if (!deptMap.has(upperDept)) {
            deptMap.set(upperDept, upperDept);
          }
        }
      }
    });
    
    // Get departments from teachers
    allTeachers.forEach(teacher => {
      if (teacher.college && teacher.department) {
        if (normalize(teacher.college) === normalize(editForm.college)) {
          const upperDept = String(teacher.department).trim().toUpperCase();
          if (!deptMap.has(upperDept)) {
            deptMap.set(upperDept, upperDept);
          }
        }
      }
    });
    
    return Array.from(deptMap.values()).sort();
  }, [editForm.college, allStudents, allTeachers, normalize]);

  const allAvailableDepartments = useMemo(() => {
    const deptMap = new Map();
    
    // Get ALL departments from students
    allStudents.forEach(student => {
      if (student.department) {
        const upperDept = String(student.department).trim().toUpperCase();
        if (!deptMap.has(upperDept)) {
          deptMap.set(upperDept, upperDept);
        }
      }
    });
    
    // Get ALL departments from teachers
    allTeachers.forEach(teacher => {
      if (teacher.department) {
        const upperDept = String(teacher.department).trim().toUpperCase();
        if (!deptMap.has(upperDept)) {
          deptMap.set(upperDept, upperDept);
        }
      }
    });
    
    return Array.from(deptMap.values()).sort();
  }, [allStudents, allTeachers, normalize]);

  useEffect(() => {
    setAdminProfileForm({
      name: adminData?.name || '',
      email: adminData?.email || '',
      institution: adminData?.institution || '',
      department: adminData?.department || '',
      role: adminData?.role || 'Super Admin',
    });
  }, [adminData]);

  const getApiErrorMessage = (error, fallback) => {
    const status = error?.response?.status;
    const payload = error?.response?.data || {};
    const details = Array.isArray(payload?.details) ? payload.details.filter(Boolean) : [];
    const main = payload?.error || payload?.message || error?.message || fallback;
    if (details.length > 0) {
      return `${main} (HTTP ${status || 'N/A'})\n- ${details.join('\n- ')}`;
    }
    return `${main}${status ? ` (HTTP ${status})` : ''}`;
  };

  const fetchData = async () => {
    try {
      const [studentsRes, teachersRes, collegesRes] = await Promise.all([
        api.get('/api/admin/students'),
        api.get('/api/admin/teachers'),
        api.get('/api/colleges')
      ]);

      const allStudents = Array.isArray(studentsRes.data) ? studentsRes.data : [];
      const allTeachers = Array.isArray(teachersRes.data) ? teachersRes.data : [];

      setAllStudents(allStudents);
      setAllTeachers(allTeachers);

      setTotalStudents(allStudents.length);
      setTotalTeachers(allTeachers.length);

      const hasAdminScope = Boolean(adminData?.institution && adminData?.department);

      const filteredStudents = hasAdminScope
        ? allStudents.filter(
            (student) =>
              normalize(student.college) === normalize(adminData.institution) &&
              normalize(student.department) === normalize(adminData.department)
          )
        : allStudents;

      const filteredTeachers = hasAdminScope
        ? allTeachers.filter(
            (teacher) =>
              normalize(teacher.college) === normalize(adminData.institution) &&
              normalize(teacher.department) === normalize(adminData.department)
          )
        : allTeachers;

      // If admin scope labels don't match dataset labels, show all data instead of blank tables.
      setStudents(hasAdminScope && filteredStudents.length === 0 ? allStudents : filteredStudents);
      setTeachers(hasAdminScope && filteredTeachers.length === 0 ? allTeachers : filteredTeachers);
      
      // Filter colleges to only include gmrit
      // (standardize all variations like GMRIT, GMR INSTITUTE OF TECHNOLOGY, etc.)
      const collegeSet = new Set();
      allStudents.forEach(s => {
        if (s.college) {
          collegeSet.add('gmrit');
        }
      });
      allTeachers.forEach(t => {
        if (t.college) {
          collegeSet.add('gmrit');
        }
      });
      
      const filteredColleges = Array.from(collegeSet).sort();
      setColleges(filteredColleges);
      
      const groupsRes = await api.get(`/api/groups/${adminData.adminId}`);
      setGroups(Array.isArray(groupsRes.data) ? groupsRes.data : []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleEditStudent = async (student) => {
    const updatedName = window.prompt('Student name', student.name || '');
    if (updatedName === null) return;

    const updatedEmail = window.prompt('Student email', student.email || '');
    if (updatedEmail === null) return;

    const updatedDepartment = window.prompt('Student department', student.department || '');
    if (updatedDepartment === null) return;

    const updatedCollege = window.prompt('Student college', student.college || '');
    if (updatedCollege === null) return;

    try {
      await api.put(`/api/admin/students/${student.studentId}`, {
        name: updatedName,
        email: updatedEmail,
        department: updatedDepartment,
        college: updatedCollege,
      });
      await fetchData();
    } catch (error) {
      alert(getApiErrorMessage(error, 'Failed to update student'));
    }
  };

  const handleDeleteStudent = async (student) => {
    const confirmed = window.confirm(`Delete student ${student.name} (${student.studentId})?`);
    if (!confirmed) return;

    try {
      await api.delete(`/api/admin/students/${student.studentId}`);
      await fetchData();
    } catch (error) {
      alert(getApiErrorMessage(error, 'Failed to delete student'));
    }
  };

  const handleEditTeacher = async (teacher) => {
    const updatedName = window.prompt('Faculty name', teacher.name || '');
    if (updatedName === null) return;

    const updatedEmail = window.prompt('Faculty email', teacher.email || '');
    if (updatedEmail === null) return;

    const updatedDepartment = window.prompt('Faculty department', teacher.department || '');
    if (updatedDepartment === null) return;

    const updatedDesignation = window.prompt('Faculty designation', teacher.designation || '');
    if (updatedDesignation === null) return;

    try {
      await api.put(`/api/admin/teachers/${teacher.teacherId}`, {
        name: updatedName,
        email: updatedEmail,
        department: updatedDepartment,
        designation: updatedDesignation,
      });
      await fetchData();
    } catch (error) {
      alert(getApiErrorMessage(error, 'Failed to update faculty'));
    }
  };

  const handleDeleteTeacher = async (teacher) => {
    const confirmed = window.confirm(`Delete faculty ${teacher.name} (${teacher.teacherId})?`);
    if (!confirmed) return;

    try {
      await api.delete(`/api/admin/teachers/${teacher.teacherId}`);
      await fetchData();
    } catch (error) {
      alert(getApiErrorMessage(error, 'Failed to delete faculty'));
    }
  };

  const studentQuery = useMemo(() => normalize(studentSearch), [studentSearch, normalize]);
  const teacherQuery = useMemo(() => normalize(teacherSearch), [teacherSearch, normalize]);
  const groupQuery = useMemo(() => normalize(groupSearch), [groupSearch, normalize]);

  const studentSource = useMemo(() => showAllStudents ? allStudents : students, [showAllStudents, allStudents, students]);

  const isStudentInSelectedGroup = useCallback((studentId) => {
    if (selectedStudentGroup === 'ALL') return true;
    const selectedGroupObject = groups.find((g) => g._id === selectedStudentGroup);
    if (!selectedGroupObject) return true;
    return Array.isArray(selectedGroupObject.students) && selectedGroupObject.students.includes(studentId);
  }, [selectedStudentGroup, groups]);

  const visibleStudents = useMemo(() => 
    studentSource.filter((student) => {
      const matchesSearch = matchesStudentSearch(student, studentQuery);
      const matchesBranch =
        selectedStudentBranch === 'ALL' || getBranchCode(student.department) === selectedStudentBranch;
      const matchesGroup = isStudentInSelectedGroup(student.studentId);
      return matchesSearch && matchesBranch && matchesGroup;
    }),
    [studentSource, studentQuery, selectedStudentBranch, isStudentInSelectedGroup, matchesStudentSearch, getBranchCode]
  );

  const visibleTeachers = useMemo(() => {
    let filtered = allTeachers;
    
    // Filter by college if not ALL
    if (facultyFilterCollege !== 'ALL') {
      filtered = filtered.filter((teacher) =>
        normalize(teacher.college) === normalize(facultyFilterCollege)
      );
    }
    
    // Filter by department if not ALL
    if (facultyFilterDepartment !== 'ALL') {
      filtered = filtered.filter((teacher) =>
        normalize(teacher.department) === normalize(facultyFilterDepartment)
      );
    }
    
    // Filter by search query
    return filtered.filter((teacher) => {
      if (!teacherQuery) return true;
      return [
        teacher.teacherId,
        teacher.name,
        teacher.email,
        teacher.department,
        teacher.designation,
        teacher.college,
      ].some((value) => normalize(value).includes(teacherQuery));
    });
  }, [allTeachers, teacherQuery, facultyFilterCollege, facultyFilterDepartment, normalize]);

  const visibleGroups = useMemo(() =>
    groups.filter((group) => {
      if (!groupQuery) return true;
      return [
        group.name,
        group.teacher,
        group.college,
        group.department,
      ].some((value) => normalize(value).includes(groupQuery));
    }),
    [groups, groupQuery, normalize]
  );

  const groupStudentQuery = useMemo(() => normalize(groupStudentSearch), [groupStudentSearch, normalize]);
  const hasAdminScope = Boolean(adminData?.institution && adminData?.department);

  const scopedCreateGroupTeachers = useMemo(() => allTeachers.filter((teacher) => {
    if (groupForm.college && groupForm.department) {
      return (
        normalize(teacher.college) === normalize(groupForm.college) &&
        normalize(teacher.department) === normalize(groupForm.department)
      );
    }
    if (!hasAdminScope) return true;
    return (
      normalize(teacher.college) === normalize(adminData.institution) &&
      normalize(teacher.department) === normalize(adminData.department)
    );
  }), [allTeachers, groupForm.college, groupForm.department, hasAdminScope, adminData, normalize]);

  const eligibleCreateGroupStudents = useMemo(() => {
    // When department is selected, filter by it (primary filter)
    if (groupForm.department) {
      const selectedDeptNorm = normalize(groupForm.department);
      
      return allStudents.filter((s) => {
        if (!s.department) return false;
        const studentDeptNorm = normalize(s.department);
        return studentDeptNorm === selectedDeptNorm;
      });
    }
    
    // If nothing selected, return all students
    return allStudents || [];
  }, [groupForm.department, allStudents, normalize]);

  const eligibleCreateGroupTeachers = useMemo(() =>
    scopedCreateGroupTeachers.length > 0
      ? scopedCreateGroupTeachers
      : (teachers.length > 0 ? teachers : allTeachers),
    [scopedCreateGroupTeachers, teachers, allTeachers]
  );

  const visibleGroupStudents = useMemo(() => 
    eligibleCreateGroupStudents.filter((student) => {
      const matchesSearch = matchesStudentSearch(student, groupStudentQuery);
      const matchesYear = groupFormYearFilter === 'ALL' || String(student.year) === groupFormYearFilter;
      return matchesSearch && matchesYear;
    }),
    [eligibleCreateGroupStudents, groupStudentQuery, groupFormYearFilter, matchesStudentSearch]
  );

  const editGroupStudentQuery = useMemo(() => normalize(editGroupStudentSearch), [editGroupStudentSearch, normalize]);
  const selectedEditGroup = useMemo(() => groups.find((group) => group._id === editingGroup), [groups, editingGroup]);
  
  const scopedEditGroupStudents = useMemo(() => allStudents.filter((student) => {
    if (!selectedEditGroup) return true;
    return (
      normalize(student.college) === normalize(selectedEditGroup.college) &&
      normalize(student.department) === normalize(selectedEditGroup.department)
    );
  }), [allStudents, selectedEditGroup, normalize]);

  const scopedEditGroupTeachers = useMemo(() => allTeachers.filter((teacher) => {
    if (!selectedEditGroup) return true;
    const college = editForm.college || selectedEditGroup.college;
    const department = editForm.department || selectedEditGroup.department;
    return (
      normalize(teacher.college) === normalize(college) &&
      normalize(teacher.department) === normalize(department)
    );
  }), [allTeachers, selectedEditGroup, editForm.college, editForm.department, normalize]);

  const eligibleEditGroupStudents = useMemo(() => {
    // When department is selected, filter by it
    if (editForm.department) {
      return allStudents.filter((s) => {
        if (!s.department) return false;
        return normalize(s.department) === normalize(editForm.department);
      });
    }
    
    // If form has no selections but there's a selected group, use the group's department
    if (selectedEditGroup?.department) {
      return allStudents.filter((s) => {
        if (!s.department) return false;
        return normalize(s.department) === normalize(selectedEditGroup.department);
      });
    }
    
    // Default: return all students
    return allStudents || [];
  }, [allStudents, editForm.department, selectedEditGroup, normalize]);

  const eligibleEditGroupTeachers = useMemo(() =>
    scopedEditGroupTeachers.length > 0
      ? scopedEditGroupTeachers
      : (teachers.length > 0 ? teachers : allTeachers),
    [scopedEditGroupTeachers, teachers, allTeachers]
  );

  const visibleEditGroupStudents = useMemo(() =>
    eligibleEditGroupStudents.filter((student) => {
      const matchesSearch = matchesStudentSearch(student, editGroupStudentQuery);
      const matchesYear = editFormYearFilter === 'ALL' || String(student.year) === editFormYearFilter;
      return matchesSearch && matchesYear;
    }),
    [eligibleEditGroupStudents, editGroupStudentQuery, editFormYearFilter, matchesStudentSearch]
  );

  const getTeacherDisplayName = useCallback((teacherId) => {
    const teacher = teachers.find((t) => t.teacherId === teacherId);
    if (!teacher) return teacherId;
    const teacherBranch = teacher.department || 'No Branch';
    return `${teacher.name} (${teacherBranch})`;
  }, [teachers]);

  const getTeacherGroupCount = useCallback((teacherId) => {
    return groups.filter((group) => group.teacher === teacherId).length;
  }, [groups]);

  const getStudentGroupCount = useCallback((studentId) => {
    return groups.filter((group) => group.students?.includes(studentId)).length;
  }, [groups]);

  const getStudentsForTeacher = useCallback((teacherId) => {
    const assignedGroups = groups.filter((group) => group.teacher === teacherId);
    const studentIds = new Set(assignedGroups.flatMap((group) => group.students || []));
    return allStudents.filter((student) => studentIds.has(student.studentId));
  }, [groups, allStudents]);

  const handleSaveAdminProfile = useCallback(async (e) => {
    e.preventDefault();
    if (!adminData?.adminId) return;

    try {
      setSavingAdminProfile(true);
      const response = await api.put(`/api/admin/profile/${adminData.adminId}`, adminProfileForm);
      if (typeof onAdminUpdate === 'function') {
        onAdminUpdate(response.data);
      }
      setShowAdminEditModal(false);
      await fetchData();
    } catch (error) {
      alert(getApiErrorMessage(error, 'Failed to update admin profile'));
    } finally {
      setSavingAdminProfile(false);
    }
  }, [adminData, adminProfileForm, onAdminUpdate, getApiErrorMessage]);



  return (
    <div className={`min-h-screen transition-colors duration-300 ${dark ? 'bg-gradient-to-br from-gray-950 via-slate-900 to-gray-900' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'}`}>
      {lastGroupCreated && (
        <div className="fixed top-6 right-6 z-50 w-80">
          <div className={`rounded-xl p-4 shadow-lg border ${dark ? 'bg-slate-800 text-white border-white/10' : 'bg-white text-gray-900 border-gray-200'}`}>
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">Group Created</span>
              <button onClick={() => setLastGroupCreated(null)} className="text-gray-500 hover:text-gray-700">x</button>
            </div>
            <p className="text-sm">{lastGroupCreated.name} has been created successfully.</p>
            <p className="text-xs text-gray-500 mt-1">{new Date(lastGroupCreated.createdAt || Date.now()).toLocaleString()}</p>
          </div>
        </div>
      )}
      {/* Modern Navigation */}
      <nav className={`backdrop-blur-xl border-b shadow-lg sticky top-0 z-40 transition-colors duration-300 ${dark ? 'bg-slate-900/80 border-white/10' : 'bg-white/80 border-white/20'}`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                </svg>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className={`text-xs sm:text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Manage your institution</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={() => setShowAdminEditModal(true)}
                className={`hidden sm:flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-xl transition-all duration-200 text-sm ${dark ? 'bg-white/10 hover:bg-white/20' : 'bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100'}`}
                title="Edit admin profile"
              >
                <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">{adminData?.name?.charAt(0)}</span>
                </div>
                <span className={`text-xs sm:text-sm font-medium hidden md:inline ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Welcome</span>
              </button>
              {/* Dark mode toggle */}
              <button
                onClick={() => setDark(d => !d)}
                className={`p-2 rounded-xl transition-all duration-200 ${dark ? 'bg-white/10 hover:bg-white/20 text-yellow-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
                title={dark ? 'Light mode' : 'Dark mode'}
              >
                {dark ? (
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd"/></svg>
                ) : (
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/></svg>
                )}
              </button>
              <button 
                onClick={onLogout} 
                className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-2 sm:px-4 py-2 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base"
              >
                <svg className="w-4 h-4 inline sm:mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd"/>
                </svg>
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        {/* Modern Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <div className={`backdrop-blur-xl rounded-2xl p-4 sm:p-6 border shadow-xl ${dark ? 'bg-white/5 border-white/10' : 'bg-white/70 border-white/20'}`}>
            <div className="flex items-center justify-between gap-2 sm:gap-4">
              <div>
                <p className={`text-xs sm:text-sm font-medium mb-1 ${dark ? 'text-gray-400' : 'text-gray-600'}`}>Total Students</p>
                <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{totalStudents}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                </svg>
              </div>
            </div>
          </div>
          
          <div className={`backdrop-blur-xl rounded-2xl p-4 sm:p-6 border shadow-xl ${dark ? 'bg-white/5 border-white/10' : 'bg-white/70 border-white/20'}`}>
            <div className="flex items-center justify-between gap-2 sm:gap-4">
              <div>
                <p className={`text-xs sm:text-sm font-medium mb-1 ${dark ? 'text-gray-400' : 'text-gray-600'}`}>Total Teachers</p>
                <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{totalTeachers}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                </svg>
              </div>
            </div>
          </div>
          
          <div className={`backdrop-blur-xl rounded-2xl p-4 sm:p-6 border shadow-xl ${dark ? 'bg-white/5 border-white/10' : 'bg-white/70 border-white/20'}`}>
            <div className="flex items-center justify-between gap-2 sm:gap-4">
              <div>
                <p className={`text-xs sm:text-sm font-medium mb-1 ${dark ? 'text-gray-400' : 'text-gray-600'}`}>Active Groups</p>
                <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{groups.length}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                </svg>
              </div>
            </div>
          </div>
          
          <div className={`backdrop-blur-xl rounded-2xl p-4 sm:p-6 border shadow-xl ${dark ? 'bg-white/5 border-white/10' : 'bg-white/70 border-white/20'}`}>
            <div className="flex items-center justify-between gap-2 sm:gap-4">
              <div>
                <p className={`text-xs sm:text-sm font-medium mb-1 ${dark ? 'text-gray-400' : 'text-gray-600'}`}>System Status</p>
                <p className="text-lg sm:text-2xl font-bold text-green-500">Online</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Tab Navigation */}
        <div className={`backdrop-blur-xl rounded-2xl shadow-xl border overflow-hidden ${dark ? 'bg-white/5 border-white/10' : 'bg-white/70 border-white/20'}`}>
          <div className={`border-b ${dark ? 'border-white/10' : 'border-gray-200/50'}`}>
            <nav className="flex space-x-2 sm:space-x-8 px-2 sm:px-6 overflow-x-auto">
              {[
                { key: 'overview', label: 'Personal Info', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
                { key: 'students', label: 'Students', icon: 'M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z' },
                { key: 'teachers', label: 'Faculty', icon: 'M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z' },
                { key: 'assignments', label: 'Assignments', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
                { key: 'groups', label: 'Groups', icon: 'M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center space-x-1 sm:space-x-2 py-4 px-1 sm:px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-all duration-200 ${
                    activeTab === tab.key 
                      ? 'border-indigo-500 text-indigo-400' 
                      : dark ? 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d={tab.icon} clipRule="evenodd"/>
                  </svg>
                  <span className="hidden sm:inline">{tab.label}</span>
                  {tab.key === 'students' && (
                    <span className={`px-2 py-0.5 text-xs rounded-full ${dark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>
                      {totalStudents}
                    </span>
                  )}
                  {tab.key === 'teachers' && (
                    <span className={`px-2 py-0.5 text-xs rounded-full ${dark ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-700'}`}>
                      {totalTeachers}
                    </span>
                  )}
                  {tab.key === 'assignments' && (
                    <span className={`px-2 py-0.5 text-xs rounded-full ${dark ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-100 text-amber-700'}`}>
                      {allTeachers.filter(t => getTeacherGroupCount(t.teacherId) > 0).length}
                    </span>
                  )}
                  {tab.key === 'groups' && (
                    <span className={`px-2 py-0.5 text-xs rounded-full ${dark ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-700'}`}>
                      {groups.length}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {activeTab === 'overview' && (
            <div className="p-8">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl font-bold text-white">{adminData?.name?.charAt(0)}</span>
                  </div>
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    Admin Profile
                  </h3>
                  <p className={`${dark ? 'text-gray-400' : 'text-gray-600'}`}>Manage your administrative account</p>
                  <button
                    onClick={() => setShowAdminEditModal(true)}
                    className="mt-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-5 py-2 rounded-xl font-medium transition-all duration-200 shadow-lg"
                  >
                    Edit Profile
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className={`p-6 rounded-2xl border ${dark ? 'bg-blue-500/10 border-blue-500/20' : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100'}`}>
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                        </svg>
                      </div>
                      <h4 className={`text-lg font-semibold ${dark ? 'text-gray-200' : 'text-gray-800'}`}>Full Name</h4>
                    </div>
                    <p className={`text-2xl font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>{adminData?.name}</p>
                  </div>
                  
                  <div className={`p-6 rounded-2xl border ${dark ? 'bg-purple-500/10 border-purple-500/20' : 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100'}`}>
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h12a1 1 0 001-1V7l-7-5zM9 9a1 1 0 012 0v4a1 1 0 11-2 0V9z" clipRule="evenodd"/>
                        </svg>
                      </div>
                      <h4 className={`text-lg font-semibold ${dark ? 'text-gray-200' : 'text-gray-800'}`}>Admin ID</h4>
                    </div>
                    <p className={`text-2xl font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>{adminData?.adminId}</p>
                  </div>
                  
                  <div className={`p-6 rounded-2xl border ${dark ? 'bg-green-500/10 border-green-500/20' : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-100'}`}>
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z"/>
                        </svg>
                      </div>
                      <h4 className={`text-lg font-semibold ${dark ? 'text-gray-200' : 'text-gray-800'}`}>Institution</h4>
                    </div>
                    <p className={`text-xl font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>{adminData?.institution || 'Not specified'}</p>
                  </div>
                  
                  <div className={`p-6 rounded-2xl border ${dark ? 'bg-orange-500/10 border-orange-500/20' : 'bg-gradient-to-br from-orange-50 to-red-50 border-orange-100'}`}>
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                          <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 102 0V3h4v1a1 1 0 102 0V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 10-4.9 0h4.9zM12 9a1 1 0 100 2h3a1 1 0 100-2h-3zm-1 4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" clipRule="evenodd"/>
                        </svg>
                      </div>
                      <h4 className={`text-lg font-semibold ${dark ? 'text-gray-200' : 'text-gray-800'}`}>Department</h4>
                    </div>
                    <p className={`text-xl font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>{adminData?.department || 'Not specified'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}



          {activeTab === 'students' && (
            <div className="p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Student Management</h3>
                    <p className={`mt-1 ${dark ? 'text-gray-400' : 'text-gray-600'}`}>Manage and view all registered students</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 justify-start md:justify-end">
                    <div className={`px-4 py-2 rounded-xl ${dark ? 'bg-blue-500/10' : 'bg-gradient-to-r from-blue-50 to-cyan-50'}`}>
                      <span className={`text-sm font-medium ${dark ? 'text-blue-400' : 'text-blue-700'}`}>
                        {visibleStudents.length} / {showAllStudents ? allStudents.length : students.length} Students
                      </span>
                    </div>
                    <select
                      value={selectedStudentBranch}
                      onChange={(e) => setSelectedStudentBranch(e.target.value)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${dark ? 'bg-white/10 border border-white/10 text-gray-200' : 'bg-white border border-gray-200 text-gray-700'} focus:outline-none focus:ring-2 focus:ring-blue-500/30`}
                    >
                      <option value="ALL">All Branches</option>
                      <option value="AIML">AIML</option>
                      <option value="AIDS">AIDS</option>
                      <option value="CSE">CSE</option>
                      <option value="MECH">MEC/MECH</option>
                      <option value="EEE">EEE</option>
                      <option value="ECE">ECE</option>
                      <option value="IT">IT</option>
                    </select>
                    <select
                      value={selectedStudentGroup}
                      onChange={(e) => setSelectedStudentGroup(e.target.value)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${dark ? 'bg-white/10 border border-white/10 text-gray-200' : 'bg-white border border-gray-200 text-gray-700'} focus:outline-none focus:ring-2 focus:ring-blue-500/30`}
                    >
                      <option value="ALL">All Groups</option>
                      {groups.map((group) => (
                        <option key={group._id} value={group._id}>{group.name} ({group.students?.length || 0} students)</option>
                      ))}
                    </select>
                    <div className="relative w-full sm:w-64">
                      <input
                        type="text"
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        placeholder="Search students..."
                        className={`w-full px-4 py-2.5 pl-10 rounded-xl border transition-all duration-200 ${dark ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-blue-400/50' : 'bg-white/80 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-blue-500'} focus:outline-none focus:ring-2 focus:ring-blue-500/30`}
                      />
                      <svg className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${dark ? 'text-gray-500' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
                      </svg>
                    </div>
                  </div>
                </div>
              
              <div className={`backdrop-blur-sm rounded-2xl shadow-xl border overflow-hidden ${dark ? 'bg-white/5 border-white/10' : 'bg-white/80 border-white/20'}`}>
                <div className="overflow-x-auto">
                  <table className="w-full table-fixed">
                    <thead className={`${dark ? 'bg-white/5' : 'bg-gradient-to-r from-gray-50 to-gray-100'}`}>
                      <tr>
                        <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${dark ? 'text-gray-400' : 'text-gray-600'}`}>Student ID</th>
                        <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${dark ? 'text-gray-400' : 'text-gray-600'}`}>Name</th>
                        <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${dark ? 'text-gray-400' : 'text-gray-600'}`}>Email</th>
                        <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${dark ? 'text-gray-400' : 'text-gray-600'}`}>Department</th>
                        <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${dark ? 'text-gray-400' : 'text-gray-600'}`}>College</th>
                        <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${dark ? 'text-gray-400' : 'text-gray-600'}`}>Group Count</th>
                        <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${dark ? 'text-gray-400' : 'text-gray-600'}`}>Actions</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${dark ? 'divide-white/10' : 'divide-gray-200'}`}>
                      {visibleStudents.map((student, index) => (
                        <tr key={student._id} className={`transition-colors duration-200 ${dark ? (index % 2 === 0 ? 'bg-white/[0.02]' : 'bg-transparent') + ' hover:bg-white/5' : (index % 2 === 0 ? 'bg-white/50' : 'bg-gray-50/30') + ' hover:bg-blue-50/50'}`}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mr-3">
                                <span className="text-white text-xs font-bold">{student.name?.charAt(0)}</span>
                              </div>
                              <span className={`text-sm font-medium ${dark ? 'text-gray-200' : 'text-gray-900'}`}>{student.studentId}</span>
                            </div>
                          </td>
                          <td title={student.name} className={`px-6 py-4 whitespace-nowrap text-sm font-medium truncate max-w-[220px] ${dark ? 'text-gray-200' : 'text-gray-900'}`}>{student.name}</td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm truncate max-w-[240px] ${dark ? 'text-gray-400' : 'text-gray-600'}`}>{student.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${dark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-800'}`}>
                              {student.department}
                            </span>
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${dark ? 'text-gray-400' : 'text-gray-600'}`}>{student.college}</td>
                          <td className={`px-6 py-4 whitespace-nowrap ${dark ? 'text-gray-200' : 'text-gray-800'}`}>{getStudentGroupCount(student.studentId)}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2 min-w-[150px]">
                              <button
                                onClick={() => handleEditStudent(student)}
                                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 transition-all duration-200"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteStudent(student)}
                                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 transition-all duration-200"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {visibleStudents.length === 0 && (
                        <tr>
                          <td colSpan="7" className={`px-6 py-8 text-center text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                            No students found for this search.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'teachers' && (
            <div className="p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Faculty Management</h3>
                  <p className={`mt-1 ${dark ? 'text-gray-400' : 'text-gray-600'}`}>Manage and view all faculty members</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`px-4 py-2 rounded-xl ${dark ? 'bg-green-500/10' : 'bg-gradient-to-r from-green-50 to-emerald-50'}`}>
                    <span className={`text-sm font-medium ${dark ? 'text-green-400' : 'text-green-700'}`}>{visibleTeachers.length} / {totalTeachers} Faculty</span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={teacherSearch}
                      onChange={(e) => setTeacherSearch(e.target.value)}
                      placeholder="Search faculty..."
                      className={`w-64 px-4 py-2.5 pl-10 rounded-xl border transition-all duration-200 ${dark ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-green-400/50' : 'bg-white/80 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-green-500'} focus:outline-none focus:ring-2 focus:ring-green-500/30`}
                    />
                    <svg className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${dark ? 'text-gray-500' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="mb-4 flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <label className={`block text-sm font-semibold mb-2 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>College</label>
                  <div className={`w-full px-4 py-2.5 border rounded-xl ${dark ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-white/10 text-white' : 'bg-white/80 border-gray-200 text-gray-900'} font-semibold`}>
                    gmrit
                  </div>
                </div>
                
                <div className="flex-1">
                  <label className={`block text-sm font-semibold mb-2 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Filter by Department</label>
                  <select
                    value={facultyFilterDepartment}
                    onChange={(e) => setFacultyFilterDepartment(e.target.value)}
                    className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${dark ? 'bg-slate-800 border-white/10 text-white' : 'bg-white/50 border-gray-200 text-gray-900'}`}
                  >
                    <option value="ALL">All Departments</option>
                    {facultyDepartments.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex-1">
                  <label className={`block text-sm font-semibold mb-2 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>&nbsp;</label>
                  <button
                    onClick={() => {
                      setFacultyFilterCollege('gmrit');
                      setFacultyFilterDepartment('ALL');
                      setTeacherSearch('');
                    }}
                    className="w-full px-4 py-2.5 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 font-semibold text-sm"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
              
              <div className={`backdrop-blur-sm rounded-2xl shadow-xl border overflow-hidden ${dark ? 'bg-white/5 border-white/10' : 'bg-white/80 border-white/20'}`}>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1100px]">
                    <thead className={`${dark ? 'bg-white/5' : 'bg-gradient-to-r from-gray-50 to-gray-100'}`}>
                      <tr>
                        <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${dark ? 'text-gray-400' : 'text-gray-600'}`}>Teacher ID</th>
                        <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${dark ? 'text-gray-400' : 'text-gray-600'}`}>Name</th>
                        <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${dark ? 'text-gray-400' : 'text-gray-600'}`}>Email</th>
                        <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${dark ? 'text-gray-400' : 'text-gray-600'}`}>Department</th>
                        <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${dark ? 'text-gray-400' : 'text-gray-600'}`}>Designation</th>
                        <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${dark ? 'text-gray-400' : 'text-gray-600'}`}>Group Count</th>
                        <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${dark ? 'text-gray-400' : 'text-gray-600'}`}>Actions</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${dark ? 'divide-white/10' : 'divide-gray-200'}`}>
                      {visibleTeachers.map((teacher, index) => (
                        <tr key={teacher._id} className={`transition-colors duration-200 ${dark ? (index % 2 === 0 ? 'bg-white/[0.02]' : 'bg-transparent') + ' hover:bg-white/5' : (index % 2 === 0 ? 'bg-white/50' : 'bg-gray-50/30') + ' hover:bg-green-50/50'}`}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mr-3">
                                <span className="text-white text-xs font-bold">{teacher.name?.charAt(0)}</span>
                              </div>
                              <span className={`text-sm font-medium ${dark ? 'text-gray-200' : 'text-gray-900'}`}>{teacher.teacherId}</span>
                            </div>
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${dark ? 'text-gray-200' : 'text-gray-900'}`}>{teacher.name}</td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${dark ? 'text-gray-400' : 'text-gray-600'}`}>{teacher.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${dark ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-800'}`}>
                              {teacher.department}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${dark ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-800'}`}>
                              {teacher.designation}
                            </span>
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap ${dark ? 'text-gray-200' : 'text-gray-800'}`}>
                            {getTeacherGroupCount(teacher.teacherId)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2 min-w-[200px]">
                              <button
                                onClick={() => {
                                  setTeacherDetailsForStudents({
                                    teacher,
                                    students: getStudentsForTeacher(teacher.teacherId)
                                  });
                                  setShowTeacherStudentModal(true);
                                }}
                                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 transition-all duration-200"
                              >
                                Assigned Students
                              </button>
                              <button
                                onClick={() => handleEditTeacher(teacher)}
                                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 transition-all duration-200"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteTeacher(teacher)}
                                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 transition-all duration-200"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {visibleTeachers.length === 0 && (
                        <tr>
                          <td colSpan="7" className={`px-6 py-8 text-center text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                            No faculty found for this search.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {showTeacherStudentModal && teacherDetailsForStudents && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
              <div className={`w-full max-w-lg rounded-2xl p-5 shadow-2xl ${dark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-bold">{teacherDetailsForStudents.teacher.name} - Assigned Students</h4>
                  <button onClick={() => setShowTeacherStudentModal(false)} className="text-gray-400 hover:text-gray-600">x</button>
                </div>
                {teacherDetailsForStudents.students.length === 0 ? (
                  <p className="text-sm text-gray-400">No students assigned to this teacher yet.</p>
                ) : (
                  <div className="max-h-72 overflow-y-auto space-y-2">
                    {teacherDetailsForStudents.students.map((student) => (
                      <div key={student.studentId} className={`rounded-lg border p-3 ${dark ? 'border-white/10' : 'border-gray-200'}`}>
                        <p className="font-medium">{student.name} ({student.studentId})</p>
                        <p className="text-xs text-gray-500">{student.department} - {student.college}</p>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-4 text-right">
                  <button onClick={() => setShowTeacherStudentModal(false)} className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700">Close</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'assignments' && (
            <div className="p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">Teacher Assignments</h3>
                  <p className={`mt-1 ${dark ? 'text-gray-400' : 'text-gray-600'}`}>View and manage all teacher group and student assignments</p>
                </div>
                <div className={`px-4 py-2 rounded-xl ${dark ? 'bg-amber-500/10' : 'bg-gradient-to-r from-amber-50 to-orange-50'}`}>
                  <span className={`text-sm font-medium ${dark ? 'text-amber-400' : 'text-amber-700'}`}>{allTeachers.filter(t => getTeacherGroupCount(t.teacherId) > 0).length} Assigned Teachers</span>
                </div>
              </div>

              <div className="space-y-4">
                {allTeachers
                  .filter(teacher => getTeacherGroupCount(teacher.teacherId) > 0)
                  .map((teacher) => {
                    const groupCount = getTeacherGroupCount(teacher.teacherId);
                    const studentCount = getStudentsForTeacher(teacher.teacherId).length;
                    const teacherGroups = groups.filter(g => g.teacher === teacher.teacherId);
                    return (
                      <div key={teacher.teacherId} className={`backdrop-blur-sm rounded-2xl border p-6 transition-all duration-200 ${dark ? 'bg-white/5 border-white/10 hover:bg-white/8' : 'bg-white/80 border-white/20 hover:bg-white/90'}`}>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center gap-4 md:col-span-2">
                            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                              <span className="text-white font-bold text-lg">{teacher.name?.charAt(0)}</span>
                            </div>
                            <div>
                              <h4 className={`text-lg font-bold ${dark ? 'text-gray-200' : 'text-gray-800'}`}>{teacher.name}</h4>
                              <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-600'}`}>{teacher.designation}</p>
                              <p className={`text-xs ${dark ? 'text-gray-500' : 'text-gray-500'}`}>{teacher.department} | {teacher.college}</p>
                            </div>
                          </div>
                          <div className={`rounded-xl p-3 ${dark ? 'bg-blue-500/10' : 'bg-blue-100/50'}`}>
                            <p className={`text-xs font-semibold ${dark ? 'text-blue-300' : 'text-blue-700'}`}>Groups Assigned</p>
                            <p className={`text-2xl font-bold ${dark ? 'text-blue-400' : 'text-blue-600'}`}>{groupCount}</p>
                          </div>
                          <div className={`rounded-xl p-3 ${dark ? 'bg-green-500/10' : 'bg-green-100/50'}`}>
                            <p className={`text-xs font-semibold ${dark ? 'text-green-300' : 'text-green-700'}`}>Students Assigned</p>
                            <p className={`text-2xl font-bold ${dark ? 'text-green-400' : 'text-green-600'}`}>{studentCount}</p>
                          </div>
                        </div>

                        {teacherGroups.length > 0 && (
                          <div className={`border-t ${dark ? 'border-white/10' : 'border-gray-200'} pt-4`}>
                            <p className={`text-sm font-semibold mb-3 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Assigned Groups:</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {teacherGroups.map((group) => (
                                <div key={group._id} className={`rounded-lg p-2 flex items-center justify-between ${dark ? 'bg-white/5 border border-white/10' : 'bg-gray-100 border border-gray-200'}`}>
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded flex items-center justify-center">
                                      <span className="text-white text-xs font-bold">{group.name?.charAt(0)}</span>
                                    </div>
                                    <div>
                                      <p className={`text-sm font-medium ${dark ? 'text-gray-300' : 'text-gray-700'}`}>{group.name}</p>
                                      <p className={`text-xs ${dark ? 'text-gray-500' : 'text-gray-500'}`}>{group.students?.length || 0} students</p>
                                    </div>
                                  </div>
                                  <div className={`px-2 py-1 rounded text-xs font-semibold ${dark ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-700'}`}>
                                    {group.department}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {studentCount > 0 && (
                          <div className={`border-t ${dark ? 'border-white/10' : 'border-gray-200'} pt-4 mt-4`}>
                            <p className={`text-sm font-semibold mb-3 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Assigned Students ({studentCount}):</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                              {getStudentsForTeacher(teacher.teacherId).map((student) => (
                                <div key={student.studentId} className={`rounded-lg p-2 ${dark ? 'bg-white/5 border border-white/10' : 'bg-gray-100 border border-gray-200'}`}>
                                  <p className={`text-sm font-medium truncate ${dark ? 'text-gray-300' : 'text-gray-700'}`}>{student.name}</p>
                                  <p className={`text-xs truncate ${dark ? 'text-gray-500' : 'text-gray-600'}`}>{student.studentId}</p>
                                  <p className={`text-xs ${dark ? 'text-gray-600' : 'text-gray-500'}`}>{student.year ? `Year ${student.year}` : 'N/A'}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                  .slice(0, 10)}

                {allTeachers.filter(t => getTeacherGroupCount(t.teacherId) === 0).length > 0 && (
                  <div className={`rounded-xl p-8 text-center ${dark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                    <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {allTeachers.filter(t => getTeacherGroupCount(t.teacherId) === 0).length} teacher(s) have no assignments yet
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'groups' && (
            <div className="p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Group Management</h3>
                  <p className={`mt-1 ${dark ? 'text-gray-400' : 'text-gray-600'}`}>Create and manage student groups</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`px-4 py-2 rounded-xl ${dark ? 'bg-purple-500/10' : 'bg-gradient-to-r from-purple-50 to-pink-50'}`}>
                    <span className={`text-sm font-medium ${dark ? 'text-purple-400' : 'text-purple-700'}`}>{visibleGroups.length} / {groups.length} Groups</span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={groupSearch}
                      onChange={(e) => setGroupSearch(e.target.value)}
                      placeholder="Search groups..."
                      className={`w-64 px-4 py-2.5 pl-10 rounded-xl border transition-all duration-200 ${dark ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-purple-400/50' : 'bg-white/80 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-purple-500'} focus:outline-none focus:ring-2 focus:ring-purple-500/30`}
                    />
                    <svg className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${dark ? 'text-gray-500' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className={`backdrop-blur-sm rounded-2xl shadow-xl border p-6 mb-8 ${dark ? 'bg-white/5 border-white/10' : 'bg-white/80 border-white/20'}`}>
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z"/>
                    </svg>
                  </div>
                  <h4 className={`text-xl font-bold ${dark ? 'text-gray-200' : 'text-gray-800'}`}>Create New Group</h4>
                </div>
                
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    if (!adminData?.adminId) {
                      alert('Admin ID is missing. Please re-login and try again.');
                      return;
                    }

                    // Use form's college/department if selected, otherwise use admin's scope
                    const groupCollege = groupForm.college || adminData?.institution || '';
                    const groupDepartment = groupForm.department || adminData?.department || '';

                    const groupData = {
                      name: String(groupForm.name || '').trim(),
                      college: String(groupCollege).trim(),
                      department: String(groupDepartment).trim(),
                      teacher: groupForm.teacher,
                      students: groupForm.students,
                      createdBy: adminData.adminId
                    };

                    if (!groupData.name || !groupData.teacher || !groupData.college || !groupData.department) {
                      alert('Group name, teacher, college, and department are required.');
                      return;
                    }

                    const response = await api.post('/api/groups', groupData);
                    setGroupForm({ name: '', college: '', department: '', teacher: '', students: [] });
                    setGroupStudentSearch('');
                    setGroupFormYearFilter('ALL');
                    setShowAllCreateGroupStudents(false);
                    setSelectedStudentGroup(response.data._id || 'ALL');
                    setLastGroupCreated(response.data);
                    await fetchData();
                  } catch (error) {
                    console.error('Group creation error:', error);
                    alert('Error creating group: ' + (error.response?.data?.error || error.message));
                  }
                }} className="space-y-6">
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Group Name</label>
                    <input
                      type="text"
                      placeholder="Enter group name"
                      value={groupForm.name}
                      onChange={(e) => setGroupForm({...groupForm, name: e.target.value})}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm ${dark ? 'bg-white/5 border-white/10 text-white placeholder-gray-500' : 'bg-white/50 border-gray-200 text-gray-900'}`}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>College/Institution</label>
                      <div className={`w-full px-4 py-3 border rounded-xl font-semibold ${dark ? 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-white/10 text-white' : 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 text-gray-900'}`}>
                        gmrit
                      </div>
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Department/Branch</label>
                      <select
                        value={groupForm.department}
                        onChange={(e) => setGroupForm({...groupForm, department: e.target.value})}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm ${dark ? 'bg-slate-800 border-white/10 text-white' : 'bg-white/50 border-gray-200 text-gray-900'}`}
                      >
                        <option value="">Select Department</option>
                        {allAvailableDepartments.map((department) => (
                          <option key={department} value={department}>
                            {department}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Assign Teacher</label>
                    <select
                      value={groupForm.teacher}
                      onChange={(e) => setGroupForm({...groupForm, teacher: e.target.value})}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm ${dark ? 'bg-slate-800 border-white/10 text-white' : 'bg-white/50 border-gray-200 text-gray-900'}`}
                      required
                    >
                      <option value="">Select Teacher</option>
                      {scopedCreateGroupTeachers.length > 0 ? (
                        scopedCreateGroupTeachers.map((teacher) => (
                          <option key={teacher.teacherId} value={teacher.teacherId}>
                            {teacher.name} ({teacher.department || 'No Branch'})
                          </option>
                        ))
                      ) : (
                        <option disabled>No teachers available for selected college/department</option>
                      )}
                    </select>
                    {scopedCreateGroupTeachers.length === 0 && (
                      <p className={`mt-2 text-xs ${dark ? 'text-amber-300' : 'text-amber-700'}`}>
                        No teachers available for selected college/department. {groupForm.college && groupForm.department ? 'Please add teachers or select different college/department.' : 'Please select college and department first.'}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Select Students</label>
                    <div className="mb-3 flex flex-col sm:flex-row gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={groupStudentSearch}
                          onChange={(e) => setGroupStudentSearch(e.target.value)}
                          placeholder="Search all students by ID, name, email, roll number, college, department, year..."
                          className={`w-full px-4 py-2.5 pl-10 border rounded-xl transition-all duration-200 ${dark ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-purple-400/50' : 'bg-white/80 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-purple-500'} focus:outline-none focus:ring-2 focus:ring-purple-500/30`}
                        />
                        <svg className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${dark ? 'text-gray-500' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
                        </svg>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (showAllCreateGroupStudents) {
                            setShowAllCreateGroupStudents(false);
                          } else {
                            setGroupStudentSearch('');
                            setShowAllCreateGroupStudents(true);
                          }
                        }}
                        className={`px-3 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200 ${dark ? 'bg-white/5 border-white/10 text-gray-200 hover:bg-white/10' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                      >
                        {showAllCreateGroupStudents ? 'Close View' : 'View All'}
                      </button>
                    </div>
                    <div className="mb-3 space-y-2">
                      <p className={`text-xs mb-2 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Filter by Year:
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {['ALL', '1', '2', '3', '4'].map((year) => (
                          <button
                            key={year}
                            onClick={() => setGroupFormYearFilter(year)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 ${
                              groupFormYearFilter === year
                                ? dark ? 'bg-purple-600/80 border-purple-400 text-white' : 'bg-purple-600 border-purple-700 text-white'
                                : dark ? 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10' : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {year === 'ALL' ? 'All Years' : `Year ${year}`}
                          </button>
                        ))}
                      </div>
                    </div>
                    <p className={`text-xs mb-3 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Showing {visibleGroupStudents.length} of {eligibleCreateGroupStudents.length} students | Selected {groupForm.students.length}
                    </p>
                    <div className={`${showAllCreateGroupStudents ? 'max-h-none overflow-visible' : 'max-h-48 overflow-y-auto'} backdrop-blur-sm border rounded-xl ${dark ? 'bg-white/5 border-white/10' : 'bg-gray-50/50 border-gray-200'}`}>
                      <div className={`divide-y ${dark ? 'divide-white/10' : 'divide-gray-200'}`}>
                        {visibleGroupStudents.map((student) => (
                          <label key={student.studentId} className={`flex items-start space-x-3 px-4 py-3 transition-colors duration-150 cursor-pointer ${dark ? 'hover:bg-white/8' : 'hover:bg-white/70'}`}>
                            <input
                              type="checkbox"
                              checked={groupForm.students.includes(student.studentId)}
                              onChange={() => {
                                const studentId = student.studentId;
                                setGroupForm(prev => ({
                                  ...prev,
                                  students: prev.students.includes(studentId)
                                    ? prev.students.filter(id => id !== studentId)
                                    : [...prev.students, studentId]
                                }));
                              }}
                              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                            />
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">{student.name?.charAt(0)}</span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className={`text-sm font-medium truncate ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
                                {student.name} ({student.studentId})
                              </p>
                              <p className={`text-xs truncate ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {student.email || 'No email'} | Roll: {student.rollNumber || 'N/A'}
                              </p>
                              <p className={`text-xs truncate ${dark ? 'text-gray-500' : 'text-gray-500'}`}>
                                {student.department || 'N/A'} | {student.college || 'N/A'}
                              </p>
                              <p className={`text-xs ${dark ? 'text-gray-500' : 'text-gray-500'}`}>
                                Year {student.year || 'N/A'} | Semester {student.semester || 'N/A'}
                              </p>
                            </div>
                          </label>
                        ))}
                        {visibleGroupStudents.length === 0 && (
                          <p className={`text-sm px-4 py-3 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>No students found for this search.</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 px-6 rounded-xl"
                  >
                    <svg className="w-5 h-5 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
                    </svg>
                    Create Group
                  </button>
                </form>
              </div>
              
              <div className={`backdrop-blur-sm rounded-2xl shadow-xl border p-6 ${dark ? 'bg-white/5 border-white/10' : 'bg-white/80 border-white/20'}`}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                      </svg>
                    </div>
                    <h4 className={`text-xl font-bold ${dark ? 'text-gray-200' : 'text-gray-800'}`}>Existing Groups</h4>
                  </div>
                  <div className={`px-4 py-2 rounded-xl ${dark ? 'bg-purple-500/10' : 'bg-gradient-to-r from-purple-50 to-pink-50'}`}>
                    <span className={`text-sm font-medium ${dark ? 'text-purple-400' : 'text-purple-700'}`}>{groups.length} Groups</span>
                  </div>
                </div>
                
                <div className={`divide-y ${dark ? 'divide-white/10' : 'divide-gray-200'}`}>
                  {visibleGroups.map((group) => (
                    <div key={group._id} className={`py-5 ${dark ? 'bg-transparent' : 'bg-transparent'}`}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center mb-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-4">
                              <span className="text-white font-bold text-lg">{group.name?.charAt(0)}</span>
                            </div>
                            <div>
                              <h5 className={`text-xl font-bold ${dark ? 'text-gray-200' : 'text-gray-800'}`}>{group.name}</h5>
                              <p className={`text-sm ${dark ? 'text-gray-500' : 'text-gray-500'}`}>Created by Admin</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                                </svg>
                              </div>
                              <div>
                                <p className={`text-sm font-medium ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Teacher</p>
                                <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-600'}`}>{getTeacherDisplayName(group.teacher)}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                                </svg>
                              </div>
                              <div>
                                <p className={`text-sm font-medium ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Students</p>
                                <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-600'}`}>{group.students.length} members</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingGroup(group._id);
                              setEditForm({
                                name: group.name,
                                college: group.college,
                                department: group.department,
                                teacher: group.teacher,
                                students: group.students
                              });
                              setEditGroupStudentSearch('');
                              setEditFormYearFilter('ALL');
                              setShowAllEditGroupStudents(false);
                            }}
                            className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-xl font-medium flex items-center space-x-2"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                            </svg>
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={async () => {
                              const confirmed = window.confirm(`Delete group ${group.name}?`);
                              if (!confirmed) return;
                              try {
                                await api.delete(`/api/groups/${group._id}`);
                                await fetchData();
                              } catch (error) {
                                alert(getApiErrorMessage(error, 'Failed to delete group'));
                              }
                            }}
                            className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-xl font-medium flex items-center space-x-2"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2h.293l.91 10.11A2 2 0 007.196 18h5.608a2 2 0 001.993-1.89L15.707 6H16a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zm-1 4a1 1 0 012 0v8a1 1 0 11-2 0V6zm4-1a1 1 0 00-1 1v8a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                            </svg>
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {visibleGroups.length === 0 && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                        </svg>
                      </div>
                      <h3 className={`text-lg font-semibold mb-2 ${dark ? 'text-gray-400' : 'text-gray-600'}`}>No groups created yet</h3>
                      <p className={`${dark ? 'text-gray-500' : 'text-gray-500'}`}>Create your first group to get started with student management.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {showAdminEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`backdrop-blur-xl rounded-2xl shadow-2xl max-w-xl w-full border ${dark ? 'bg-gray-900/95 border-white/10' : 'bg-white/95 border-white/20'}`}>
            <div className={`p-6 border-b ${dark ? 'border-white/10' : 'border-gray-200/50'}`}>
              <div className="flex items-center justify-between">
                <h3 className={`text-xl font-bold ${dark ? 'text-gray-200' : 'text-gray-800'}`}>Edit Admin Profile</h3>
                <button
                  onClick={() => setShowAdminEditModal(false)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-200 ${dark ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  <svg className={`w-4 h-4 ${dark ? 'text-gray-400' : 'text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveAdminProfile} className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-semibold mb-2 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Full Name</label>
                <input
                  type="text"
                  value={adminProfileForm.name}
                  onChange={(e) => setAdminProfileForm((prev) => ({ ...prev, name: e.target.value }))}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${dark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-semibold mb-2 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
                <input
                  type="email"
                  value={adminProfileForm.email}
                  onChange={(e) => setAdminProfileForm((prev) => ({ ...prev, email: e.target.value }))}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${dark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Institution</label>
                  <input
                    type="text"
                    value={adminProfileForm.institution}
                    onChange={(e) => setAdminProfileForm((prev) => ({ ...prev, institution: e.target.value }))}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${dark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Department</label>
                  <input
                    type="text"
                    value={adminProfileForm.department}
                    onChange={(e) => setAdminProfileForm((prev) => ({ ...prev, department: e.target.value }))}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${dark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={savingAdminProfile}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg disabled:opacity-60"
                >
                  {savingAdminProfile ? 'Saving...' : 'Save Profile'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAdminEditModal(false)}
                  className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingGroup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`backdrop-blur-xl rounded-2xl shadow-2xl max-w-lg w-full border ${dark ? 'bg-gray-900/95 border-white/10' : 'bg-white/95 border-white/20'}`}>
            <div className={`p-6 border-b ${dark ? 'border-white/10' : 'border-gray-200/50'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                    </svg>
                  </div>
                  <h3 className={`text-xl font-bold ${dark ? 'text-gray-200' : 'text-gray-800'}`}>Edit Group</h3>
                </div>
                <button
                  onClick={() => {
                    setEditingGroup(null);
                    setEditFormYearFilter('ALL');
                  }}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-200 ${dark ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  <svg className={`w-4 h-4 ${dark ? 'text-gray-400' : 'text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                  </svg>
                </button>
              </div>
            </div>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                await api.put(`/api/groups/${editingGroup}`, editForm);
                setEditingGroup(null);
                setEditFormYearFilter('ALL');
                fetchData();
              } catch (error) {
                alert('Error updating group: ' + (error.response?.data?.error || error.message));
              }
            }} className="p-6 space-y-6">
              <div>
                <label className={`block text-sm font-semibold mb-2 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Group Name</label>
                <input
                  type="text"
                  placeholder="Enter group name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm ${dark ? 'bg-white/5 border-white/10 text-white placeholder-gray-500' : 'bg-white/50 border-gray-200 text-gray-900'}`}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>College/Institution</label>
                  <div className={`w-full px-4 py-3 border rounded-xl font-semibold ${dark ? 'bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-white/10 text-white' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-gray-900'}`}>
                    gmrit
                  </div>
                </div>
                
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Department/Branch</label>
                  <select
                    value={editForm.department}
                    onChange={(e) => setEditForm({...editForm, department: e.target.value})}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm ${dark ? 'bg-slate-800 border-white/10 text-white' : 'bg-white/50 border-gray-200 text-gray-900'}`}
                  >
                    <option value="">Select Department</option>
                    {allAvailableDepartments.map((department) => (
                      <option key={department} value={department}>
                        {department}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className={`block text-sm font-semibold mb-2 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Assign Teacher</label>
                <select
                  value={editForm.teacher}
                  onChange={(e) => setEditForm({...editForm, teacher: e.target.value})}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm ${dark ? 'bg-slate-800 border-white/10 text-white' : 'bg-white/50 border-gray-200 text-gray-900'}`}
                  required
                >
                  <option value="">Select Teacher</option>
                  {eligibleEditGroupTeachers.length > 0 ? (
                    eligibleEditGroupTeachers.map((teacher) => (
                      <option key={teacher.teacherId} value={teacher.teacherId}>
                        {teacher.name} ({teacher.department || 'No Branch'})
                      </option>
                    ))
                  ) : (
                    <option disabled>No teachers available for selected college/department</option>
                  )}
                </select>
                {eligibleEditGroupTeachers.length === 0 && (
                  <p className={`mt-2 text-xs ${dark ? 'text-amber-300' : 'text-amber-700'}`}>
                    No matching teachers available. Please update college/department selection.
                  </p>
                )}
              </div>
              
              <div>
                <label className={`block text-sm font-semibold mb-2 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Select Students</label>
                <div className="mb-3 flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={editGroupStudentSearch}
                      onChange={(e) => setEditGroupStudentSearch(e.target.value)}
                      placeholder="Search all students by ID, name, email, roll number, college, department, year..."
                      className={`w-full px-4 py-2.5 pl-10 border rounded-xl transition-all duration-200 ${dark ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-blue-400/50' : 'bg-white/80 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-blue-500'} focus:outline-none focus:ring-2 focus:ring-blue-500/30`}
                    />
                    <svg className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${dark ? 'text-gray-500' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (showAllEditGroupStudents) {
                        setShowAllEditGroupStudents(false);
                      } else {
                        setEditGroupStudentSearch('');
                        setShowAllEditGroupStudents(true);
                      }
                    }}
                    className={`px-3 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200 ${dark ? 'bg-white/5 border-white/10 text-gray-200 hover:bg-white/10' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                  >
                    {showAllEditGroupStudents ? 'Close View' : 'View All'}
                  </button>
                </div>
                <div className="mb-3 space-y-2">
                  <p className={`text-xs mb-2 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Filter by Year:
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {['ALL', '1', '2', '3', '4'].map((year) => (
                      <button
                        key={year}
                        onClick={() => setEditFormYearFilter(year)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 ${
                          editFormYearFilter === year
                            ? dark ? 'bg-blue-600/80 border-blue-400 text-white' : 'bg-blue-600 border-blue-700 text-white'
                            : dark ? 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10' : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {year === 'ALL' ? 'All Years' : `Year ${year}`}
                      </button>
                    ))}
                  </div>
                </div>
                <p className={`text-xs mb-3 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Showing {visibleEditGroupStudents.length} of {eligibleEditGroupStudents.length} students | Selected {editForm.students.length}
                </p>
                <div className={`${showAllEditGroupStudents ? 'max-h-none overflow-visible' : 'max-h-48 overflow-y-auto'} backdrop-blur-sm border rounded-xl ${dark ? 'bg-white/5 border-white/10' : 'bg-gray-50/50 border-gray-200'}`}>
                  <div className={`divide-y ${dark ? 'divide-white/10' : 'divide-gray-200'}`}>
                    {visibleEditGroupStudents.map((student) => (
                      <label key={student.studentId} className={`flex items-start space-x-3 px-4 py-3 transition-colors duration-150 cursor-pointer ${dark ? 'hover:bg-white/8' : 'hover:bg-white/70'}`}>
                        <input
                          type="checkbox"
                          checked={editForm.students.includes(student.studentId)}
                          onChange={() => {
                            const studentId = student.studentId;
                            setEditForm(prev => ({
                              ...prev,
                              students: prev.students.includes(studentId)
                                ? prev.students.filter(id => id !== studentId)
                                : [...prev.students, studentId]
                            }));
                          }}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">{student.name?.charAt(0)}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm font-medium truncate ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {student.name} ({student.studentId})
                          </p>
                          <p className={`text-xs truncate ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {student.email || 'No email'} | Roll: {student.rollNumber || 'N/A'}
                          </p>
                          <p className={`text-xs truncate ${dark ? 'text-gray-500' : 'text-gray-500'}`}>
                            {student.department || 'N/A'} | {student.college || 'N/A'}
                          </p>
                          <p className={`text-xs ${dark ? 'text-gray-500' : 'text-gray-500'}`}>
                            Year {student.year || 'N/A'} | Semester {student.semester || 'N/A'}
                          </p>
                        </div>
                      </label>
                    ))}
                    {visibleEditGroupStudents.length === 0 && (
                      <p className={`text-sm px-4 py-3 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>No students found for this search.</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button 
                  type="submit" 
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <svg className="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingGroup(null);
                    setEditFormYearFilter('ALL');
                  }}
                  className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;