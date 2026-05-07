/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { auth, loginWithGoogle, logout, testConnection } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { 
  BarChart3, 
  Briefcase, 
  Users, 
  Box, 
  Truck, 
  Wallet, 
  LogOut, 
  LogIn,
  Menu,
  X,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

// Pages
import Dashboard from './components/Dashboard';
import ProjectList from './components/projects/ProjectList';
import PersonnelList from './components/personnel/PersonnelList';
import MaterialList from './components/materials/MaterialList';
import MachineList from './components/machines/MachineList';
import FinanceList from './components/finance/FinanceList';

type View = 'dashboard' | 'projects' | 'personnel' | 'materials' | 'machines' | 'finance';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      if (user) {
        testConnection();
      }
    });
    return () => unsubscribe();
  }, []);

  const menuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: BarChart3 },
    { id: 'projects', label: 'Projets', icon: Briefcase },
    { id: 'personnel', label: 'Personnel', icon: Users },
    { id: 'materials', label: 'Matériaux', icon: Box },
    { id: 'machines', label: 'Machines', icon: Truck },
    { id: 'finance', label: 'Finances', icon: Wallet },
  ];

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl"
        >
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600">
              <Briefcase className="h-8 w-8 text-white" />
            </div>
            <h1 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">Civix Manager</h1>
            <p className="mt-2 text-gray-600">Plateforme de gestion pour ingénieurs civils</p>
          </div>
          
          <button
            onClick={loginWithGoogle}
            className="group relative flex w-full justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <LogIn className="h-5 w-5 text-blue-300 group-hover:text-blue-100" />
            </span>
            Se connecter avec Google
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-xl transition-transform duration-300 ease-in-out lg:static lg:translate-x-0",
          !isSidebarOpen && "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-20 items-center border-b px-6">
            <Briefcase className="h-8 w-8 text-blue-600" />
            <span className="ml-3 text-xl font-bold tracking-tight">Civix Manager</span>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-4">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveView(item.id as View);
                  if (window.innerWidth < 1024) setIsSidebarOpen(false);
                }}
                className={cn(
                  "flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  activeView === item.id 
                    ? "bg-blue-50 text-blue-700" 
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                <item.icon className={cn("mr-3 h-5 w-5", activeView === item.id ? "text-blue-600" : "text-gray-400")} />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="border-t p-4">
            <div className="mb-4 flex items-center px-2">
              <img 
                src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} 
                alt={user.displayName || ''} 
                className="h-8 w-8 rounded-full border border-gray-200"
              />
              <div className="ml-3 overflow-hidden">
                <p className="truncate text-xs font-medium text-gray-900">{user.displayName}</p>
                <p className="truncate text-[10px] text-gray-500">{user.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Déconnexion
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-20 items-center justify-between border-b bg-white px-8 lg:h-20">
          <div className="flex items-center">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="mr-4 rounded-lg p-1 text-gray-500 lg:hidden"
            >
              {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <h2 className="text-xl font-semibold text-gray-800">
              {menuItems.find(i => i.id === activeView)?.label}
            </h2>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Contextual actions could go here */}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {activeView === 'dashboard' && <Dashboard />}
              {activeView === 'projects' && <ProjectList />}
              {activeView === 'personnel' && <PersonnelList />}
              {activeView === 'materials' && <MaterialList />}
              {activeView === 'machines' && <MachineList />}
              {activeView === 'finance' && <FinanceList />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
