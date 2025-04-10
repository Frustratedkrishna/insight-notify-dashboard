
import React from 'react';
import { FacultyNavbar } from '@/components/FacultyNavbar';
import { Footer } from '@/components/Footer';
import AdminRoleCheck from '@/components/faculty/AdminRoleCheck';
import FacultyApprovalManager from '@/components/faculty/FacultyApprovalManager';

export default function ApproveFaculty() {
  return (
    <div className="min-h-screen flex flex-col">
      <FacultyNavbar role="admin" />
      <main className="flex-1 container mx-auto px-4 py-8 space-y-6">
        <AdminRoleCheck>
          <FacultyApprovalManager />
        </AdminRoleCheck>
      </main>
      <Footer />
    </div>
  );
}
