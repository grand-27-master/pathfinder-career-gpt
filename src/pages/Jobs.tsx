
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { BriefcaseBusiness, Search, Filter, MapPin, Building, Clock, DollarSign } from 'lucide-react';
import MainLayout from '@/components/Layout/MainLayout';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';

type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  matchScore: number;
  postedTime: string;
  description: string;
  skills: string[];
  applyUrl: string;
  jobType: string[];
  experienceLevel: string;
};

const Jobs = () => {
  // State for filters
  const [jobTypeFilters, setJobTypeFilters] = useState({
    fulltime: false,
    parttime: false,
    contract: false,
    remote: false,
  });

  const [experienceLevelFilters, setExperienceLevelFilters] = useState({
    entry: false,
    mid: false,
    senior: false,
    executive: false,
  });

  const [sortBy, setSortBy] = useState('matchScore');
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [minMatchScore, setMinMatchScore] = useState(70);
  
  const [allJobs, setAllJobs] = useState<Job[]>([
    {
      id: "1",
      title: "Senior Frontend Developer",
      company: "TechCorp Inc.",
      location: "Remote",
      salary: "$120K - $150K",
      matchScore: 92,
      postedTime: "3 days ago",
      description: "We're looking for a senior frontend developer with expertise in React, TypeScript, and modern web technologies to join our growing team.",
      skills: ["React", "TypeScript", "Redux", "CSS", "HTML"],
      applyUrl: "https://example.com/jobs/frontend-dev",
      jobType: ["fulltime", "remote"],
      experienceLevel: "senior"
    },
    {
      id: "2",
      title: "Full Stack Engineer",
      company: "StartupXYZ",
      location: "New York, NY",
      salary: "$110K - $140K",
      matchScore: 87,
      postedTime: "1 week ago",
      description: "Join our innovative startup as a full stack engineer working on cutting-edge web applications with modern technologies.",
      skills: ["JavaScript", "Node.js", "React", "MongoDB", "AWS"],
      applyUrl: "https://example.com/jobs/fullstack",
      jobType: ["fulltime"],
      experienceLevel: "mid"
    },
    {
      id: "3",
      title: "React Developer",
      company: "InnovateSoft",
      location: "San Francisco, CA",
      salary: "$100K - $130K",
      matchScore: 84,
      postedTime: "2 days ago",
      description: "InnovateSoft is hiring React developers to build beautiful, responsive web applications for our enterprise clients.",
      skills: ["React", "JavaScript", "CSS", "UI/UX", "GraphQL"],
      applyUrl: "https://example.com/jobs/react-dev",
      jobType: ["contract", "parttime"],
      experienceLevel: "mid"
    },
    {
      id: "4",
      title: "JavaScript Engineer",
      company: "WebSolutions",
      location: "Austin, TX",
      salary: "$90K - $120K",
      matchScore: 79,
      postedTime: "5 days ago",
      description: "Looking for a JavaScript engineer to help build and maintain our growing suite of web applications.",
      skills: ["JavaScript", "HTML", "CSS", "Vue.js", "REST APIs"],
      applyUrl: "https://example.com/jobs/js-engineer",
      jobType: ["fulltime"],
      experienceLevel: "entry"
    },
    {
      id: "5",
      title: "Frontend Architect",
      company: "DesignFirm",
      location: "Seattle, WA",
      salary: "$130K - $160K",
      matchScore: 74,
      postedTime: "2 weeks ago",
      description: "DesignFirm is seeking a Frontend Architect to lead our frontend development strategy and implementation.",
      skills: ["JavaScript", "Architecture", "Performance", "React", "Design Systems"],
      applyUrl: "https://example.com/jobs/frontend-architect",
      jobType: ["fulltime"],
      experienceLevel: "executive"
    },
    {
      id: "6",
      title: "UI/UX Developer",
      company: "CreativeAgency",
      location: "Remote",
      salary: "$95K - $125K",
      matchScore: 81,
      postedTime: "4 days ago",
      description: "Join our creative team to build stunning user interfaces with a focus on exceptional user experience.",
      skills: ["React", "CSS", "UI/UX Design", "Figma", "Responsive Design"],
      applyUrl: "https://example.com/jobs/ui-ux-dev",
      jobType: ["remote", "fulltime"],
      experienceLevel: "mid"
    },
    {
      id: "7",
      title: "Part-time React Developer",
      company: "FlexTech",
      location: "Chicago, IL (Hybrid)",
      salary: "$60K - $80K",
      matchScore: 82,
      postedTime: "1 day ago",
      description: "Seeking a part-time React developer to help with ongoing projects and maintenance of existing applications.",
      skills: ["React", "JavaScript", "Redux", "REST APIs"],
      applyUrl: "https://example.com/jobs/part-time-react",
      jobType: ["parttime"],
      experienceLevel: "entry"
    },
    {
      id: "8",
      title: "Contract Frontend Engineer",
      company: "ProjectBoost",
      location: "Remote",
      salary: "$90/hr",
      matchScore: 77,
      postedTime: "3 days ago",
      description: "6-month contract opportunity for a frontend engineer to help build a new customer-facing portal.",
      skills: ["TypeScript", "React", "Material UI", "GraphQL"],
      applyUrl: "https://example.com/jobs/contract-frontend",
      jobType: ["contract", "remote"],
      experienceLevel: "senior"
    }
  ]);
  
  const [jobsData, setJobsData] = useState<Job[]>(allJobs);
  const [displayedJobs, setDisplayedJobs] = useState(3);

  // Apply filters whenever they change
  useEffect(() => {
    let filteredJobs = [...allJobs];
    
    // Apply job type filters
    const activeJobTypeFilters = Object.entries(jobTypeFilters)
      .filter(([_, isActive]) => isActive)
      .map(([type]) => type);
      
    if (activeJobTypeFilters.length > 0) {
      filteredJobs = filteredJobs.filter(job => 
        job.jobType.some(type => activeJobTypeFilters.includes(type))
      );
    }
    
    // Apply experience level filters
    const activeExpLevelFilters = Object.entries(experienceLevelFilters)
      .filter(([_, isActive]) => isActive)
      .map(([level]) => level);
      
    if (activeExpLevelFilters.length > 0) {
      filteredJobs = filteredJobs.filter(job => 
        activeExpLevelFilters.includes(job.experienceLevel)
      );
    }
    
    // Apply search term filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filteredJobs = filteredJobs.filter(job => 
        job.title.toLowerCase().includes(searchLower) || 
        job.company.toLowerCase().includes(searchLower) ||
        job.skills.some(skill => skill.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply location filter
    if (location) {
      const locationLower = location.toLowerCase();
      filteredJobs = filteredJobs.filter(job => 
        job.location.toLowerCase().includes(locationLower)
      );
    }
    
    // Apply match score filter
    filteredJobs = filteredJobs.filter(job => job.matchScore >= minMatchScore);
    
    // Apply sorting
    if (sortBy === 'matchScore') {
      filteredJobs.sort((a, b) => b.matchScore - a.matchScore);
    } else if (sortBy === 'datePosted') {
      filteredJobs.sort((a, b) => {
        // Simple string comparison for this demo
        // In a real app, parse actual dates
        return a.postedTime.localeCompare(b.postedTime);
      });
    } else if (sortBy === 'company') {
      filteredJobs.sort((a, b) => a.company.localeCompare(b.company));
    } else if (sortBy === 'location') {
      filteredJobs.sort((a, b) => a.location.localeCompare(b.location));
    }
    
    setJobsData(filteredJobs);
    setDisplayedJobs(Math.min(3, filteredJobs.length)); // Reset pagination when filters change
  }, [jobTypeFilters, experienceLevelFilters, searchTerm, location, minMatchScore, sortBy, allJobs]);

  // Handle job type filter change
  const handleJobTypeChange = (id: keyof typeof jobTypeFilters) => {
    setJobTypeFilters(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Handle experience level filter change
  const handleExperienceLevelChange = (id: keyof typeof experienceLevelFilters) => {
    setExperienceLevelFilters(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Handle apply now button click
  const handleApplyNow = (jobTitle: string, applyUrl: string) => {
    toast({
      title: "Application Started",
      description: `You're being redirected to the ${jobTitle} job application page.`,
    });
    window.open(applyUrl, '_blank');
  };

  // Handle save job button click
  const handleSaveJob = (jobTitle: string) => {
    toast({
      title: "Job Saved",
      description: `You've saved the ${jobTitle} position to your favorites.`,
    });
  };

  // Handle reset filters
  const handleResetFilters = () => {
    setJobTypeFilters({
      fulltime: false,
      parttime: false,
      contract: false,
      remote: false,
    });
    setExperienceLevelFilters({
      entry: false,
      mid: false,
      senior: false,
      executive: false,
    });
    setSearchTerm('');
    setLocation('');
    setMinMatchScore(70);
    toast({
      title: "Filters Reset",
      description: "All job filters have been reset.",
    });
  };
  
  // Handle sort by change
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
  };
  
  const handleLoadMore = () => {
    if (displayedJobs < jobsData.length) {
      setDisplayedJobs(Math.min(displayedJobs + 2, jobsData.length));
      toast({
        title: "More Jobs Loaded",
        description: "Additional job listings have been loaded.",
      });
    } else {
      toast({
        title: "No More Jobs",
        description: "All available job listings are displayed.",
      });
    }
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  // Handle location input change
  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocation(e.target.value);
  };
  
  // Handle match score slider change
  const handleMatchScoreChange = (value: number[]) => {
    setMinMatchScore(value[0]);
  };

  // Displayed jobs
  const visibleJobs = jobsData.slice(0, displayedJobs);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Job Matches</h1>
            <p className="text-gray-600 mt-1">Personalized job recommendations based on your resume</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="h-5 w-5 mr-2" /> Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Title
                  </label>
                  <Input 
                    placeholder="Search job titles" 
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <Input 
                    placeholder="City, State, or Remote" 
                    value={location}
                    onChange={handleLocationChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Match Score
                  </label>
                  <Slider 
                    defaultValue={[minMatchScore]} 
                    value={[minMatchScore]}
                    max={100} 
                    step={5} 
                    className="my-5"
                    onValueChange={handleMatchScoreChange}
                  />
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>{minMatchScore}%</span>
                    <span>100%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Type
                  </label>
                  <div className="space-y-2">
                    {Object.entries(jobTypeFilters).map(([id, checked]) => (
                      <FilterCheckbox 
                        key={id} 
                        id={id} 
                        label={id === 'fulltime' ? 'Full-time' : 
                              id === 'parttime' ? 'Part-time' : 
                              id === 'contract' ? 'Contract' : 'Remote'} 
                        checked={checked}
                        onCheckedChange={() => handleJobTypeChange(id as keyof typeof jobTypeFilters)}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience Level
                  </label>
                  <div className="space-y-2">
                    {Object.entries(experienceLevelFilters).map(([id, checked]) => (
                      <FilterCheckbox 
                        key={id} 
                        id={id} 
                        label={id === 'entry' ? 'Entry Level' : 
                              id === 'mid' ? 'Mid Level' : 
                              id === 'senior' ? 'Senior Level' : 'Executive'} 
                        checked={checked}
                        onCheckedChange={() => handleExperienceLevelChange(id as keyof typeof experienceLevelFilters)}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={handleResetFilters}>
                  Reset Filters
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Job Listings */}
          <div className="col-span-1 lg:col-span-3">
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 flex flex-col sm:flex-row justify-between items-center">
              <div className="flex items-center mb-4 sm:mb-0">
                <Search className="text-gray-400 mr-2" />
                <Input 
                  placeholder="Search job listings" 
                  className="w-full sm:w-80"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Sort by:</span>
                <select 
                  className="bg-white border border-gray-300 text-gray-700 text-sm rounded px-3 py-1.5 focus:ring-careerGpt-indigo focus:border-careerGpt-indigo"
                  value={sortBy}
                  onChange={handleSortChange}
                >
                  <option value="matchScore">Match Score</option>
                  <option value="datePosted">Date Posted</option>
                  <option value="company">Company</option>
                  <option value="location">Location</option>
                </select>
              </div>
            </div>

            {jobsData.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg text-gray-600">No jobs match your current filters.</p>
                <Button className="mt-4" variant="outline" onClick={handleResetFilters}>
                  Reset Filters
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {visibleJobs.map(job => (
                  <JobListingCard
                    key={job.id}
                    title={job.title}
                    company={job.company}
                    location={job.location}
                    salary={job.salary}
                    matchScore={job.matchScore}
                    postedTime={job.postedTime}
                    description={job.description}
                    skills={job.skills}
                    onApply={() => handleApplyNow(job.title, job.applyUrl)}
                    onSave={() => handleSaveJob(job.title)}
                  />
                ))}
                
                {displayedJobs < jobsData.length && (
                  <div className="flex justify-center mt-8">
                    <Button className="bg-careerGpt-indigo hover:bg-careerGpt-indigo/90" onClick={handleLoadMore}>
                      Load More Jobs
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

interface FilterCheckboxProps {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: () => void;
}

const FilterCheckbox = ({ id, label, checked, onCheckedChange }: FilterCheckboxProps) => (
  <div className="flex items-center space-x-2">
    <Checkbox 
      id={id} 
      checked={checked} 
      onCheckedChange={onCheckedChange} 
    />
    <label htmlFor={id} className="text-sm text-gray-700 cursor-pointer">
      {label}
    </label>
  </div>
);

interface JobListingCardProps {
  title: string;
  company: string;
  location: string;
  salary: string;
  matchScore: number;
  postedTime: string;
  description: string;
  skills: string[];
  onApply: () => void;
  onSave: () => void;
}

const JobListingCard = ({
  title,
  company,
  location,
  salary,
  matchScore,
  postedTime,
  description,
  skills,
  onApply,
  onSave,
}: JobListingCardProps) => (
  <Card>
    <CardHeader className="pb-4">
      <div className="flex flex-col sm:flex-row justify-between">
        <div>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription className="flex items-center mt-1">
            <Building className="h-4 w-4 mr-1" /> {company} • 
            <MapPin className="h-4 w-4 mx-1" /> {location}
          </CardDescription>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center">
          <div className="bg-careerGpt-purple/10 text-careerGpt-purple rounded-full px-3 py-1 font-bold flex items-center">
            <BriefcaseBusiness className="h-4 w-4 mr-1" /> {matchScore}% Match
          </div>
        </div>
      </div>
    </CardHeader>
    <CardContent className="pb-4">
      <div className="mb-4 flex flex-wrap gap-2">
        <div className="flex items-center text-gray-600 text-sm">
          <DollarSign className="h-4 w-4 mr-1" /> {salary}
        </div>
        <div className="flex items-center text-gray-600 text-sm">
          <Clock className="h-4 w-4 mr-1" /> Posted {postedTime}
        </div>
      </div>
      
      <p className="text-gray-700 mb-4">{description}</p>
      
      <div className="flex flex-wrap gap-2">
        {skills.map((skill, index) => (
          <span
            key={index}
            className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded"
          >
            {skill}
          </span>
        ))}
      </div>
    </CardContent>
    <CardFooter className="flex flex-col sm:flex-row gap-3 justify-between">
      <Button className="w-full sm:w-auto bg-careerGpt-indigo hover:bg-careerGpt-indigo/90" onClick={onApply}>
        Apply Now
      </Button>
      <Button variant="outline" className="w-full sm:w-auto" onClick={onSave}>
        Save Job
      </Button>
    </CardFooter>
  </Card>
);

export default Jobs;
