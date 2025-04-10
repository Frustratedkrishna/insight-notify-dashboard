
import React from 'react';
import { FacultyProfile } from "@/types/supabase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface FacultyTableProps {
  faculties: FacultyProfile[];
  onViewFaculty: (faculty: FacultyProfile) => void;
  onApprove: (id: string) => Promise<void>;
  onRevoke: (id: string) => Promise<void>;
  processingAction: string | null;
}

const FacultyTable: React.FC<FacultyTableProps> = ({
  faculties,
  onViewFaculty,
  onApprove,
  onRevoke,
  processingAction,
}) => {
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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Employee ID</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {faculties.map((faculty) => (
          <TableRow key={faculty.id}>
            <TableCell>
              <Button 
                variant="link" 
                className="p-0 h-auto font-normal text-left"
                onClick={() => onViewFaculty(faculty)}
              >
                {`${faculty.first_name} ${faculty.last_name}`}
              </Button>
            </TableCell>
            <TableCell>{faculty.employee_id}</TableCell>
            <TableCell>{getRoleDisplay(faculty.role)}</TableCell>
            <TableCell>
              {faculty.verify ? (
                <Badge className="bg-green-500">Approved</Badge>
              ) : (
                <Badge variant="destructive">Pending</Badge>
              )}
            </TableCell>
            <TableCell>
              {faculty.role !== 'admin' && (
                faculty.verify ? (
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => onRevoke(faculty.id)}
                    disabled={processingAction === faculty.id}
                  >
                    {processingAction === faculty.id ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    ) : (
                      <XCircle className="h-4 w-4 mr-1" />
                    )}
                    Revoke
                  </Button>
                ) : (
                  <Button 
                    variant="default" 
                    size="sm"
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
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default FacultyTable;
