'use client';

import { useRouter } from 'next/navigation';
import axios from 'axios';
import AdminLoginForm, { LoginCredentials } from '@/components/AdminLoginForm';

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = async (credentials: LoginCredentials) => {
    try {
      // Same-origin call; the server sets an httpOnly auth cookie in the response.
      const response = await axios.post('/api/auth/login', credentials);
      // Keep a non-sensitive copy of the user for display in the dashboard.
      localStorage.setItem('user', JSON.stringify(response.data.user));
      router.push('/admin');
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
