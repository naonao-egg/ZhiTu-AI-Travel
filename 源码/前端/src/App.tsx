import React, { useState } from 'react';
import TopAppBar from './components/TopAppBar';
import BottomNavBar from './components/BottomNavBar';
import NavigationDrawer from './components/NavigationDrawer';
import ExplorePage from './pages/ExplorePage';
import ItineraryPage from './pages/ItineraryPage';
import PassportPage from './pages/PassportPage';
import LoginPage from './pages/LoginPage';
import { TravelProvider, useTravel } from './context/TravelContext';

function AppContent() {
  const { currentUser } = useTravel();
  const [activeTab, setActiveTab] = useState(0); // Default to Explore
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  if (!currentUser) {
    return <LoginPage />;
  }

  return (
    <div className="bg-background-main font-body-md text-on-background h-screen flex flex-col overflow-hidden w-full max-w-md mx-auto relative shadow-2xl ring-1 ring-surface-variant">
      <TopAppBar onMenuClick={() => setIsDrawerOpen(true)} />
      <NavigationDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} setActiveTab={setActiveTab} />
      <div className="flex-1 overflow-hidden relative">
        <div className={`absolute inset-0 transition-opacity duration-300 ${activeTab === 0 ? 'opacity-100 z-10 relative pointer-events-auto h-full' : 'absolute opacity-0 z-0 pointer-events-none'}`}>
          <ExplorePage />
        </div>
        <div className={`absolute inset-0 transition-opacity duration-300 ${activeTab === 1 ? 'opacity-100 z-10 relative pointer-events-auto h-full' : 'absolute opacity-0 z-0 pointer-events-none'}`}>
          <ItineraryPage />
        </div>
        <div className={`absolute inset-0 transition-opacity duration-300 ${activeTab === 2 ? 'opacity-100 z-10 relative pointer-events-auto h-full' : 'absolute opacity-0 z-0 pointer-events-none'}`}>
          <PassportPage setActiveTab={setActiveTab} />
        </div>
      </div>
      <BottomNavBar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default function App() {
  return (
    <TravelProvider>
      <AppContent />
    </TravelProvider>
  );
}
