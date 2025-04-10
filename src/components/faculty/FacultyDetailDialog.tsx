
import React from 'react';
import { FacultyProfile } from "@/types/supabase";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import FacultyProfileCard from '@/components/faculty/FacultyProfileCard';

interface FacultyDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedFaculty: FacultyProfile | null;
  onApprove: (id: string) => Promise<void>;
  onRevoke: (id: string) => Promise<void>;
  processingAction: string | null;
}

const FacultyDetailDialog: React.FC<FacultyDetailDialogProps> = ({
  open,
  onOpenChange,
  selectedFaculty,
  onApprove,
  onRevoke,
  processingAction
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onOpenChange(false)}
              className="h-7 w-7"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            Faculty Profile
          </DialogTitle>
        </DialogHeader>
        
        {selectedFaculty && (
          <FacultyProfileCard 
            faculty={selectedFaculty} 
            onApprove={onApprove}
            onRevoke={onRevoke}
            processingAction={processingAction}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FacultyDetailDialog;
