import React, { useRef, useState } from 'react';
import { Button } from './ui/button';
import { Upload, FileText, X } from 'lucide-react';

const FileUpload = ({ onUpload }) => {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  const handleFiles = (files) => {
    const file = files[0];
    if (file && file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const svgContent = e.target.result;
        setUploadedFile(file);
        onUpload(svgContent);
      };
      reader.readAsText(file);
    } else {
      alert('Please upload a valid SVG file.');
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const clearFile = () => {
    setUploadedFile(null);
    onUpload(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept=".svg"
        onChange={handleChange}
        className="hidden"
      />
      
      {!uploadedFile ? (
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive
              ? 'border-blue-400 bg-blue-50/10'
              : 'border-gray-600 hover:border-gray-500'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <div className="text-gray-300 mb-4">
            <p className="text-lg font-medium">Drop your SVG file here</p>
            <p className="text-sm">or click to browse</p>
          </div>
          <Button onClick={onButtonClick} variant="outline" className="mt-2">
            Choose File
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-600">
          <div className="flex items-center space-x-3">
            <FileText className="h-8 w-8 text-green-400" />
            <div>
              <p className="text-white font-medium">{uploadedFile.name}</p>
              <p className="text-gray-400 text-sm">
                {(uploadedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>
          <Button
            onClick={clearFile}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;

