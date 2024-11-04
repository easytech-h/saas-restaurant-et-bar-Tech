import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './lib/stores/useAuthStore';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Sales from './pages/Sales';
import Orders from './pages/Orders';
import Kitchen from './pages/Kitchen';
import Inventory from './pages/Inventory';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import { Loader2, ChefHat } from 'lucide-react';

function LoadingScreen() {
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-50">
      <ChefHat className="w-16 h-16 text-indigo-600 mb-4" />
      <div className="text-xl font-semibold text-gray-800 mb-4">Delux Bar & Fast-Food</div>
      <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
    </div>
  );
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore();
  
  React.useEffect(() => {
    console.log('Auth state:', { user, loading });
  }, [user, loading]);
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  return user ? <>{children}</> : <Navigate to="/login" />;
}

export default function App() {
  const { initialize } = useAuthStore();
  const [initError, setInitError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    console.log('Starting app initialization...');
    initialize().catch(error => {
      console.error('Failed to initialize app:', error);
      setInitError(error);
    });
  }, [initialize]);

  if (initError) {
    throw initError;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="sales" element={<Sales />} />
          <Route path="orders" element={<Orders />} />
          <Route path="kitchen" element={<Kitchen />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}