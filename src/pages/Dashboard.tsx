
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileUp, FileText, Trash2, BriefcaseBusiness, MessagesSquare, Clock, Calendar } from 'lucide-react';
import MainLayout from '@/components/Layout/MainLayout';
import ResumeUploader from '@/components/Resume/ResumeUploader';
import { useUser } from '@/context/UserContext';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

const Dashboard = () => {
  const { user, isAuthenticated, deleteResume } = useUser();
  const navigate = useNavigate();

  const handleUploadClick = () => {
    navigate('/resumes');
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage your career progress and activities</p>
          </div>
          <Button 
            className="mt-4 md:mt-0 bg-careerGpt-indigo hover:bg-careerGpt-indigo/90"
            onClick={handleUploadClick}
          >
            <FileUp className="mr-2 h-4 w-4" /> Upload Resume
          </Button>
        </div>

        <Tabs defaultValue="resumes" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="resumes" className="text-sm sm:text-base">
              <FileText className="h-4 w-4 mr-2" /> Resumes
            </TabsTrigger>
            <TabsTrigger value="jobs" className="text-sm sm:text-base">
              <BriefcaseBusiness className="h-4 w-4 mr-2" /> Job Matches
            </TabsTrigger>
            <TabsTrigger value="interviews" className="text-sm sm:text-base">
              <MessagesSquare className="h-4 w-4 mr-2" /> Interviews
            </TabsTrigger>
          </TabsList>

          <TabsContent value="resumes">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {!isAuthenticated ? (
                <Card className="col-span-3">
                  <CardHeader>
                    <CardTitle>Upload Resume</CardTitle>
                    <CardDescription>
                      Upload your resume to get personalized job matches and interview preparation
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResumeUploader />
                  </CardContent>
                </Card>
              ) : (
                <>
                  {user?.resumes && user.resumes.length > 0 ? (
                    user.resumes.map((resume, index) => (
                      <ResumeCard
                        key={resume.id}
                        title={resume.name}
                        lastUpdated={resume.uploadDate}
                        fileType={resume.name.endsWith('.pdf') ? 'PDF' : 'DOCX'}
                        onView={() => navigate(`/resumes?view=${resume.id}`)}
                        onDelete={() => deleteResume(resume.id)}
                      />
                    ))
                  ) : (
                    <Card className="col-span-3">
                      <CardHeader>
                        <CardTitle>Upload Resume</CardTitle>
                        <CardDescription>
                          Upload your resume to get personalized job matches and interview preparation
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResumeUploader />
                      </CardContent>
                    </Card>
                  )}
                  
                  <Card 
                    className="bg-gray-50 border-dashed border-2 flex flex-col items-center justify-center py-8 hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={handleUploadClick}
                  >
                    <FileUp className="h-10 w-10 text-gray-400 mb-2" />
                    <p className="text-gray-600 font-medium">Upload New Resume</p>
                  </Card>
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="jobs">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <JobCard
                title="Senior Frontend Developer"
                company="TechCorp Inc."
                location="Remote"
                matchScore={92}
                jobUrl="https://www.linkedin.com/jobs/search/?keywords=Senior%20Frontend%20Developer"
              />
              
              <JobCard
                title="Full Stack Engineer"
                company="StartupXYZ"
                location="New York, NY"
                matchScore={87}
                jobUrl="https://www.linkedin.com/jobs/search/?keywords=Full%20Stack%20Engineer"
              />
              
              <JobCard
                title="React Developer"
                company="InnovateSoft"
                location="San Francisco, CA"
                matchScore={84}
                jobUrl="https://www.linkedin.com/jobs/search/?keywords=React%20Developer"
              />
              
              <JobCard
                title="JavaScript Engineer"
                company="WebSolutions"
                location="Austin, TX"
                matchScore={79}
                jobUrl="https://www.linkedin.com/jobs/search/?keywords=JavaScript%20Engineer"
              />
              
              <JobCard
                title="Frontend Architect"
                company="DesignFirm"
                location="Seattle, WA"
                matchScore={74}
                jobUrl="https://www.linkedin.com/jobs/search/?keywords=Frontend%20Architect"
              />
              
              <JobCard
                title="UI Developer"
                company="CreativeTech"
                location="Chicago, IL"
                matchScore={70}
                jobUrl="https://www.linkedin.com/jobs/search/?keywords=UI%20Developer"
              />
            </div>
          </TabsContent>

          <TabsContent value="interviews">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Mock Interviews</CardTitle>
                  <CardDescription>
                    Scheduled interview practice sessions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <InterviewItem
                      title="Frontend Developer Technical Interview"
                      date="Tomorrow, 2:00 PM"
                      status="scheduled"
                      onAction={() => navigate('/interviews?prepare=frontend-dev')}
                    />
                    <InterviewItem
                      title="Behavioral Interview Practice"
                      date="Apr 20, 10:00 AM"
                      status="scheduled"
                      onAction={() => navigate('/interviews?prepare=behavioral')}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={() => navigate('/interviews?schedule=new')}>
                    <Calendar className="h-4 w-4 mr-2" /> Schedule New Interview
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Past Interviews</CardTitle>
                  <CardDescription>
                    Review your completed mock interviews
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <InterviewItem
                      title="Product Manager Case Study"
                      date="Apr 10, 2023"
                      status="completed"
                      score="83%"
                      onAction={() => navigate('/interviews?review=pm-case-study')}
                    />
                    <InterviewItem
                      title="Coding Challenge Review"
                      date="Apr 5, 2023"
                      status="completed"
                      score="91%"
                      onAction={() => navigate('/interviews?review=coding-challenge')}
                    />
                    <InterviewItem
                      title="System Design Interview"
                      date="Mar 28, 2023"
                      status="completed"
                      score="78%"
                      onAction={() => navigate('/interviews?review=system-design')}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={() => navigate('/interviews?history=all')}>
                    View All Past Interviews
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

interface ResumeCardProps {
  title: string;
  lastUpdated: string;
  fileType: string;
  onView: () => void;
  onDelete: () => void;
}

const ResumeCard = ({ title, lastUpdated, fileType, onView, onDelete }: ResumeCardProps) => (
  <Card>
    <CardHeader className="pb-3">
      <CardTitle className="text-lg">{title}</CardTitle>
      <CardDescription className="flex items-center">
        <Clock className="h-3 w-3 mr-1" /> Updated {lastUpdated}
      </CardDescription>
    </CardHeader>
    <CardContent className="pb-3">
      <div className="flex items-center">
        <div className="bg-careerGpt-indigo/10 text-careerGpt-indigo rounded px-2 py-1 text-xs font-medium">
          {fileType}
        </div>
      </div>
    </CardContent>
    <CardFooter className="flex justify-between">
      <Button variant="outline" size="sm" onClick={onView}>
        <FileText className="h-4 w-4 mr-2" /> View
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        className="text-red-500 hover:text-red-700"
        onClick={onDelete}
      >
        <Trash2 className="h-4 w-4 mr-2" /> Delete
      </Button>
    </CardFooter>
  </Card>
);

interface JobCardProps {
  title: string;
  company: string;
  location: string;
  matchScore: number;
  jobUrl: string;
}

const JobCard = ({ title, company, location, matchScore, jobUrl }: JobCardProps) => (
  <Card>
    <CardHeader className="pb-3">
      <div className="flex justify-between items-start">
        <div>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription className="mt-1">{company}</CardDescription>
        </div>
        <div className="bg-careerGpt-purple/10 text-careerGpt-purple rounded-full h-12 w-12 flex items-center justify-center font-bold">
          {matchScore}%
        </div>
      </div>
    </CardHeader>
    <CardContent className="pb-3">
      <div className="flex items-center text-gray-600 mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        {location}
      </div>
      <div className="space-y-2">
        <MatchItem label="Skills Match" value={matchScore > 85 ? "Excellent" : matchScore > 75 ? "Good" : "Fair"} />
        <MatchItem label="Experience Match" value={matchScore > 80 ? "High" : matchScore > 70 ? "Medium" : "Low"} />
      </div>
    </CardContent>
    <CardFooter>
      <Button 
        className="w-full bg-careerGpt-indigo hover:bg-careerGpt-indigo/90"
        onClick={() => window.open(jobUrl, '_blank')}
      >
        View Job Details
      </Button>
    </CardFooter>
  </Card>
);

interface MatchItemProps {
  label: string;
  value: string;
}

const MatchItem = ({ label, value }: MatchItemProps) => (
  <div className="flex justify-between items-center">
    <span className="text-sm text-gray-600">{label}</span>
    <span className="text-sm font-medium">{value}</span>
  </div>
);

interface InterviewItemProps {
  title: string;
  date: string;
  status: "scheduled" | "completed" | "cancelled";
  score?: string;
  onAction: () => void;
}

const InterviewItem = ({ title, date, status, score, onAction }: InterviewItemProps) => (
  <div className="flex justify-between items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
    <div>
      <h4 className="font-medium">{title}</h4>
      <p className="text-gray-600 text-sm flex items-center">
        <Clock className="h-3 w-3 mr-1" /> {date}
      </p>
    </div>
    <div className="flex items-center">
      {status === "completed" && score && (
        <span className="mr-3 bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
          Score: {score}
        </span>
      )}
      {status === "scheduled" ? (
        <Button size="sm" variant="outline" onClick={onAction}>Prepare</Button>
      ) : (
        <Button size="sm" variant="outline" onClick={onAction}>Review</Button>
      )}
    </div>
  </div>
);

export default Dashboard;
