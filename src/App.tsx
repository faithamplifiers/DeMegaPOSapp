import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';
import News from './pages/News';
import Events from './pages/Events';
import Services from './pages/Services';
import Directory from './pages/Directory';
import Resources from './pages/Resources';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminLogin from './pages/auth/AdminLogin';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Dashboard from './pages/dashboard/Dashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import AuthGuard from './components/auth/AuthGuard';
import AdminGuard from './components/auth/AdminGuard';
import PublicLayout from './components/layout/PublicLayout';

function App() {
  return (
    <Router>
      <Routes>
        {/* Admin login — standalone page, no header/footer */}
        <Route path="/fa-admin/login" element={<AdminLogin />} />

        {/* Admin dashboard — standalone full-page layout, no header/footer */}
        <Route
          path="/fa-admin/*"
          element={
            <AdminGuard>
              <AdminDashboard />
            </AdminGuard>
          }
        />

        {/* Creator/member dashboard — standalone full-page layout, no header/footer */}
        <Route
          path="/dashboard/*"
          element={
            <AuthGuard>
              <Dashboard />
            </AuthGuard>
          }
        />

        {/* All public pages — wrapped with Header + Footer */}
        <Route path="/*" element={<PublicLayout />} />
      </Routes>
      <Toaster position="top-right" />
    </Router>
  );
}

export default App;