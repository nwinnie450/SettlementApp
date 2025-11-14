import React, { useState, useRef, DragEvent } from 'react';

interface DragDropPhotoUploadProps {
  onPhotoSelect: (photoDataUrl: string) => void;
  currentPhoto?: string | null;
  onRemovePhoto?: () => void;
  maxSizeMB?: number;
}

const DragDropPhotoUpload: React.FC<DragDropPhotoUploadProps> = ({
  onPhotoSelect,
  currentPhoto,
  onRemovePhoto,
  maxSizeMB = 2,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setError('');

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Validate file size
    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      setError(`File is too large. Maximum size is ${maxSizeMB}MB`);
      return;
    }

    // Read file as data URL
    const reader = new FileReader();
    reader.onloadend = () => {
      onPhotoSelect(reader.result as string);
    };
    reader.onerror = () => {
      setError('Failed to read file');
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  if (currentPhoto) {
    return (
      <div
        style={{
          position: 'relative',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '2px solid #e5e7eb',
          backgroundColor: '#f9fafb',
        }}
      >
        <img
          src={currentPhoto}
          alt="Receipt preview"
          style={{
            width: '100%',
            maxHeight: '300px',
            objectFit: 'contain',
            backgroundColor: '#ffffff',
          }}
        />

        <div
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            display: 'flex',
            gap: '8px',
          }}
        >
          {/* Change Photo Button */}
          <button
            type="button"
            onClick={handleBrowseClick}
            style={{
              padding: '8px 16px',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              color: '#14b8a6',
              border: '1px solid rgba(20, 184, 166, 0.3)',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              transition: 'all 200ms ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#14b8a6';
              e.currentTarget.style.color = 'white';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
              e.currentTarget.style.color = '#14b8a6';
            }}
          >
            📷 Change
          </button>

          {/* Remove Button */}
          <button
            type="button"
            onClick={onRemovePhoto}
            style={{
              padding: '8px 16px',
              backgroundColor: 'rgba(239, 68, 68, 0.95)',
              backdropFilter: 'blur(10px)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
              transition: 'all 200ms ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#dc2626';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.95)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            ✕ Remove
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
        />
      </div>
    );
  }

  return (
    <div>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
        style={{
          border: isDragging ? '2px dashed #14b8a6' : '2px dashed #d1d5db',
          borderRadius: '12px',
          padding: '32px',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 200ms ease',
          backgroundColor: isDragging ? '#f0fdfa' : '#fafafa',
          transform: isDragging ? 'scale(1.02)' : 'scale(1)',
        }}
      >
        {/* Upload Icon */}
        <div
          style={{
            width: '64px',
            height: '64px',
            margin: '0 auto 16px',
            borderRadius: '50%',
            backgroundColor: isDragging ? '#14b8a6' : '#e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 200ms ease',
          }}
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke={isDragging ? 'white' : '#6b7280'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </div>

        {/* Text */}
        <p
          style={{
            fontSize: '16px',
            fontWeight: '500',
            color: isDragging ? '#14b8a6' : '#374151',
            marginBottom: '8px',
          }}
        >
          {isDragging ? 'Drop your photo here!' : 'Drag & drop your receipt'}
        </p>

        <p
          style={{
            fontSize: '14px',
            color: '#6b7280',
            marginBottom: '16px',
          }}
        >
          or click to browse
        </p>

        <p
          style={{
            fontSize: '12px',
            color: '#9ca3af',
          }}
        >
          Maximum file size: {maxSizeMB}MB
        </p>
      </div>

      {error && (
        <div
          style={{
            marginTop: '12px',
            padding: '12px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
          }}
        >
          <p style={{ fontSize: '14px', color: '#dc2626', margin: 0 }}>
            ⚠️ {error}
          </p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default DragDropPhotoUpload;
