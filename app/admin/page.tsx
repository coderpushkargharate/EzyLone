'use client';
import React, { useState, useEffect, useRef } from 'react';
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
  Loader2,
  Brain,
  MessageCircle,
  Target,
  Activity as ActivityIcon,
  BarChart3,
  Network,
  Zap,
  FolderOpen,
  ShieldCheck,
  CreditCard,
  Smartphone,
  BookOpen,
  Settings as SettingsIcon,
  ChevronDown
} from 'lucide-react';
import axios from 'axios';
import AdminLoginForm from '@/components/AdminLoginForm';
import EzyBrainManager from '@/components/admin/EzyBrainManager';
import WhatsAppBrainManager from '@/components/admin/WhatsAppBrainManager';
import LeadsManager from '@/components/admin/LeadsManager';
import ContentManager from '@/components/admin/ContentManager';
import ActivitiesManager from '@/components/admin/ActivitiesManager';
import AnalyticsManager from '@/components/admin/AnalyticsManager';
import TeamManager from '@/components/admin/TeamManager';
import AutomationsManager from '@/components/admin/AutomationsManager';
import EmployeesManager from '@/components/admin/EmployeesManager';
import AccountManager from '@/components/admin/AccountManager';

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
    // Auth is held in an httpOnly cookie (sent automatically on same-origin
    // requests). Verify it server-side; the response carries the user's current
    // role + permissions (fresh from the DB), which drives which tabs show.
    axios.get('/api/auth/verify')
      .then((res) => {
        const verified = res.data?.user;
        if (verified) {
          setUser(verified);
          localStorage.setItem('user', JSON.stringify(verified));
        }
        setCurrentPage('dashboard');
      })
      .catch(() => {
        localStorage.removeItem('user');
        setCurrentPage('login');
      });
  }, []);

  const handleLogin = async (credentials: LoginCredentials) => {
    try {
      const response = await axios.post<LoginResponse>('/api/auth/login', credentials);
      const { user } = response.data;

      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      setCurrentPage('dashboard');

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Invalid credentials'
      };
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch {
      // ignore — clear local state regardless
    }
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
    setCurrentPage('login');
  };

  if (currentPage === 'login') {
    return <AdminLoginForm onLogin={handleLogin} />;
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
  const [profileOpen, setProfileOpen] = useState(false);
  const [accountTab, setAccountTab] = useState('profile');
  const profileMenuRef = useRef<HTMLDivElement>(null);
  // Close the profile dropdown when clicking outside it.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);
  const [dashboardStats, setDashboardStats] = useState({
    totalContacts: 0,
    totalLoanApplications: 0,
    pendingApplications: 0,
    totalBanners: 0,
    totalBlogs: 0,
    totalLeads: 0,
    convertedLeads: 0
  });
  // Raw data kept for the analytics charts on the overview page.
  const [analyticsData, setAnalyticsData] = useState<{ loans: any[]; contacts: any[] }>({ loans: [], contacts: [] });
  const [banners, setBanners] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [selectedPage, setSelectedPage] = useState<string>('home');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedContact, setSelectedContact] = useState<any | null>(null);
  const [selectedLoan, setSelectedLoan] = useState<any | null>(null);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [selectedTestimonial, setSelectedTestimonial] = useState<any | null>(null);
  const [loading, setLoading] = useState({
    banners: false,
    contacts: false,
    loans: false,
    blogs: false,
    testimonials: false
  });

  // Menu items configuration. `group` sorts each tab under a labelled section
  // in the sidebar so the 15+ tabs read as an organised, advanced panel instead
  // of one long list. `hidden` items (Account) belong to no sidebar group.
  const menuItems = [
    { id: 'dashboard', name: 'Overview', icon: LayoutDashboard, component: DashboardOverview, group: 'Overview' },
    { id: 'leads', name: 'Lead Management', icon: Target, component: LeadsManager, group: 'Leads & CRM' },
    { id: 'contacts', name: 'Contacts', icon: MessageSquare, component: ContactsManager, group: 'Leads & CRM' },
    { id: 'loans', name: 'Loan Applications', icon: FileText, component: LoansManager, group: 'Leads & CRM' },
    { id: 'activities', name: 'Activities', icon: ActivityIcon, component: ActivitiesManager, group: 'Leads & CRM' },
    { id: 'team', name: 'Team', icon: Network, component: TeamManager, group: 'Leads & CRM' },
    { id: 'analytics', name: 'CRM Analytics', icon: BarChart3, component: AnalyticsManager, group: 'Leads & CRM' },
    { id: 'automations', name: 'Automations', icon: Zap, component: AutomationsManager, group: 'Growth & Automation' },
    { id: 'banners', name: 'Banners', icon: ImageIcon, component: BannersManager, group: 'Website Content' },
    { id: 'content', name: 'Content', icon: FolderOpen, component: ContentManager, group: 'Website Content' },
    { id: 'blogs', name: 'Blog Manager', icon: FileText, component: BlogsManager, group: 'Website Content' },
    { id: 'testimonials', name: 'Testimonials', icon: Users, component: TestimonialsManager, group: 'Website Content' },
    { id: 'ezyBrain', name: 'Ezy AI Brain', icon: Brain, component: EzyBrainManager, group: 'AI Assistants' },
    { id: 'whatsappBrain', name: 'WhatsApp AI Brain', icon: MessageCircle, component: WhatsAppBrainManager, group: 'AI Assistants' },
    { id: 'employees', name: 'Employees', icon: ShieldCheck, component: EmployeesManager, adminOnly: true, group: 'Administration' },
    // `hidden` = reachable from the top-bar profile menu, not shown in the sidebar.
    // Everyone (admins + employees) can view/edit their own account.
    { id: 'account', name: 'Account', icon: UserIcon, component: AccountManager, hidden: true }
  ];

  // Order the section labels appear in the sidebar.
  const GROUP_ORDER = ['Overview', 'Leads & CRM', 'Growth & Automation', 'Website Content', 'AI Assistants', 'Administration'];

  // Role-based visibility: admins (anything not explicitly 'employee') see every
  // tab; employees only see the tabs listed in their `permissions`. The
  // "Employees" tab is admin-only; "Account" is hidden from the sidebar.
  const isAdminUser = (user as any)?.role !== 'employee';
  const permissions: string[] = (user as any)?.permissions || [];
  const mayAccess = (item: any) => {
    if (item.adminOnly) return isAdminUser;
    if (item.hidden) return true;
    if (isAdminUser) return true;
    return permissions.includes(item.id);
  };
  // Sidebar shows non-hidden allowed tabs; `reachableItems` also includes the
  // hidden Account page so it can render when opened from the profile menu.
  const visibleMenuItems = menuItems.filter((item) => !(item as any).hidden && mayAccess(item));
  const reachableItems = menuItems.filter(mayAccess);

  // If the current tab isn't one the user may reach, snap to their first sidebar tab.
  useEffect(() => {
    if (!user) return;
    if (visibleMenuItems.length && !reachableItems.some((i) => i.id === currentPage)) {
      setCurrentPage(visibleMenuItems[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, currentPage]);

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
    else if (currentPage === 'testimonials' && testimonials.length === 0) fetchTestimonials();
  }, [currentPage]);

  const fetchDashboardStats = async () => {
    try {
      const [contactsRes, loansRes, bannersRes, blogsRes, analyticsRes] = await Promise.all([
        axios.get(`/api/contacts`),
        axios.get(`/api/loans`),
        axios.get(`/api/banners`),
        axios.get(`/api/blogs`),
        // CRM lead totals (shared leads collection). Wrapped so a failure here
        // never blanks out the rest of the dashboard.
        axios.get(`/api/analytics`).catch(() => ({ data: { stats: {} } }))
      ]);

      const crmStats = analyticsRes.data?.stats || {};
      setDashboardStats({
        totalContacts: contactsRes.data.length,
        totalLoanApplications: loansRes.data.length,
        pendingApplications: loansRes.data.filter((loan: any) => loan.status === 'pending').length,
        totalBanners: bannersRes.data.length,
        totalBlogs: blogsRes.data.length,
        totalLeads: crmStats.totalLeads || 0,
        convertedLeads: crmStats.convertedLeads || 0
      });
      setAnalyticsData({ loans: loansRes.data, contacts: contactsRes.data });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const fetchBanners = async () => {
    setLoading(prev => ({ ...prev, banners: true }));
    try {
      // Bust the browser HTTP cache (the public GET sets max-age=300) so the
      // admin always sees the live list — otherwise a just-deleted banner can
      // reappear from cache and trigger repeated 404 deletes.
      const response = await axios.get(`/api/banners?_t=${Date.now()}`, {
        headers: { 'Cache-Control': 'no-cache' },
      });
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
      const response = await axios.get(`/api/contacts`);
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
      const response = await axios.get(`/api/loans`);
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
      const response = await axios.get(`/api/blogs`);
      setBlogs(response.data);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      alert('Failed to load blogs. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, blogs: false }));
    }
  };

  // Testimonials
  const fetchTestimonials = async () => {
    setLoading(prev => ({ ...prev, testimonials: true }));
    try {
      // Bust the browser HTTP cache (the public GET sets max-age=300) so the
      // admin always sees the live list — otherwise a just-deleted testimonial
      // can reappear from cache and trigger a 404 delete.
      const response = await axios.get(`/api/testimonials?_t=${Date.now()}`, {
        headers: { 'Cache-Control': 'no-cache' },
      });
      setTestimonials(response.data);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      alert('Failed to load testimonials. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, testimonials: false }));
    }
  };

  const handleCreateTestimonial = async (formData: FormData) => {
    try {
      await axios.post(`/api/testimonials`, formData);
      fetchTestimonials();
      return { success: true };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Failed to create testimonial' };
    }
  };

  const handleUpdateTestimonial = async (id: string, formData: FormData) => {
    try {
      await axios.put(`/api/testimonials/${id}`, formData);
      fetchTestimonials();
      return { success: true };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Failed to update testimonial' };
    }
  };

  const handleDeleteTestimonial = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) return;

    // Optimistically drop it so it disappears immediately and can't be
    // clicked/deleted twice while the request is in flight.
    setTestimonials(prev => prev.filter((t: any) => t._id !== id));

    try {
      await axios.delete(`/api/testimonials/${id}`);
      fetchTestimonials();
    } catch (error: any) {
      // 404 = already deleted (e.g. a double-click); the row is already gone,
      // so just reconcile with a fresh fetch — no error popup.
      if (error?.response?.status === 404) {
        fetchTestimonials();
        return;
      }
      console.error('Error deleting testimonial:', error);
      alert('Failed to delete testimonial. Please try again.');
      fetchTestimonials();
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
      await axios.post(`/api/banners`, formData, {
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

    // Optimistically drop it from the list so it disappears immediately and
    // can't be clicked again while the request is in flight.
    setBanners(prev => prev.filter((b: any) => b._id !== bannerId));

    try {
      await axios.delete(`/api/banners/${bannerId}`);
      fetchBanners();
    } catch (error: any) {
      // 404 = already gone (stale list / double-click); the server has cleared
      // its cache, so a fresh fetch reconciles the list. No error to the user.
      if (error?.response?.status === 404) {
        fetchBanners();
        return;
      }
      console.error('Error deleting banner:', error);
      alert('Failed to delete banner. Please try again.');
      fetchBanners();
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) return;
    
    try {
      await axios.delete(`/api/contacts/${contactId}`);
      fetchContacts();
      alert('Contact deleted successfully!');
    } catch (error) {
      console.error('Error deleting contact:', error);
      alert('Failed to delete contact. Please try again.');
    }
  };

  const handleStatusUpdate = async (loanId: string, status: string) => {
    try {
      await axios.put(`/api/loans/${loanId}/status`, { status });
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
      await axios.delete(`/api/loans/${loanId}`);
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
      await axios.post(`/api/blogs`, blogData);
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
      await axios.put(`/api/blogs/${blogId}`, blogData);
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
      await axios.delete(`/api/blogs/${blogId}`);
      fetchBlogs();
      alert('Blog deleted successfully!');
    } catch (error) {
      console.error('Error deleting blog:', error);
      alert('Failed to delete blog. Please try again.');
    }
  };

  // Get current component to display — restricted to tabs the user may reach
  // (includes the hidden Account page), so an employee can never render a
  // component they lack access to.
  const activeItem = reachableItems.find(item => item.id === currentPage) || visibleMenuItems[0];
  const CurrentComponent = activeItem?.component;

  // Profile dropdown display values (mirrors the EzyLoanCrm nav profile menu).
  const displayName = (user as any)?.name || user?.username || 'Admin';
  const company = (user as any)?.company || 'ezyloan.co.in';
  const initials = String(displayName).split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  const openAccount = (t: string) => {
    setAccountTab(t);
    setCurrentPage('account');
    setProfileOpen(false);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50" id="admin-app">
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* Sidebar — flex column so the nav scrolls between a fixed logo header
          and a fixed user/logout footer (12+ tabs would otherwise overflow). */}
      <div
        className={`fixed top-0 left-0 z-50 h-screen w-64 bg-white shadow-xl flex flex-col transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      >
        {/* Logo header (fixed) */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/ezy-logo.webp" alt="EzyLoan" className="h-9 w-auto" />
            <span className="text-[11px] font-bold text-gray-400 tracking-widest uppercase">Admin</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Scrollable nav — tabs organised under labelled section headers. */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {GROUP_ORDER.map((group) => {
            const groupItems = visibleMenuItems.filter((item) => (item as any).group === group);
            if (groupItems.length === 0) return null;
            return (
              <div key={group} className="mb-4">
                <p className="px-4 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">{group}</p>
                <div className="space-y-1">
                  {groupItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setCurrentPage(item.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`flex items-center w-full px-4 py-2.5 text-sm font-medium rounded-lg transition-colors
                        ${currentPage === item.id ? "bg-blue-600 text-white shadow-sm" : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"}`}
                      >
                        <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
                        <span className="truncate">{item.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* User + logout (fixed) */}
        <div className="p-4 border-t border-gray-200 flex-shrink-0">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{(user as any)?.name || user?.username || 'Admin'}</p>
              <p className="text-xs text-gray-500">{isAdminUser ? 'Administrator' : 'Employee'}</p>
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
        <div className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden text-gray-500 hover:text-gray-700 flex-shrink-0">
              <Menu className="h-6 w-6" />
            </button>
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 truncate">
              {activeItem?.name || 'Dashboard'}
            </h2>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/ezy-logo.webp" alt="EzyLoan" className="h-8 w-auto lg:hidden" />

            {/* Profile dropdown — same items as the EzyLoanCrm nav menu */}
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setProfileOpen((o) => !o)}
                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-gray-100 transition"
                aria-label="Account menu"
              >
                <span className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 ring-2 ring-white shadow flex items-center justify-center text-white text-xs font-bold">
                  {initials}
                </span>
                <span className="hidden sm:block text-sm font-semibold text-gray-700 max-w-[140px] truncate">{displayName}</span>
                <ChevronDown size={15} className="text-gray-400 hidden sm:block" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                  <div className="flex flex-col items-center px-4 py-3 border-b border-gray-100">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-sm font-bold mb-2">
                      {initials}
                    </div>
                    <p className="text-sm font-semibold text-gray-900 capitalize">{displayName}</p>
                    <p className="text-xs text-gray-500 truncate max-w-full">{company}</p>
                    <span className="mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 capitalize">
                      {isAdminUser ? 'Administrator' : 'Employee'}
                    </span>
                  </div>
                  <div className="py-1">
                    <button onClick={() => openAccount('profile')} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition">
                      <UserIcon size={15} className="text-gray-400" /> Profile
                    </button>
                    <button onClick={() => openAccount('notifications')} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition">
                      <SettingsIcon size={15} className="text-gray-400" /> Settings
                    </button>
                    <button onClick={() => openAccount('subscription')} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition">
                      <CreditCard size={15} className="text-gray-400" /> Subscription
                    </button>
                    <button onClick={() => openAccount('profile')} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition">
                      <Smartphone size={15} className="text-gray-400" /> Mobile App
                    </button>
                    <a href="/faq" target="_blank" rel="noopener noreferrer" onClick={() => setProfileOpen(false)} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition">
                      <BookOpen size={15} className="text-gray-400" /> User Guide
                    </a>
                    <a href="https://wa.me/916372977626" target="_blank" rel="noopener noreferrer" onClick={() => setProfileOpen(false)} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition">
                      <MessageCircle size={15} className="text-gray-400" /> Live Chat Support
                    </a>
                  </div>
                  <div className="border-t border-gray-100 pt-1">
                    <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition font-medium">
                      <LogOut size={15} /> Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6">
          {!CurrentComponent ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-16 text-center">
              <ShieldCheck size={36} className="text-blue-400 mx-auto mb-3" />
              <p className="text-base font-semibold text-gray-700">No sections assigned yet</p>
              <p className="text-sm text-gray-500 mt-1">Your admin hasn&apos;t given you access to any tabs. Please contact them.</p>
            </div>
          ) : (
          <CurrentComponent
            // Account props
            accountInitialTab={accountTab}
            // Dashboard props
            stats={dashboardStats}
            analytics={analyticsData}
            setCurrentPage={setCurrentPage}
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
            // Testimonials props
            testimonials={testimonials}
            selectedTestimonial={selectedTestimonial}
            setSelectedTestimonial={setSelectedTestimonial}
            onCreateTestimonial={handleCreateTestimonial}
            onUpdateTestimonial={handleUpdateTestimonial}
            onDeleteTestimonial={handleDeleteTestimonial}
            loadingTestimonials={loading.testimonials}
          />
          )}
        </div>
      </div>
    </div>
  );
}

// Lightweight dependency-free horizontal bar chart.
function MiniBarChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  if (data.length === 0) return <p className="text-sm text-gray-400">No data yet</p>;
  return (
    <div className="space-y-3">
      {data.map((d) => (
        <div key={d.label}>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-700">{d.label}</span>
            <span className="font-semibold text-gray-900">{d.value}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5">
            <div className={`${d.color} h-2.5 rounded-full transition-all`} style={{ width: `${(d.value / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// Dashboard Overview Component
function DashboardOverview({ stats, analytics, setCurrentPage }: { stats: any; analytics?: { loans: any[]; contacts: any[] }; setCurrentPage?: (page: string) => void }) {
  const loans = analytics?.loans || [];
  const contacts = analytics?.contacts || [];

  // Loan applications by status
  const statusData = [
    { label: 'Approved', value: loans.filter((l) => l.status === 'approved').length, color: 'bg-green-500' },
    { label: 'Pending', value: loans.filter((l) => l.status === 'pending').length, color: 'bg-yellow-500' },
    { label: 'Rejected', value: loans.filter((l) => l.status === 'rejected').length, color: 'bg-red-500' },
  ];

  // Loan applications by type (top entries)
  const typeCounts: Record<string, number> = {};
  loans.forEach((l) => { const k = l.loanType || 'Other'; typeCounts[k] = (typeCounts[k] || 0) + 1; });
  const typeData = Object.entries(typeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([label, value]) => ({ label, value, color: 'bg-blue-500' }));

  // Leads (contacts + loans) per month — last 6 months
  const now = new Date();
  const months: { key: string; label: string }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleString('en-US', { month: 'short' }) });
  }
  const monthIndex = (dateStr: string) => { const d = new Date(dateStr); return `${d.getFullYear()}-${d.getMonth()}`; };
  const monthlyData = months.map((m) => ({
    label: m.label,
    value:
      loans.filter((l) => l.createdAt && monthIndex(l.createdAt) === m.key).length +
      contacts.filter((c) => c.createdAt && monthIndex(c.createdAt) === m.key).length,
    color: 'bg-indigo-500',
  }));

  // Approval rate (of decided applications)
  const decided = statusData[0].value + statusData[2].value;
  const approvalRate = decided > 0 ? Math.round((statusData[0].value / decided) * 100) : 0;

  const statCards = [
    { title: 'Total Leads (CRM)', value: stats.totalLeads, color: 'bg-blue-600', icon: <Target className="h-8 w-8" /> },
    { title: 'Converted Leads', value: stats.convertedLeads, color: 'bg-emerald-500', icon: <CheckCircle className="h-8 w-8" /> },
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

      {/* Analytics charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Applications by Status</h4>
          <MiniBarChart data={statusData} />
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-600">Approval rate</span>
            <span className="text-lg font-bold text-green-600">{approvalRate}%</span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Applications by Loan Type</h4>
          <MiniBarChart data={typeData} />
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Leads — Last 6 Months</h4>
          <MiniBarChart data={monthlyData} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h4>
          <div className="space-y-3">
            <button onClick={() => setCurrentPage?.('leads')} className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors w-full text-left">
              <Target className="h-5 w-5 text-blue-600 mr-3" />
              <span className="font-medium text-blue-600">Manage Leads</span>
            </button>
            <button onClick={() => setCurrentPage?.('contacts')} className="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors w-full text-left">
              <MessageSquare className="h-5 w-5 text-green-600 mr-3" />
              <span className="font-medium text-green-600">View Contacts</span>
            </button>
            <button onClick={() => setCurrentPage?.('loans')} className="flex items-center p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors w-full text-left">
              <FileText className="h-5 w-5 text-purple-600 mr-3" />
              <span className="font-medium text-purple-600">Review Loan Applications</span>
            </button>
            <button onClick={() => setCurrentPage?.('banners')} className="flex items-center p-3 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors w-full text-left">
              <ImageIcon className="h-5 w-5 text-indigo-600 mr-3" />
              <span className="font-medium text-indigo-600">Manage Banners</span>
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
    { value: 'property-loan', label: 'Property Loan' }, { value: 'commercial-vehicle-loan', label: 'Commercial Vehicle Loan' },
    { value: 'bank-partners', label: 'Trusted Banking & NBFC Partners (logos)' },
    { value: 'loan-options', label: 'Instant Loan Options (card images)' }
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
                    <img src={banner.image} alt="Banner" className="w-full h-full object-cover" onError={(e) => { const target = e.target as HTMLImageElement; target.onerror = null; target.src = 'https://via.placeholder.com/400x200?text=Image+Not+Found'; }} />
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
// Reusable search + filter + date-range bar for the list managers.
function ListFilters({
  search, setSearch, fromDate, setFromDate, toDate, setToDate,
  types, typeFilter, setTypeFilter, statuses, statusFilter, setStatusFilter, onClear,
}: {
  search: string; setSearch: (v: string) => void;
  fromDate: string; setFromDate: (v: string) => void;
  toDate: string; setToDate: (v: string) => void;
  types?: string[]; typeFilter?: string; setTypeFilter?: (v: string) => void;
  statuses?: string[]; statusFilter?: string; setStatusFilter?: (v: string) => void;
  onClear: () => void;
}) {
  const cls = 'px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm';
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4 border border-gray-100 flex flex-wrap gap-3 items-end">
      <div className="flex-1 min-w-[200px]">
        <label className="block text-xs font-medium text-gray-600 mb-1">Search</label>
        <input className={`${cls} w-full`} placeholder="Name, phone, email, city..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      {statuses && setStatusFilter && (
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
          <select className={cls} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All</option>
            {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      )}
      {types && setTypeFilter && (
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Loan Type</label>
          <select className={cls} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="all">All</option>
            {types.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      )}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">From</label>
        <input type="date" className={cls} value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">To</label>
        <input type="date" className={cls} value={toDate} onChange={(e) => setToDate(e.target.value)} />
      </div>
      <button onClick={onClear} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm">Clear</button>
    </div>
  );
}

// Shared date-range predicate (inclusive of the whole "to" day).
function inDateRange(createdAt: string | undefined, fromDate: string, toDate: string): boolean {
  if (!fromDate && !toDate) return true;
  if (!createdAt) return false;
  const d = new Date(createdAt);
  if (fromDate && d < new Date(fromDate)) return false;
  if (toDate && d > new Date(toDate + 'T23:59:59')) return false;
  return true;
}

function ContactsManager({ contacts, selectedContact, setSelectedContact, onDeleteContact, loadingContacts }: {
  contacts: any[]; selectedContact: any | null; setSelectedContact: (contact: any | null) => void;
  onDeleteContact: (contactId: string) => void; loadingContacts: boolean;
}) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const loanTypes = Array.from(new Set(contacts.map((c) => c.loanType).filter(Boolean))) as string[];
  const filtered = contacts.filter((c) => {
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || [c.fullName, c.email, c.phoneNumber, c.loanType, c.city].some((v) => String(v || '').toLowerCase().includes(q));
    const matchesType = typeFilter === 'all' || c.loanType === typeFilter;
    return matchesSearch && matchesType && inDateRange(c.createdAt, fromDate, toDate);
  });

  return (
    <div>
      <div className="mb-6"><h3 className="text-2xl font-bold text-gray-800 mb-2">Contact Messages</h3><p className="text-gray-600">Manage customer inquiries and contact messages</p></div>
      <ListFilters
        search={search} setSearch={setSearch}
        fromDate={fromDate} setFromDate={setFromDate} toDate={toDate} setToDate={setToDate}
        types={loanTypes} typeFilter={typeFilter} setTypeFilter={setTypeFilter}
        onClear={() => { setSearch(''); setTypeFilter('all'); setFromDate(''); setToDate(''); }}
      />
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-4 md:p-6 border-b border-gray-200"><h4 className="text-lg font-semibold text-gray-800">Showing {filtered.length} of {contacts.length}</h4></div>
        <div className="overflow-x-auto">
          {loadingContacts ? (
            <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12"><MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" /><p className="text-gray-500 text-lg">No contact messages found</p></div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50"><tr><th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Info</th><th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Loan Details</th><th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Date</th><th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th></tr></thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.map((contact) => (
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
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const loanTypes = Array.from(new Set(loans.map((l) => l.loanType).filter(Boolean))) as string[];
  const filtered = loans.filter((l) => {
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || [l.fullName, l.phoneNumber, l.email, l.city, l.pincode, l.loanType].some((v) => String(v || '').toLowerCase().includes(q));
    const matchesType = typeFilter === 'all' || l.loanType === typeFilter;
    const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus && inDateRange(l.createdAt, fromDate, toDate);
  });

  return (
    <div>
      <div className="mb-6"><h3 className="text-2xl font-bold text-gray-800 mb-2">Loan Applications</h3><p className="text-gray-600">Manage and review loan applications</p></div>
      <ListFilters
        search={search} setSearch={setSearch}
        fromDate={fromDate} setFromDate={setFromDate} toDate={toDate} setToDate={setToDate}
        types={loanTypes} typeFilter={typeFilter} setTypeFilter={setTypeFilter}
        statuses={['pending', 'approved', 'rejected']} statusFilter={statusFilter} setStatusFilter={setStatusFilter}
        onClear={() => { setSearch(''); setTypeFilter('all'); setStatusFilter('all'); setFromDate(''); setToDate(''); }}
      />
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-4 md:p-6 border-b border-gray-200"><h4 className="text-lg font-semibold text-gray-800">Showing {filtered.length} of {loans.length}</h4></div>
        <div className="overflow-x-auto">
          {loadingLoans ? (<div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>) : filtered.length === 0 ? (
            <div className="text-center py-12"><FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" /><p className="text-gray-500 text-lg">No loan applications found</p></div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50"><tr><th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th><th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Loan Details</th><th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th><th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Date</th><th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th></tr></thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.map((loan) => (
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
      const response = await axios.post(`/api/banners`, uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // The banners endpoint returns the created banner object
      // Extract the image URL from the response
      const uploadedBanner = response.data;
      return uploadedBanner.image;
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

// Testimonials Manager Component
function TestimonialsManager({
  testimonials, selectedTestimonial, setSelectedTestimonial, onCreateTestimonial, onUpdateTestimonial, onDeleteTestimonial, loadingTestimonials
}: {
  testimonials: any[]; selectedTestimonial: any | null; setSelectedTestimonial: (t: any | null) => void;
  onCreateTestimonial: (data: FormData) => Promise<{ success: boolean; message?: string }>;
  onUpdateTestimonial: (id: string, data: FormData) => Promise<{ success: boolean; message?: string }>;
  onDeleteTestimonial: (id: string) => void; loadingTestimonials: boolean;
}) {
  const [form, setForm] = useState({ name: '', location: '', quote: '', rating: 5 });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (selectedTestimonial) {
      setForm({
        name: selectedTestimonial.name || '',
        location: selectedTestimonial.location || '',
        quote: selectedTestimonial.quote || '',
        rating: selectedTestimonial.rating || 5,
      });
      setPreview(selectedTestimonial.avatar || '');
      setIsEditing(true);
    } else {
      setForm({ name: '', location: '', quote: '', rating: 5 });
      setPreview('');
      setIsEditing(false);
    }
    setAvatarFile(null);
    setError('');
  }, [selectedTestimonial]);

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Please select an image'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('Image should be less than 5MB'); return; }
    setAvatarFile(file);
    setPreview(URL.createObjectURL(file));
    e.target.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.quote.trim()) { setError('Name and quote are required'); return; }
    setIsSubmitting(true);
    setError('');

    const fd = new FormData();
    fd.append('name', form.name);
    fd.append('location', form.location);
    fd.append('quote', form.quote);
    fd.append('rating', String(form.rating));
    if (avatarFile) fd.append('avatarFile', avatarFile);

    const res = isEditing && selectedTestimonial
      ? await onUpdateTestimonial(selectedTestimonial._id, fd)
      : await onCreateTestimonial(fd);

    if (res.success) {
      setSelectedTestimonial(null);
      setForm({ name: '', location: '', quote: '', rating: 5 });
      setAvatarFile(null);
      setPreview('');
      setIsEditing(false);
    } else {
      setError(res.message || 'Failed to save testimonial');
    }
    setIsSubmitting(false);
  };

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Testimonials</h3>
        <p className="text-gray-600">Customer reviews shown on the website hero section</p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6 border border-gray-100">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">{isEditing ? '✏️ Edit Testimonial' : '➕ Add Testimonial'}</h4>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Customer name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="City" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Review / Quote *</label>
            <textarea value={form.quote} onChange={(e) => setForm({ ...form, quote: e.target.value })} required rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="What the customer said..." />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
              <select value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>{'★'.repeat(r)} ({r})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
              <div className="flex items-center gap-3">
                <label className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" /> Choose Photo
                  <input type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
                </label>
                {preview && <img src={preview} alt="Preview" className="w-12 h-12 rounded-full object-cover border border-gray-200" />}
              </div>
            </div>
          </div>
          {error && <div className="bg-red-50 text-red-800 p-3 rounded-lg text-sm border border-red-200">{error}</div>}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2">
              {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : <><Save className="h-4 w-4" /> {isEditing ? 'Update' : 'Add'} Testimonial</>}
            </button>
            {isEditing && <button type="button" onClick={() => setSelectedTestimonial(null)} className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">Cancel</button>}
          </div>
        </form>
      </div>

      {/* List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-4 md:p-6 border-b border-gray-200"><h4 className="text-lg font-semibold text-gray-800">All Testimonials ({testimonials.length})</h4></div>
        <div className="p-4 md:p-6">
          {loadingTestimonials ? (
            <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>
          ) : testimonials.length === 0 ? (
            <div className="text-center py-12"><Users className="h-16 w-16 text-gray-300 mx-auto mb-4" /><p className="text-gray-500 text-lg">No testimonials yet</p><p className="text-gray-400 mt-2">Add your first one above</p></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {testimonials.map((t) => (
                <div key={t._id} className="border border-gray-200 rounded-lg p-4 flex gap-3">
                  {t.avatar
                    ? <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    : <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold flex-shrink-0">{t.name?.[0]?.toUpperCase() || '?'}</div>}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900 truncate">{t.name}</p>
                      <div className="flex space-x-1 flex-shrink-0">
                        <button onClick={() => setSelectedTestimonial(t)} className="text-indigo-600 hover:text-indigo-800 p-1 hover:bg-indigo-50 rounded-full" title="Edit"><Edit className="h-4 w-4" /></button>
                        <button onClick={() => onDeleteTestimonial(t._id)} className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded-full" title="Delete"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                    <p className="text-xs text-yellow-500">{'★'.repeat(t.rating || 5)}<span className="text-gray-400">{t.location ? ` · ${t.location}` : ''}</span></p>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{t.quote}</p>
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