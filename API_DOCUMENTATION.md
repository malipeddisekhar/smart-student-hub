# LeetCode Feature - API Documentation

## Base URL
```
Backend: http://localhost:3000
Frontend: http://localhost:5173
```

## Endpoints

### 1. Update LeetCode Username

**Endpoint**: `POST /api/leetcode/update-username`

**Authentication**: Required (Student must be logged in)

**Request Body**:
```json
{
  "studentId": "MITCOE123456",
  "username": "leeLeetCode"
}
```

**Response** (Success - 200):
```json
{
  "message": "LeetCode username saved successfully",
  "leetcodeUsername": "leeLeetCode",
  "problemsSolved": 150
}
```

**Response** (Invalid Username - 400):
```json
{
  "error": "Failed to fetch LeetCode stats",
  "details": "Username not found on LeetCode"
}
```

**Response** (Empty Username - 400):
```json
{
  "error": "Username cannot be empty"
}
```

**Response** (Validation Error - 400):
```json
{
  "error": "StudentId and username are required"
}
```

**Response** (Student Not Found - 404):
```json
{
  "error": "Student not found"
}
```

**Validation Rules**:
- `studentId`: Required, must exist in database
- `username`: Required, non-empty, minimum 2 characters, must be valid LeetCode username

---

### 2. Get Student LeetCode Data

**Endpoint**: `GET /api/leetcode/:studentId`

**Authentication**: Not required (Public data)

**URL Parameters**:
- `studentId` (string, required): Student's unique ID

**Response** (Success - 200):
```json
{
  "leetcodeUsername": "leeLeetCode",
  "problemsSolved": 150,
  "leetcodeUpdatedAt": "2024-01-06T10:30:00.000Z"
}
```

**Response** (No Username Set - 200):
```json
{
  "leetcodeUsername": null,
  "problemsSolved": 0,
  "leetcodeUpdatedAt": null
}
```

**Response** (Student Not Found - 404):
```json
{
  "error": "Student not found"
}
```

**Usage**:
- Called when Dashboard mounts to display current LeetCode data
- Returns null values if student hasn't added LeetCode username

---

### 3. Get Leaderboard

**Endpoint**: `GET /api/leaderboard`

**Authentication**: Not required (Public data)

**Query Parameters**: None

**Response** (Success - 200):
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "studentId": "MITCOE000001",
    "name": "Aditya Sharma",
    "college": "MIT College of Engineering",
    "department": "Computer Science",
    "leetcodeUsername": "leeLeetCode",
    "problemsSolved": 500,
    "leetcodeUpdatedAt": "2024-01-06T10:30:00.000Z",
    "rank": 1
  },
  {
    "_id": "507f1f77bcf86cd799439012",
    "studentId": "MITCOE000002",
    "name": "Priya Gupta",
    "college": "MIT College of Engineering",
    "department": "Information Technology",
    "leetcodeUsername": "priya_codes",
    "problemsSolved": 450,
    "leetcodeUpdatedAt": "2024-01-05T15:45:00.000Z",
    "rank": 2
  }
]
```

**Response** (Empty Leaderboard - 200):
```json
[]
```

**Sorting**: 
- By `problemsSolved` descending (highest first)
- Rank auto-calculated by position (1st, 2nd, 3rd...)

**Data Included**:
- studentId, name, college, department
- leetcodeUsername, problemsSolved, leetcodeUpdatedAt
- rank (calculated)

**Note**: Only includes students with non-null `leetcodeUsername`

---

### 4. Search Students

**Endpoint**: `GET /api/search/students`

**Authentication**: Not required (Public data)

**Query Parameters**:
- `query` (string, required): Search term (minimum 2 characters)

**Response** (Success - 200):
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "studentId": "MITCOE000001",
    "name": "Aditya Sharma",
    "email": "aditya@mit.edu",
    "college": "MIT College of Engineering",
    "department": "Computer Science",
    "year": 3,
    "rollNumber": "22CS101",
    "profile": {
      "profileImage": "https://cloudinary.com/..."
    }
  }
]
```

**Response** (Empty Result - 200):
```json
[]
```

**Search Fields**:
- name (case-insensitive, partial match)
- studentId (case-insensitive, partial match)
- rollNumber (case-insensitive, partial match)
- college (case-insensitive, partial match)
- email (case-insensitive, partial match)

**Limit**: Maximum 10 results

**Example Queries**:
- `/api/search/students?query=Aditya`
- `/api/search/students?query=MITCOE`
- `/api/search/students?query=22CS101`

---

## Error Codes

| Status | Description | Common Cause |
|--------|-------------|--------------|
| 200 | Success | Operation completed successfully |
| 400 | Bad Request | Invalid input, validation failed |
| 404 | Not Found | Student not found in database |
| 500 | Server Error | Unexpected server error |

## Error Response Format

All errors follow this format:
```json
{
  "error": "Error message",
  "details": "Additional details (optional)"
}
```

---

## Frontend Integration

### In LeetCodeCard Component

```javascript
// Save LeetCode username
const response = await api.post("/api/leetcode/update-username", {
  studentId: studentData.studentId,
  username: inputValue.trim(),
});

// Get current LeetCode data
const response = await api.get(`/api/leetcode/${studentData.studentId}`);

// View leaderboard link
navigate("/leaderboard");
```

### In Leaderboard Component

```javascript
// Get all students with LeetCode data
const response = await api.get("/api/leaderboard");
const leaderboardData = response.data; // Array sorted by problems solved
```

### In LandingPage Component

```javascript
// Search for students
const response = await api.get(
  `/api/search/students?query=${encodeURIComponent(query)}`
);
const searchResults = response.data;
```

---

## Data Flow

### Adding LeetCode Username Flow

```
User Input
    ↓
Frontend Validation (non-empty, length >= 2)
    ↓
Send to POST /api/leetcode/update-username
    ↓
Backend Validation (studentId exists, username format)
    ↓
Fetch from LeetCode GraphQL API
    ↓
Parse and Calculate Problems Solved
    ↓
Save to MongoDB (leetcodeUsername, problemsSolved, leetcodeUpdatedAt)
    ↓
Return Success Response
    ↓
Update Frontend State & Show Success Message
```

### Viewing Leaderboard Flow

```
User Navigates to /leaderboard
    ↓
Component Mounts
    ↓
Send GET /api/leaderboard
    ↓
Backend Queries MongoDB
    ↓
Filter: Only students with leetcodeUsername != null
    ↓
Sort: By problemsSolved (descending)
    ↓
Calculate: Rank based on position
    ↓
Return Array of Students
    ↓
Render in Table with Styling & Links
```

---

## Rate Limiting Considerations

**LeetCode API**: 
- No documented rate limit, but high request frequency might cause blocks
- Current implementation: Fetch on-demand when user submits

**Optimization**:
```javascript
// Cache response for 1 hour
const cacheKey = `leetcode_${username}`;
const cached = cache.get(cacheKey);
if (cached && Date.now() - cached.timestamp < 3600000) {
  return cached.data;
}
```

---

## Examples

### Example 1: Add LeetCode Username

**Request**:
```bash
curl -X POST http://localhost:3000/api/leetcode/update-username \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "MITCOE000001",
    "username": "lcuser"
  }'
```

**Response**:
```json
{
  "message": "LeetCode username saved successfully",
  "leetcodeUsername": "lcuser",
  "problemsSolved": 250
}
```

### Example 2: Get Leaderboard

**Request**:
```bash
curl http://localhost:3000/api/leaderboard
```

**Response**:
```json
[
  {
    "rank": 1,
    "name": "Student A",
    "studentId": "ID001",
    "problemsSolved": 500,
    "leetcodeUsername": "studentA"
  },
  {
    "rank": 2,
    "name": "Student B",
    "studentId": "ID002",
    "problemsSolved": 450,
    "leetcodeUsername": "studentB"
  }
]
```

### Example 3: Search Students

**Request**:
```bash
curl "http://localhost:3000/api/search/students?query=Aditya"
```

**Response**:
```json
[
  {
    "studentId": "MITCOE000001",
    "name": "Aditya Sharma",
    "college": "MIT College of Engineering",
    "email": "aditya@mit.edu"
  }
]
```

---

## Notes for Developers

1. **CORS Handling**: All requests go through configured CORS settings in `app.js`
2. **JSON Format**: All responses are JSON (not XML or other formats)
3. **Case Sensitivity**: LeetCode usernames are case-sensitive
4. **Timestamps**: All timestamps are UTC ISO 8601 format
5. **Pagination**: Leaderboard doesn't currently paginate (all results returned)
6. **Caching**: Consider implementing Redis caching for production
7. **Validation**: Both frontend and backend validate all inputs
8. **Security**: Sensitive fields (passwords) never returned in responses

---

## Changelog

### v1.0 (Initial Release)
- ✅ POST /api/leetcode/update-username
- ✅ GET /api/leetcode/:studentId  
- ✅ GET /api/leaderboard
- ✅ GET /api/search/students (supporting leaderboard feature)

### Future Versions
- Pagination for leaderboard (v1.1)
- Difficulty breakdown endpoint (v1.2)
- Scheduled stats update job (v1.2)
- Advanced filtering/sorting (v1.3)
- Caching layer (v1.3)
