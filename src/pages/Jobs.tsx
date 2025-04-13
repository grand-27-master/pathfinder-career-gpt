
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { BriefcaseBusiness, Search, Filter, MapPin, Building, Clock, DollarSign } from 'lucide-react';
import MainLayout from '@/components/Layout/MainLayout';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';

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
  const handleApplyNow = (jobTitle: string) => {
    toast({
      title: "Application Submitted",
      description: `You've applied for the ${jobTitle} position.`,
    });
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
    toast({
      title: "Filters Reset",
      description: "All job filters have been reset.",
    });
  };

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
                  <Input placeholder="Search job titles" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <Input placeholder="City, State, or Remote" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Match Score
                  </label>
                  <Slider defaultValue={[70]} max={100} step={1} className="my-5" />
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>70%</span>
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
                <Input placeholder="Search job listings" className="w-full sm:w-80" />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Sort by:</span>
                <select className="bg-white border border-gray-300 text-gray-700 text-sm rounded px-3 py-1.5 focus:ring-careerGpt-indigo focus:border-careerGpt-indigo">
                  <option>Match Score</option>
                  <option>Date Posted</option>
                  <option>Company</option>
                  <option>Location</option>
                </select>
              </div>
            </div>

            <div className="space-y-6">
              <JobListingCard
                title="Senior Frontend Developer"
                company="TechCorp Inc."
                location="Remote"
                salary="$120K - $150K"
                matchScore={92}
                postedTime="3 days ago"
                description="We're looking for a senior frontend developer with expertise in React, TypeScript, and modern web technologies to join our growing team."
                skills={["React", "TypeScript", "Redux", "CSS", "HTML"]}
                onApply={() => handleApplyNow("Senior Frontend Developer")}
                onSave={() => handleSaveJob("Senior Frontend Developer")}
              />
              
              <JobListingCard
                title="Full Stack Engineer"
                company="StartupXYZ"
                location="New York, NY"
                salary="$110K - $140K"
                matchScore={87}
                postedTime="1 week ago"
                description="Join our innovative startup as a full stack engineer working on cutting-edge web applications with modern technologies."
                skills={["JavaScript", "Node.js", "React", "MongoDB", "AWS"]}
                onApply={() => handleApplyNow("Full Stack Engineer")}
                onSave={() => handleSaveJob("Full Stack Engineer")}
              />
              
              <JobListingCard
                title="React Developer"
                company="InnovateSoft"
                location="San Francisco, CA"
                salary="$100K - $130K"
                matchScore={84}
                postedTime="2 days ago"
                description="InnovateSoft is hiring React developers to build beautiful, responsive web applications for our enterprise clients."
                skills={["React", "JavaScript", "CSS", "UI/UX", "GraphQL"]}
                onApply={() => handleApplyNow("React Developer")}
                onSave={() => handleSaveJob("React Developer")}
              />
              
              <JobListingCard
                title="JavaScript Engineer"
                company="WebSolutions"
                location="Austin, TX"
                salary="$90K - $120K"
                matchScore={79}
                postedTime="5 days ago"
                description="Looking for a JavaScript engineer to help build and maintain our growing suite of web applications."
                skills={["JavaScript", "HTML", "CSS", "Vue.js", "REST APIs"]}
                onApply={() => handleApplyNow("JavaScript Engineer")}
                onSave={() => handleSaveJob("JavaScript Engineer")}
              />
              
              <JobListingCard
                title="Frontend Architect"
                company="DesignFirm"
                location="Seattle, WA"
                salary="$130K - $160K"
                matchScore={74}
                postedTime="2 weeks ago"
                description="DesignFirm is seeking a Frontend Architect to lead our frontend development strategy and implementation."
                skills={["JavaScript", "Architecture", "Performance", "React", "Design Systems"]}
                onApply={() => handleApplyNow("Frontend Architect")}
                onSave={() => handleSaveJob("Frontend Architect")}
              />
              
              <div className="flex justify-center mt-8">
                <Button className="bg-careerGpt-indigo hover:bg-careerGpt-indigo/90">
                  Load More Jobs
                </Button>
              </div>
            </div>
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
