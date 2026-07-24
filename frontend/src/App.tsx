import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Landing from './pages/Landing';
import Login from './pages/Login';
import DashboardLayout from './components/layout/DashboardLayout';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import Departments from './pages/dashboard/Departments';
import Courses from './pages/dashboard/Courses';
import Subjects from './pages/dashboard/Subjects';
import FacultyPage from './pages/dashboard/Faculty';
import StudentsPage from './pages/dashboard/Students';
import AcademicYearsPage from './pages/dashboard/AcademicYears';
import SemestersPage from './pages/dashboard/Semesters';
import UsersPage from './pages/dashboard/Users';
import ProgramsPage from './pages/dashboard/Programs';
import BatchesPage from './pages/dashboard/Batches';
import SectionsPage from './pages/dashboard/Sections';
import CourseOfferingsPage from './pages/dashboard/CourseOfferings';
import CurriculumsPage from './pages/dashboard/Curriculums';
import AcademicCalendarsPage from './pages/dashboard/AcademicCalendars';
import AuditLogsPage from './pages/dashboard/AuditLogs';
import CsvImportPage from './pages/dashboard/CsvImport';
import CourseOutcomesPage from './pages/dashboard/CourseOutcomes';
import QuestionBankPage from './pages/dashboard/QuestionBank';
import AssessmentTypesPage from './pages/dashboard/AssessmentTypes';
import AssessmentsPage from './pages/dashboard/Assessments';
import MarksEntryPage from './pages/dashboard/MarksEntry';
import COConfigurationPage from './pages/dashboard/COConfiguration';
import AttainmentRulesPage from './pages/dashboard/AttainmentRules';
import AssessmentWeightagePage from './pages/dashboard/AssessmentWeightage';
import CalculateCOPage from './pages/dashboard/CalculateCO';
import CalculationHistoryPage from './pages/dashboard/CalculationHistory';
import StudentCOViewPage from './pages/dashboard/StudentCOView';

// Phase 5 Imports
import ProgramOutcomesPage from './pages/dashboard/ProgramOutcomes';
import PSOsPage from './pages/dashboard/PSOs';
import POConfigurationPage from './pages/dashboard/POConfiguration';
import COPOMappingMatrixPage from './pages/dashboard/COPOMappingMatrix';
import CalculatePOPage from './pages/dashboard/CalculatePO';
import StudentPOViewPage from './pages/dashboard/StudentPOView';

// Phase 6 Imports (AI/ML Engine)
import DatasetManagementPage from './pages/dashboard/ml/DatasetManagement';
import ModelTrainingPage from './pages/dashboard/ml/ModelTraining';
import PredictionDashboardPage from './pages/dashboard/ml/PredictionDashboard';

// Phase 7 Imports (Analytics & Reports)
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import Settings from './pages/dashboard/Settings';

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="programs" element={<ProgramsPage />} />
            <Route path="batches" element={<BatchesPage />} />
            <Route path="sections" element={<SectionsPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="departments" element={<Departments />} />
            <Route path="courses" element={<Courses />} />
            <Route path="subjects" element={<Subjects />} />
            <Route path="offerings" element={<CourseOfferingsPage />} />
            <Route path="curriculums" element={<CurriculumsPage />} />
            <Route path="faculty" element={<FacultyPage />} />
            <Route path="students" element={<StudentsPage />} />
            <Route path="academic-years" element={<AcademicYearsPage />} />
            <Route path="semesters" element={<SemestersPage />} />
            <Route path="calendars" element={<AcademicCalendarsPage />} />
            <Route path="import" element={<CsvImportPage />} />
            <Route path="audit" element={<AuditLogsPage />} />
            <Route path="course-outcomes" element={<CourseOutcomesPage />} />
            <Route path="question-bank" element={<QuestionBankPage />} />
            <Route path="assessment-types" element={<AssessmentTypesPage />} />
            <Route path="assessments" element={<AssessmentsPage />} />
            <Route path="marks-entry" element={<MarksEntryPage />} />
            <Route path="co-config" element={<COConfigurationPage />} />
            <Route path="attainment-rules" element={<AttainmentRulesPage />} />
            <Route path="weightage" element={<AssessmentWeightagePage />} />
            <Route path="calculate-co" element={<CalculateCOPage />} />
            <Route path="calculation-history" element={<CalculationHistoryPage />} />
            <Route path="student-co-view" element={<StudentCOViewPage />} />
            
            {/* Phase 5 Routes */}
            <Route path="program-outcomes" element={<ProgramOutcomesPage />} />
            <Route path="psos" element={<PSOsPage />} />
            <Route path="po-config" element={<POConfigurationPage />} />
            <Route path="co-po-mapping" element={<COPOMappingMatrixPage />} />
            <Route path="calculate-po" element={<CalculatePOPage />} />
            <Route path="student-po-view" element={<StudentPOViewPage />} />

            {/* Phase 6 ML Routes */}
            <Route path="ml-datasets" element={<DatasetManagementPage />} />
            <Route path="ml-training" element={<ModelTrainingPage />} />
            <Route path="ml-prediction" element={<PredictionDashboardPage />} />

            {/* Phase 7 Analytics Routes */}
            <Route path="analytics-dashboard" element={<AnalyticsDashboard />} />

            <Route path="settings" element={<Settings />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
