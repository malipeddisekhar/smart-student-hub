# Quick Start Guide - LeetCode Leaderboard Feature

## Installation

### Step 1: Install Backend Dependencies
```bash
cd Backend
npm install axios
```

### Step 2: Verify Database Connection
- Ensure MongoDB is running
- Check `.env` file has `MONGODB_URI` set

### Step 3: Start Backend
```bash
cd Backend
npm run dev  # or npm start
```

Expected output: `Server running at http://localhost:3000`

### Step 4: Start Frontend
```bash
cd Frontend/smart-student-hub
npm run dev
```

Expected output: `Local: http://localhost:5173`

## Testing the Feature

### Test 1: View Leaderboard (No Auth Required)
1. Open http://localhost:5173 in browser
2. Click "Leaderboard" button in navbar
3. Should see empty state (no students yet)

### Test 2: Add LeetCode Username (Authenticated)
1. Login as a student (email: test@example.com or register new)
2. Go to Dashboard
3. Scroll down to "LeetCode Credentials" card
4. Click "Add LeetCode Username"
5. Enter a valid LeetCode username (e.g., "leeLeetCode")
6. Click "Save"
7. Should see success message and username displayed

### Test 3: View Updated Leaderboard
1. Click "View Leaderboard" link on the LeetCode card
2. Or click "Leaderboard" button in navbar
3. Should see the student you just added
4. Should show correct problem count

### Test 4: Update Username
1. On Dashboard, click "Update" button on LeetCode card
2. Enter a different username
3. Click "Save"
4. Verify leaderboard updates with new data

### Test 5: Error Handling
1. Try entering an invalid username (one that doesn't exist on LeetCode)
2. Should see error message: "Failed to fetch LeetCode stats"
3. Try submitting empty username
4. Should see error message: "Username cannot be empty"

## API Endpoints Reference

### Leaderboard
```
GET /api/leaderboard
Response: Array of students sorted by problems solved (descending)
```

### Update LeetCode Username
```
POST /api/leetcode/update-username
Body: { studentId, username }
Response: { message, leetcodeUsername, problemsSolved }
```

### Get Student LeetCode Data
```
GET /api/leetcode/:studentId
Response: { leetcodeUsername, problemsSolved, leetcodeUpdatedAt }
```

### Search Students
```
GET /api/search/students?query=queryString
Response: Array of matching students
```

## Troubleshooting

### Issue: "axios is not defined"
**Solution**: Run `npm install axios` in Backend directory

### Issue: LeetCode fetch fails with timeout
**Solution**: Check internet connection, LeetCode API might be down

### Issue: Leaderboard shows empty state
**Solution**: Make sure student has successfully added LeetCode username

### Issue: Backend not responding to frontend
**Solution**: Check CORS settings in `Backend/app.js`, verify both are running

### Issue: Student can't see themselves on leaderboard
**Solution**: 
1. Verify they added a LeetCode username
2. Refresh page
3. Check browser console for errors

## File Structure

```
Smart Student Hub/
├── Backend/
│   ├── app.js (Modified - new endpoints)
│   ├── models/
│   │   └── Student.js (Modified - new fields)
│   ├── utils/
│   │   └── leetcodeService.js (NEW)
│   └── package.json (needs axios)
├── Frontend/smart-student-hub/
│   └── src/
│       ├── App.jsx (Modified - new route)
│       ├── components/
│       │   ├── Dashboard.jsx (Modified - LeetCodeCard import)
│       │   ├── LandingPage.jsx (Modified - navbar buttons)
│       │   ├── LeetCodeCard.jsx (NEW)
│       │   └── Leaderboard.jsx (NEW)
│       └── services/
│           └── api.js (unchanged)
└── LEETCODE_IMPLEMENTATION.md (Documentation)
```

## Database Schema

### Student Collection - New Fields
```javascript
{
  leetcodeUsername: String,      // null if not set
  problemsSolved: Number,        // default: 0
  leetcodeUpdatedAt: Date        // null if not set
}
```

## User Flows

### Flow 1: Student Adding LeetCode Username
1. Student logs in
2. Goes to Dashboard
3. Sees "LeetCode Credentials" card
4. Clicks "Add LeetCode Username"
5. Enters username (e.g., "leeLeetCode")
6. System fetches stats from LeetCode API
7. Saves username and problem count
8. Shows success message
9. Student sees updated profile

### Flow 2: Student Viewing Leaderboard
1. Student clicks "Leaderboard" button
2. Leaderboard page loads
3. Shows ranked list of all students with LeetCode usernames
4. Current student is highlighted with "You" badge
5. Student can click any username to view LeetCode profile

### Flow 3: Unauthenticated User Viewing Leaderboard
1. From landing page, click "Leaderboard"
2. Leaderboard loads (read-only)
3. Shows all students without edit functionality
4. Can view but cannot add own username

## Performance Tips

1. **For Large Datasets**: Add database index on `leetcodeUsername`
   ```javascript
   studentSchema.index({ leetcodeUsername: 1 });
   ```

2. **For Better UX**: Implement leaderboard pagination
   - Fetch 10-50 students per page
   - Add "Load More" or page numbers

3. **For Frequent Updates**: Implement caching
   - Cache LeetCode response for 1 hour
   - Reduces API calls to LeetCode

## Security Checklist

- ✅ Student can only update own profile
- ✅ Input validation on all fields
- ✅ Error messages don't expose sensitive info
- ✅ Leaderboard is read-only public data
- ✅ CORS configured properly
- ✅ No authentication bypass possible
- ✅ Rate limiting can be added if needed

## Next Steps

1. Test all features thoroughly
2. Deploy to production
3. Monitor LeetCode API usage
4. Consider adding badges for milestones
5. Plan for future enhancements (scheduled updates, filters, etc.)

## Contact & Support

For issues or questions:
1. Check browser console (Ctrl+Shift+I)
2. Check server logs (Backend terminal)
3. Review error messages in UI
4. Check LEETCODE_IMPLEMENTATION.md for detailed documentation
