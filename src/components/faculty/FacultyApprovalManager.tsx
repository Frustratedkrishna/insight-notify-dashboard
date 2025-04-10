
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { FacultyProfile } from '@/types/supabase';
import FacultyTable from '@/components/faculty/FacultyTable';
import FacultyDetailDialog from '@/components/faculty/FacultyDetailDialog';
import { useFacultyApproval } from '@/hooks/useFacultyApproval';

const FacultyApprovalManager: React.FC = () => {
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyProfile | null>(null);
  const [showFacultyDialog, setShowFacultyDialog] = useState(false);
  
  const { 
    loading, 
    faculties, 
    processingAction,
    loadFacultyProfiles,
    handleApprove,
    handleRevoke 
  } = useFacultyApproval();

  useEffect(() => {
    // Load faculty profiles when component mounts
    loadFacultyProfiles();
  }, []);

  const handleViewFaculty = (faculty: FacultyProfile) => {
    setSelectedFaculty(faculty);
    setShowFacultyDialog(true);
  };

  if (loading) {
    return <p className="text-center py-8">Loading faculty data...</p>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Approve Faculty Members</span>
            <Button 
              size="sm"
              onClick={loadFacultyProfiles}
              variant="outline"
              className="flex items-center gap-1"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </CardTitle>
          <CardDescription>
            Click on a faculty member's name to view their complete profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          {faculties.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No faculty profiles found</p>
          ) : (
            <FacultyTable
              faculties={faculties}
              onViewFaculty={handleViewFaculty}
              onApprove={handleApprove}
              onRevoke={handleRevoke}
              processingAction={processingAction}
            />
          )}
        </CardContent>
      </Card>

      <FacultyDetailDialog
        open={showFacultyDialog}
        onOpenChange={setShowFacultyDialog}
        selectedFaculty={selectedFaculty}
        onApprove={handleApprove}
        onRevoke={handleRevoke}
        processingAction={processingAction}
      />
    </>
  );
};

export default FacultyApprovalManager;
