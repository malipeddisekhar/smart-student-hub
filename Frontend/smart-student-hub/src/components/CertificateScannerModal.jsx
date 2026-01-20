import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import api from '../services/api';

/**
 * Certificate Scanner Modal Component
 * PhonePe-like scanning experience with QR code detection
 */
const CertificateScannerModal = ({ 
  isOpen, 
  onClose, 
  certificateImageUrl, 
  onScanComplete,
  studentId,
  certificateId 
}) => {
  const [scanMode, setScanMode] = useState('manual'); // 'auto', 'camera', 'file', 'manual'
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanMessage, setScanMessage] = useState('Ready to scan certificate');
  const [error, setError] = useState(null);
  const [qrData, setQrData] = useState(null);
  
  const qrReaderRef = useRef(null);
  const scannerContainerRef = useRef(null);

  useEffect(() => {
    // Cleanup when modal closes
    return () => {
      if (qrReaderRef.current) {
        qrReaderRef.current.stop().catch(err => console.error(err));
      }
    };
  }, [isOpen]);

  /**
   * Auto scan from uploaded certificate file
   */
  const handleAutoScan = async () => {
    setIsScanning(true);
    setScanProgress(10);
    setScanMessage('Loading certificate...');
    setError(null);

    try {
      // Simulate scanning animation
      setScanProgress(30);
      setScanMessage('Analyzing certificate...');
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setScanProgress(50);
      setScanMessage('Searching for QR code...');
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setScanProgress(70);
      setScanMessage('Extracting verification data...');
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setScanProgress(90);
      setScanMessage('Verifying certificate...');
      
      // Call backend scan API using axios
      const response = await api.post(
        `/api/scan-certificate/${studentId}/${certificateId}`,
        {
          teacherId: localStorage.getItem('teacherId') || 'TEACHER001'
        }
      );
      
      const data = response.data;
      
      if (!data) {
        throw new Error('No response from server');
      }
      
      setScanProgress(100);
      setScanMessage('Scan complete!');
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Pass scan result to parent
      onScanComplete(data);
      
    } catch (err) {
      setError(err.message);
      setScanMessage('Scan failed');
      setScanProgress(0);
    } finally {
      setIsScanning(false);
    }
  };

  /**
   * Start camera scanning
   */
  const handleCameraScan = async () => {
    setIsScanning(true);
    setScanMessage('Starting camera...');
    setError(null);

    try {
      const html5QrCode = new Html5Qrcode("qr-reader");
      qrReaderRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" }, // Use back camera
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        (decodedText, decodedResult) => {
          // QR code detected
          setQrData(decodedText);
          setScanMessage('QR code detected!');
          
          // Stop scanning
          html5QrCode.stop().then(() => {
            // Process QR data
            handleQRDetected(decodedText);
          });
        },
        (errorMessage) => {
          // Scanning error (can be ignored for most cases)
        }
      );

      setScanMessage('Point camera at QR code...');
    } catch (err) {
      setError('Failed to access camera: ' + err.message);
      setIsScanning(false);
    }
  };

  /**
   * Handle QR code detection
   */
  /**
   * Handle QR code detection
   */
  const handleQRDetected = async (qrText) => {
    setScanMessage('Verifying QR code...');
    
    try {
      // Send to backend for verification using axios
      const response = await api.post(
        `/api/scan-certificate/${studentId}/${certificateId}`,
        {
          teacherId: localStorage.getItem('teacherId') || 'TEACHER001',
          qrData: qrText
        }
      );
      
      const data = response.data;
      
      if (!data) {
        throw new Error('No response from server');
      }
      
      setScanMessage('Verification complete!');
      onScanComplete(data);
      
    } catch (err) {
      setError(err.message);
      setScanMessage('Verification failed');
    } finally {
      setIsScanning(false);
    }
  };

  /**
   * Stop camera scanning
   */
  const stopCameraScan = () => {
    if (qrReaderRef.current) {
      qrReaderRef.current.stop().catch(err => console.error(err));
      qrReaderRef.current = null;
    }
    setIsScanning(false);
    setScanMessage('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Certificate Scanner</h2>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white text-3xl leading-none"
            >
              ×
            </button>
          </div>
        </div>

        {/* Scan Mode Selection */}
        {!isScanning && !error && (
          <div className="p-6 space-y-4">
            <p className="text-gray-600 text-sm">Choose scanning method:</p>
            
            <button
              onClick={() => {
                setScanMode('auto');
                handleAutoScan();
              }}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-4 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-3"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/>
              </svg>
              <span>Scan Uploaded Certificate</span>
            </button>

            <button
              onClick={() => {
                setScanMode('camera');
                handleCameraScan();
              }}
              className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white py-4 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-3"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
              </svg>
              <span>Scan with Camera</span>
            </button>
          </div>
        )}

        {/* Scanning Animation */}
        {isScanning && scanMode === 'auto' && (
          <div className="p-8">
            <div className="relative">
              {/* PhonePe-like circular progress */}
              <div className="w-48 h-48 mx-auto relative">
                <svg className="transform -rotate-90 w-48 h-48">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="url(#gradient)"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 88}`}
                    strokeDashoffset={`${2 * Math.PI * 88 * (1 - scanProgress / 100)}`}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </svg>
                
                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {scanProgress}%
                  </div>
                  <div className="text-sm text-gray-600 mt-2">Scanning</div>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-gray-700 font-medium">{scanMessage}</p>
              
              {/* Scanning dots animation */}
              <div className="flex justify-center space-x-2 mt-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}

        {/* Camera Scanner */}
        {isScanning && scanMode === 'camera' && (
          <div className="p-6">
            <div id="qr-reader" ref={scannerContainerRef} className="rounded-xl overflow-hidden"></div>
            
            <div className="mt-4 text-center">
              <p className="text-gray-700 font-medium mb-4">{scanMessage}</p>
              
              <button
                onClick={stopCameraScan}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg"
              >
                Stop Scanning
              </button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-6">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                </svg>
                <div>
                  <p className="font-medium text-red-800">Scan Failed</p>
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => {
                  setError(null);
                  setScanMode('auto');
                }}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg"
              >
                Try Again
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificateScannerModal;
