import React from 'react';
import { useOutletContext } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
import HODDashboard from './HODDashboard';
import FacultyDashboard from './FacultyDashboard';
import StudentDashboard from './StudentDashboard';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

const DashboardHome = () => {
  const context = useOutletContext<{ user?: User }>();
  
  let role = 'ADMIN';
  let currentUser: User = {
    id: 1,
    name: 'Administrator',
    email: 'admin@copovision.edu',
    role: 'ADMIN'
  };

  if (context?.user) {
    currentUser = context.user;
    role = (context.user.role || 'ADMIN').toUpperCase();
  } else {
    const saved = localStorage.getItem('user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        role = (parsed.role || 'ADMIN').toUpperCase();
        currentUser = {
          id: parsed.user_id || parsed.id || 1,
          name: parsed.full_name || parsed.name || parsed.username || 'User',
          email: parsed.username || parsed.email || 'user@copovision.edu',
          role: role
        };
      } catch (e) {
        console.error("Error parsing user in DashboardHome", e);
      }
    }
  }

  switch (role) {
    case 'HOD':
      return <HODDashboard user={currentUser} />;
    case 'FACULTY':
      return <FacultyDashboard user={currentUser} />;
    case 'STUDENT':
      return <StudentDashboard user={currentUser} />;
    case 'ADMIN':
    case 'SUPERADMIN':
    default:
      return <AdminDashboard />;
  }
};

export default DashboardHome;
