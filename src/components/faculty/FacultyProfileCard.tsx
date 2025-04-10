
import React from 'react';
import { FacultyProfile } from "@/types/supabase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

interface FacultyProfileCardProps {
  faculty: FacultyProfile;
  onApprove: (id: string) => Promise<void>;
  onRevoke: (id: string) => Promise<void>;
  processingAction: string | null;
}

const FacultyProfileCard: React.FC<FacultyProfileCardProps> = ({
  faculty,
  onApprove,
  onRevoke,
  processingAction,
}) => {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`;
  };

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'chairman':
        return 'Chairman';
      case 'director':
        return 'Director';
      case 'hod':
        return 'Head of Department';
      case 'class_coordinator':
        return 'Class Coordinator';
      default:
        return role;
    }
  };

  return (
    <ScrollArea className="max-h-[70vh] pr-4">
      <div className="flex flex-col items-center mb-6">
        <Avatar className="h-32 w-32 mb-4">
          <AvatarImage 
            src={faculty.profile_image_url || ''} 
            alt={`${faculty.first_name} ${faculty.last_name}`} 
          />
          <AvatarFallback className="text-2xl">
            {getInitials(faculty.first_name, faculty.last_name)}
          </AvatarFallback>
        </Avatar>
        <h3 className="text-xl font-semibold">{`${faculty.first_name} ${faculty.last_name}`}</h3>
        <Badge className={faculty.verify ? "bg-green-500 mt-2" : "bg-red-500 mt-2"}>
          {faculty.verify ? "Approved" : "Pending Approval"}
        </Badge>
      </div>
      
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-gray-500">Employee ID</h4>
          <p>{faculty.employee_id}</p>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-gray-500">Role</h4>
          <p>{getRoleDisplay(faculty.role)}</p>
        </div>
        
        {faculty.department && (
          <div>
            <h4 className="text-sm font-medium text-gray-500">Department</h4>
            <p>{faculty.department}</p>
          </div>
        )}
        
        {faculty.course_name && (
          <div>
            <h4 className="text-sm font-medium text-gray-500">Course</h4>
            <p>{faculty.course_name}</p>
          </div>
        )}
        
        {faculty.year && (
          <div>
            <h4 className="text-sm font-medium text-gray-500">Year</h4>
            <p>{faculty.year}</p>
          </div>
        )}
        
        {faculty.section && (
          <div>
            <h4 className="text-sm font-medium text-gray-500">Section</h4>
            <p>{faculty.section}</p>
          </div>
        )}
        
        <div>
          <h4 className="text-sm font-medium text-gray-500">Account Created</h4>
          <p>{new Date(faculty.created_at).toLocaleString()}</p>
        </div>
        
        <div className="flex gap-2 justify-center mt-4">
          {faculty.role !== 'admin' && (
            faculty.verify ? (
              <Button 
                variant="destructive" 
                onClick={() => onRevoke(faculty.id)}
                disabled={processingAction === faculty.id}
              >
                {processingAction === faculty.id ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <XCircle className="h-4 w-4 mr-1" />
                )}
                Revoke Approval
              </Button>
            ) : (
              <Button 
                variant="default" 
                onClick={() => onApprove(faculty.id)}
                disabled={processingAction === faculty.id}
              >
                {processingAction === faculty.id ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-1" />
                )}
                Approve
              </Button>
            )
          )}
        </div>
      </div>
    </ScrollArea>
  );
};

export default FacultyProfileCard;
