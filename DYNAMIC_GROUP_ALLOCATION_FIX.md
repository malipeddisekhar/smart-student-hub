# Dynamic Group Allocation Fix

## Problem
The group allocation system was restricting admins to creating groups **only within their own branch/department**. This meant:
- Only teachers from the admin's department could be assigned
- Only students from the admin's department could be added to groups
- Cross-branch group allocation was impossible

## Root Cause
The system had **hardcoded scope restrictions** in the frontend:
```javascript
// OLD CODE - Hardcoded to admin's institution and department
college: String(adminData.institution || '').trim()
department: String(adminData.department || '').trim()

// Teacher filtering restricted to admin's scope
scopedCreateGroupTeachers = allTeachers.filter((teacher) =>
  normalize(teacher.college) === normalize(adminData.institution) &&
  normalize(teacher.department) === normalize(adminData.department)
)
```

## Solution: Dynamic College & Department Selection

### Frontend Changes (AdminDashboard.jsx)

#### 1. **Updated Form State**
```javascript
// Added college and department to group forms
const [groupForm, setGroupForm] = useState({ 
  name: '', 
  college: '',          // NEW
  department: '',       // NEW
  teacher: '', 
  students: [] 
});
```

#### 2. **College & Department Selectors Added**
- Admins can now **select any college/institution** from available colleges
- Department list **dynamically updates** based on selected college
- Shows only departments that exist for the selected college

#### 3. **Dynamic Teacher Filtering**
```javascript
// NEW - Uses form's selected college/department instead of admin's scope
const scopedCreateGroupTeachers = allTeachers.filter((teacher) => {
  if (groupForm.college && groupForm.department) {
    return (
      normalize(teacher.college) === normalize(groupForm.college) &&
      normalize(teacher.department) === normalize(groupForm.department)
    );
  }
  // Fallback to admin's scope if not selected
  if (!hasAdminScope) return true;
  return (
    normalize(teacher.college) === normalize(adminData.institution) &&
    normalize(teacher.department) === normalize(adminData.department)
  );
});
```

#### 4. **Dynamic Student Filtering**
```javascript
// Students filtered by selected college/department
const eligibleCreateGroupStudents =
  (groupForm.college && groupForm.department)
    ? allStudents.filter((s) =>
        normalize(s.college) === normalize(groupForm.college) &&
        normalize(s.department) === normalize(groupForm.department)
      )
    : (allStudents.length > 0 ? allStudents : students);
```

#### 5. **Group Creation Updated**
- Now uses `groupForm.college` and `groupForm.department` instead of `adminData.institution` and `adminData.department`
- If no college/department selected, falls back to admin's scope
- Form validation requires college and department selection

#### 6. **Group Editing Enhanced**
- Edit groups now also allows changing college and department
- When editing, the edit form populates with current group's college/department
- Teachers and students are filtered based on the selected/updated college/department

### Backend Changes (app.js)

#### Updated PUT /api/groups/:groupId Endpoint
- Now accepts `college` and `department` in the request body
- Allows updating a group's college and department
- Validates that selected teacher belongs to the new college/department
- Validates that all selected students belong to the new college/department

```javascript
app.put('/api/groups/:groupId', async (req, res) => {
  // Now handles college and department updates
  const { name, college, department, teacher, students } = req.body;
  
  // Uses updated college/department for validation
  const updatedCollege = college !== undefined ? String(college).trim() : group.college;
  const updatedDepartment = department !== undefined ? String(department).trim() : group.department;
  
  // Validates teacher and students against the updated scope
  ...
});
```

## Benefits

✅ **Cross-Branch Group Allocation**: Admins can now create groups with students and teachers from different departments

✅ **Flexible Scope Management**: Not limited by admin's own branch assignment

✅ **Dynamic Filtering**: Teacher and student lists update based on selected college/department

✅ **Full Edit Capability**: Can completely reassign groups to different branches

✅ **Validation Maintained**: System still validates that teachers and students belong to the selected college/department

## UI Changes
1. **Two new dropdowns** in "Create New Group" form:
   - College/Institution selector
   - Department/Branch selector (dynamically populated)

2. **Same dropdowns added** to "Edit Group" modal

3. **Improved error messages** that specify which college/department is required

## How to Use

### Creating a Cross-Branch Group
1. Navigate to **Admin Dashboard → Groups tab**
2. In "Create New Group" section:
   - Enter group name
   - **Select College** (this is now dynamic - choose any available)
   - **Select Department** (only shows departments for selected college)
   - Select Teacher (only shows teachers from selected college/department)
   - Select Students (only shows students from selected college/department)
3. Click "Create Group"

### Editing a Group's Scope
1. Click **Edit** on an existing group
2. Change College and/or Department
3. Select appropriate Teacher and Students for the new scope
4. Save changes

## Files Modified
- `Frontend/smart-student-hub/src/components/AdminDashboard.jsx`
- `Backend/app.js`

## Testing Checklist
- [ ] Create group with students from different department
- [ ] Edit existing group to change college/department
- [ ] Verify teacher dropdown updates when changing department
- [ ] Verify student list updates when changing department
- [ ] Ensure validation prevents invalid teacher/student assignments
- [ ] Test fallback to admin scope when no college/department selected

