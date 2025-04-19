
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

export type Resume = {
  id: string;
  name: string;
  uploadDate: string;
  fileSize: string;
  atsScore: number;
  status: 'processed' | 'processing' | 'error';
};

export type InterviewRecord = {
  id: string;
  date: string;
  role: string;
  duration: string;
  score: number;
};

export type User = {
  id: string;
  name: string;
  email: string;
  resumes: Resume[];
  interviews: InterviewRecord[];
};

interface UserContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => void;
  signUp: (email: string, password: string, name: string) => void;
  signOut: () => void;
  addResume: (resume: Resume) => void;
  deleteResume: (resumeId: string) => void;
  addInterview: (interview: InterviewRecord) => void;
  deleteInterview: (interviewId: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check for existing user session on load
  useEffect(() => {
    const storedUser = localStorage.getItem('careerGptUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  // Save user to localStorage when it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('careerGptUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('careerGptUser');
    }
  }, [user]);

  const signIn = (email: string, password: string) => {
    // In a real app, this would validate credentials against a backend
    setIsLoading(true);
    
    // Simulate authentication delay
    setTimeout(() => {
      // For demo purposes, create a sample user
      const newUser: User = {
        id: `user-${Date.now()}`,
        name: email.split('@')[0],
        email,
        resumes: [],
        interviews: []
      };
      
      setUser(newUser);
      setIsLoading(false);
      toast({
        title: "Signed In Successfully",
        description: `Welcome back, ${newUser.name}!`,
      });
    }, 1000);
  };

  const signUp = (email: string, password: string, name: string) => {
    setIsLoading(true);
    
    // Simulate authentication delay
    setTimeout(() => {
      const newUser: User = {
        id: `user-${Date.now()}`,
        name: name || email.split('@')[0], 
        email,
        resumes: [],
        interviews: []
      };
      
      setUser(newUser);
      setIsLoading(false);
      toast({
        title: "Account Created",
        description: `Welcome to CareerGPT, ${newUser.name}!`,
      });
    }, 1000);
  };

  const signOut = () => {
    setUser(null);
    toast({
      title: "Signed Out",
      description: "You have been signed out successfully.",
    });
  };

  const addResume = (resume: Resume) => {
    if (!user) return;
    setUser({
      ...user,
      resumes: [...user.resumes, resume]
    });
    toast({
      title: "Resume Added",
      description: `${resume.name} has been added to your profile.`,
    });
  };

  const deleteResume = (resumeId: string) => {
    if (!user) return;
    setUser({
      ...user,
      resumes: user.resumes.filter(resume => resume.id !== resumeId)
    });
    toast({
      title: "Resume Deleted",
      description: "Resume has been removed from your profile.",
    });
  };

  const addInterview = (interview: InterviewRecord) => {
    if (!user) return;
    setUser({
      ...user,
      interviews: [...user.interviews, interview]
    });
    toast({
      title: "Interview Saved",
      description: `Your ${interview.role} interview has been saved.`,
    });
  };

  const deleteInterview = (interviewId: string) => {
    if (!user) return;
    setUser({
      ...user,
      interviews: user.interviews.filter(interview => interview.id !== interviewId)
    });
    toast({
      title: "Interview Deleted",
      description: "Interview record has been removed from your profile.",
    });
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        signIn,
        signUp,
        signOut,
        addResume,
        deleteResume,
        addInterview,
        deleteInterview
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
