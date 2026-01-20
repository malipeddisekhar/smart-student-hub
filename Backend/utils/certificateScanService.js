const crypto = require('crypto');
const axios = require('axios');
const Jimp = require('jimp');
const jsQR = require('jsqr');
const Tesseract = require('tesseract.js');
const { PDFParse } = require('pdf-parse');

/**
 * Certificate Scan Service
 * Handles QR code extraction, OCR, verification, and tampering detection
 */

/**
 * Generate SHA-256 hash of certificate image
 * @param {string} imageUrl - URL or path of the certificate image
 * @returns {Promise<string>} - SHA-256 hash
 */
async function generateCertificateHash(imageUrl) {
  try {
    let imageBuffer;
    
    // Check if it's a URL or local path
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      imageBuffer = Buffer.from(response.data);
    } else {
      const fs = require('fs');
      imageBuffer = fs.readFileSync(imageUrl);
    }
    
    const hash = crypto.createHash('sha256').update(imageBuffer).digest('hex');
    return hash;
  } catch (error) {
    console.error('Error generating certificate hash:', error);
    throw new Error('Failed to generate certificate hash');
  }
}

/**
 * Extract QR code from certificate image
 * @param {string} imageUrl - URL or path of the certificate image
 * @returns {Promise<object>} - QR code data and verification URL
 */
async function extractQRCode(imageUrl) {
  try {
    let image;
    
    // Load image using Jimp
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      image = await Jimp.read(imageUrl);
    } else {
      image = await Jimp.read(imageUrl);
    }
    
    // Convert to raw image data for jsQR
    const imageData = {
      data: new Uint8ClampedArray(image.bitmap.data),
      width: image.bitmap.width,
      height: image.bitmap.height
    };
    
    // Scan for QR code
    const qrCode = jsQR(imageData.data, imageData.width, imageData.height);
    
    if (qrCode) {
      return {
        found: true,
        data: qrCode.data,
        verificationUrl: extractVerificationUrl(qrCode.data)
      };
    }
    
    return { found: false, data: null, verificationUrl: null };
  } catch (error) {
    console.error('Error extracting QR code:', error);
    return { found: false, data: null, verificationUrl: null, error: error.message };
  }
}

/**
 * Extract verification URL from QR code data
 * @param {string} qrData - QR code data
 * @returns {string|null} - Verification URL if found
 */
function extractVerificationUrl(qrData) {
  // Check if QR data is already a URL
  const urlPattern = /^https?:\/\/.+/i;
  if (urlPattern.test(qrData)) {
    return qrData;
  }
  
  // Try to extract URL from JSON or text
  try {
    const parsed = JSON.parse(qrData);
    if (parsed.verificationUrl || parsed.url || parsed.link) {
      return parsed.verificationUrl || parsed.url || parsed.link;
    }
  } catch (e) {
    // Not JSON, try to find URL in plain text
    const match = qrData.match(/https?:\/\/[^\s]+/i);
    if (match) {
      return match[0];
    }
  }
  
  return null;
}

/**
 * Perform OCR on certificate image to extract text
 * @param {string} imageUrl - URL or path of the certificate image
 * @returns {Promise<object>} - Extracted text and student/course names
 */
async function performOCR(imageUrl) {
  try {
    const { data: { text } } = await Tesseract.recognize(imageUrl, 'eng', {
      logger: m => console.log(m)
    });
    
    // Log the full extracted text for debugging
    console.log('Full OCR text:', text.substring(0, 300));
    
    // Extract student name and course name using patterns
    const studentName = extractStudentName(text);
    const courseName = extractCourseName(text);
    
    return {
      fullText: text,
      studentName,
      courseName
    };
  } catch (error) {
    console.error('Error performing OCR:', error);
    return {
      fullText: '',
      studentName: null,
      courseName: null,
      error: error.message
    };
  }
}

/**
 * Extract student name from OCR text
 * @param {string} text - OCR extracted text
 * @returns {string|null} - Student name if found
 */
function extractStudentName(text) {
  console.log('Attempting to extract student name from text (length:', text.length, ')');
  console.log('Text preview:', text.substring(0, 200));
  
  // Common patterns for student names in certificates
  const patterns = [
    // Pattern 1: "awarded to [NAME] for" (common in certificates)
    /(?:awarded to|presented to|this certifies that|certificate is awarded to)\s*\n?\s*([A-Z][A-Z\s]+?)\s*(?:\n|for|$)/i,
    // Pattern 2: "Student name: [NAME]"
    /(?:student name|candidate|recipient):\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i,
    // Pattern 3: NPTEL PDF format - line after course name (all caps, multiple words, 10+ chars)
    /(?:course|engineering|science|technology|management)\s*\n\s*([A-Z][A-Z\s]{10,}?)\s*\n/i,
    // Pattern 4: Multiple capital letter words on one line (3+ words, all caps)
    /\n([A-Z][A-Z]+(?:\s+[A-Z][A-Z]+){2,})\s*\n/,
    // Pattern 5: Mixed case names (First Last format) after "awarded to"  
    /(?:awarded to|presented to)\s*\n?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i,
    // Pattern 6: All caps name (2+ words) anywhere in text
    /\b([A-Z]{3,}(?:\s+[A-Z]{3,})+)\b/
  ];
  
  for (let i = 0; i < patterns.length; i++) {
    const pattern = patterns[i];
    const match = text.match(pattern);
    if (match && match[1]) {
      const name = match[1].trim();
      // Clean up: remove any trailing words like "for", "with", etc
      const cleanName = name.replace(/\s+(for|with|successfully|completing|course|the|a).*$/i, '');
      const finalName = cleanName.trim();
      
      // Validate: name should be at least 2 words (first + last name minimum)
      const words = finalName.split(/\s+/).filter(w => w.length > 1);
      if (words.length >= 2) {
        console.log(`✓ Extracted name using pattern ${i + 1}:`, finalName);
        return finalName;
      }
    }
  }
  
  console.log('✗ Could not extract student name from text');
  return null;
}

/**
 * Extract course/certificate name from OCR text
 * @param {string} text - OCR extracted text
 * @returns {string|null} - Course name if found
 */
function extractCourseName(text) {
  // Common patterns for course names in certificates
  const patterns = [
    /(?:certificate of|course:|program:|certification in)\s*([A-Za-z0-9\s]+?)(?:\n|$|awarded|presented)/i,
    /(?:successfully completing the course)\s*\n\s*([A-Za-z][A-Za-z\s]+?)\s*(?:\n|$)/i,
    /(?:completing the course|completion of)\s*\n?\s*([A-Za-z][A-Za-z\s]+?)\s*(?:\n|with|$)/i,
    /(?:successfully completed|completion of)\s*([A-Za-z0-9\s]+?)(?:\n|$|course|program)/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const courseName = match[1].trim();
      // Filter out numbers-only matches (like "4458")
      // Also remove trailing words like "with", "a", etc
      const cleanCourseName = courseName.replace(/\s+(with|a|an|the)\s*$/i, '');
      if (!/^\d+$/.test(cleanCourseName.trim())) {
        return cleanCourseName.trim();
      }
    }
  }
  
  return null;
}

/**
 * Extract PDF URL from HTML response and download/parse the PDF
 * @param {string} htmlContent - HTML content from verification URL
 * @param {string} baseUrl - Base URL for resolving relative paths
 * @returns {Promise<object>} - PDF text and extracted name
 */
async function extractAndParsePDF(htmlContent, baseUrl) {
  try {
    // Extract PDF link from HTML - handle both quoted and unquoted href attributes
    // NPTEL uses: href=../../path/to/cert.pdf (no quotes)
    // Others use: href="path/to/cert.pdf" or href='path/to/cert.pdf'
    const pdfLinkMatch = htmlContent.match(/href=["']?([^"'\s>]*\.pdf)["']?/i);
    
    if (!pdfLinkMatch) {
      console.log('No PDF link found in HTML');
      console.log('HTML preview for debugging:', htmlContent.substring(0, 500));
      return { success: false, text: null, studentName: null };
    }
    
    let pdfUrl = pdfLinkMatch[1];
    
    console.log('Raw PDF href from HTML:', pdfUrl);
    
    // Resolve relative URL - preserve exact case from HTML
    if (pdfUrl.startsWith('../') || pdfUrl.startsWith('./')) {
      const urlObj = new URL(baseUrl);
      
      // For NPTEL-style relative paths (../../content/...), just use domain + path
      // This preserves the exact casing from the HTML
      if (pdfUrl.startsWith('../')) {
        // Count how many levels up
        const upLevels = (pdfUrl.match(/\.\.\//g) || []).length;
        // Remove all ../ to get the actual path
        const actualPath = pdfUrl.replace(/\.\.\//g, '');
        // Just use domain + path (ignore baseUrl path to avoid case issues)
        pdfUrl = `${urlObj.protocol}//${urlObj.host}/${actualPath}`;
      } else {
        // Handle ./ paths
        const actualPath = pdfUrl.replace(/^\.\//g, '');
        const basePath = urlObj.pathname.split('/').slice(0, -1).join('/');
        pdfUrl = `${urlObj.protocol}//${urlObj.host}${basePath}/${actualPath}`;
      }
    } else if (!pdfUrl.startsWith('http')) {
      // Absolute path
      const urlObj = new URL(baseUrl);
      pdfUrl = `${urlObj.protocol}//${urlObj.host}${pdfUrl}`;
    }
    
    console.log('Downloading PDF from:', pdfUrl);
    
    // Download PDF - try original URL first, then archive domain if NPTEL
    let pdfResponse;
    let downloadError;
    
    try {
      pdfResponse = await axios.get(pdfUrl, {
        responseType: 'arraybuffer',
        timeout: 15000,
        validateStatus: (status) => status < 500
      });
      
      // If 404 and this is NPTEL, try archive domain
      if (pdfResponse.status === 404 && pdfUrl.includes('nptel.ac.in')) {
        console.log('404 on main domain, trying archive.nptel.ac.in...');
        const archiveUrl = pdfUrl.replace('://nptel.ac.in/', '://archive.nptel.ac.in/');
        console.log('Downloading PDF from archive:', archiveUrl);
        
        pdfResponse = await axios.get(archiveUrl, {
          responseType: 'arraybuffer',
          timeout: 15000
        });
      }
    } catch (error) {
      // If main URL fails and this is NPTEL, try archive domain
      if (pdfUrl.includes('nptel.ac.in')) {
        console.log('Error on main domain, trying archive.nptel.ac.in...');
        const archiveUrl = pdfUrl.replace('://nptel.ac.in/', '://archive.nptel.ac.in/');
        console.log('Downloading PDF from archive:', archiveUrl);
        
        try {
          pdfResponse = await axios.get(archiveUrl, {
            responseType: 'arraybuffer',
            timeout: 15000
          });
        } catch (archiveError) {
          downloadError = archiveError;
        }
      } else {
        downloadError = error;
      }
    }
    
    if (downloadError) {
      throw downloadError;
    }
    
    if (pdfResponse.status !== 200) {
      console.log('Failed to download PDF, status:', pdfResponse.status);
      return { success: false, text: null, studentName: null };
    }
    
    console.log('PDF downloaded, size:', pdfResponse.data.length, 'bytes');
    
    // Parse PDF using PDFParse class from pdf-parse v2.4.5
    // Convert Buffer to Uint8Array as required by the library
    const uint8Array = new Uint8Array(pdfResponse.data);
    const parser = new PDFParse(uint8Array);
    await parser.load(); // Load the PDF
    
    // getText() returns an object with text content per page
    const textResult = await parser.getText();
    console.log('getText() result type:', typeof textResult);
    console.log('getText() result:', JSON.stringify(textResult).substring(0, 200));
    
    // Extract text from all pages
    let pdfText = '';
    if (typeof textResult === 'string') {
      pdfText = textResult;
    } else if (Array.isArray(textResult)) {
      // If it's an array of page texts
      pdfText = textResult.join('\n');
    } else if (textResult && typeof textResult === 'object') {
      // If it's an object with page data
      if (textResult.text) {
        pdfText = textResult.text;
      } else if (textResult.pages) {
        pdfText = textResult.pages.map(p => p.text || p).join('\n');
      } else {
        // Try to stringify and extract text
        pdfText = JSON.stringify(textResult);
      }
    }
    
    console.log('PDF text extracted, length:', pdfText.length, 'chars');
    console.log('PDF text preview:', pdfText.substring(0, 300));
    
    // Extract student name from PDF using same logic as OCR
    const studentName = extractStudentName(pdfText);
    
    return {
      success: true,
      text: pdfText,
      studentName,
      pdfUrl
    };
  } catch (error) {
    console.error('Error extracting/parsing PDF:', error.message);
    return { success: false, text: null, studentName: null, error: error.message };
  }
}

/**
 * Verify certificate URL
 * @param {string} verificationUrl - URL to verify
 * @param {object} expectedData - Expected student name and course name
 * @returns {Promise<object>} - Verification result
 */
async function verifyUrl(verificationUrl, expectedData = {}) {
  try {
    if (!verificationUrl) {
      return {
        success: false,
        status: 'NO_URL',
        message: 'No verification URL found'
      };
    }
    
    // Check if URL is from a trusted certificate issuer
    const trustedDomains = [
      'nptel.ac.in',
      'coursera.org',
      'udemy.com',
      'edx.org',
      'linkedin.com/learning',
      'udacity.com',
      'skillsoft.com',
      'pluralsight.com'
    ];
    
    const urlObj = new URL(verificationUrl);
    const isTrustedDomain = trustedDomains.some(domain => 
      urlObj.hostname.includes(domain) || urlObj.hostname.endsWith(domain)
    );
    
    // Make request to verification URL
    const response = await axios.get(verificationUrl, {
      timeout: 10000,
      validateStatus: (status) => status < 500 // Accept any status < 500
    });
    
    if (response.status !== 200) {
      return {
        success: false,
        status: 'HTTP_ERROR',
        statusCode: response.status,
        message: `Verification URL returned status ${response.status}`
      };
    }
    
    // Keep original HTML for PDF extraction
    const originalHtml = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
    
    // Check if response contains expected data (for ALL domains)
    // Handle both HTML and JSON responses
    let responseText = '';
    if (typeof response.data === 'string') {
      responseText = response.data.toLowerCase();
    } else if (typeof response.data === 'object') {
      responseText = JSON.stringify(response.data).toLowerCase();
    }
    
    console.log('===== VERIFICATION URL RESPONSE =====');
    console.log('Response preview (first 500 chars):', responseText.substring(0, 500));
    console.log('Expected student name:', expectedData.studentName);
    console.log('Expected course name:', expectedData.courseName);
    
    // For student name matching, be flexible with name formats
    let studentNameMatch = true;
    if (expectedData.studentName && expectedData.studentName.length > 3) {
      const nameLower = expectedData.studentName.toLowerCase();
      // Check if the response contains the full name or significant parts
      studentNameMatch = responseText.includes(nameLower);
      
      console.log(`Full name match (${nameLower}):`, studentNameMatch);
      
      // If full name doesn't match, try matching individual words (for multi-word names)
      if (!studentNameMatch) {
        const nameWords = nameLower.split(/\s+/).filter(word => word.length > 2);
        console.log('Trying word-by-word matching for:', nameWords);
        
        // Consider it a match if at least 70% of significant name words are found
        const matchingWords = nameWords.filter(word => {
          const found = responseText.includes(word);
          console.log(`  - Word "${word}": ${found ? 'FOUND' : 'NOT FOUND'}`);
          return found;
        });
        const matchRatio = matchingWords.length / nameWords.length;
        studentNameMatch = matchRatio >= 0.7;
        console.log(`Name words match ratio: ${matchingWords.length}/${nameWords.length} = ${(matchRatio * 100).toFixed(0)}% (need 70%)`);
      }
    }
    
    const courseNameMatch = expectedData.courseName ? 
      responseText.includes(expectedData.courseName.toLowerCase()) : true;
    
    console.log('Student name match:', studentNameMatch);
    console.log('Course name match:', courseNameMatch);
    
    // For trusted domains, try to extract and parse the PDF certificate
    // This is the CORRECT way - compare name on uploaded image with name in original PDF
    if (isTrustedDomain) {
      console.log('Trusted domain detected:', urlObj.hostname);
      console.log('Attempting to extract PDF from verification page...');
      
      // Try to extract PDF from HTML response - use ORIGINAL HTML, not lowercased
      const pdfResult = await extractAndParsePDF(originalHtml, verificationUrl);
      
      if (pdfResult.success && pdfResult.studentName) {
        console.log('===== PDF VERIFICATION =====');
        console.log('Name in PDF (authentic):', pdfResult.studentName);
        console.log('Name in uploaded image (OCR):', expectedData.studentName);
        
        // Compare name in PDF with name extracted from uploaded image
        if (expectedData.studentName) {
          const pdfNameLower = pdfResult.studentName.toLowerCase().trim();
          const uploadedNameLower = expectedData.studentName.toLowerCase().trim();
          
          let namesMatch = pdfNameLower === uploadedNameLower;
          
          // Fuzzy matching if exact match fails
          if (!namesMatch) {
            const pdfWords = pdfNameLower.split(/\s+/).filter(w => w.length > 2);
            const uploadedWords = uploadedNameLower.split(/\s+/).filter(w => w.length > 2);
            
            if (pdfWords.length > 0 && uploadedWords.length > 0) {
              const matchingWords = pdfWords.filter(pdfWord => 
                uploadedWords.some(upWord => 
                  pdfWord.includes(upWord) || upWord.includes(pdfWord) || pdfWord === upWord
                )
              );
              const matchRatio = matchingWords.length / Math.max(pdfWords.length, uploadedWords.length);
              namesMatch = matchRatio >= 0.5;
              
              console.log(`PDF vs Image name match: ${matchingWords.length}/${Math.max(pdfWords.length, uploadedWords.length)} words = ${(matchRatio * 100).toFixed(0)}% (need 50%)`);
            }
          } else {
            console.log('✓ Exact name match between PDF and uploaded image');
          }
          
          console.log('Names match:', namesMatch);
          
          return {
            success: true,
            status: 'VERIFIED',
            statusCode: 200,
            trustedDomain: true,
            studentNameMatch: namesMatch,
            courseNameMatch: true,
            dataMatch: namesMatch,
            pdfVerified: true,
            pdfName: pdfResult.studentName,
            message: namesMatch 
              ? 'Certificate verified - PDF name matches uploaded image' 
              : 'Certificate appears to be edited - PDF name does not match uploaded image',
            responseData: response.data
          };
        }
      }
      
      // Fallback if PDF parsing failed - just verify URL is reachable
      console.log('PDF parsing failed or no name found, using basic URL verification');
      return {
        success: true,
        status: 'VERIFIED',
        statusCode: 200,
        trustedDomain: true,
        studentNameMatch: true,
        courseNameMatch: true,
        dataMatch: true,
        pdfVerified: false,
        message: 'Certificate verified via trusted domain QR code (PDF parsing unavailable)',
        responseData: response.data
      };
    }
    
    // For non-trusted domains, use the same matching logic
    const hasValidStudentName = expectedData.studentName && expectedData.studentName.length > 3;
    const hasValidCourseName = expectedData.courseName && expectedData.courseName.length > 2 && !/^\d+$/.test(expectedData.courseName);
    
    const finalDataMatch = (!hasValidStudentName || studentNameMatch) && (!hasValidCourseName || courseNameMatch);
    
    console.log('Final data match:', finalDataMatch, '(hasValidStudentName:', hasValidStudentName, ', hasValidCourseName:', hasValidCourseName, ')');
    
    return {
      success: true,
      status: 'VERIFIED',
      statusCode: 200,
      trustedDomain: false,
      studentNameMatch,
      courseNameMatch,
      dataMatch: finalDataMatch,
      responseData: response.data
    };
  } catch (error) {
    console.error('Error verifying URL:', error);
    return {
      success: false,
      status: 'NETWORK_ERROR',
      message: error.message
    };
  }
}

/**
 * Detect tampering by comparing hashes
 * @param {string} currentHash - Current certificate hash
 * @param {string} originalHash - Original certificate hash (if available)
 * @returns {boolean} - True if tampering detected
 */
function detectTampering(currentHash, originalHash) {
  if (!originalHash) {
    // No original hash to compare, cannot detect tampering
    return false;
  }
  
  return currentHash !== originalHash;
}

/**
 * Complete certificate scan and verification
 * @param {string} certificateImageUrl - Certificate image URL
 * @param {object} studentData - Student data for verification
 * @param {string} originalHash - Original certificate hash (optional)
 * @returns {Promise<object>} - Complete scan result
 */
async function scanAndVerifyCertificate(certificateImageUrl, studentData = {}, originalHash = null) {
  try {
    console.log('Starting certificate scan and verification...');
    console.log('Certificate URL:', certificateImageUrl);
    
    // Step 1: Generate certificate hash (simplified for now)
    let currentHash = null;
    try {
      currentHash = await generateCertificateHash(certificateImageUrl);
      console.log('Certificate hash generated:', currentHash);
    } catch (hashError) {
      console.warn('Hash generation failed:', hashError.message);
      currentHash = 'hash-' + Date.now();
    }
    
    // Step 2: Detect tampering
    const tamperingDetected = detectTampering(currentHash, originalHash);
    
    // Step 3: Extract QR code
    let qrResult = { found: false, data: null, verificationUrl: null };
    try {
      qrResult = await extractQRCode(certificateImageUrl);
      console.log('QR extraction result:', qrResult.found ? 'Found' : 'Not found');
      if (qrResult.found) {
        console.log('QR data:', qrResult.data);
        console.log('Verification URL:', qrResult.verificationUrl);
      }
    } catch (qrError) {
      console.warn('QR extraction failed:', qrError.message);
    }
    
    // Step 4: Perform OCR to extract name from uploaded image
    let ocrResult = { fullText: '', studentName: null, courseName: null };
    try {
      console.log('Attempting OCR on uploaded image...');
      ocrResult = await performOCR(certificateImageUrl);
      console.log('OCR completed');
      if (ocrResult.studentName) console.log('Extracted student name from uploaded image:', ocrResult.studentName);
      if (ocrResult.courseName) console.log('Extracted course name from uploaded image:', ocrResult.courseName);
    } catch (ocrError) {
      console.warn('OCR failed:', ocrError.message);
    }
    
    // Step 5: Verify URL if QR code found
    // This will download the PDF from QR and compare names
    let urlVerificationResult = { success: false, status: 'NOT_ATTEMPTED' };
    if (qrResult.found && qrResult.verificationUrl) {
      try {
        // Use OCR-extracted data from certificate, NOT the uploader's data
        // We're verifying the certificate is authentic, not that it belongs to the uploader
        urlVerificationResult = await verifyUrl(qrResult.verificationUrl, {
          studentName: ocrResult.studentName,
          courseName: ocrResult.courseName
        });
        console.log('URL verification result:', urlVerificationResult.status);
      } catch (urlError) {
        console.warn('URL verification failed:', urlError.message);
        urlVerificationResult = { success: false, status: 'ERROR', message: urlError.message };
      }
    }
    
    // Step 6: Determine final scan result
    let scanResult = 'SOURCE_NOT_DIGITALLY_VERIFIABLE';
    let verificationNotes = [];
    
    if (tamperingDetected) {
      scanResult = 'AUTO_REJECTED';
      verificationNotes.push('Tampering detected - certificate hash mismatch');
    } else if (qrResult.found && urlVerificationResult.success && urlVerificationResult.dataMatch) {
      scanResult = 'AUTO_VERIFIED';
      verificationNotes.push('QR code found, URL verified, data matches');
    } else if (qrResult.found && urlVerificationResult.success && !urlVerificationResult.dataMatch) {
      scanResult = 'AUTO_REJECTED';
      verificationNotes.push('QR code found, URL verified, but student/course name mismatch');
    } else if (qrResult.found && !urlVerificationResult.success) {
      scanResult = 'AUTO_REJECTED';
      verificationNotes.push('QR code found but verification URL failed or unreachable');
    } else if (!qrResult.found) {
      scanResult = 'SOURCE_NOT_DIGITALLY_VERIFIABLE';
      verificationNotes.push('No QR code found - cannot verify digitally');
    }
    
    console.log('Final scan result:', scanResult);
    
    return {
      scanResult,
      certificateHash: currentHash,
      verificationDetails: {
        qrCodeFound: qrResult.found,
        qrCodeData: qrResult.data,
        verificationUrl: qrResult.verificationUrl,
        extractedStudentName: ocrResult.studentName,
        extractedCourseName: ocrResult.courseName,
        urlVerificationStatus: urlVerificationResult.status,
        tamperingDetected,
        verificationNotes: verificationNotes.join('; ')
      }
    };
  } catch (error) {
    console.error('Error in scan and verification:', error);
    // Return a safe fallback instead of throwing
    return {
      scanResult: 'SOURCE_NOT_DIGITALLY_VERIFIABLE',
      certificateHash: null,
      verificationDetails: {
        qrCodeFound: false,
        qrCodeData: null,
        verificationUrl: null,
        extractedStudentName: null,
        extractedCourseName: null,
        urlVerificationStatus: 'ERROR',
        tamperingDetected: false,
        verificationNotes: 'Scan failed: ' + error.message
      }
    };
  }
}

module.exports = {
  generateCertificateHash,
  extractQRCode,
  performOCR,
  verifyUrl,
  detectTampering,
  scanAndVerifyCertificate
};
