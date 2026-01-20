# Component Architecture & Visual Guide

## Component Hierarchy

```
App (Router)
├── LandingPage
│   ├── Navbar (with Student Login & Leaderboard buttons)
│   └── Features Section (unchanged)
├── StudentLogin / StudentRegister
├── Dashboard
│   ├── Navbar (messages, notifications, logout)
│   ├── Welcome Card (profile info)
│   ├── Feature Cards Grid (6 cards)
│   │   ├── Academic Records
│   │   ├── Academic Certificates
│   │   ├── Personal Achievements
│   │   ├── Profile Management
│   │   ├── Project Portfolio
│   │   └── Professional Portfolio
│   └── LeetCodeCard 🆕
│       ├── View Mode (username + problems display)
│       ├── Edit Mode (form to add/update)
│       └── Link to Leaderboard
├── Leaderboard 🆕
│   ├── Navbar (dashboard & logout for auth users)
│   ├── Header (title + icon)
│   ├── Status (loading/error/success)
│   ├── Leaderboard Table
│   │   ├── Header Row (Rank, Name, College, Username, Problems)
│   │   └── Data Rows (students sorted by problems)
│   └── Statistics Footer (total, average, max)
├── Other existing routes...
```

## New Components

### 1. LeetCodeCard Component

**Purpose**: Embed in Dashboard to manage LeetCode credentials

**File**: `src/components/LeetCodeCard.jsx`

**Props**:
```typescript
interface LeetCodeCardProps {
  studentData: {
    studentId: string;
    name: string;
  }
}
```

**States**:
```javascript
{
  leetcodeUsername: string | null,      // Current username
  inputValue: string,                    // Form input value
  loading: boolean,                      // API call in progress
  error: string,                        // Error message
  success: string,                      // Success message
  problemsSolved: number,                // Current problem count
  isEditing: boolean                    // Show form vs display
}
```

**Features**:
- ✅ Display current username and problems when saved
- ✅ Form to add/update username
- ✅ Real-time validation feedback
- ✅ Loading spinner during submission
- ✅ Error/success messages
- ✅ Link to LeetCode profile
- ✅ Link to view leaderboard
- ✅ Cancel/Save buttons

**Styling**:
- Orange/Red gradient theme
- Matches Dashboard card styling
- Responsive layout
- Smooth transitions

**UI States**:
```
Initial State (No Username)
├── Title: "LeetCode Credentials"
├── Icon: Orange gradient circle with smiley
├── Button: "Add LeetCode Username"
└── Link: "View Leaderboard →"

Data Loaded (Username Exists)
├── Title: "LeetCode Credentials"
├── Status Box: 
│   ├── Username displayed
│   └── Problems count (large number)
├── Actions:
│   ├── "View Profile" (link to LeetCode)
│   └── "Update" (edit button)
└── Link: "View Leaderboard →"

Editing Mode
├── Title: "LeetCode Credentials"
├── Form:
│   ├── Input field (username)
│   ├── Helper text
│   └── Error/success messages (if any)
├── Actions:
│   ├── "Save" (submit, with loading state)
│   └── "Cancel" (exit edit mode)
└── Link: "View Leaderboard →"
```

---

### 2. Leaderboard Component

**Purpose**: Display ranked list of students by LeetCode problems solved

**File**: `src/components/Leaderboard.jsx`

**Props**:
```typescript
interface LeaderboardProps {
  studentData?: {
    studentId: string;
    name: string;
  }
}
```

**States**:
```javascript
{
  leaderboard: Array<Student>,          // All students data
  loading: boolean,                     // Data loading
  error: string | null                  // Error message
}
```

**Features**:
- ✅ Fetches all students with LeetCode usernames on mount
- ✅ Displays in ranked table format
- ✅ Shows rank with emoji medals for top 3
- ✅ Highlights current user with "You" badge
- ✅ Clickable LeetCode usernames (opens profile in new tab)
- ✅ Shows loading spinner while fetching
- ✅ Shows error message if fetch fails
- ✅ Shows empty state if no students
- ✅ Statistics footer (total, average, max)
- ✅ Responsive table design
- ✅ Navigation to Dashboard for auth users

**Table Columns**:
```
┌─────┬──────────────┬─────────────┬──────────────┬────────────┐
│Rank │Student Name  │ College     │LeetCode User │Problems    │
├─────┼──────────────┼─────────────┼──────────────┼────────────┤
│ 🥇  │Student A     │MIT College  │leeLeetCode   │500         │
│ 🥈  │Student B     │Stanford     │priya_codes   │450         │
│ 🥉  │Student C     │IIT Delhi    │coder_c       │420         │
│ 4   │You (Student)│MIT College  │your_username │350         │
└─────┴──────────────┴─────────────┴──────────────┴────────────┘
```

**Styling**:
- Gradient header (dark blue to indigo)
- Row alternating backgrounds (subtle gray)
- Current user row: Golden/orange gradient background
- Medal emojis for top 3 (🥇🥈🥉)
- White cards with shadow effects
- Responsive on mobile (might scroll horizontally)

**Status States**:
```
Loading State
├── Spinner animation
└── "Loading leaderboard..."

Error State
├── Error icon
├── Error message
└── Can retry by refreshing

Empty State
├── Empty icon
├── "No students have submitted LeetCode credentials yet"
└── Suggestion: "Be the first to add your LeetCode username!"

Success State (Data Loaded)
├── Full table with students
├── Statistics footer
└── Navigation options
```

**Statistics Footer**:
```
┌─────────────────────────────────────────────────────────────┐
│ Total Students: 10  │  Avg Problems: 350  │  Max Problems: 500 │
└─────────────────────────────────────────────────────────────┘
```

---

## Updated Components

### 1. Dashboard Component

**Changes**:
- Import: `import LeetCodeCard from "./LeetCodeCard";`
- Added component: `<LeetCodeCard studentData={studentData} />`
- Placement: In the grid, after Professional Portfolio card

**Visual Position**:
```
Grid Layout (3 columns):
Row 1: Academic Records | Academic Certificates | Personal Achievements
Row 2: Profile Management | Project Portfolio | Professional Portfolio
Row 3: LeetCodeCard 🆕 (spans full width or 1/3 of grid)
```

---

### 2. LandingPage Component

**Changes**:
```javascript
// Before:
<button>Student Login</button>
<button>Teacher Login</button>
<button>Admin Login</button>

// After:
<button>Student Login</button>
<button>Leaderboard</button>  // NEW
```

**Visual Changes**:
```
Navigation Bar:
┌──────────────────────────────────────────────────────────┐
│ Smart Student Hub          Search...   [Student] [Leaderboard] │
└──────────────────────────────────────────────────────────┘
                                       (was: Student, Teacher, Admin)
                                       (now: Student, Leaderboard)
```

---

### 3. App.jsx Component

**Changes**:
```javascript
// Added import
import Leaderboard from "./components/Leaderboard";

// Added route
<Route
  path="/leaderboard"
  element={<Leaderboard studentData={studentData} />}
/>
```

---

## Color Scheme

### LeetCode Feature Colors
```
Primary Colors:
- Orange: #F97316 (main actions)
- Red: #DC2626 (secondary)
- Gradient: Orange → Red

Status Colors:
- Success: #10B981 (green)
- Error: #EF4444 (red)
- Loading: #4F46E5 (indigo)
- Warning: #F59E0B (amber)

Backgrounds:
- Card: rgba(255, 255, 255, 0.6) with blur
- Hover: rgba(255, 255, 255, 0.8)
- Gradient overlay: Orange/Red at 10% opacity

Text:
- Primary: #111827 (dark gray)
- Secondary: #4B5563 (medium gray)
- Light: #9CA3AF (light gray)
```

---

## Responsive Design

### Desktop (1200px+)
- Leaderboard table: Full width
- Dashboard grid: 3 columns
- LeetCodeCard: Full width below grid

### Tablet (768px - 1199px)
- Leaderboard table: Full width, might scroll horizontally
- Dashboard grid: 2 columns
- LeetCodeCard: Full width

### Mobile (< 768px)
- Leaderboard table: Single column list format
- Dashboard grid: 1 column stacked
- LeetCodeCard: Full width
- Smaller fonts and padding
- Touch-friendly buttons (larger hit area)

---

## Animation & Transitions

### Loading States
```css
Spinner Animation:
- Border: 4px solid #E5E7EB
- Top border: 4px solid #4F46E5
- Rotation: 360deg infinite 1s
- Border-radius: 50%
```

### Hover Effects
```css
Card Hover:
- Transform: translateY(-8px) (lift up)
- Box-shadow: Enhanced shadow
- Background: Slightly more opaque
- Duration: 500ms

Button Hover:
- Scale: 1.05 (slightly bigger)
- Background: Darker shade
- Duration: 300ms
```

### Message Animations
```css
Success/Error Messages:
- Fade in: 300ms
- Auto-dismiss: 3000ms
- Fade out: 300ms
```

---

## Accessibility

### Keyboard Navigation
- ✅ Tab through buttons and form fields
- ✅ Enter to submit forms
- ✅ Escape to close modals (future)
- ✅ Arrow keys for table navigation (future)

### Screen Reader Support
- ✅ Semantic HTML (button, form, table)
- ✅ ARIA labels where needed
- ✅ Alt text for icons
- ✅ Proper heading hierarchy

### Color Contrast
- ✅ Text on background: WCAG AA compliant
- ✅ Error messages: Clear red on white
- ✅ Success messages: Clear green on white
- ✅ Buttons: White text on colored background

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    LeetCode Feature Data Flow               │
└─────────────────────────────────────────────────────────────┘

User Action: Enter LeetCode Username
       ↓
[LeetCodeCard] - Frontend Validation
       ↓ (POST)
[Backend] - Validate studentId & username
       ↓
[GraphQL Query] - Fetch LeetCode Stats
       ↓
[LeetCode API] - Return submission stats
       ↓
[Calculate] - Sum easy + medium + hard
       ↓
[MongoDB] - Save username & count
       ↓
[Response] - Return success + data
       ↓
[LeetCodeCard] - Update display & show success
       ↓ (Automatic)
[Leaderboard] - Can now see updated rank
```

---

## File Organization

```
Frontend/src/
├── components/
│   ├── LeetCodeCard.jsx 🆕 (New component)
│   ├── Leaderboard.jsx 🆕 (New component)
│   ├── Dashboard.jsx (Modified)
│   ├── LandingPage.jsx (Modified)
│   └── ... other components
├── services/
│   └── api.js (Unchanged)
└── ... other files

Backend/
├── app.js (Modified - new endpoints)
├── models/
│   └── Student.js (Modified - new fields)
├── utils/
│   └── leetcodeService.js 🆕 (New utility)
└── ... other files
```

---

## Testing Checklist

### Visual Testing
- [ ] LeetCodeCard displays correctly on Dashboard
- [ ] Leaderboard table is fully visible and readable
- [ ] Responsive design works on mobile/tablet
- [ ] Animations are smooth and not laggy
- [ ] Colors are correct and text is readable

### Functional Testing
- [ ] Can add LeetCode username
- [ ] Can view leaderboard after adding
- [ ] Can update username
- [ ] Can click LeetCode username to open profile
- [ ] Error messages appear when needed
- [ ] Success messages appear and auto-dismiss

### Accessibility Testing
- [ ] Can tab through all interactive elements
- [ ] Can submit form with Enter key
- [ ] Screen reader reads content correctly
- [ ] Color contrast is sufficient
- [ ] Focus indicators are visible

### Performance Testing
- [ ] Leaderboard loads quickly (< 2s)
- [ ] No lag when typing in form
- [ ] Animations are 60fps
- [ ] Mobile performance is good

---

This document provides a comprehensive visual and architectural overview of all the new and modified components.
