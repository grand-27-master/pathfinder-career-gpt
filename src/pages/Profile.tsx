
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, User, MessageSquare, Eye, Trash2 } from 'lucide-react';
import MainLayout from '@/components/Layout/MainLayout';
import { useUser } from '@/context/UserContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, isAuthenticated, deleteResume, deleteInterview } = useUser();
  const navigate = useNavigate();

  // Redirect to home if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  if (!user) return null;

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
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600 mt-1">Manage your career progress and data</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Your personal details and account information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="bg-careerGpt-indigo p-3 rounded-full">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">{user.name}</h3>
                    <p className="text-gray-500">{user.email}</p>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button variant="outline" className="w-full" onClick={() => navigate('/resumes')}>
                    <FileText className="mr-2 h-4 w-4" />
                    Manage Resumes
                  </Button>
                </div>
                
                <div className="pt-2">
                  <Button variant="outline" className="w-full" onClick={() => navigate('/interviews')}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Practice Interviews
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <div className="space-y-8">
              {/* User's Resumes */}
              <Card>
                <CardHeader>
                  <CardTitle>My Resumes</CardTitle>
                  <CardDescription>
                    Your uploaded resumes and their ATS scores
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {user.resumes.length > 0 ? (
                    <div className="space-y-4">
                      {user.resumes.map((resume) => (
                        <div 
                          key={resume.id} 
                          className="border rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                        >
                          <div className="flex items-center">
                            <div className="bg-gray-100 p-3 rounded-lg mr-4">
                              <FileText className="h-6 w-6 text-careerGpt-indigo" />
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
                                onClick={() => navigate(`/resumes?view=${resume.id}`)}
                                title="View Resume"
                              >
                                <Eye className="h-5 w-5" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => deleteResume(resume.id)}
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
                    <div className="text-center py-6">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No resumes yet</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Upload your resume to get feedback and job matches
                      </p>
                      <Button onClick={() => navigate('/resumes')}>
                        Upload Resume
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* User's Interview Records */}
              <Card>
                <CardHeader>
                  <CardTitle>Interview History</CardTitle>
                  <CardDescription>
                    Your practice interview records and scores
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {user.interviews.length > 0 ? (
                    <div className="space-y-4">
                      {user.interviews.map((interview) => (
                        <div 
                          key={interview.id} 
                          className="border rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                        >
                          <div className="flex items-center">
                            <div className="bg-gray-100 p-3 rounded-lg mr-4">
                              <MessageSquare className="h-6 w-6 text-careerGpt-indigo" />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">{interview.role} Interview</h3>
                              <p className="text-sm text-gray-500">
                                {interview.date} • {interview.duration}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4 ml-auto">
                            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(interview.score)}`}>
                              Score: {interview.score}%
                            </div>
                            
                            <div className="flex space-x-2">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => navigate(`/interviews?review=${interview.id}`)}
                                title="Review Interview"
                              >
                                <Eye className="h-5 w-5" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => deleteInterview(interview.id)}
                                title="Delete Interview"
                              >
                                <Trash2 className="h-5 w-5 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No interview records</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Practice interviewing to build your confidence
                      </p>
                      <Button onClick={() => navigate('/interviews')}>
                        Practice Interview
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;
