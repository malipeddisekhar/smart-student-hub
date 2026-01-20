# Certificate Scan-based Verification System

## Overview
This document describes the comprehensive scan-based certificate verification feature added to Smart-Student-Hub. The system provides automated verification of student-uploaded certificates using QR code scanning, OCR, URL verification, and tampering detection.

---

## 🎯 Features Implemented

### 1. **Minimal UI Changes**
- ✅ Added "Scan Certificate" button under each certificate in Teacher Dashboard → Certificate Review
- ✅ PhonePe-like scanning animation modal
- ✅ Visual scan status badges (AUTO_VERIFIED, AUTO_REJECTED, SOURCE_NOT_DIGITALLY_VERIFIABLE)
- ✅ Disabled Approve/Reject buttons until scan is completed

### 2. **Scan Functionality**
- ✅ **Auto-scan** from uploaded certificate file
- ✅ **Camera scan** for physical certificates or screen QR codes
- ✅ PhonePe-like circular progress animation
- ✅ Real-time scanning status updates

### 3. **Automatic Verification Logic**

#### Step 1: Certificate Reading
- ✅ **QR Code Extraction** - Detects and reads QR codes from certificates
- ✅ **OCR Processing** - Extracts text including student name and course name
- ✅ **Hash Generation** - Creates SHA-256 hash for tampering detection

#### Step 2: Verification Rules
- ✅ **QR/URL Verification**
  - Opens verification URL programmatically
  - Validates HTTP status = 200
  - Matches student name
  - Matches course name
- ✅ **Tampering Detection**
  - Compares current hash with stored hash
  - Detects image manipulation/editing

#### Step 3: System-Assigned Results
- ✅ **AUTO_VERIFIED** - QR found, URL verified, data matches
- ✅ **AUTO_REJECTED** - QR found but verification failed, tampering detected, or data mismatch
- ✅ **SOURCE_NOT_DIGITALLY_VERIFIABLE** - No QR code found

### 4. **Teacher Action Flow**
- ✅ Teacher clicks "Scan Certificate"
- ✅ System performs automated verification
- ✅ Results displayed with color-coded badges
- ✅ Approve button: **Only enabled if status = AUTO_VERIFIED**
- ✅ Reject button: **Only enabled after scan (any status)**
- ✅ Cannot approve/reject without scanning first

### 5. **Backend Security**

#### API Endpoints
- ✅ `POST /api/scan-certificate/:studentId/:certificateId` - Perform certificate scan
- ✅ `GET /api/scan-status/:studentId/:certificateId` - Get scan status
- ✅ `POST /api/review/academic-certificates/:studentId/:certificateId/approve-with-scan` - Approve with scan check
- ✅ `POST /api/review/academic-certificates/:studentId/:certificateId/reject-with-scan` - Reject with scan check

#### Security Features
- ✅ **Rate Limiting** - 5 second cooldown between scans (prevents spam)
- ✅ **Scan Validation** - Must scan before approve/reject
- ✅ **Auto-verified Check** - Only AUTO_VERIFIED can be approved
- ✅ **Teacher Tracking** - Records which teacher performed scan

### 6. **Database Schema**

#### Updated AcademicCertificate Model
```javascript
{
  // Existing fields...
  scanStatus: 'not_scanned' | 'scanning' | 'scanned',
  scanResult: 'AUTO_VERIFIED' | 'AUTO_REJECTED' | 'SOURCE_NOT_DIGITALLY_VERIFIABLE' | null,
  scannedAt: Date,
  scannedByTeacherId: String,
  certificateHash: String,
  verificationDetails: {
    qrCodeFound: Boolean,
    qrCodeData: String,
    verificationUrl: String,
    extractedStudentName: String,
    extractedCourseName: String,
    urlVerificationStatus: String,
    tamperingDetected: Boolean,
    verificationNotes: String
  }
}
```

---

## 📂 Files Created/Modified

### New Files
1. **Backend/utils/certificateScanService.js** - Core scanning service
2. **Frontend/smart-student-hub/src/components/CertificateScannerModal.jsx** - Scanner UI component

### Modified Files
1. **Backend/models/Student.js** - Added scan fields to academicCertificateSchema
2. **Backend/models/AcademicCertificate.js** - Added scan fields
3. **Backend/app.js** - Added scan endpoints and updated review logic
4. **Frontend/smart-student-hub/src/components/TeacherDashboard.jsx** - Integrated scanner UI and logic

### Dependencies Installed
**Backend:**
- `jsqr` - QR code reading
- `tesseract.js` - OCR processing
- `jimp` - Image manipulation (already installed)

**Frontend:**
- `html5-qrcode` - Camera-based QR scanning

---

## 🚀 How to Use

### For Teachers:

1. **Navigate to Certificate Review**
   - Go to Teacher Dashboard
   - Click "Certificate Review" tab

2. **Scan Certificate**
   - Click "Scan Certificate" button on any pending certificate
   - Choose scan method:
     - **Auto-scan** - Scans the uploaded certificate file
     - **Camera scan** - Opens camera to scan physical certificate or screen QR

3. **View Results**
   - ✅ **Green badge** = AUTO_VERIFIED (can approve)
   - ❌ **Red badge** = AUTO_REJECTED (should reject)
   - ⚠️ **Yellow badge** = SOURCE_NOT_DIGITALLY_VERIFIABLE (manual review)

4. **Approve or Reject**
   - Approve button only works for AUTO_VERIFIED certificates
   - Must scan before approving or rejecting
   - Add feedback if needed

---

## 🔧 Technical Implementation

### Scan Service (`certificateScanService.js`)

#### 1. QR Code Extraction
```javascript
extractQRCode(imageUrl)
  → Loads image with Jimp
  → Scans for QR using jsQR
  → Extracts verification URL
```

#### 2. OCR Processing
```javascript
performOCR(imageUrl)
  → Uses Tesseract.js for text extraction
  → Pattern matching for student/course names
  → Returns extracted data
```

#### 3. URL Verification
```javascript
verifyUrl(url, expectedData)
  → Makes HTTP request to verification URL
  → Checks status code (must be 200)
  → Validates student name match
  → Validates course name match
```

#### 4. Tampering Detection
```javascript
detectTampering(currentHash, originalHash)
  → Compares SHA-256 hashes
  → Returns true if mismatch detected
```

#### 5. Complete Scan Flow
```javascript
scanAndVerifyCertificate()
  → Step 1: Generate hash
  → Step 2: Detect tampering
  → Step 3: Extract QR code
  → Step 4: Perform OCR
  → Step 5: Verify URL
  → Step 6: Determine final result
```

### Scanner Modal Component

#### Features:
- **Two scanning modes**: Auto-scan and Camera-scan
- **PhonePe-like animation**: Circular progress with gradient
- **Real-time progress**: Shows scan stages
- **Error handling**: Displays user-friendly error messages
- **Responsive design**: Works on desktop and mobile

#### State Management:
```javascript
scanMode: 'auto' | 'camera'
isScanning: boolean
scanProgress: 0-100
scanMessage: string
error: string | null
```

---

## 🔒 Security Features

### 1. Rate Limiting
- 5-second cooldown between scans per teacher per certificate
- Prevents scan abuse and server overload

### 2. Scan-Before-Approve
- Approve/Reject buttons disabled until scan completes
- Backend validation ensures scan occurred
- Frontend and backend enforcement

### 3. Auto-Verified Only Approval
- Only AUTO_VERIFIED certificates can be approved
- Backend rejects approval attempts for other statuses
- Clear error messages guide teachers

### 4. Audit Trail
- Records who performed scan (`scannedByTeacherId`)
- Timestamp of scan (`scannedAt`)
- Verification details logged
- Enables accountability and debugging

### 5. Tampering Detection
- SHA-256 hash comparison
- Detects image manipulation
- Flags edited certificates

---

## 🎨 UI/UX Design

### Scan Status Badges

**AUTO_VERIFIED** (Green)
```
✓ Auto Verified - QR & URL Verified
Background: Green-100, Text: Green-800, Border: Green-300
```

**AUTO_REJECTED** (Red)
```
✗ Auto Rejected - Verification Failed
Background: Red-100, Text: Red-800, Border: Red-300
```

**SOURCE_NOT_DIGITALLY_VERIFIABLE** (Yellow)
```
⚠ Not Digitally Verifiable - No QR Found
Background: Yellow-100, Text: Yellow-800, Border: Yellow-300
```

### Scan Button States

**Not Scanned** (Default)
- Gradient blue-to-purple background
- White text
- Hover: Scale up, darker gradient
- Text: "Scan Certificate"

**Scanning** (In Progress)
- Gray background
- Disabled cursor
- Text: "Scanning..."

**Scanned** (Completed)
- Light blue background
- Blue text
- Blue border
- Text: "Re-scan Certificate"

### Approve/Reject Buttons

**Before Scan**
- Gray background
- Disabled cursor
- Alert shown on click

**After Scan (AUTO_VERIFIED)**
- Approve: Green, enabled
- Reject: Red, enabled

**After Scan (AUTO_REJECTED or NOT_VERIFIABLE)**
- Approve: Gray, disabled (with alert)
- Reject: Red, enabled

---

## 📊 Verification Results Flow

```
Certificate Upload
    ↓
Teacher clicks "Scan Certificate"
    ↓
System scans → QR Found?
    ├─ YES → Verify URL
    │         ├─ Success + Data Match → AUTO_VERIFIED ✅
    │         ├─ Success + Data Mismatch → AUTO_REJECTED ❌
    │         └─ Failed → AUTO_REJECTED ❌
    └─ NO → SOURCE_NOT_DIGITALLY_VERIFIABLE ⚠️
    ↓
Tampering Check
    ├─ Hash Match → Keep Result
    └─ Hash Mismatch → AUTO_REJECTED ❌
    ↓
Display Result to Teacher
    ↓
Teacher Decision
    ├─ AUTO_VERIFIED → Can Approve ✓
    ├─ AUTO_REJECTED → Should Reject ✗
    └─ NOT_VERIFIABLE → Manual Review ⚠️
```

---

## 🧪 Testing Scenarios

### Test 1: Certificate with Valid QR Code
1. Upload certificate with working QR code
2. Click "Scan Certificate"
3. Expected: AUTO_VERIFIED status
4. Approve button should be enabled

### Test 2: Certificate with Invalid QR URL
1. Upload certificate with QR pointing to invalid URL
2. Click "Scan Certificate"
3. Expected: AUTO_REJECTED status
4. Approve button should be disabled

### Test 3: Certificate without QR Code
1. Upload certificate without QR code
2. Click "Scan Certificate"
3. Expected: SOURCE_NOT_DIGITALLY_VERIFIABLE status
4. Approve button should be disabled

### Test 4: Tampered Certificate
1. Upload certificate that was previously scanned
2. Modify the image
3. Re-upload and scan
4. Expected: AUTO_REJECTED with tampering detected

### Test 5: Rate Limiting
1. Scan a certificate
2. Immediately try to scan again
3. Expected: Error message "Please wait X seconds"

### Test 6: Approve Without Scan
1. Try to click Approve before scanning
2. Expected: Alert "Please scan the certificate before approving"

---

## 🐛 Known Limitations

1. **OCR Accuracy**: Text extraction depends on certificate image quality
2. **QR Code Positioning**: QR codes must be clearly visible in the image
3. **Network Dependency**: URL verification requires internet connectivity
4. **Camera Access**: Camera scan requires browser permission
5. **Supported Formats**: Works best with images (PNG, JPG); PDF support limited

---

## 🔮 Future Enhancements

1. **Blockchain Integration**: Store certificate hashes on blockchain
2. **AI-based Forgery Detection**: Use ML to detect fake certificates
3. **Batch Scanning**: Scan multiple certificates at once
4. **Mobile App Integration**: Native mobile scanning experience
5. **Certificate Template Recognition**: Auto-detect certificate issuers
6. **Advanced OCR**: Support for multiple languages
7. **Verification History**: Show previous scan attempts
8. **Admin Dashboard**: Statistics on verification results

---

## 📝 Sample Code Snippets

### Scanning a Certificate (Frontend)
```javascript
const handleScanClick = (cert) => {
  setScanningCert(cert);
  setShowScannerModal(true);
};

const handleScanComplete = async (scanData) => {
  // Show result
  alert(scanData.scanResult);
  
  // Refresh certificates
  const certsRes = await api.get('/api/review/academic-certificates');
  setPendingCertificates(certsRes.data);
};
```

### Approving a Certificate (Frontend)
```javascript
const handleApprove = async (cert) => {
  if (cert.scanResult !== 'AUTO_VERIFIED') {
    alert('Only AUTO_VERIFIED certificates can be approved');
    return;
  }
  
  await api.post(
    `/api/review/academic-certificates/${cert.studentId}/${cert.certificateId}/approve-with-scan`,
    { feedback: 'Verified and approved' }
  );
};
```

### Backend Scan Endpoint
```javascript
app.post('/api/scan-certificate/:studentId/:certificateId', async (req, res) => {
  // Rate limiting check
  // Find certificate
  // Perform scan
  // Update database
  // Return result
});
```

---

## 🎓 Educational Value

This feature demonstrates:
- **Image Processing**: QR decoding, OCR
- **Security**: Hashing, tampering detection
- **API Design**: RESTful endpoints
- **UI/UX**: Loading states, animations
- **Database Design**: Schema design for verification data
- **Rate Limiting**: Preventing abuse
- **Error Handling**: User-friendly messages

---

## ✅ Checklist for Deployment

- [x] Database schema updated
- [x] Backend service created
- [x] API endpoints implemented
- [x] Frontend component created
- [x] UI integrated in Teacher Dashboard
- [x] Dependencies installed
- [x] Security features implemented
- [x] Documentation created
- [ ] Integration testing
- [ ] Performance testing
- [ ] Deploy to production

---

## 📞 Support

For issues or questions:
1. Check verification details in certificate card
2. Review error messages in scan modal
3. Check browser console for detailed errors
4. Verify network connectivity
5. Ensure camera permissions (for camera scan)

---

**Last Updated**: January 18, 2026
**Version**: 1.0.0
**Status**: ✅ Implementation Complete
