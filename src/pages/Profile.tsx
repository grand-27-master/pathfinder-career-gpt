
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, User, MessageSquare, Eye, Trash2, MapPin, Mail, Linkedin, Github } from 'lucide-react';
import MainLayout from '@/components/Layout/MainLayout';
import { useUser } from '@/context/UserContext';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const Profile = () => {
  const { user, isAuthenticated, deleteResume, deleteInterview, updateProfile } = useUser();
  const navigate = useNavigate();
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    location: user?.location || '',
    linkedinUrl: user?.linkedinUrl || '',
    githubUrl: user?.githubUrl || ''
  });

  // Redirect to home if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  React.useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        location: user.location || '',
        linkedinUrl: user.linkedinUrl || '',
        githubUrl: user.githubUrl || ''
      });
    }
  }, [user]);

  if (!user) return null;

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 80) return 'text-blue-600 bg-blue-50';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(profileForm);
    setIsEditProfileOpen(false);
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600 mt-1">Manage your career progress and data</p>
          </div>
          <Button 
            variant="outline"
            className="mt-4 md:mt-0"
            onClick={() => setIsEditProfileOpen(true)}
          >
            Edit Profile
          </Button>
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
                
                {user.roles && user.roles.length > 0 && (
                  <div className="pt-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Roles</h4>
                    <div className="flex flex-wrap gap-2">
                      {user.roles.map((role, index) => (
                        <span 
                          key={index} 
                          className="px-2 py-1 bg-careerGpt-indigo/10 text-careerGpt-indigo text-xs font-medium rounded-full"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 space-y-3">
                  {user.location && (
                    <div className="flex items-center text-gray-700">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{user.location}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center text-gray-700">
                    <Mail className="h-4 w-4 mr-2" />
                    <span>{user.email}</span>
                  </div>
                  
                  {user.linkedinUrl && (
                    <div className="flex items-center text-gray-700">
                      <Linkedin className="h-4 w-4 mr-2" />
                      <a 
                        href={user.linkedinUrl.startsWith('http') ? user.linkedinUrl : `https://${user.linkedinUrl}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-careerGpt-indigo hover:underline"
                      >
                        LinkedIn Profile
                      </a>
                    </div>
                  )}
                  
                  {user.githubUrl && (
                    <div className="flex items-center text-gray-700">
                      <Github className="h-4 w-4 mr-2" />
                      <a 
                        href={user.githubUrl.startsWith('http') ? user.githubUrl : `https://${user.githubUrl}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-careerGpt-indigo hover:underline"
                      >
                        GitHub Profile
                      </a>
                    </div>
                  )}
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

        {/* Edit Profile Dialog */}
        <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
              <DialogDescription>
                Update your profile information
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleProfileSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  name="name" 
                  value={profileForm.name} 
                  onChange={handleProfileChange} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input 
                  id="location" 
                  name="location" 
                  value={profileForm.location} 
                  onChange={handleProfileChange} 
                  placeholder="e.g. New York, NY" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                <Input 
                  id="linkedinUrl" 
                  name="linkedinUrl" 
                  value={profileForm.linkedinUrl} 
                  onChange={handleProfileChange} 
                  placeholder="e.g. linkedin.com/in/yourname" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="githubUrl">GitHub URL</Label>
                <Input 
                  id="githubUrl" 
                  name="githubUrl" 
                  value={profileForm.githubUrl} 
                  onChange={handleProfileChange} 
                  placeholder="e.g. github.com/yourusername" 
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" type="button" onClick={() => setIsEditProfileOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Save Changes
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default Profile;
