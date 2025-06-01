import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';

const DocumentUpload = ({ onUploadSuccess }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;
      
      const formData = new FormData();
      formData.append('file', acceptedFiles[0]);
      
      try {
        setIsUploading(true);
        setError(null);
        
        const response = await fetch('http://localhost:8000/api/upload/', {
          method: 'POST',
          body: formData,
          credentials: 'include',  // Equivalent to withCredentials: true
          // Headers are not needed for FormData with fetch
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Upload failed');
        }

        const data = await response.json();
        onUploadSuccess(data);
      } catch (error) {
        console.error('Upload error:', error);
        setError(error.message || 'Failed to upload document. Please try again.');
      } finally {
        setIsUploading(false);
      }
    },
  });

  return (
    <div {...getRootProps()} style={dropzoneStyles}>
      <input {...getInputProps()} />
      {isUploading ? (
        <p>Uploading...</p>
      ) : (
        <>
          <p>Drag & drop a PDF, DOCX, or TXT file here, or click to select</p>
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </>
      )}
    </div>
  );
};

const dropzoneStyles = {
  border: '2px dashed #cccccc',
  borderRadius: '4px',
  padding: '20px',
  textAlign: 'center',
  cursor: 'pointer',
  margin: '20px 0',
};

export default DocumentUpload;