import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import OnboardingScreen from './screens/OnboardingScreen';
import GroupDashboard from './screens/GroupDashboard';
import Groups from './screens/Groups';
import CreateGroup from './screens/CreateGroup';
import AddExpense from './screens/AddExpense';
import ExpenseList from './screens/ExpenseList';
import SettlementView from './screens/SettlementView';
import Settings from './screens/Settings';
import { useAppStore } from './stores/useAppStore';
import { useGroupStore } from './stores/useGroupStore';

function App() {
  const { initialize, isFirstTime } = useAppStore();
  const { loadGroups, initializeActiveGroup } = useGroupStore();

  useEffect(() => {
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
  }, [initialize, loadGroups, initializeActiveGroup]);

  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          {/* Redirect first-time users to onboarding */}
          <Route path="/" element={
            isFirstTime ? <Navigate to="/onboarding" replace /> : <Layout />
          }>
            {!isFirstTime && (
              <>
                <Route index element={<GroupDashboard />} />
                <Route path="dashboard" element={<GroupDashboard />} />
                <Route path="groups" element={<Groups />} />
                <Route path="expenses" element={<ExpenseList />} />
                <Route path="add-expense" element={<AddExpense />} />
                <Route path="settlements" element={<SettlementView />} />
                <Route path="settings" element={<Settings />} />
              </>
            )}
          </Route>
          
          {/* Standalone screens */}
          <Route path="/onboarding" element={<OnboardingScreen />} />
          <Route path="/create-group" element={<CreateGroup />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;