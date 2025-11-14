import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import OnboardingScreen from './screens/OnboardingScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import JoinGroupScreen from './screens/JoinGroupScreen';
import GroupDashboard from './screens/GroupDashboard';
import Groups from './screens/Groups';
import CreateGroup from './screens/CreateGroup';
import AddExpense from './screens/AddExpense';
import ExpenseList from './screens/ExpenseList';
import SettlementView from './screens/SettlementView';
import Settings from './screens/Settings';
import { useAuthStore } from './stores/useAuthStore';
import { useAppStore } from './stores/useAppStore';
import { useGroupStore } from './stores/useGroupStore';
import PageTransition from './components/PageTransition';

function App() {
  const { initialize: initializeAuth, isAuthenticated } = useAuthStore();
  const { initialize, isFirstTime } = useAppStore();
  const { loadGroups, initializeActiveGroup } = useGroupStore();

  useEffect(() => {
    // Initialize auth first
    initializeAuth();

    // Initialize app state on startup
    initialize();
    loadGroups();
    initializeActiveGroup();

    // Set up online/offline detection
    const handleOnline = () => useAppStore.getState().setOfflineStatus(false);
    const handleOffline = () => useAppStore.getState().setOfflineStatus(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set initial online state
    useAppStore.getState().setOfflineStatus(!navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [initializeAuth, initialize, loadGroups, initializeActiveGroup]);

  return (
    <Router>
      <div className="min-h-screen bg-background">
        <PageTransition>
          <Routes>
            {/* Public routes */}
            <Route path="/onboarding" element={<OnboardingScreen />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/register" element={<RegisterScreen />} />
            <Route path="/join-group" element={<JoinGroupScreen />} />

            {/* Protected routes */}
            <Route path="/" element={
              !isAuthenticated ? (
                <Navigate to="/onboarding" replace />
              ) : (
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              )
            }>
              <Route index element={<GroupDashboard />} />
              <Route path="dashboard" element={<GroupDashboard />} />
              <Route path="groups" element={<Groups />} />
              <Route path="expenses" element={<ExpenseList />} />
              <Route path="add-expense" element={<AddExpense />} />
              <Route path="settlements" element={<SettlementView />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            <Route path="/create-group" element={
              <ProtectedRoute>
                <CreateGroup />
              </ProtectedRoute>
            } />

            {/* Group specific routes */}
            <Route path="/group/:groupId" element={
              <ProtectedRoute>
                <GroupDashboard />
              </ProtectedRoute>
            } />

            {/* Catch all - redirect to login */}
            <Route path="*" element={<Navigate to="/onboarding" replace />} />
          </Routes>
        </PageTransition>
      </div>
    </Router>
  );
}

export default App;