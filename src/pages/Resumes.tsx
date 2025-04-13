
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Trash2, Upload, FileText, AlertTriangle, CheckCircle } from 'lucide-react';
import MainLayout from '@/components/Layout/MainLayout';
import ResumeUploader from '@/components/Resume/ResumeUploader';
import { toast } from '@/hooks/use-toast';

type Resume = {
  id: string;
  name: string;
  uploadDate: string;
  fileSize: string;
  atsScore: number;
  status: 'processed' | 'processing' | 'error';
};

const Resumes = () => {
  const [resumes, setResumes] = useState<Resume[]>([
    {
      id: '1',
      name: 'Frontend_Developer_Resume.pdf',
      uploadDate: 'Apr 10, 2023',
      fileSize: '1.2 MB',
      atsScore: 92,
      status: 'processed'
    },
    {
      id: '2',
      name: 'Software_Engineer_Resume.docx',
      uploadDate: 'Mar 25, 2023',
      fileSize: '0.8 MB',
      atsScore: 78,
      status: 'processed'
    },
    {
      id: '3',
      name: 'Product_Manager_Resume.pdf',
      uploadDate: 'Apr 15, 2023',
      fileSize: '1.5 MB',
      atsScore: 85,
      status: 'processed'
    }
  ]);

  const handleView = (resumeId: string, resumeName: string) => {
    toast({
      title: "Viewing Resume",
      description: `Opening ${resumeName} for review.`,
    });
    // In a real app, this would open the resume in a new tab or modal
    window.open(`#/resume/${resumeId}`, '_blank');
  };

  const handleDelete = (resumeId: string, resumeName: string) => {
    setResumes(resumes.filter(resume => resume.id !== resumeId));
    toast({
      title: "Resume Deleted",
      description: `${resumeName} has been removed from your account.`,
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 80) return 'text-blue-600 bg-blue-50';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Resume Management</h1>
            <p className="text-gray-600 mt-1">Upload and manage your resumes for better job matching</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Upload Resume</CardTitle>
                <CardDescription>
                  Upload your resume to get ATS score and job matches
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResumeUploader />
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Your Resumes</CardTitle>
                <CardDescription>
                  Manage your uploaded resumes and view ATS scores
                </CardDescription>
              </CardHeader>
              <CardContent>
                {resumes.length > 0 ? (
                  <div className="space-y-4">
                    {resumes.map((resume) => (
                      <div 
                        key={resume.id} 
                        className="border rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                      >
                        <div className="flex items-center">
                          <div className="bg-gray-100 p-3 rounded-lg mr-4">
                            <FileText className="h-8 w-8 text-careerGpt-indigo" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{resume.name}</h3>
                            <p className="text-sm text-gray-500">
                              Uploaded on {resume.uploadDate} • {resume.fileSize}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4 ml-auto">
                          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(resume.atsScore)}`}>
                            ATS Score: {resume.atsScore}%
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleView(resume.id, resume.name)}
                              title="View Resume"
                            >
                              <Eye className="h-5 w-5" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDelete(resume.id, resume.name)}
                              title="Delete Resume"
                            >
                              <Trash2 className="h-5 w-5 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No resumes uploaded</h3>
                    <p className="text-sm text-gray-500">
                      Upload a resume to get started with job matching
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Resumes;
