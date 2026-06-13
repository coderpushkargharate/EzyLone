'use client';

import { useRouter } from 'next/navigation';
import axios from 'axios';
import AdminLoginForm, { LoginCredentials } from '@/components/AdminLoginForm';

const SERVER_HOST = process.env.NEXT_PUBLIC_SERVER_HOST || 'http://127.0.0.1:3001';

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = async (credentials: LoginCredentials) => {
    try {
      const response = await axios.post(`${SERVER_HOST}/api/auth/login`, credentials);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
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
