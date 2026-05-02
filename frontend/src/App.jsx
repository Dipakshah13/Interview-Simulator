import { Routes, Route, Navigate } from 'react-router-dom';
import SplashPage           from './pages/SplashPage';
import LoginPage            from './pages/LoginPage';
import SignupPage           from './pages/SignupPage';
import DashboardPage        from './pages/DashboardPage';
import InterviewSetupPage   from './pages/InterviewSetupPage';
import InterviewSessionPage from './pages/InterviewSessionPage';
import InsightsPage         from './pages/InsightsPage';
import ReportPage           from './pages/ReportPage';
import HistoryPage          from './pages/HistoryPage';
import ProfilePage          from './pages/ProfilePage';
import ResumeAnalyzerPage  from './pages/ResumeAnalyzerPage';

export default function App() {
  return (
    <Routes>
      <Route path="/"                  element={<SplashPage />} />
      <Route path="/login"             element={<LoginPage />} />
      <Route path="/signup"            element={<SignupPage />} />
      <Route path="/dashboard"         element={<DashboardPage />} />
      <Route path="/interview/setup"   element={<InterviewSetupPage />} />
      <Route path="/interview/session" element={<InterviewSessionPage />} />
      <Route path="/insights"          element={<InsightsPage />} />
      <Route path="/report"            element={<ReportPage />} />
      <Route path="/history"           element={<HistoryPage />} />
      <Route path="/profile"           element={<ProfilePage />} />
      <Route path="/resume-analyzer"   element={<ResumeAnalyzerPage />} />
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
