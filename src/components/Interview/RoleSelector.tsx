
import React from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RoleSelectorProps {
  onInterviewTypeSelect: (type: string) => void;
}

const RoleSelector = ({ onInterviewTypeSelect }: RoleSelectorProps) => {
  const interviewTypes = [
    { value: "screening", label: "Screening Interview", description: "Basic questions about background and fit" },
    { value: "technical", label: "Technical Interview", description: "In-depth technical questions and problem solving" },
    { value: "behavioral", label: "Behavioral Interview", description: "Situational questions and soft skills assessment" },
    { value: "system-design", label: "System Design", description: "Architecture and design questions" },
    { value: "cultural-fit", label: "Cultural Fit", description: "Company values and team collaboration" }
  ];

  return (
    <div className="w-full space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Interview Type</h2>
        <Select onValueChange={onInterviewTypeSelect}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose interview type" />
          </SelectTrigger>
          <SelectContent>
            {interviewTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                <div className="space-y-1">
                  <div className="font-medium">{type.label}</div>
                  <div className="text-sm text-muted-foreground">{type.description}</div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default RoleSelector;
