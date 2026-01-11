import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { UserProvider } from './context/UserContext';
import { VehicleProvider } from './context/VehicleContext';
import { OBDProvider } from './context/OBDContext';

// Pages
import GunUIDashboard from './pages/GunUIDashboard';
import Subscription from './pages/Subscription';
import LiveMonitor from './pages/LiveMonitor';
import DTCScanner from './pages/DTCScanner';
import Reports from './pages/Reports';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [lang, setLang] = useState('en');

  return (
    <UserProvider>
      <OBDProvider>
        <VehicleProvider>
          <Router>
            <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950">
              <Navbar
                toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                lang={lang}
                setLang={setLang}
              />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar
                  isOpen={isSidebarOpen}
                  closeSidebar={() => setIsSidebarOpen(false)}
                  lang={lang}
                />
                <main className="flex-1 overflow-y-auto p-0"> {/* Remove padding for GunUI full width */}
                  <Routes>
                    <Route path="/" element={<GunUIDashboard lang={lang} />} />
                    <Route path="/subscription" element={<Subscription />} />
                    <Route path="/live" element={<LiveMonitor />} />
                    <Route path="/dtc" element={<DTCScanner />} />
                    <Route path="/reports" element={<Reports />} />
                  </Routes>
                </main>
              </div>
            </div>
          </Router>
        </VehicleProvider>
      </OBDProvider>
    </UserProvider>
  );
}

export default App;
