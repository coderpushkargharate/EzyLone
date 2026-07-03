'use client';

import axios from 'axios';
import AdminLoginForm, { LoginCredentials } from '@/components/AdminLoginForm';

export default function LoginPage() {
  const handleLogin = async (credentials: LoginCredentials) => {
    try {
      // Same-origin call; the server sets an httpOnly auth cookie in the response.
      const response = await axios.post('/api/auth/login', credentials);
      // Keep a non-sensitive copy of the user for display in the dashboard.
      localStorage.setItem('user', JSON.stringify(response.data.user));
      // Full-page navigation (not router.push): guarantees the browser makes a
      // fresh top-level request to /admin WITH the freshly-set auth cookie,
      // through middleware. A soft router.push could re-run /admin's own
      // /api/auth/verify before the cookie is attached, bouncing the user back
      // to the login form and forcing a second login attempt.
      window.location.assign('/admin');
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Please try again.',
      };
    }
  };

  return <AdminLoginForm onLogin={handleLogin} />;
}
