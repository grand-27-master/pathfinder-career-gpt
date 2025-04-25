
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Eye, Trash2, Upload, FileText } from 'lucide-react';
import MainLayout from '@/components/Layout/MainLayout';
import ResumeUploader from '@/components/Resume/ResumeUploader';
import { useUser } from '@/context/UserContext';
import AuthDialog from '@/components/Auth/AuthDialog';
import { useSearchParams } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

const Resumes = () => {
  const { user, isAuthenticated, deleteResume } = useUser();
  const [searchParams] = useSearchParams();
  const viewResumeId = searchParams.get('view');
  const [viewedResume, setViewedResume] = useState<{ id: string; content?: string } | null>(null);

  // Find the resume to view based on URL parameter
  React.useEffect(() => {
    if (viewResumeId && user?.resumes) {
      const resume = user.resumes.find(r => r.id === viewResumeId);
      if (resume) {
        setViewedResume({
          id: resume.id,
          content: `This is a placeholder for the actual resume content of ${resume.name}.
          
In a real implementation, this would display the actual resume content or a PDF viewer component.`
        });
      }
    }
  }, [viewResumeId, user?.resumes]);

  const handleDeleteResume = (resumeId: string) => {
    deleteResume(resumeId);
    toast({
      title: "Resume deleted",
      description: "Your resume has been successfully deleted.",
    });
  };

  const handleViewResume = (resumeId: string) => {
    if (user?.resumes) {
      const resume = user.resumes.find(r => r.id === resumeId);
      if (resume) {
        setViewedResume({
          id: resume.id,
          content: `This is a placeholder for the actual resume content of ${resume.name}.
          
In a real implementation, this would display the actual resume content or a PDF viewer component.`
        });
      }
    }
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
                {isAuthenticated ? (
                  <ResumeUploader />
                ) : (
                  <div className="text-center py-6">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Sign in to upload</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Create an account or sign in to upload and manage your resumes
                    </p>
                    <div className="flex justify-center space-x-2">
                      <AuthDialog mode="signin" />
                      <AuthDialog mode="signup" />
                    </div>
                  </div>
                )}
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
                {isAuthenticated ? (
                  user?.resumes && user.resumes.length > 0 ? (
                    <div className="space-y-4">
                      {user.resumes.map((resume) => (
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
                                title="View Resume"
                                onClick={() => handleViewResume(resume.id)}
                              >
                                <Eye className="h-5 w-5" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleDeleteResume(resume.id)}
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
                  )
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Sign in to view your resumes</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Create an account or sign in to manage your resume portfolio
                    </p>
                    <div className="flex justify-center space-x-2">
                      <AuthDialog mode="signin" />
                      <AuthDialog mode="signup" />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Resume Viewer Dialog */}
        <Dialog open={viewedResume !== null} onOpenChange={(open) => !open && setViewedResume(null)}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Resume Preview</DialogTitle>
            </DialogHeader>
            <div className="p-4 border rounded-md bg-gray-50 whitespace-pre-line">
              {viewedResume?.content}
            </div>
            <div className="flex justify-end mt-4">
              <Button 
                variant="outline" 
                onClick={() => setViewedResume(null)}
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default Resumes;
