import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { LoginPage } from './pages/LoginPage';
import { ProfilePage } from './pages/ProfilePage';
import { DashboardPage } from './pages/DashboardPage';
import { WeightPage } from './pages/WeightPage';
import { WorkoutPage } from './pages/WorkoutPage';
import { AgentPage } from './pages/AgentPage';
import { WorkoutCoachPage } from './pages/WorkoutCoachPage';

function RootRedirect() {
  const { user, isLoadingAuth } = useAuth();
  const { profile, isLoading } = useApp();

  if (isLoadingAuth || isLoading) return null;

  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={profile ? '/dashboard' : '/profile'} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/profile" element={
        <ProtectedRoute requireProfile={false}>
          <Layout><ProfilePage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Layout><DashboardPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/weight" element={
        <ProtectedRoute>
          <Layout><WeightPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/workouts" element={
        <ProtectedRoute>
          <Layout><WorkoutPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/agent" element={
        <ProtectedRoute>
          <Layout><AgentPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/workout-coach" element={
        <ProtectedRoute>
          <Layout><WorkoutCoachPage /></Layout>
        </ProtectedRoute>
      } />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <AppRoutes />
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
