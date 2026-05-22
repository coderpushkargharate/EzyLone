'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Image as ImageIcon,
  MessageSquare,
  FileText,
  LogOut,
  Users,
  Upload,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Menu,
  X,
  Lock,
  User as UserIcon,
  Plus,
  Edit,
  Save,
  Loader2
} from 'lucide-react';
import axios from 'axios';

const SERVER_HOST = process.env.NEXT_PUBLIC_SERVER_HOST || 'http://127.0.0.1:3001';

// TypeScript Interfaces
interface User {
  username: string;
  [key: string]: any;
}

interface LoginCredentials {
  username: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: User;
}

interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  image: string;
  createdAt: string;
  updatedAt: string;
}

interface BlogFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  image: string;
}

// Main Admin Application
export default function AdminApp() {
  const [currentPage, setCurrentPage] = useState<string>('login');
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setCurrentPage('dashboard');
      axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
      
      axios.get(`${SERVER_HOST}/api/auth/verify`)
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setCurrentPage('login');
        });
    } else {
      setCurrentPage('login');
    }
  }, []);

  const handleLogin = async (credentials: LoginCredentials) => {
    try {
      const response = await axios.post<LoginResponse>(`${SERVER_HOST}/api/auth/login`, credentials);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setToken(token);
      setUser(user);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setCurrentPage('dashboard');
      
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Invalid credentials'
      };
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setToken(null);
    setCurrentPage('login');
  };

  if (currentPage === 'login') {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <AdminDashboard
      user={user}
      onLogout={handleLogout}
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
    />
  );
}

// Login Page Component
function AdminLogin({ onLogin }: { onLogin: (credentials: LoginCredentials) => Promise<{ success: boolean; message?: string }> }) {
  const [formData, setFormData] = useState<LoginCredentials>({ username: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    const result = await onLogin(formData);
    if (!result.success) {
      setError(result.message || 'Login failed');
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Users className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">EzyLoan Admin</h1>
          <p className="text-gray-600">Access Dashboard</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                required
                placeholder="Enter username"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
                placeholder="Enter password"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              />
            </div>
          </div>
          {error && (
            <div className="bg-red-50 text-red-800 p-3 rounded-lg text-sm border border-red-200">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-cyan-600 transition-all duration-300 disabled:opacity-50 shadow-md hover:shadow-lg"
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

// Main Dashboard Component
function AdminDashboard({ 
  user, 
  onLogout, 
  currentPage, 
  setCurrentPage 
}: { 
  user: User | null; 
  onLogout: () => void; 
  currentPage: string; 
  setCurrentPage: (page: string) => void;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    totalContacts: 0,
    totalLoanApplications: 0,
    pendingApplications: 0,
    totalBanners: 0,
    totalBlogs: 0
  });
  const [banners, setBanners] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [selectedPage, setSelectedPage] = useState<string>('home');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedContact, setSelectedContact] = useState<any | null>(null);
  const [selectedLoan, setSelectedLoan] = useState<any | null>(null);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState({
    banners: false,
    contacts: false,
    loans: false,
    blogs: false
  });

  // Menu items configuration - Added Blogs
  const menuItems = [
    { id: 'dashboard', name: 'Overview', icon: LayoutDashboard, component: DashboardOverview },
    { id: 'banners', name: 'Banners', icon: ImageIcon, component: BannersManager },
    { id: 'contacts', name: 'Contacts', icon: MessageSquare, component: ContactsManager },
    { id: 'loans', name: 'Loan Applications', icon: FileText, component: LoansManager },
    { id: 'blogs', name: 'Blog Manager', icon: FileText, component: BlogsManager }
  ];

  // Fetch dashboard stats
  useEffect(() => {
    if (currentPage === 'dashboard') {
      fetchDashboardStats();
    }
  }, [currentPage]);

  // Fetch data when components are accessed
  useEffect(() => {
    if (currentPage === 'banners' && banners.length === 0) fetchBanners();
    else if (currentPage === 'contacts' && contacts.length === 0) fetchContacts();
    else if (currentPage === 'loans' && loans.length === 0) fetchLoans();
    else if (currentPage === 'blogs' && blogs.length === 0) fetchBlogs();
  }, [currentPage]);

  const fetchDashboardStats = async () => {
    try {
      const [contactsRes, loansRes, bannersRes, blogsRes] = await Promise.all([
        axios.get(`${SERVER_HOST}/api/contacts`),
        axios.get(`${SERVER_HOST}/api/loans`),
        axios.get(`${SERVER_HOST}/api/banners`),
        axios.get(`${SERVER_HOST}/api/blogs`)
      ]);
      
      setDashboardStats({
        totalContacts: contactsRes.data.length,
        totalLoanApplications: loansRes.data.length,
        pendingApplications: loansRes.data.filter((loan: any) => loan.status === 'pending').length,
        totalBanners: bannersRes.data.length,
        totalBlogs: blogsRes.data.length
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const fetchBanners = async () => {
    setLoading(prev => ({ ...prev, banners: true }));
    try {
      const response = await axios.get(`${SERVER_HOST}/api/banners`);
      setBanners(response.data);
    } catch (error) {
      console.error('Error fetching banners:', error);
      alert('Failed to load banners. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, banners: false }));
    }
  };

  const fetchContacts = async () => {
    setLoading(prev => ({ ...prev, contacts: true }));
    try {
      const response = await axios.get(`${SERVER_HOST}/api/contacts`);
      setContacts(response.data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      alert('Failed to load contacts. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, contacts: false }));
    }
  };

  const fetchLoans = async () => {
    setLoading(prev => ({ ...prev, loans: true }));
    try {
      const response = await axios.get(`${SERVER_HOST}/api/loans`);
      setLoans(response.data);
    } catch (error) {
      console.error('Error fetching loans:', error);
      alert('Failed to load loan applications. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, loans: false }));
    }
  };

  // 🔥 NEW: Blog Fetch Functions
  const fetchBlogs = async () => {
    setLoading(prev => ({ ...prev, blogs: true }));
    try {
      const response = await axios.get(`${SERVER_HOST}/api/blogs`);
      setBlogs(response.data);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      alert('Failed to load blogs. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, blogs: false }));
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      alert('File size should be less than 5MB');
      return;
    }
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    formData.append('page', selectedPage);
    
    try {
      await axios.post(`${SERVER_HOST}/api/banners`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchBanners();
      alert('Banner uploaded successfully!');
    } catch (error) {
      console.error('Error uploading banner:', error);
      alert('Error uploading banner. Please try again.');
    }
    
    setIsUploading(false);
    event.target.value = '';
  };

  const handleDeleteBanner = async (bannerId: string) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) return;
    
    try {
      await axios.delete(`${SERVER_HOST}/api/banners/${bannerId}`);
      fetchBanners();
      alert('Banner deleted successfully!');
    } catch (error) {
      console.error('Error deleting banner:', error);
      alert('Failed to delete banner. Please try again.');
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) return;
    
    try {
      await axios.delete(`${SERVER_HOST}/api/contacts/${contactId}`);
      fetchContacts();
      alert('Contact deleted successfully!');
    } catch (error) {
      console.error('Error deleting contact:', error);
      alert('Failed to delete contact. Please try again.');
    }
  };

  const handleStatusUpdate = async (loanId: string, status: string) => {
    try {
      await axios.put(`${SERVER_HOST}/api/loans/${loanId}/status`, { status });
      fetchLoans();
      alert(`Loan application ${status} successfully!`);
    } catch (error) {
      console.error('Error updating loan status:', error);
      alert('Failed to update loan status. Please try again.');
    }
  };

  const handleDeleteLoan = async (loanId: string) => {
    if (!window.confirm('Are you sure you want to delete this loan application?')) return;
    
    try {
      await axios.delete(`${SERVER_HOST}/api/loans/${loanId}`);
      fetchLoans();
      alert('Loan application deleted successfully!');
    } catch (error) {
      console.error('Error deleting loan:', error);
      alert('Failed to delete loan application. Please try again.');
    }
  };

  // 🔥 NEW: Blog CRUD Functions
  const handleCreateBlog = async (blogData: BlogFormData) => {
    try {
      await axios.post(`${SERVER_HOST}/api/blogs`, blogData);
      fetchBlogs();
      alert('Blog created successfully!');
      return { success: true };
    } catch (error: any) {
      console.error('Error creating blog:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to create blog' };
    }
  };

  const handleUpdateBlog = async (blogId: string, blogData: Partial<BlogFormData>) => {
    try {
      await axios.put(`${SERVER_HOST}/api/blogs/${blogId}`, blogData);
      fetchBlogs();
      alert('Blog updated successfully!');
      return { success: true };
    } catch (error: any) {
      console.error('Error updating blog:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to update blog' };
    }
  };

  const handleDeleteBlog = async (blogId: string) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) return;
    
    try {
      await axios.delete(`${SERVER_HOST}/api/blogs/${blogId}`);
      fetchBlogs();
      alert('Blog deleted successfully!');
    } catch (error) {
      console.error('Error deleting blog:', error);
      alert('Failed to delete blog. Please try again.');
    }
  };

  // Get current component to display
  const CurrentComponent = menuItems.find(item => item.id === currentPage)?.component || menuItems[0].component;

  return (
    <div className="min-h-screen bg-gray-50" id="admin-app">
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 z-50 h-screen w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <h1 className="text-lg font-bold text-blue-600 tracking-wide">EzyLoan Admin</h1>
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="mt-6 space-y-1 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors
                ${currentPage === item.id ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"}`}
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.name}
              </button>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">{user?.username || 'Admin'}</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>
          <button onClick={onLogout} className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors">
            <LogOut className="h-4 w-4 mr-2" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        <div className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-6">
          <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden text-gray-500 hover:text-gray-700">
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center">
            <h2 className="text-lg font-semibold text-gray-800">
              {menuItems.find(item => item.id === currentPage)?.name || 'Dashboard'}
            </h2>
          </div>
        </div>

        <div className="p-4 md:p-6">
          <CurrentComponent
            // Dashboard props
            stats={dashboardStats}
            // Banners props
            banners={banners}
            selectedPage={selectedPage}
            setSelectedPage={setSelectedPage}
            isUploading={isUploading}
            onFileUpload={handleFileUpload}
            onDeleteBanner={handleDeleteBanner}
            loadingBanners={loading.banners}
            // Contacts props
            contacts={contacts}
            selectedContact={selectedContact}
            setSelectedContact={setSelectedContact}
            onDeleteContact={handleDeleteContact}
            loadingContacts={loading.contacts}
            // Loans props
            loans={loans}
            selectedLoan={selectedLoan}
            setSelectedLoan={setSelectedLoan}
            onStatusUpdate={handleStatusUpdate}
            onDeleteLoan={handleDeleteLoan}
            loadingLoans={loading.loans}
            // 🔥 Blogs props
            blogs={blogs}
            selectedBlog={selectedBlog}
            setSelectedBlog={setSelectedBlog}
            onCreateBlog={handleCreateBlog}
            onUpdateBlog={handleUpdateBlog}
            onDeleteBlog={handleDeleteBlog}
            loadingBlogs={loading.blogs}
          />
        </div>
      </div>
    </div>
  );
}

// Dashboard Overview Component
function DashboardOverview({ stats }: { stats: any }) {
  const statCards = [
    { title: 'Total Contacts', value: stats.totalContacts, color: 'bg-blue-500', icon: <MessageSquare className="h-8 w-8" /> },
    { title: 'Loan Applications', value: stats.totalLoanApplications, color: 'bg-green-500', icon: <FileText className="h-8 w-8" /> },
    { title: 'Pending Applications', value: stats.pendingApplications, color: 'bg-yellow-500', icon: <FileText className="h-8 w-8" /> },
    { title: 'Total Banners', value: stats.totalBanners, color: 'bg-purple-500', icon: <ImageIcon className="h-8 w-8" /> },
    { title: 'Total Blogs', value: stats.totalBlogs, color: 'bg-indigo-500', icon: <FileText className="h-8 w-8" /> }
  ];

  return (
    <div>
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Dashboard Overview</h3>
        <p className="text-gray-600">Welcome to EzyLoan Admin Panel</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 mb-8">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-4 md:p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
              </div>
              <div className={`${card.color} p-3 rounded-lg text-white`}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h4>
          <div className="space-y-3">
            <button className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors w-full text-left">
              <ImageIcon className="h-5 w-5 text-blue-600 mr-3" />
              <span className="font-medium text-blue-600">Manage Banners</span>
            </button>
            <button className="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors w-full text-left">
              <MessageSquare className="h-5 w-5 text-green-600 mr-3" />
              <span className="font-medium text-green-600">View Contacts</span>
            </button>
            <button className="flex items-center p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors w-full text-left">
              <FileText className="h-5 w-5 text-purple-600 mr-3" />
              <span className="font-medium text-purple-600">Review Loan Applications</span>
            </button>
            <button className="flex items-center p-3 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors w-full text-left">
              <FileText className="h-5 w-5 text-indigo-600 mr-3" />
              <span className="font-medium text-indigo-600">Manage Blogs</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">System Status</h4>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">API Status</span>
                <span className="text-sm font-medium text-green-600">Operational</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Database</span>
                <span className="text-sm font-medium text-green-600">Healthy</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
            <div className="mt-2 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-600">
                All systems operational. Last updated: {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Banners Manager Component
function BannersManager({
  banners, selectedPage, setSelectedPage, isUploading, onFileUpload, onDeleteBanner, loadingBanners
}: {
  banners: any[]; selectedPage: string; setSelectedPage: (page: string) => void;
  isUploading: boolean; onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteBanner: (bannerId: string) => void; loadingBanners: boolean;
}) {
  const pages = [
    { value: 'home', label: 'Home' }, { value: 'about', label: 'About' },
    { value: 'contact', label: 'Contact' }, { value: 'apply', label: 'Apply Loan' },
    { value: 'car-refinance', label: 'Car Refinance' }, { value: 'used-car-refinance', label: 'Used Car Refinance' },
    { value: 'car-balance-transfer', label: 'Car Balance Transfer' }, { value: 'car-top-up', label: 'Car Top-Up Loan' },
    { value: 'new-car-loan', label: 'New Car Loan' }, { value: 'personal-loan', label: 'Personal Loan' },
    { value: 'property-loan', label: 'Property Loan' }, { value: 'commercial-vehicle-loan', label: 'Commercial Vehicle Loan' }
  ];

  const filteredBanners = banners.filter(banner => banner.page === selectedPage);

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Banner Management</h3>
        <p className="text-gray-600">Manage banners for different pages</p>
      </div>
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6 border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="w-full sm:w-auto">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Page</label>
            <select value={selectedPage} onChange={(e) => setSelectedPage(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-auto">
              {pages.map((page) => (<option key={page.value} value={page.value}>{page.label}</option>))}
            </select>
          </div>
          <div className="w-full sm:w-auto">
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Banner</label>
            <label className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors cursor-pointer w-full sm:w-auto">
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? 'Uploading...' : 'Choose Image'}
              <input type="file" accept="image/*" onChange={onFileUpload} disabled={isUploading} className="hidden" />
            </label>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-4 md:p-6 border-b border-gray-200">
          <h4 className="text-lg font-semibold text-gray-800">{pages.find(p => p.value === selectedPage)?.label} Banners ({filteredBanners.length})</h4>
        </div>
        <div className="p-4 md:p-6">
          {loadingBanners ? (
            <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>
          ) : filteredBanners.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No banners uploaded for this page</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredBanners.map((banner) => (
                <div key={banner._id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <div className="relative h-40 md:h-48 overflow-hidden">
                    <img src={banner.image.startsWith('http') ? banner.image : `${SERVER_HOST}${banner.image}`} alt="Banner" className="w-full h-full object-cover" onError={(e) => { const target = e.target as HTMLImageElement; target.onerror = null; target.src = 'https://via.placeholder.com/400x200?text=Image+Not+Found'; }} />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 text-xs rounded-full ${banner.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{banner.isActive ? 'Active' : 'Inactive'}</span>
                      <button onClick={() => onDeleteBanner(banner._id)} className="text-red-600 hover:text-red-800 transition-colors p-1 hover:bg-red-50 rounded-full" title="Delete banner"><Trash2 className="h-4 w-4" /></button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Uploaded: {new Date(banner.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Contacts Manager Component
function ContactsManager({ contacts, selectedContact, setSelectedContact, onDeleteContact, loadingContacts }: {
  contacts: any[]; selectedContact: any | null; setSelectedContact: (contact: any | null) => void;
  onDeleteContact: (contactId: string) => void; loadingContacts: boolean;
}) {
  return (
    <div>
      <div className="mb-6"><h3 className="text-2xl font-bold text-gray-800 mb-2">Contact Messages</h3><p className="text-gray-600">Manage customer inquiries and contact messages</p></div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-4 md:p-6 border-b border-gray-200"><h4 className="text-lg font-semibold text-gray-800">All Contacts ({contacts.length})</h4></div>
        <div className="overflow-x-auto">
          {loadingContacts ? (
            <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-12"><MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" /><p className="text-gray-500 text-lg">No contact messages found</p></div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50"><tr><th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Info</th><th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Loan Details</th><th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Date</th><th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th></tr></thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contacts.map((contact) => (
                  <tr key={contact._id} className="hover:bg-gray-50">
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap"><div><p className="font-medium text-gray-900">{contact.fullName}</p><p className="text-sm text-gray-500">{contact.email}</p><p className="text-sm text-gray-500">{contact.phoneNumber}</p></div></td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap hidden md:table-cell"><div><p className="text-sm text-gray-900">{contact.loanType}</p><p className="text-sm text-gray-500">{contact.loanAmount}</p></div></td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">{new Date(contact.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap"><div className="flex space-x-2"><button onClick={() => setSelectedContact(contact)} className="text-blue-600 hover:text-blue-800 transition-colors p-1 hover:bg-blue-50 rounded-full" title="View details"><Eye className="h-4 w-4" /></button><button onClick={() => onDeleteContact(contact._id)} className="text-red-600 hover:text-red-800 transition-colors p-1 hover:bg-red-50 rounded-full" title="Delete contact"><Trash2 className="h-4 w-4" /></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {selectedContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full my-8">
            <div className="p-4 md:p-6 border-b border-gray-200 flex justify-between items-center"><h3 className="text-lg font-semibold text-gray-800">Contact Details</h3><button onClick={() => setSelectedContact(null)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button></div>
            <div className="p-4 md:p-6 max-h-[70vh] overflow-y-auto">
              <div className="space-y-4">
                <DetailItem label="Full Name" value={selectedContact.fullName} /><DetailItem label="Email" value={selectedContact.email} /><DetailItem label="Phone" value={selectedContact.phoneNumber} /><DetailItem label="Loan Type" value={selectedContact.loanType} /><DetailItem label="Loan Amount" value={selectedContact.loanAmount} />
                {selectedContact.city && <DetailItem label="City" value={selectedContact.city} />}
                {selectedContact.message && <DetailItem label="Message" value={selectedContact.message} isTextArea />}
              </div>
            </div>
            <div className="p-4 md:p-6 border-t border-gray-200 flex justify-end"><button onClick={() => setSelectedContact(null)} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">Close</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailItem({ label, value, isTextArea }: { label: string; value: string; isTextArea?: boolean }) {
  return (<div><label className="block text-sm font-medium text-gray-700 mb-1">{label}</label><div className={`text-gray-900 ${isTextArea ? 'whitespace-pre-wrap' : ''}`}>{value || 'N/A'}</div></div>);
}

// Loans Manager Component
function LoansManager({ loans, selectedLoan, setSelectedLoan, onStatusUpdate, onDeleteLoan, loadingLoans }: {
  loans: any[]; selectedLoan: any | null; setSelectedLoan: (loan: any | null) => void;
  onStatusUpdate: (loanId: string, status: string) => void; onDeleteLoan: (loanId: string) => void; loadingLoans: boolean;
}) {
  return (
    <div>
      <div className="mb-6"><h3 className="text-2xl font-bold text-gray-800 mb-2">Loan Applications</h3><p className="text-gray-600">Manage and review loan applications</p></div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-4 md:p-6 border-b border-gray-200"><h4 className="text-lg font-semibold text-gray-800">All Applications ({loans.length})</h4></div>
        <div className="overflow-x-auto">
          {loadingLoans ? (<div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>) : loans.length === 0 ? (
            <div className="text-center py-12"><FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" /><p className="text-gray-500 text-lg">No loan applications found</p></div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50"><tr><th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th><th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Loan Details</th><th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th><th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Date</th><th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th></tr></thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loans.map((loan) => (
                  <tr key={loan._id} className="hover:bg-gray-50">
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap"><div><p className="font-medium text-gray-900">{loan.fullName}</p><p className="text-sm text-gray-500">{loan.phoneNumber}</p><p className="text-sm text-gray-500 hidden md:block">{loan.city}, {loan.pincode}</p></div></td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap hidden md:table-cell"><div><p className="text-sm text-gray-900">{loan.loanType}</p><p className="text-sm text-gray-500">{loan.employmentType}</p><p className="text-sm text-gray-500">CIBIL: {loan.cibilScore}</p></div></td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap"><StatusBadge status={loan.status} /></td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">{new Date(loan.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap"><div className="flex space-x-2"><button onClick={() => setSelectedLoan(loan)} className="text-blue-600 hover:text-blue-800 transition-colors p-1 hover:bg-blue-50 rounded-full" title="View details"><Eye className="h-4 w-4" /></button>{loan.status === 'pending' && (<><button onClick={() => onStatusUpdate(loan._id, 'approved')} className="text-green-600 hover:text-green-800 transition-colors p-1 hover:bg-green-50 rounded-full" title="Approve application"><CheckCircle className="h-4 w-4" /></button><button onClick={() => onStatusUpdate(loan._id, 'rejected')} className="text-red-600 hover:text-red-800 transition-colors p-1 hover:bg-red-50 rounded-full" title="Reject application"><XCircle className="h-4 w-4" /></button></>) }<button onClick={() => onDeleteLoan(loan._id)} className="text-red-600 hover:text-red-800 transition-colors p-1 hover:bg-red-50 rounded-full" title="Delete application"><Trash2 className="h-4 w-4" /></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {selectedLoan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full my-8 max-h-[90vh] overflow-hidden">
            <div className="p-4 md:p-6 border-b border-gray-200 flex justify-between items-center"><h3 className="text-lg font-semibold text-gray-800">Loan Application Details</h3><button onClick={() => setSelectedLoan(null)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button></div>
            <div className="p-4 md:p-6 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><h4 className="font-medium text-gray-800 mb-3 pb-2 border-b border-gray-100">Personal Information</h4><DetailItem label="Full Name" value={selectedLoan.fullName} /><DetailItem label="Phone Number" value={selectedLoan.phoneNumber} /><DetailItem label="Email" value={selectedLoan.email} /><DetailItem label="City" value={selectedLoan.city} /><DetailItem label="Pincode" value={selectedLoan.pincode} /></div>
                <div><h4 className="font-medium text-gray-800 mb-3 pb-2 border-b border-gray-100">Loan Information</h4><DetailItem label="Loan Type" value={selectedLoan.loanType} /><DetailItem label="Employment Type" value={selectedLoan.employmentType} /><DetailItem label="CIBIL Score" value={selectedLoan.cibilScore} /><DetailItem label="Monthly Income" value={selectedLoan.monthlyIncome} /><div><label className="block text-sm font-medium text-gray-700 mb-1">Status</label><StatusBadge status={selectedLoan.status} large /></div></div>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-100"><label className="block text-sm font-medium text-gray-700 mb-1">Application Date</label><p className="text-gray-900">{new Date(selectedLoan.createdAt).toLocaleString()}</p></div>
            </div>
            <div className="p-4 md:p-6 border-t border-gray-200 flex justify-between flex-col sm:flex-row gap-3">
              <div className="flex space-x-3">{selectedLoan.status === 'pending' && (<><button onClick={() => { onStatusUpdate(selectedLoan._id, 'approved'); setSelectedLoan(null); }} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors min-w-[100px]">Approve</button><button onClick={() => { onStatusUpdate(selectedLoan._id, 'rejected'); setSelectedLoan(null); }} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors min-w-[100px]">Reject</button></>) }</div>
              <button onClick={() => setSelectedLoan(null)} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors min-w-[100px]">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status, large = false }: { status: string; large?: boolean }) {
  const statusConfig: Record<string, { text: string; bg: string; textClass: string; dot: string }> = {
    approved: { text: 'Approved', bg: 'bg-green-100', textClass: 'text-green-800', dot: 'bg-green-500' },
    rejected: { text: 'Rejected', bg: 'bg-red-100', textClass: 'text-red-800', dot: 'bg-red-500' },
    pending: { text: 'Pending', bg: 'bg-yellow-100', textClass: 'text-yellow-800', dot: 'bg-yellow-500' }
  };
  const config = statusConfig[status] || statusConfig.pending;
  return (<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.textClass}`}><span className={`inline-block w-2 h-2 mr-1 rounded-full ${config.dot}`}></span>{large ? config.text.toUpperCase() : config.text}</span>);
}

// 🔥 FIXED: Blogs Manager Component - Image Upload Now Uses /api/banners Endpoint
function BlogsManager({
  blogs, selectedBlog, setSelectedBlog, onCreateBlog, onUpdateBlog, onDeleteBlog, loadingBlogs
}: {
  blogs: Blog[]; selectedBlog: Blog | null; setSelectedBlog: (blog: Blog | null) => void;
  onCreateBlog: (data: BlogFormData) => Promise<{ success: boolean; message?: string }>;
  onUpdateBlog: (id: string, data: Partial<BlogFormData>) => Promise<{ success: boolean; message?: string }>;
  onDeleteBlog: (id: string) => void; loadingBlogs: boolean;
}) {
  const [formData, setFormData] = useState<BlogFormData>({
    title: '', slug: '', excerpt: '', content: '', category: 'Personal', image: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  
  // 🔥 NEW: Image upload states
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');

  // 🔥 UPDATED: Categories array as per your request
  const categories = [
    'Personal',
    'Property Loans',
    'Business',
    'car-loan-bt',
    'car-loan-new',
    'used-car-loan',
    'car-loan-topup',
    'commercial-vehicle'
  ];

  useEffect(() => {
    if (selectedBlog) {
      setFormData({
        title: selectedBlog.title,
        slug: selectedBlog.slug,
        excerpt: selectedBlog.excerpt,
        content: selectedBlog.content,
        category: selectedBlog.category,
        image: selectedBlog.image
      });
      setImagePreview(selectedBlog.image);
      setIsEditing(true);
    } else {
      setFormData({ title: '', slug: '', excerpt: '', content: '', category: 'Personal', image: '' });
      setImagePreview('');
      setIsEditing(false);
    }
    setError('');
    setImageFile(null);
  }, [selectedBlog]);

  const handleGenerateSlug = () => {
    if (formData.title) {
      const slug = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  // 🔥 NEW: Handle image file selection and preview
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      alert('File size should be less than 5MB');
      return;
    }
    
    setImageFile(file);
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    
    // Clear the input value so same file can be selected again
    event.target.value = '';
  };

  // 🔥 FIXED: Upload image using EXISTING /api/banners endpoint (no backend changes needed!)
  const uploadImage = async (file: File): Promise<string> => {
    const uploadFormData = new FormData();
    uploadFormData.append('image', file);
    uploadFormData.append('page', 'blog'); // Use 'blog' as page identifier
    
    try {
      const response = await axios.post(`${SERVER_HOST}/api/banners`, uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // The banners endpoint returns the created banner object
      // Extract the image URL from the response
      const uploadedBanner = response.data;
      const imageUrl = uploadedBanner.image?.startsWith('http') 
        ? uploadedBanner.image 
        : `${SERVER_HOST}${uploadedBanner.image}`;
      
      return imageUrl;
    } catch (error) {
      console.error('Error uploading blog image:', error);
      throw new Error('Failed to upload image. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.slug || !formData.excerpt || !formData.content) {
      setError('Please fill all required fields');
      return;
    }
    setIsSubmitting(true);
    setError('');
    
    try {
      let finalImageUrl = formData.image;
      
      // 🔥 NEW: If new image file selected, upload it first using banners endpoint
      if (imageFile) {
        setIsUploadingImage(true);
        finalImageUrl = await uploadImage(imageFile);
        setIsUploadingImage(false);
      }
      
      const blogData: BlogFormData = {
        ...formData,
        image: finalImageUrl
      };
      
      if (isEditing && selectedBlog) {
        await onUpdateBlog(selectedBlog._id, blogData);
      } else {
        await onCreateBlog(blogData);
      }
      
      // Cleanup
      setFormData({ title: '', slug: '', excerpt: '', content: '', category: 'Personal', image: '' });
      setImageFile(null);
      setImagePreview('');
      setSelectedBlog(null);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to save blog');
      setIsUploadingImage(false);
    }
    setIsSubmitting(false);
  };

  const handleCancel = () => {
    setSelectedBlog(null);
    setFormData({ title: '', slug: '', excerpt: '', content: '', category: 'Personal', image: '' });
    setImageFile(null);
    setImagePreview('');
    setIsEditing(false);
    setError('');
  };

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Blog Management</h3>
        <p className="text-gray-600">Create, edit, and manage your blog posts</p>
      </div>

      {/* Blog Form */}
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6 border border-gray-100">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">{isEditing ? '✏️ Edit Blog' : '➕ Create New Blog'}</h4>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Enter blog title" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
              <div className="flex gap-2">
                <input type="text" value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} required className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="blog-title-slug" />
                <button type="button" onClick={handleGenerateSlug} className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm">Generate</button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            {/* 🔥 FIXED: Image Upload Section - Uses /api/banners endpoint */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Featured Image</label>
              <div className="flex items-center gap-3">
                <label className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  {isUploadingImage ? 'Uploading...' : 'Choose Image'}
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageSelect} 
                    disabled={isUploadingImage} 
                    className="hidden" 
                  />
                </label>
                {imagePreview && (
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-16 h-16 rounded object-cover border border-gray-200"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64x64?text=No+Image'; }}
                  />
                )}
              </div>
              {formData.image && !imageFile && (
                <p className="text-xs text-gray-500 mt-1 truncate max-w-xs">
                  Current: {formData.image}
                </p>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt *</label>
            <textarea value={formData.excerpt} onChange={(e) => setFormData({...formData, excerpt: e.target.value})} required rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Short description for blog listing..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
            <textarea value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} required rows={10} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono" placeholder="Write your blog content here (HTML supported)..." />
            <p className="text-xs text-gray-500 mt-1">💡 Tip: You can use HTML tags like &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;a&gt; for formatting</p>
          </div>
          {error && <div className="bg-red-50 text-red-800 p-3 rounded-lg text-sm border border-red-200">{error}</div>}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={isSubmitting || isUploadingImage} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2">
              {isSubmitting || isUploadingImage ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : <><Save className="h-4 w-4" /> {isEditing ? 'Update Blog' : 'Publish Blog'}</>}
            </button>
            {isEditing && <button type="button" onClick={handleCancel} className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">Cancel</button>}
          </div>
        </form>
      </div>

      {/* Blogs List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-4 md:p-6 border-b border-gray-200"><h4 className="text-lg font-semibold text-gray-800">All Blogs ({blogs.length})</h4></div>
        <div className="overflow-x-auto">
          {loadingBlogs ? (<div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>) : blogs.length === 0 ? (
            <div className="text-center py-12"><FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" /><p className="text-gray-500 text-lg">No blogs found</p><p className="text-gray-400 mt-2">Create your first blog to get started</p></div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50"><tr><th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blog</th><th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Category</th><th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Date</th><th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th></tr></thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {blogs.map((blog) => (
                  <tr key={blog._id} className="hover:bg-gray-50">
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {blog.image && <img src={blog.image} alt={blog.title} className="w-12 h-12 rounded object-cover" onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48x48?text=No+Image'; }} />}
                        <div>
                          <p className="font-medium text-gray-900">{blog.title}</p>
                          <p className="text-sm text-gray-500 truncate max-w-xs">{blog.excerpt}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap hidden md:table-cell"><span className="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-800">{blog.category}</span></td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">{new Date(blog.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <a href={`/blog/${blog.slug}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 transition-colors p-1 hover:bg-blue-50 rounded-full" title="View live"><Eye className="h-4 w-4" /></a>
                        <button onClick={() => setSelectedBlog(blog)} className="text-indigo-600 hover:text-indigo-800 transition-colors p-1 hover:bg-indigo-50 rounded-full" title="Edit"><Edit className="h-4 w-4" /></button>
                        <button onClick={() => onDeleteBlog(blog._id)} className="text-red-600 hover:text-red-800 transition-colors p-1 hover:bg-red-50 rounded-full" title="Delete"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}