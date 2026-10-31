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
  X,
  Lock,
  User as UserIcon,
  Plus,
  Edit,
  Save,
  Loader2,
  Brain,
  MessageCircle,
  MessageSquareText,
  Target,
  Activity as ActivityIcon,
  BarChart3,
  Network,
  Zap,
  FolderOpen,
  ShieldCheck,
  ShieldAlert,
  CreditCard,
  Smartphone,
  BookOpen,
  Settings as SettingsIcon,
  ChevronDown,
  MoreVertical,
  Home,
  Send,
  Archive,
  AlertTriangle,
  Clock,
  Megaphone,
  LineChart,
  Search,
  Calendar,
  ExternalLink,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Menu,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import './admin.css';
import { PageHead } from '@/components/admin/PageHead';
import SeoTrafficPanel from '@/components/admin/SeoTrafficPanel';
import { runSeoChecklist, sanitizeSlug, type SeoCheckResult } from '@/lib/blog';
import axios from 'axios';
import AdminLoginForm from '@/components/AdminLoginForm';
import EzyBrainManager from '@/components/admin/EzyBrainManager';
import ChatAnalytics from '@/components/admin/ChatAnalytics';
import SiteHealth from '@/components/admin/SiteHealth';
import WhatsAppBrainManager from '@/components/admin/WhatsAppBrainManager';
import WhatsAppChatsManager from '@/components/admin/WhatsAppChatsManager';
import LeadsManager from '@/components/admin/LeadsManager';
import ContentManager from '@/components/admin/ContentManager';
import ActivitiesManager from '@/components/admin/ActivitiesManager';
import AnalyticsManager from '@/components/admin/AnalyticsManager';
import TeamManager from '@/components/admin/TeamManager';
import AutomationsManager from '@/components/admin/AutomationsManager';
import dynamic from 'next/dynamic';
// Loaded on demand: the Marketing tab is large and most sessions never open it.
const MarketingManager = dynamic(() => import('@/components/admin/MarketingManager'), { ssr: false });
const AuditLogManager = dynamic(() => import('@/components/admin/AuditLogManager'), { ssr: false });
const MarketingSnapshot = dynamic(() => import('@/components/admin/MarketingSnapshot'), { ssr: false });
import EmployeesManager from '@/components/admin/EmployeesManager';
import BlockedIpsManager from '@/components/admin/BlockedIpsManager';
import AccountManager from '@/components/admin/AccountManager';
import { useWhatsAppUnread, requestNotifyPermission } from '@/components/admin/useWhatsAppUnread';
import { usePushSubscribe } from '@/components/admin/usePushSubscribe';

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

type BlogStatus = 'draft' | 'pending' | 'published' | 'rejected' | 'archived';

interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  image: string;
  status?: BlogStatus;
  rejectionReason?: string;
  featuredImageAlt?: string;
  author?: string;
  authorBio?: string;
  tags?: string[];
  seoTitle?: string;
  seoDescription?: string;
  focusKeyword?: string;
  secondaryKeywords?: string[];
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  publishedAt?: string;
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
  featuredImageAlt: string;
  author: string;
  authorBio: string;
  tags: string;
  seoTitle: string;
  seoDescription: string;
  focusKeyword: string;
  secondaryKeywords: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
}

// Main Admin Application
export default function AdminApp() {
  const [currentPage, setCurrentPage] = useState<string>('login');
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  // "Access" / app mode: when the admin taps "Open as app" on the WhatsApp Chats
  // tab we remember it in localStorage and show ONLY the chat, full-screen, like
  // a standalone WhatsApp app. Stays that way (across app opens) until logout or
  // "Exit". Kept in sync via the 'wa-focus-change' window event.
  const [waFocus, setWaFocus] = useState(false);
  const router = useRouter();
  // Admins may use every tab; employees only the tabs in their `permissions`.
  // Background pollers below must respect this, otherwise every poll is a 403.
  const canUseTab = (...tabs: string[]) =>
    !!user && (user.role !== 'employee' || tabs.some((t) => (user.permissions || []).includes(t)));
  const loggedIn = currentPage !== 'login';
  const canSeeWhatsApp = loggedIn && canUseTab('whatsappChats');
  // New-WhatsApp-message counter (drives the red badge on the app symbol / tab
  // and the installed app-icon badge). Enabled once we're past the login screen.
  const { count: waUnread, markSeen: markWaSeen } = useWhatsAppUnread(canSeeWhatsApp);
  // Register this device for Web Push once logged in, so alerts arrive even when
  // the app is fully closed. Ask for notification permission first (needed for
  // both the push subscription and the open-app browser notification).
  usePushSubscribe(loggedIn && canUseTab('whatsappChats', 'leads', 'dashboard'));
  useEffect(() => {
    if (currentPage !== 'login') requestNotifyPermission();
  }, [currentPage]);

  useEffect(() => {
    const read = () => setWaFocus(typeof window !== 'undefined' && localStorage.getItem('wa_focus') === '1');
    read();
    window.addEventListener('wa-focus-change', read);
    return () => window.removeEventListener('wa-focus-change', read);
  }, []);

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
    localStorage.removeItem('wa_focus'); // leaving = drop app mode too
    setWaFocus(false);
    setUser(null);
    setToken(null);
    setCurrentPage('login');
  };

  const exitAccess = () => {
    localStorage.removeItem('wa_focus');
    setWaFocus(false);
  };

  if (currentPage === 'login') {
    return <AdminLoginForm onLogin={handleLogin} />;
  }

  // Standalone WhatsApp-chat app mode (only after we've confirmed a session).
  if (waFocus && canSeeWhatsApp) {
    return (
      <WhatsAppFocusApp
        user={user}
        onLogout={handleLogout}
        onExit={exitAccess}
        unread={waUnread}
        onSeen={markWaSeen}
      />
    );
  }

  return (
    <AdminDashboard
      user={user}
      onLogout={handleLogout}
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      waUnread={waUnread}
      markWaSeen={markWaSeen}
    />
  );
}

// Full-screen, WhatsApp-only shell. Shows just the chats (no sidebar, no other
// admin data) with a top bar whose 3-dot menu holds Logout + Exit. Because the
// login cookie lasts 30 days and the mode is remembered in localStorage, opening
// the installed app drops the user straight back here until they log out.
function WhatsAppFocusApp({
  user,
  onLogout,
  onExit,
  unread = 0,
  onSeen,
}: {
  user: User | null;
  onLogout: () => void;
  onExit: () => void;
  unread?: number;
  onSeen?: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);
  // Opening the app = the admin is here to read chats, so ask for notification
  // permission once (enables background alerts for the next new message).
  useEffect(() => { requestNotifyPermission(); }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-100">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* App symbol with a red "new messages" badge on its top-left. Tap it
              to mark everything as seen (clears the badge). */}
          <button
            onClick={() => onSeen?.()}
            className="relative w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0"
            title={unread > 0 ? `${unread} new message${unread === 1 ? '' : 's'} — tap to clear` : 'WhatsApp chats'}
          >
            <MessageSquareText className="w-5 h-5" />
            {unread > 0 && (
              <span className="absolute -top-1 -left-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-green-600">
                {unread > 99 ? '99+' : unread}
              </span>
            )}
          </button>
          <div className="min-w-0">
            <div className="font-semibold text-sm truncate">EzyLoan WhatsApp</div>
            <div className="text-[11px] text-white/80 truncate">{user?.name || user?.username || 'Signed in'}</div>
          </div>
        </div>
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="p-2 rounded-full hover:bg-white/15 transition"
            aria-label="Menu"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-1 w-48 bg-white text-gray-700 rounded-xl shadow-lg border border-gray-100 overflow-hidden z-10">
              {/* Full page load on purpose: leaves the admin PWA shell for the public site. */}
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a
                href="/"
                onClick={() => setMenuOpen(false)}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 text-left"
              >
                <Home className="w-4 h-4 text-gray-500" /> Home page
              </a>
              <button
                onClick={() => { setMenuOpen(false); onExit(); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 text-left border-t border-gray-100"
              >
                <LayoutDashboard className="w-4 h-4 text-gray-500" /> Full admin panel
              </button>
              <button
                onClick={() => { setMenuOpen(false); onLogout(); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-red-50 text-red-600 text-left border-t border-gray-100"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Chat body — fills the remaining height; the chat list/transcript scroll
          internally so it feels like a real full-screen app (no double scroll). */}
      <div className="flex-1 min-h-0 overflow-hidden p-2 sm:p-4">
        <WhatsAppChatsManager embedded />
      </div>
    </div>
  );
}

// Main Dashboard Component
function AdminDashboard({
  user,
  onLogout,
  currentPage,
  setCurrentPage,
  waUnread = 0,
  markWaSeen,
}: {
  user: User | null;
  onLogout: () => void;
  currentPage: string;
  setCurrentPage: (page: string) => void;
  waUnread?: number;
  markWaSeen?: () => void;
}) {
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

  // Header search + grouped nav dropdown (same behaviour as the Mappingg admin).
  const [q, setQ] = useState('');
  const [searchFocus, setSearchFocus] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  // Vertical sidebar. Desktop: can collapse to icons only (remembered per
  // browser). Tablet/phone: slides in as a drawer from the menu button.
  const [sideOpen, setSideOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    try { setCollapsed(localStorage.getItem('adm2-side-collapsed') === '1'); } catch { /* storage blocked */ }
  }, []);
  const toggleCollapsed = () => {
    setCollapsed((c) => {
      try { localStorage.setItem('adm2-side-collapsed', c ? '0' : '1'); } catch { /* storage blocked */ }
      return !c;
    });
  };
  // Drawer: Escape closes it, and the page behind doesn't scroll while open.
  useEffect(() => {
    if (!sideOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSideOpen(false); };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; document.removeEventListener('keydown', onKey); };
  }, [sideOpen]);
  // Date pill — set on the client so it always shows the viewer's local date.
  const [today, setToday] = useState('');
  useEffect(() => {
    setToday(new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }));
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
  // `desc` = one line in the nav dropdown / search; `sub` = the line under the
  // page title. `ownHead` = the component draws its own page title card
  // (because it has buttons or live numbers in it); otherwise the shell does.
  const menuItems: any[] = [
    { id: 'dashboard', name: 'Overview', icon: LayoutDashboard, component: DashboardOverview, group: 'Overview', desc: 'Today at a glance', ownHead: true },
    { id: 'seoTraffic', name: 'SEO & Traffic', icon: LineChart, component: SeoTrafficPanel, group: 'Overview', desc: 'Visitors, Analytics & Search Console', sub: 'Website traffic, Google Analytics 4 and Google Search Console.' },
    { id: 'siteHealth', name: 'Website Health', icon: ShieldCheck, component: SiteHealth, group: 'Overview', desc: 'Security, SEO, speed & daily leads', ownHead: true },
    { id: 'leads', name: 'Lead Management', icon: Target, component: LeadsManager, group: 'Leads & CRM', desc: 'Website enquiries & CRM clients', ownHead: true },
    { id: 'contacts', name: 'Contacts', icon: MessageSquare, component: ContactsManager, group: 'Leads & CRM', desc: 'Contact-form enquiries', sub: 'Customer enquiries and messages from the website contact form.' },
    { id: 'loans', name: 'Loan Applications', icon: FileText, component: LoansManager, group: 'Leads & CRM', desc: 'Review & approve applications', sub: 'Review, approve or reject loan applications.' },
    { id: 'activities', name: 'Activities', icon: ActivityIcon, component: ActivitiesManager, group: 'Leads & CRM', desc: 'Calls, notes & follow-ups', ownHead: true },
    { id: 'team', name: 'Team', icon: Network, component: TeamManager, group: 'Leads & CRM', desc: 'Team structure & roles', sub: 'Who is on the team and what each person handles.' },
    { id: 'analytics', name: 'CRM Analytics', icon: BarChart3, component: AnalyticsManager, group: 'Leads & CRM', desc: 'Funnel, sources & conversion', ownHead: true },
    { id: 'automations', name: 'Automations', icon: Zap, component: AutomationsManager, group: 'Growth & Automation', desc: 'Lead sources, rules, import & export', sub: 'Lead sources, automatic rules, email-to-lead, import and export.' },
    { id: 'marketing', name: 'Marketing & Ads', icon: Megaphone, component: MarketingManager, group: 'Growth & Automation', desc: 'Meta & Google ads, conversions', sub: 'Meta & Google connections, CRM-confirmed results, and conversion delivery to ad platforms.' },
    { id: 'banners', name: 'Banners', icon: ImageIcon, component: BannersManager, group: 'Website Content', desc: 'Page banners & logo images', sub: 'Banners, partner logos and card images for each page of the website.' },
    { id: 'content', name: 'Content', icon: FolderOpen, component: ContentManager, group: 'Website Content', desc: 'Website content & files', ownHead: true },
    { id: 'blogs', name: 'Blog Manager', icon: FileText, component: BlogsManager, group: 'Website Content', desc: 'Write, review & publish posts', sub: 'Create, review and publish blog posts. A blog goes live only after it is Published.' },
    { id: 'testimonials', name: 'Testimonials', icon: Users, component: TestimonialsManager, group: 'Website Content', desc: 'Customer reviews on the site', sub: 'Customer reviews shown on the website hero section.' },
    { id: 'ezyBrain', name: 'Ezy AI Brain', icon: Brain, component: EzyBrainManager, group: 'AI Assistants', desc: 'Train the website chatbot', sub: 'Train the chatbot from your own database — no external AI API.' },
    { id: 'ezyInsights', name: 'Ezy AI Insights', icon: BarChart3, component: ChatAnalytics, group: 'AI Assistants', desc: 'How visitors use the chatbot', sub: 'How visitors use the chatbot — volume, answer rate, and voice usage.' },
    { id: 'whatsappBrain', name: 'WhatsApp AI Brain', icon: MessageCircle, component: WhatsAppBrainManager, group: 'AI Assistants', desc: 'Train WhatsApp auto-replies', sub: 'Train what your WhatsApp bot auto-replies — from your own database, no external AI API.' },
    { id: 'whatsappChats', name: 'WhatsApp Chats', icon: MessageSquareText, component: WhatsAppChatsManager, group: 'AI Assistants', desc: 'Conversations with the bot', ownHead: true },
    { id: 'employees', name: 'Employees', icon: ShieldCheck, component: EmployeesManager, adminOnly: true, group: 'Administration', desc: 'Staff logins & their access', ownHead: true },
    { id: 'blockedIps', name: 'Blocked IPs', icon: ShieldAlert, component: BlockedIpsManager, adminOnly: true, group: 'Administration', desc: 'Block or unblock spam IPs', sub: 'Spammers are blocked automatically; you can also block or unblock an IP here.' },
    { id: 'auditLog', name: 'Audit Log', icon: FileText, component: AuditLogManager, adminOnly: true, group: 'Administration', desc: 'Settings, export & access changes', sub: 'Configuration changes, integration connections, exports, user/permission changes, blog publication and manual conversion actions.' },
    // `hidden` = reachable from the top-bar profile menu, not shown in the nav.
    // Everyone (admins + employees) can view/edit their own account.
    { id: 'account', name: 'Account', icon: UserIcon, component: AccountManager, hidden: true, desc: 'Profile, settings & subscription', sub: 'Your profile, notifications, subscription and password.' }
  ];

  // Order the section labels appear in the sidebar.
  const GROUP_ICONS: Record<string, React.ElementType> = {
    Overview: LayoutDashboard, 'Leads & CRM': Target, 'Growth & Automation': Megaphone,
    'Website Content': FolderOpen, 'AI Assistants': Brain, Administration: ShieldCheck,
  };
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

  // Deep-link from a push notification: opening "/ezyadmin?tab=whatsappChats" (what a
  // new-WhatsApp-message push points to) lands straight on that tab instead of the
  // dashboard. Runs once after login, and only if the user may reach that tab
  // (RBAC preserved). Manual navigation afterwards is never overridden.
  const deepLinkedRef = useRef(false);
  useEffect(() => {
    if (!user || deepLinkedRef.current || typeof window === 'undefined') return;
    const tab = new URLSearchParams(window.location.search).get('tab');
    if (tab && reachableItems.some((i) => i.id === tab)) {
      deepLinkedRef.current = true;
      setCurrentPage(tab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, reachableItems]);

  // Fetch dashboard stats
  useEffect(() => {
    // Only users who may see the Overview tab — otherwise its APIs return 403.
    if (currentPage === 'dashboard' && (isAdminUser || permissions.includes('dashboard'))) {
      fetchDashboardStats();
    }
    // Viewing the WhatsApp chats = everything so far is seen; clear the badge.
    if (currentPage === 'whatsappChats') {
      markWaSeen?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  // Fetch data when components are accessed
  useEffect(() => {
    if (currentPage === 'banners' && banners.length === 0) fetchBanners();
    else if (currentPage === 'contacts' && contacts.length === 0) fetchContacts();
    else if (currentPage === 'loans' && loans.length === 0) fetchLoans();
    else if (currentPage === 'blogs' && blogs.length === 0) fetchBlogs();
    else if (currentPage === 'testimonials' && testimonials.length === 0) fetchTestimonials();
    // Fetch once per tab visit; the cached lists are deliberately not deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // 🔥 NEW: Blog approval-workflow status change (submit / approve / reject / unpublish)
  const handleBlogStatus = async (blogId: string, status: BlogStatus, rejectionReason?: string) => {
    try {
      await axios.post(`/api/blogs/${blogId}/status`, { status, rejectionReason });
      fetchBlogs();
      return { success: true };
    } catch (error: any) {
      const data = error.response?.data;
      const msg = data?.errors?.length
        ? `${data.message}\n\n• ${data.errors.join('\n• ')}`
        : data?.message || 'Failed to update status';
      return { success: false, message: msg };
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
  };

  // Sidebar = labelled groups, each listing its sections.
  const groupItemsOf = (g: string) => visibleMenuItems.filter((item) => item.group === g);
  const tabGroups = GROUP_ORDER.filter((g) => groupItemsOf(g).length > 0);
  const go = (id: string) => {
    setCurrentPage(id);
    setQ('');
    setSearchOpen(false);
    setSideOpen(false);
    if (id === 'whatsappChats') markWaSeen?.();
  };
  const waBadge = (id: string) => (id === 'whatsappChats' && waUnread > 0 ? (waUnread > 99 ? '99+' : String(waUnread)) : '');

  // Header search: jumps to any section the user may open.
  const query = q.trim().toLowerCase();
  const searchHits = query
    ? reachableItems.filter((i) => `${i.name} ${i.desc || ''} ${i.group || ''}`.toLowerCase().includes(query)).slice(0, 8)
    : [];

  return (
    <div className={`adm2${collapsed ? ' side-collapsed' : ''}`} id="admin-app">
      <header className="adm2-top">
        <button
          type="button"
          className="adm2-burger"
          onClick={() => setSideOpen(true)}
          aria-label="Open menu"
          aria-expanded={sideOpen}
          aria-controls="adm2-side"
        >
          <Menu size={20} />
        </button>
        <a className="adm2-brand" href="/" target="_blank" rel="noopener" aria-label="EzyLoan home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/ezy-logo.webp" alt="EzyLoan" />
          <span className="sep" aria-hidden="true" />
          <span><small>{isAdminUser ? 'Super admin' : 'Team panel'}</small></span>
        </a>

        <div className={`adm2-search${searchOpen ? ' open' : ''}`} ref={searchRef}>
          <Search size={16} />
          <input
            ref={searchInput}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => setSearchFocus(true)}
            onBlur={() => setSearchFocus(false)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') { setQ(''); setSearchOpen(false); (e.target as HTMLInputElement).blur(); }
              if (e.key === 'Enter' && searchHits[0]) go(searchHits[0].id);
            }}
            placeholder="Search sections — leads, loans, blogs, WhatsApp…"
            aria-label="Search sections"
          />
          {searchOpen && <button type="button" className="adm2-search-x" onClick={() => { setQ(''); setSearchOpen(false); }} aria-label="Close search"><X size={16} /></button>}
          {searchFocus && query && (
            <div className="adm2-search-pop">
              {searchHits.length ? searchHits.map((h) => {
                const Icon = h.icon;
                return (
                  <button type="button" key={h.id} onMouseDown={(e) => e.preventDefault()} onClick={() => go(h.id)}>
                    <span className="ic"><Icon size={15} /></span>
                    <span><b>{h.name}</b><small>{h.group ? `${h.group} · ` : ''}{h.desc}</small></span>
                  </button>
                );
              }) : <p className="muted">No matches for “{q.trim()}”.</p>}
            </div>
          )}
        </div>

        <div className="adm2-top-right" ref={profileMenuRef}>
          <button type="button" className="adm2-pill adm2-search-btn" onClick={() => { setSearchOpen(true); setTimeout(() => searchInput.current?.focus(), 30); }} aria-label="Search">
            <Search size={16} />
          </button>
          {today && <span className="adm2-pill adm2-date"><Calendar size={15} /> {today}</span>}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a className="adm2-pill adm2-viewsite" href="/" target="_blank" rel="noopener" title="Open the website">
            <ExternalLink size={15} /> <span className="adm-hide-sm">View site</span>
          </a>
          <button className="adm2-user" onClick={() => setProfileOpen((o) => !o)} aria-label="Account menu" aria-expanded={profileOpen}>
            <span className="who">{initials}</span>
            <span className="who-meta"><b>{displayName}</b><small>{isAdminUser ? 'Super Admin' : 'Employee'}</small></span>
            <ChevronDown size={14} />
          </button>
          {profileOpen && (
            <div className="adm2-menu">
              <div className="adm2-menu-head"><b>{displayName}</b><small>{company}</small></div>
              <div className="adm2-menu-sep" />
              <button onClick={() => openAccount('profile')}><UserIcon size={15} /> Profile</button>
              <button onClick={() => openAccount('notifications')}><SettingsIcon size={15} /> Settings</button>
              <button onClick={() => openAccount('subscription')}><CreditCard size={15} /> Subscription</button>
              <button onClick={() => openAccount('profile')}><Smartphone size={15} /> Mobile App</button>
              <a href="/faq" target="_blank" rel="noopener noreferrer" onClick={() => setProfileOpen(false)}><BookOpen size={15} /> User Guide</a>
              <a href="https://wa.me/919692429674" target="_blank" rel="noopener noreferrer" onClick={() => setProfileOpen(false)}><MessageCircle size={15} /> Live Chat Support</a>
              <div className="adm2-menu-sep" />
              <button className="danger" onClick={onLogout}><LogOut size={15} /> Log Out</button>
            </div>
          )}
        </div>
      </header>

      <div className="adm2-body">
      {sideOpen && <div className="adm2-scrim" onClick={() => setSideOpen(false)} aria-hidden="true" />}
      <aside id="adm2-side" className={`adm2-side${sideOpen ? ' open' : ''}`} aria-label="Admin sections">
        <div className="adm2-side-head">
          <span className="adm2-side-title">Menu</span>
          <button type="button" className="adm2-side-x" onClick={() => setSideOpen(false)} aria-label="Close menu"><X size={18} /></button>
        </div>
        <nav className="adm2-side-nav">
          {tabGroups.map((g) => {
            const GIcon = GROUP_ICONS[g];
            return (
              <div className="adm2-side-group" key={g}>
                <p className="adm2-side-label">{GIcon && <GIcon size={12} />}<span>{g}</span></p>
                {groupItemsOf(g).map((item) => {
                  const Icon = item.icon;
                  const badge = waBadge(item.id);
                  const on = activeItem?.id === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`adm2-side-item${on ? ' on' : ''}`}
                      aria-current={on ? 'page' : undefined}
                      title={collapsed ? item.name : item.desc}
                      onClick={() => go(item.id)}
                    >
                      <span className="ic"><Icon size={17} /></span>
                      <span className="txt">{item.name}</span>
                      {badge && <span className="tab-badge">{badge}</span>}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>
        <button type="button" className="adm2-side-collapse" onClick={toggleCollapsed} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          {collapsed ? <ChevronsRight size={17} /> : <ChevronsLeft size={17} />}
          <span className="txt">Collapse</span>
        </button>
      </aside>

      <main className="adm2-main">
        <div className="adm-content">
          {CurrentComponent && !activeItem?.ownHead && (
            <PageHead icon={activeItem.icon} title={activeItem.name} sub={activeItem.sub} />
          )}
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
            // Role (UI only — the API enforces the same rules server-side)
            isAdminUser={isAdminUser}
            // Dashboard props
            stats={dashboardStats}
            analytics={analyticsData}
            setCurrentPage={go}
            userName={displayName}
            canOpen={(id: string) => reachableItems.some((i) => i.id === id)}
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
            onBlogStatus={handleBlogStatus}
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
      </main>
      </div>
    </div>
  );
}

// ---------- Overview (same design as the Mappingg super-admin dashboard) ----------

function timeAgo(at: string): string {
  const s = Math.max(0, (Date.now() - new Date(at).getTime()) / 1000);
  if (!Number.isFinite(s)) return '';
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 86400 * 30) return `${Math.floor(s / 86400)}d ago`;
  return new Date(at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

/** % change of items created this calendar month vs last month (null = nothing to compare). */
function monthGrowth(items: { createdAt?: string }[]): number | null {
  const now = new Date();
  const thisKey = `${now.getFullYear()}-${now.getMonth()}`;
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevKey = `${prev.getFullYear()}-${prev.getMonth()}`;
  let cur = 0, last = 0;
  for (const it of items) {
    if (!it.createdAt) continue;
    const d = new Date(it.createdAt);
    const k = `${d.getFullYear()}-${d.getMonth()}`;
    if (k === thisKey) cur++;
    else if (k === prevKey) last++;
  }
  if (!last) return null;
  return Math.round(((cur - last) / last) * 100);
}

function KpiCard({ icon: Icon, tone, value, label, growth, onClick }: { icon: React.ElementType; tone: string; value: number; label: string; growth?: number | null; onClick?: () => void }) {
  return (
    <button type="button" className={`ov-kpi ${tone}`} onClick={onClick}>
      <span className={`ov-kpi-ic ${tone}`}><Icon size={24} /></span>
      <span className="ov-kpi-row">
        <span className="ov-kpi-main"><b>{(value || 0).toLocaleString('en-IN')}</b><span>{label}</span></span>
        <span className="ov-kpi-delta">
          {growth == null || growth === 0
            ? <em className="flat">—</em>
            : growth > 0
              ? <em className="up"><TrendingUp size={14} /> {growth}%</em>
              : <em className="down"><TrendingDown size={14} /> {Math.abs(growth)}%</em>}
          <small>vs last month</small>
        </span>
      </span>
    </button>
  );
}

function OvDonut({ slices, total, label }: { slices: { label: string; count: number; color: string }[]; total: number; label: string }) {
  const R = 52, C = 2 * Math.PI * R;
  let off = 0;
  return (
    <div className="ov-donut">
      <svg viewBox="0 0 140 140" role="img" aria-label={`${total} ${label}`}>
        <circle cx="70" cy="70" r={R} fill="none" stroke="#eef1f5" strokeWidth="20" />
        {slices.map((s) => {
          const len = total ? (s.count / total) * C : 0;
          const el = <circle key={s.label} cx="70" cy="70" r={R} fill="none" stroke={s.color} strokeWidth="20"
            strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-off} transform="rotate(-90 70 70)"><title>{`${s.label}: ${s.count}`}</title></circle>;
          off += len;
          return el;
        })}
        <text x="70" y="70" textAnchor="middle" className="ov-donut-v">{total.toLocaleString('en-IN')}</text>
        <text x="70" y="88" textAnchor="middle" className="ov-donut-l">{label}</text>
      </svg>
      <table className="ov-donut-legend">
        <tbody>
          {slices.map((s) => (
            <tr key={s.label}>
              <td><span className="dot" style={{ background: s.color }} />{s.label}</td>
              <td className="n">{s.count.toLocaleString('en-IN')}</td>
              <td className="p">{total ? Math.round((s.count / total) * 100) : 0}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LeadsTrend({ days }: { days: { date: string; count: number }[] }) {
  const W = 520, H = 120, P = { l: 26, r: 10, t: 10, b: 22 };
  const max = Math.max(4, ...days.map((d) => d.count));
  const step = Math.ceil(max / 4);
  const top = step * 4;
  const x = (i: number) => P.l + (i * (W - P.l - P.r)) / Math.max(1, days.length - 1);
  const y = (v: number) => P.t + (1 - v / top) * (H - P.t - P.b);
  const line = days.map((d, i) => `${x(i)},${y(d.count)}`).join(' ');
  const label = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  const ticks = days.length ? [0, 7, 14, 21, days.length - 1].filter((i) => i < days.length) : [];
  return (
    <svg className="ov-trend" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Enquiries per day, last 30 days">
      {[0, 1, 2, 3, 4].map((k) => (
        <g key={k}>
          <line x1={P.l} x2={W - P.r} y1={y(k * step)} y2={y(k * step)} className="grid" />
          <text x={P.l - 6} y={y(k * step) + 3} textAnchor="end">{k * step}</text>
        </g>
      ))}
      {days.length > 1 && <polygon points={`${x(0)},${y(0)} ${line} ${x(days.length - 1)},${y(0)}`} className="area" />}
      <polyline points={line} className="line" />
      {days.map((d, i) => (
        <circle key={d.date} cx={x(i)} cy={y(d.count)} r={d.count ? 3 : 2} className="pt"><title>{`${label(d.date)}: ${d.count} enquir${d.count === 1 ? 'y' : 'ies'}`}</title></circle>
      ))}
      {ticks.map((i) => <text key={i} x={x(i)} y={H - 4} textAnchor="middle">{label(days[i].date)}</text>)}
    </svg>
  );
}

const LOAN_STATUS: { key: string; label: string; color: string }[] = [
  { key: 'approved', label: 'Approved', color: '#16a34a' },
  { key: 'pending', label: 'Pending', color: '#e0a526' },
  { key: 'rejected', label: 'Rejected', color: '#dc2626' },
];

// Dashboard Overview Component
function DashboardOverview({ stats, analytics, setCurrentPage, userName, canOpen }: {
  stats: any; analytics?: { loans: any[]; contacts: any[] }; setCurrentPage?: (page: string) => void;
  userName?: string; canOpen?: (id: string) => boolean;
}) {
  const [hour, setHour] = useState<number | null>(null);
  useEffect(() => { setHour(new Date().getHours()); }, []);
  const loans = analytics?.loans || [];
  const contacts = analytics?.contacts || [];
  const can = (id: string) => (canOpen ? canOpen(id) : true);
  const open = (id: string) => { if (can(id)) setCurrentPage?.(id); };

  const greeting = hour == null ? 'Welcome' : hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = (userName || '').split(/\s+/)[0];

  // Applications by status (donut)
  const statusSlices = LOAN_STATUS.map((s) => ({ label: s.label, color: s.color, count: loans.filter((l) => l.status === s.key).length }));
  const decided = statusSlices[0].count + statusSlices[2].count;
  const approvalRate = decided > 0 ? Math.round((statusSlices[0].count / decided) * 100) : 0;

  // Top loan types (bars) — applications + contact enquiries
  const typeCounts: Record<string, number> = {};
  [...loans, ...contacts].forEach((l) => { const k = l.loanType || 'Other'; typeCounts[k] = (typeCounts[k] || 0) + 1; });
  const byType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const typeMax = Math.max(1, ...byType.map(([, v]) => v));

  // Enquiries (applications + contacts) per day — last 30 days
  const dayKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const perDay: Record<string, number> = {};
  [...loans, ...contacts].forEach((x) => { if (x.createdAt) { const k = dayKey(new Date(x.createdAt)); perDay[k] = (perDay[k] || 0) + 1; } });
  const days: { date: string; count: number }[] = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const k = dayKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() - i));
    days.push({ date: k, count: perDay[k] || 0 });
  }
  const leads30 = days.reduce((a, d) => a + d.count, 0);

  // Recent activity — newest applications and contact messages
  const recent = [
    ...loans.map((l) => ({ kind: 'loan', at: l.createdAt, title: `${l.fullName || 'Someone'} applied for a loan`, detail: [l.loanType, l.city, l.status].filter(Boolean).join(' · ') })),
    ...contacts.map((c) => ({ kind: 'contact', at: c.createdAt, title: `${c.fullName || 'Someone'} sent an enquiry`, detail: [c.loanType, c.message].filter(Boolean).join(' · ') })),
  ].filter((r) => r.at).sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()).slice(0, 6);

  const actions = [
    { k: 'leads', icon: Target, tone: 'blue', b: 'Manage Leads', s: 'Follow up on enquiries' },
    { k: 'loans', icon: FileText, tone: 'green', b: 'Loan Applications', s: 'Review & approve' },
    { k: 'contacts', icon: MessageSquare, tone: 'amber', b: 'Contacts', s: 'New contact messages' },
    { k: 'blogs', icon: Edit, tone: 'violet', b: 'Create Blog', s: 'Publish new content' },
    { k: 'banners', icon: ImageIcon, tone: 'teal', b: 'Banners', s: 'Update page banners' },
    { k: 'whatsappChats', icon: MessageCircle, tone: 'wa', b: 'WhatsApp', s: 'Chats with customers' },
  ].filter((a) => can(a.k));

  return (
    <div className="ov">
      <div className="ov-top">
        <section className="ov-hero">
          <div className="ov-hero-text">
            <small>Welcome back{firstName ? `, ${firstName}` : ''}</small>
            <h2>{greeting}{firstName ? <>,<br /><span className="ov-hero-name">{firstName}</span></> : ''}</h2>
            <p>Here&apos;s what&apos;s happening on EzyLoan today.</p>
          </div>
          <div className="ov-hero-img" aria-hidden="true" />
        </section>
        <div className="ov-kpis">
          <KpiCard icon={Target} tone="blue" value={stats.totalLeads} label="Total Leads (CRM)" onClick={() => open('leads')} />
          <KpiCard icon={FileText} tone="green" value={stats.totalLoanApplications} label="Loan Applications" growth={monthGrowth(loans)} onClick={() => open('loans')} />
          <KpiCard icon={MessageSquare} tone="amber" value={stats.totalContacts} label="Contact Enquiries" growth={monthGrowth(contacts)} onClick={() => open('contacts')} />
          <KpiCard icon={CheckCircle} tone="violet" value={stats.convertedLeads} label="Converted Leads" onClick={() => open('analytics')} />
        </div>
      </div>

      {stats.pendingApplications > 0 && (
        <button type="button" className="ov-alert" onClick={() => open('loans')}>
          <Clock size={20} />
          <span><b>{stats.pendingApplications} loan application{stats.pendingApplications === 1 ? '' : 's'} waiting for review</b> — approve or reject them so customers get an answer.</span>
          <span className="ov-alert-go">Review <ArrowRight size={14} /></span>
        </button>
      )}

      <div className="ov-mid">
        <section className="ov-card">
          <div className="ov-card-head"><h3><Zap size={17} className="ov-bolt" /> Quick Actions</h3></div>
          <div className="ov-actions">
            {actions.map((a) => {
              const Icon = a.icon;
              return (
                <button type="button" key={a.k} className={`ov-action ${a.tone}`} onClick={() => open(a.k)}>
                  <span className="ic"><Icon size={15} /></span>
                  <ArrowRight size={14} className="go" />
                  <b>{a.b}</b><small>{a.s}</small>
                </button>
              );
            })}
          </div>
        </section>
        <section className="ov-card">
          <div className="ov-card-head"><h3><ActivityIcon size={17} /> Recent Activity</h3></div>
          {recent.length ? (
            <ul className="ov-activity">
              {recent.map((r, i) => (
                <li key={i} className={r.kind === 'loan' ? 'green' : 'violet'}>
                  <span className="ic">{r.kind === 'loan' ? <FileText size={14} /> : <MessageSquare size={14} />}</span>
                  <span className="t"><b>{r.title}</b><small>{r.detail || '—'}</small></span>
                  <time dateTime={r.at}>{timeAgo(r.at)}</time>
                </li>
              ))}
            </ul>
          ) : <p className="ov-none">Nothing new yet.</p>}
        </section>
      </div>

      <div className="ov-bottom">
        <section className="ov-card">
          <div className="ov-card-head"><h3>Applications by Status</h3><span className="ov-chip">Approval rate {approvalRate}%</span></div>
          {loans.length ? <OvDonut slices={statusSlices} total={loans.length} label="Applications" /> : <p className="ov-none">No applications yet.</p>}
        </section>
        <section className="ov-card">
          <div className="ov-card-head"><h3>Top Loan Types</h3><span className="ov-chip">All enquiries</span></div>
          {byType.length ? (
            <div className="ov-bars">
              {byType.map(([k, v], i) => (
                <div className="ov-bar" key={k}>
                  <span className="n" title={k}>{k}</span>
                  <span className="track"><span style={{ width: `${(v / typeMax) * 100}%`, opacity: 1 - i * 0.12 }} /></span>
                  <span className="v">{v.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          ) : <p className="ov-none">No enquiries yet.</p>}
        </section>
        <section className="ov-card">
          <div className="ov-card-head"><h3>Leads Trend</h3><span className="ov-chip">Last 30 days · {leads30}</span></div>
          <LeadsTrend days={days} />
        </section>
      </div>

      <h3 className="ov-more">More insights</h3>
      {/* Search Console clicks, GA4 cities, conversions sent (Marketing permission only) */}
      <MarketingSnapshot onOpen={can('marketing') ? () => open('marketing') : undefined} />
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

// Blog Manager — create/edit + approval workflow (draft → pending → published /
// rejected / archived) + SEO controls, preview and checklist. A blog is public
// ONLY when published; publishing is gated server-side by the SEO checklist.
const BLOG_STATUS_META: Record<string, { label: string; cls: string }> = {
  draft: { label: 'Draft', cls: 'bg-gray-100 text-gray-700' },
  pending: { label: 'Pending Review', cls: 'bg-amber-100 text-amber-800' },
  published: { label: 'Published', cls: 'bg-green-100 text-green-800' },
  rejected: { label: 'Rejected', cls: 'bg-red-100 text-red-800' },
  archived: { label: 'Archived', cls: 'bg-slate-200 text-slate-700' },
};

function BlogStatusBadge({ status }: { status?: BlogStatus }) {
  const meta = BLOG_STATUS_META[status || 'published'] || BLOG_STATUS_META.draft;
  return <span className={`px-2 py-1 text-xs rounded-full font-medium ${meta.cls}`}>{meta.label}</span>;
}

const SITE_ORIGIN = 'https://www.ezyloan.co.in';

function BlogsManager({
  blogs, selectedBlog, setSelectedBlog, onCreateBlog, onUpdateBlog, onDeleteBlog, onBlogStatus, loadingBlogs, isAdminUser
}: {
  blogs: Blog[]; selectedBlog: Blog | null; setSelectedBlog: (blog: Blog | null) => void;
  onCreateBlog: (data: BlogFormData) => Promise<{ success: boolean; message?: string }>;
  onUpdateBlog: (id: string, data: Partial<BlogFormData>) => Promise<{ success: boolean; message?: string }>;
  onDeleteBlog: (id: string) => void;
  onBlogStatus: (id: string, status: BlogStatus, rejectionReason?: string) => Promise<{ success: boolean; message?: string }>;
  loadingBlogs: boolean;
  isAdminUser?: boolean;
}) {
  const emptyForm: BlogFormData = {
    title: '', slug: '', excerpt: '', content: '', category: 'Personal', image: '',
    featuredImageAlt: '', author: '', authorBio: '', tags: '',
    seoTitle: '', seoDescription: '', focusKeyword: '', secondaryKeywords: '',
    canonicalUrl: '', ogTitle: '', ogDescription: '', ogImage: '',
  };
  const [formData, setFormData] = useState<BlogFormData>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [showSeo, setShowSeo] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | BlogStatus>('all');

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');

  const categories = [
    'Personal', 'Property Loans', 'Business',
    'car-loan-bt', 'car-loan-new', 'used-car-loan', 'car-loan-topup', 'commercial-vehicle',
  ];

  useEffect(() => {
    if (selectedBlog) {
      setFormData({
        title: selectedBlog.title || '',
        slug: selectedBlog.slug || '',
        excerpt: selectedBlog.excerpt || '',
        content: selectedBlog.content || '',
        category: selectedBlog.category || 'Personal',
        image: selectedBlog.image || '',
        featuredImageAlt: selectedBlog.featuredImageAlt || '',
        author: selectedBlog.author || '',
        authorBio: selectedBlog.authorBio || '',
        tags: (selectedBlog.tags || []).join(', '),
        seoTitle: selectedBlog.seoTitle || '',
        seoDescription: selectedBlog.seoDescription || '',
        focusKeyword: selectedBlog.focusKeyword || '',
        secondaryKeywords: (selectedBlog.secondaryKeywords || []).join(', '),
        canonicalUrl: selectedBlog.canonicalUrl || '',
        ogTitle: selectedBlog.ogTitle || '',
        ogDescription: selectedBlog.ogDescription || '',
        ogImage: selectedBlog.ogImage || '',
      });
      setImagePreview(selectedBlog.image || '');
      setIsEditing(true);
      setShowSeo(true);
    } else {
      setFormData(emptyForm);
      setImagePreview('');
      setIsEditing(false);
    }
    setError('');
    setImageFile(null);
  }, [selectedBlog]); // eslint-disable-line react-hooks/exhaustive-deps

  // Live SEO checklist for the form (recommendations, not ranking guarantees).
  const seo: SeoCheckResult = React.useMemo(() => runSeoChecklist({
    title: formData.title, slug: formData.slug, content: formData.content,
    excerpt: formData.excerpt, image: formData.image, featuredImageAlt: formData.featuredImageAlt,
    category: formData.category, author: formData.author, seoTitle: formData.seoTitle,
    seoDescription: formData.seoDescription, focusKeyword: formData.focusKeyword, canonicalUrl: formData.canonicalUrl,
  }), [formData]);

  // Warn about a substantially similar existing post (duplicate protection).
  const duplicate = React.useMemo(() => {
    const t = formData.title.trim().toLowerCase();
    if (!t) return null;
    return blogs.find((b) => b._id !== selectedBlog?._id && (b.title || '').trim().toLowerCase() === t) || null;
  }, [formData.title, blogs, selectedBlog]);

  const handleGenerateSlug = () => {
    if (formData.title) setFormData((p) => ({ ...p, slug: sanitizeSlug(formData.title) }));
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Please select an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('File size should be less than 5MB'); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    event.target.value = '';
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fd = new FormData();
    fd.append('image', file);
    const response = await axios.post(`/api/blogs/upload`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    return response.data.image;
  };

  const set = (k: keyof BlogFormData, v: string) => setFormData((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) { setError('Title and content are required'); return; }
    setIsSubmitting(true);
    setError('');
    try {
      let finalImageUrl = formData.image;
      if (imageFile) {
        setIsUploadingImage(true);
        finalImageUrl = await uploadImage(imageFile);
        setIsUploadingImage(false);
      }
      const blogData: BlogFormData = { ...formData, image: finalImageUrl, slug: sanitizeSlug(formData.slug || formData.title) };

      const res = isEditing && selectedBlog
        ? await onUpdateBlog(selectedBlog._id, blogData)
        : await onCreateBlog(blogData);

      if (res.success) {
        setFormData(emptyForm);
        setImageFile(null);
        setImagePreview('');
        setSelectedBlog(null);
        setIsEditing(false);
      } else {
        setError(res.message || 'Failed to save blog');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to save blog');
      setIsUploadingImage(false);
    }
    setIsSubmitting(false);
  };

  const handleCancel = () => {
    setSelectedBlog(null);
    setFormData(emptyForm);
    setImageFile(null);
    setImagePreview('');
    setIsEditing(false);
    setError('');
  };

  const doStatus = async (blog: Blog, status: BlogStatus) => {
    let reason: string | undefined;
    if (status === 'rejected') {
      reason = window.prompt('Reason for rejecting this blog (shown to editors):') || '';
      if (!reason.trim()) return;
    }
    const verb = status === 'published' ? 'publish' : status === 'archived' ? 'unpublish' : status;
    if (status === 'archived' && !window.confirm('Unpublish this blog? It will be removed from the site and sitemap.')) return;
    const res = await onBlogStatus(blog._id, status, reason);
    if (!res.success) alert(res.message || `Failed to ${verb} blog`);
  };

  useEffect(() => () => { if (imagePreview.startsWith('blob:')) URL.revokeObjectURL(imagePreview); }, [imagePreview]);

  const filtered = statusFilter === 'all'
    ? blogs
    : blogs.filter((b) => (b.status || 'published') === statusFilter);

  const counts = blogs.reduce((acc: Record<string, number>, b) => {
    const s = b.status || 'published';
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  const previewTitle = (formData.seoTitle || formData.title || 'Blog title').slice(0, 60);
  const previewDesc = (formData.seoDescription || formData.excerpt || 'Meta description preview…').slice(0, 160);
  const previewUrl = `${SITE_ORIGIN}/blog/${sanitizeSlug(formData.slug || formData.title) || 'your-slug'}`;

  const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500';

  return (
    <div>
      {/* Blog Form */}
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6 border border-gray-100">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">{isEditing ? '✏️ Edit Blog' : '➕ Create New Blog'}</h4>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input type="text" value={formData.title} onChange={(e) => set('title', e.target.value)} required className={inputCls} placeholder="Enter blog title" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
              <div className="flex gap-2">
                <input type="text" value={formData.slug} onChange={(e) => set('slug', e.target.value)} className={`flex-1 ${inputCls}`} placeholder="blog-title-slug" />
                <button type="button" onClick={handleGenerateSlug} className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm">Generate</button>
              </div>
              {isEditing && <p className="text-xs text-gray-400 mt-1">Changing a published slug auto-creates a 301 redirect from the old URL.</p>}
            </div>
          </div>

          {duplicate && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-lg text-sm flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              A blog with this exact title already exists (“{duplicate.title}”). Avoid publishing duplicate content.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select value={formData.category} onChange={(e) => set('category', e.target.value)} className={inputCls}>
                {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Featured Image</label>
              <div className="flex items-center gap-3">
                <label className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  {isUploadingImage ? 'Uploading...' : 'Choose Image'}
                  <input type="file" accept="image/*" onChange={handleImageSelect} disabled={isUploadingImage} className="hidden" />
                </label>
                {imagePreview && <img src={imagePreview} alt="Preview" className="w-16 h-16 rounded object-cover border border-gray-200" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image ALT text</label>
            <input type="text" value={formData.featuredImageAlt} onChange={(e) => set('featuredImageAlt', e.target.value)} className={inputCls} placeholder="Describe the image for accessibility & SEO (not keyword stuffing)" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
            <textarea value={formData.excerpt} onChange={(e) => set('excerpt', e.target.value)} rows={2} className={inputCls} placeholder="Short description for listing & meta description fallback..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
            <textarea value={formData.content} onChange={(e) => set('content', e.target.value)} required rows={12} className={`${inputCls} font-mono`} placeholder="Write your blog content here (HTML supported)..." />
            <p className="text-xs text-gray-500 mt-1">💡 Use &lt;h2&gt;, &lt;h3&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;table&gt;, &lt;a&gt;. The title is the page H1 — don’t add another &lt;h1&gt;.</p>
          </div>

          {/* SEO panel */}
          <div className="border border-gray-200 rounded-lg">
            <button type="button" onClick={() => setShowSeo((s) => !s)} className="w-full flex items-center justify-between px-4 py-3 text-left">
              <span className="font-semibold text-gray-800">🔍 SEO settings</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${showSeo ? 'rotate-180' : ''}`} />
            </button>
            {showSeo && (
              <div className="px-4 pb-4 space-y-4 border-t border-gray-100 pt-4">
                {/* Google preview */}
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Google preview</p>
                  <p className="text-[#1a0dab] text-lg leading-tight truncate">{previewTitle}</p>
                  <p className="text-[#006621] text-sm truncate">{previewUrl}</p>
                  <p className="text-sm text-gray-600 line-clamp-2">{previewDesc}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">SEO Title <span className="text-gray-400">({formData.seoTitle.length}/60)</span></label>
                    <input type="text" value={formData.seoTitle} onChange={(e) => set('seoTitle', e.target.value)} className={inputCls} placeholder="Falls back to the blog title" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Focus Keyword</label>
                    <input type="text" value={formData.focusKeyword} onChange={(e) => set('focusKeyword', e.target.value)} className={inputCls} placeholder="e.g. car loan in Odisha" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SEO Description <span className="text-gray-400">({formData.seoDescription.length}/160)</span></label>
                  <textarea value={formData.seoDescription} onChange={(e) => set('seoDescription', e.target.value)} rows={2} className={inputCls} placeholder="Falls back to the excerpt. Aim for ~120-155 characters." />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Keywords</label>
                    <input type="text" value={formData.secondaryKeywords} onChange={(e) => set('secondaryKeywords', e.target.value)} className={inputCls} placeholder="comma, separated, keywords" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                    <input type="text" value={formData.tags} onChange={(e) => set('tags', e.target.value)} className={inputCls} placeholder="comma, separated, tags" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Canonical URL <span className="text-gray-400">(optional — auto self-canonical if blank)</span></label>
                  <input type="url" value={formData.canonicalUrl} onChange={(e) => set('canonicalUrl', e.target.value)} className={inputCls} placeholder="https://www.ezyloan.co.in/blog/..." />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">OG Title</label>
                    <input type="text" value={formData.ogTitle} onChange={(e) => set('ogTitle', e.target.value)} className={inputCls} placeholder="Falls back to SEO/blog title" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">OG Image URL</label>
                    <input type="url" value={formData.ogImage} onChange={(e) => set('ogImage', e.target.value)} className={inputCls} placeholder="Falls back to featured image" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">OG Description</label>
                  <textarea value={formData.ogDescription} onChange={(e) => set('ogDescription', e.target.value)} rows={2} className={inputCls} placeholder="Falls back to SEO description" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                    <input type="text" value={formData.author} onChange={(e) => set('author', e.target.value)} className={inputCls} placeholder="Real author name (trust for financial content)" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Author Bio</label>
                    <input type="text" value={formData.authorBio} onChange={(e) => set('authorBio', e.target.value)} className={inputCls} placeholder="Short professional bio" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SEO checklist — only shown once you've started writing, so a blank
              form isn't greeted with a wall of red. Warnings are tips only and
              never block publishing; only the few red errors do. */}
          {(formData.title.trim() || formData.content.trim()) ? (
            <div className={`rounded-lg p-4 border ${seo.level === 'error' ? 'bg-red-50 border-red-200' : seo.level === 'warning' ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                {seo.level === 'error' ? <XCircle className="h-4 w-4 text-red-600" /> : seo.level === 'warning' ? <AlertTriangle className="h-4 w-4 text-amber-600" /> : <CheckCircle className="h-4 w-4 text-green-600" />}
                <span className="text-sm font-semibold">
                  SEO status: {seo.level === 'error' ? 'Fix required before publishing' : seo.level === 'warning' ? 'Good to publish — optional tips below' : 'All good — ready to publish'}
                </span>
              </div>
              {seo.errors.length > 0 && (
                <ul className="text-sm text-red-700 list-disc pl-5 space-y-0.5 mb-1">
                  {seo.errors.map((x, i) => <li key={`e${i}`}>{x}</li>)}
                </ul>
              )}
              {seo.warnings.length > 0 && (
                <ul className="text-sm text-amber-700 list-disc pl-5 space-y-0.5">
                  {seo.warnings.map((x, i) => <li key={`w${i}`}>💡 {x}</li>)}
                </ul>
              )}
            </div>
          ) : (
            <div className="rounded-lg p-4 border border-gray-200 bg-gray-50 text-sm text-gray-500">
              Start with a <strong>title</strong> and <strong>content</strong> — SEO tips and the publish check will appear here as you type.
            </div>
          )}

          {error && <div className="bg-red-50 text-red-800 p-3 rounded-lg text-sm border border-red-200 whitespace-pre-line">{error}</div>}

          <div className="flex flex-wrap gap-3 pt-2">
            <button type="submit" disabled={isSubmitting || isUploadingImage} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
              {isSubmitting || isUploadingImage ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : <><Save className="h-4 w-4" /> {isEditing ? 'Save Changes' : 'Save as Draft'}</>}
            </button>
            {isEditing && <button type="button" onClick={handleCancel} className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">Cancel</button>}
          </div>
        </form>
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2 mb-3">
        {(['all', 'draft', 'pending', 'published', 'rejected', 'archived'] as const).map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border ${statusFilter === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
            {s === 'all' ? 'All' : BLOG_STATUS_META[s].label} {s === 'all' ? `(${blogs.length})` : `(${counts[s] || 0})`}
          </button>
        ))}
      </div>

      {/* Blogs List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-4 md:p-6 border-b border-gray-200"><h4 className="text-lg font-semibold text-gray-800">Blogs ({filtered.length})</h4></div>
        <div className="overflow-x-auto">
          {loadingBlogs ? (
            <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12"><FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" /><p className="text-gray-500 text-lg">No blogs in this view</p></div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50"><tr>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Blog</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Category</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Date</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr></thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.map((blog) => {
                  const status = (blog.status || 'published') as BlogStatus;
                  const rowSeo = runSeoChecklist({
                    title: blog.title, slug: blog.slug, content: blog.content, excerpt: blog.excerpt,
                    image: blog.image, featuredImageAlt: blog.featuredImageAlt, category: blog.category,
                    author: blog.author, seoTitle: blog.seoTitle, seoDescription: blog.seoDescription,
                    focusKeyword: blog.focusKeyword, canonicalUrl: blog.canonicalUrl,
                  });
                  const dot = rowSeo.level === 'error' ? 'bg-red-500' : rowSeo.level === 'warning' ? 'bg-amber-500' : 'bg-green-500';
                  return (
                    <tr key={blog._id} className="hover:bg-gray-50 align-top">
                      <td className="px-4 md:px-6 py-4">
                        <div className="flex items-center gap-3">
                          {blog.image && <img src={blog.image} alt={blog.featuredImageAlt || blog.title} className="w-12 h-12 rounded object-cover flex-shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 flex items-center gap-2">
                              <span className={`inline-block w-2 h-2 rounded-full ${dot}`} title={`SEO: ${rowSeo.level}`}></span>
                              {blog.title}
                            </p>
                            <p className="text-sm text-gray-500 truncate max-w-xs">{blog.excerpt}</p>
                            {status === 'rejected' && blog.rejectionReason && <p className="text-xs text-red-600 mt-1">Rejected: {blog.rejectionReason}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap"><BlogStatusBadge status={status} /></td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap hidden md:table-cell"><span className="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-800">{blog.category}</span></td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">{new Date(blog.publishedAt || blog.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 md:px-6 py-4">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {status === 'published' && (
                            <a href={`/blog/${blog.slug}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:bg-blue-50 p-1 rounded-full" title="View live"><Eye className="h-4 w-4" /></a>
                          )}
                          {(isAdminUser || status !== 'published') && (
                            <button onClick={() => setSelectedBlog(blog)} className="text-indigo-600 hover:bg-indigo-50 p-1 rounded-full" title="Edit"><Edit className="h-4 w-4" /></button>
                          )}

                          {status === 'draft' && (
                            <button onClick={() => doStatus(blog, 'pending')} className="text-amber-600 hover:bg-amber-50 p-1 rounded-full" title="Submit for review"><Send className="h-4 w-4" /></button>
                          )}
                          {isAdminUser && (status === 'draft' || status === 'pending' || status === 'archived') && (
                            <button onClick={() => doStatus(blog, 'published')} className="text-green-600 hover:bg-green-50 p-1 rounded-full" title={status === 'archived' ? 'Re-publish' : 'Approve & publish'}><CheckCircle className="h-4 w-4" /></button>
                          )}
                          {isAdminUser && status === 'pending' && (
                            <button onClick={() => doStatus(blog, 'rejected')} className="text-red-600 hover:bg-red-50 p-1 rounded-full" title="Reject"><XCircle className="h-4 w-4" /></button>
                          )}
                          {isAdminUser && status === 'published' && (
                            <button onClick={() => doStatus(blog, 'archived')} className="text-slate-600 hover:bg-slate-100 p-1 rounded-full" title="Unpublish (archive)"><Archive className="h-4 w-4" /></button>
                          )}
                          {status === 'rejected' && (
                            <button onClick={() => doStatus(blog, 'draft')} className="text-gray-600 hover:bg-gray-100 p-1 rounded-full" title="Back to draft"><Clock className="h-4 w-4" /></button>
                          )}
                          {(isAdminUser || status !== 'published') && (
                            <button onClick={() => onDeleteBlog(blog._id)} className="text-red-600 hover:bg-red-50 p-1 rounded-full" title="Delete"><Trash2 className="h-4 w-4" /></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
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