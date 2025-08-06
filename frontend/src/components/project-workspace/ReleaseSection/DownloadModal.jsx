import React, { useState, useEffect } from 'react';
import './DownloadModal.css';

const DownloadModal = ({ 
  isOpen, 
  onClose, 
  release, 
  isExporting = false, 
  exportProgress = null 
}) => {
  const [copied, setCopied] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');

  useEffect(() => {
    if (release && release.id) {
      // Construct download URL from release ID
      const baseUrl = window.location.origin;
      setDownloadUrl(`${baseUrl}/api/v1/releases/${release.id}/download`);
    }
  }, [release]);

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const handleDirectDownload = () => {
    if (downloadUrl) {
      // Create a temporary link element and trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${release.name}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getCurlCommand = () => {
    return `curl -O "${downloadUrl}"`;
  };

  const getWgetCommand = () => {
    return `wget "${downloadUrl}"`;
  };

  if (!isOpen) return null;

  return (
    <div className="download-modal-overlay" onClick={onClose}>
      <div className="download-modal" onClick={(e) => e.stopPropagation()}>
        <div className="download-modal-header">
          <h2>
            {isExporting ? (
              <>
                <span className="export-icon">⚙️</span>
                Exporting Release
              </>
            ) : (
              <>
                <span className="download-icon">📦</span>
                Download Release
              </>
            )}
          </h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="download-modal-content">
          {isExporting ? (
            // Export Progress View
            <div className="export-progress-section">
              <div className="release-info">
                <h3>{release?.name || 'New Release'}</h3>
                <p className="release-description">
                  {release?.description || 'Generating release with transformations...'}
                </p>
              </div>

              <div className="progress-container">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${exportProgress?.percentage || 0}%` }}
                  ></div>
                </div>
                <div className="progress-text">
                  {exportProgress?.percentage || 0}% Complete
                </div>
              </div>

              <div className="progress-steps">
                <div className="step-item">
                  <span className="step-icon">
                    {exportProgress?.step === 'initializing' ? '🔄' : '✅'}
                  </span>
                  <span className="step-text">Initializing export process</span>
                </div>
                <div className="step-item">
                  <span className="step-icon">
                    {exportProgress?.step === 'processing_images' ? '🔄' : 
                     exportProgress?.step === 'creating_zip' || exportProgress?.step === 'completed' ? '✅' : '⏳'}
                  </span>
                  <span className="step-text">Processing images and transformations</span>
                </div>
                <div className="step-item">
                  <span className="step-icon">
                    {exportProgress?.step === 'creating_zip' ? '🔄' : 
                     exportProgress?.step === 'completed' ? '✅' : '⏳'}
                  </span>
                  <span className="step-text">Creating ZIP package</span>
                </div>
                <div className="step-item">
                  <span className="step-icon">
                    {exportProgress?.step === 'completed' ? '✅' : '⏳'}
                  </span>
                  <span className="step-text">Export completed</span>
                </div>
              </div>

              {exportProgress?.step === 'completed' && (
                <div className="export-complete-message">
                  <span className="success-icon">🎉</span>
                  <p>Release exported successfully! Choose your download method below.</p>
                </div>
              )}
            </div>
          ) : (
            // Download Options View
            <div className="download-options-section">
              <div className="release-info">
                <h3>{release?.name}</h3>
                <p className="release-description">{release?.description}</p>
                <div className="release-stats">
                  <span className="stat-item">
                    <span className="stat-icon">📊</span>
                    Format: {release?.export_format || 'YOLO'}
                  </span>
                  <span className="stat-item">
                    <span className="stat-icon">🖼️</span>
                    Images: {release?.final_image_count || 
                             (release?.original_image_count && release?.augmented_image_count ? 
                              release.original_image_count + release.augmented_image_count : 
                              release?.total_original_images && release?.total_augmented_images ?
                              release.total_original_images + release.total_augmented_images :
                              'N/A')}
                  </span>
                  <span className="stat-item">
                    <span className="stat-icon">📅</span>
                    Created: {release?.created_at ? new Date(release.created_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="download-methods">
                <h4>Choose Download Method:</h4>
                
                {/* Direct Download Button */}
                <div className="download-method">
                  <div className="method-header">
                    <span className="method-icon">⬇️</span>
                    <span className="method-title">Direct Download</span>
                  </div>
                  <p className="method-description">
                    Download the ZIP file directly to your computer
                  </p>
                  <button 
                    className="download-button primary"
                    onClick={handleDirectDownload}
                    disabled={!downloadUrl}
                  >
                    <span className="button-icon">📦</span>
                    Download ZIP File
                  </button>
                </div>

                {/* Copy Link Method */}
                <div className="download-method">
                  <div className="method-header">
                    <span className="method-icon">🔗</span>
                    <span className="method-title">Copy Download Link</span>
                  </div>
                  <p className="method-description">
                    Copy the download URL to share or use in scripts
                  </p>
                  <div className="copy-section">
                    <input 
                      type="text" 
                      value={downloadUrl} 
                      readOnly 
                      className="copy-input"
                    />
                    <button 
                      className="copy-button"
                      onClick={() => copyToClipboard(downloadUrl)}
                    >
                      {copied ? '✅ Copied!' : '📋 Copy'}
                    </button>
                  </div>
                </div>

                {/* Terminal Commands */}
                <div className="download-method">
                  <div className="method-header">
                    <span className="method-icon">💻</span>
                    <span className="method-title">Terminal Commands</span>
                  </div>
                  <p className="method-description">
                    Use these commands to download from terminal
                  </p>
                  
                  <div className="command-section">
                    <label className="command-label">Using curl:</label>
                    <div className="command-container">
                      <code className="command-text">{getCurlCommand()}</code>
                      <button 
                        className="copy-button small"
                        onClick={() => copyToClipboard(getCurlCommand())}
                      >
                        📋
                      </button>
                    </div>
                  </div>

                  <div className="command-section">
                    <label className="command-label">Using wget:</label>
                    <div className="command-container">
                      <code className="command-text">{getWgetCommand()}</code>
                      <button 
                        className="copy-button small"
                        onClick={() => copyToClipboard(getWgetCommand())}
                      >
                        📋
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="download-modal-footer">
          {isExporting ? (
            <button className="cancel-button" onClick={onClose}>
              Run in Background
            </button>
          ) : (
            <button className="close-button-footer" onClick={onClose}>
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DownloadModal;