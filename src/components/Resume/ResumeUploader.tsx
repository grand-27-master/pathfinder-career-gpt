
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/use-toast';
import { FileUp, X, FileText, Check } from 'lucide-react';

const ResumeUploader = () => {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [uploadComplete, setUploadComplete] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files: FileList) => {
    const selectedFile = files[0];
    const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
    
    if (fileExtension === 'pdf' || fileExtension === 'docx') {
      setFile(selectedFile);
    } else {
      toast({
        title: "Invalid file format",
        description: "Please upload a PDF or DOCX file.",
        variant: "destructive",
      });
    }
  };

  const handleUpload = () => {
    if (!file) return;
    
    setUploading(true);
    setProgress(0);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(interval);
          setUploading(false);
          setUploadComplete(true);
          toast({
            title: "Resume uploaded",
            description: "Your resume has been uploaded and is being processed.",
          });
          return 100;
        }
        return prevProgress + 10;
      });
    }, 300);
  };

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  const handleCancel = () => {
    setFile(null);
    setUploading(false);
    setProgress(0);
    setUploadComplete(false);
  };

  return (
    <div className="w-full">
      {!file ? (
        <div
          className={`border-2 border-dashed rounded-lg p-8 ${
            dragActive ? 'border-careerGpt-indigo bg-careerGpt-indigo/5' : 'border-gray-300'
          } transition-all duration-200 text-center cursor-pointer`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleButtonClick}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx"
            onChange={handleChange}
            className="hidden"
          />
          <div className="flex flex-col items-center justify-center">
            <FileUp className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              Drag and drop your resume
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              or click to browse (PDF or DOCX)
            </p>
            <Button type="button" variant="outline">
              Select File
            </Button>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="bg-gray-100 p-3 rounded-lg mr-4">
                <FileText className="h-8 w-8 text-careerGpt-indigo" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{file.name}</h3>
                <p className="text-sm text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleCancel}
              className="text-gray-500 hover:text-gray-700"
              disabled={uploading}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {uploading || uploadComplete ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>
                  {uploadComplete ? 'Upload complete' : `Uploading... ${progress}%`}
                </span>
                {uploadComplete && (
                  <span className="flex items-center text-green-600">
                    <Check className="h-4 w-4 mr-1" /> Complete
                  </span>
                )}
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          ) : (
            <div className="flex space-x-3">
              <Button onClick={handleUpload} className="bg-careerGpt-indigo hover:bg-careerGpt-indigo/90">
                Upload Resume
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResumeUploader;
