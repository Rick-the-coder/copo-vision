import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MainLayout } from './components/layout/MainLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { UploadMarks } from './pages/UploadMarks';
import { Attainment } from './pages/Attainment';
import { Predictions } from './pages/Predictions';
import { Alerts } from './pages/Alerts';
import { QuestionClassifier } from './pages/QuestionClassifier';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />

        {/* Protected Academic Portal Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="upload-marks" element={<UploadMarks />} />
          <Route path="attainment" element={<Attainment />} />
          <Route path="predictions" element={<Predictions />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="question-classifier" element={<QuestionClassifier />} />
        </Route>

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;
