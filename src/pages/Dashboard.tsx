import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Image, 
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
  X
} from 'lucide-react';
import axios from 'axios';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      navigate('/admin/login');
      return;
    }

    setUser(JSON.parse(userData));
    
    // Verify token
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    axios.get('http://localhost:3001/api/auth/verify')
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/admin/login');
      });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    navigate('/admin/login');
  };

  const menuItems = [
    { name: 'Overview', icon: <LayoutDashboard className="h-5 w-5" />, path: '/admin' },
    { name: 'Banners', icon: <Image className="h-5 w-5" />, path: '/admin/banners' },
    { name: 'Contacts', icon: <MessageSquare className="h-5 w-5" />, path: '/admin/contacts' },
    { name: 'Loan Applications', icon: <FileText className="h-5 w-5" />, path: '/admin/loans' }
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu overlay */}
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
  {/* Header */}
  <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
    <h1 className="text-lg font-bold text-blue-600 tracking-wide">
      EzyLoan Admin
    </h1>
    <button
      onClick={() => setIsMobileMenuOpen(false)}
      className="lg:hidden text-gray-500 hover:text-gray-700"
    >
      <X className="h-6 w-6" />
    </button>
  </div>

  {/* Navigation */}
  <nav className="mt-6 space-y-1">
    {menuItems.map((item) => (
      <Link
        key={item.path}
        to={item.path}
        className={`flex items-center px-6 py-3 text-sm font-medium transition-colors rounded-r-full
          ${
            location.pathname === item.path
              ? "bg-blue-600 text-white shadow-md"
              : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
          }`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <span className="mr-3">{item.icon}</span>
        {item.name}
      </Link>
    ))}
  </nav>

  {/* Footer (User Info + Logout) */}
  <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200">
    <div className="flex items-center space-x-3 mb-4">
      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
        <Users className="h-5 w-5 text-white" />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-800">
          {user.username}
        </p>
        <p className="text-xs text-gray-500">Administrator</p>
      </div>
    </div>
    <button
      onClick={handleLogout}
      className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors"
    >
      <LogOut className="h-4 w-4" />
      <span className="ml-2">Logout</span>
    </button>
  </div>
</div>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-6">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center">
            <h2 className="text-lg font-semibold text-gray-800">
              {menuItems.find(item => item.path === location.pathname)?.name || 'Dashboard'}
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <Routes>
            <Route path="/" element={<DashboardOverview />} />
            <Route path="/banners" element={<BannersManager />} />
            <Route path="/contacts" element={<ContactsManager />} />
            <Route path="/loans" element={<LoansManager />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

// Dashboard Overview Component
const DashboardOverview = () => {
  const [stats, setStats] = useState({
    totalContacts: 0,
    totalLoanApplications: 0,
    pendingApplications: 0,
    totalBanners: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [contacts, loans, banners] = await Promise.all([
        axios.get('http://localhost:3001/api/contacts'),
        axios.get('http://localhost:3001/api/loans'),
        axios.get('http://localhost:3001/api/banners')
      ]);

      setStats({
        totalContacts: contacts.data.length,
        totalLoanApplications: loans.data.length,
        pendingApplications: loans.data.filter((loan: any) => loan.status === 'pending').length,
        totalBanners: banners.data.length
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const statCards = [
    { title: 'Total Contacts', value: stats.totalContacts, color: 'bg-blue-500', icon: <MessageSquare className="h-8 w-8" /> },
    { title: 'Loan Applications', value: stats.totalLoanApplications, color: 'bg-green-500', icon: <FileText className="h-8 w-8" /> },
    { title: 'Pending Applications', value: stats.pendingApplications, color: 'bg-yellow-500', icon: <FileText className="h-8 w-8" /> },
    { title: 'Total Banners', value: stats.totalBanners, color: 'bg-purple-500', icon: <Image className="h-8 w-8" /> }
  ];

  return (
    <div>
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Dashboard Overview</h3>
        <p className="text-gray-600">Welcome to EzyLoan Admin Panel</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
              <div className={`${card.color} p-3 rounded-lg text-white`}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h4>
          <div className="space-y-3">
            <Link to="/admin/banners" className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              <Image className="h-5 w-5 text-blue-600 mr-3" />
              <span className="font-medium text-blue-600">Manage Banners</span>
            </Link>
            <Link to="/admin/contacts" className="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
              <MessageSquare className="h-5 w-5 text-green-600 mr-3" />
              <span className="font-medium text-green-600">View Contacts</span>
            </Link>
            <Link to="/admin/loans" className="flex items-center p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
              <FileText className="h-5 w-5 text-purple-600 mr-3" />
              <span className="font-medium text-purple-600">Review Loan Applications</span>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h4>
          <div className="text-center text-gray-500 py-8">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recent activity to display</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Banners Manager Component
const BannersManager = () => {
  const [banners, setBanners] = useState([]);
  const [selectedPage, setSelectedPage] = useState('home');
  const [isUploading, setIsUploading] = useState(false);

  const pages = [
    { value: 'home', label: 'Home' },
    { value: 'about', label: 'About' },
    { value: 'contact', label: 'Contact' },
    { value: 'apply', label: 'Apply Loan' },
    { value: 'car-refinance', label: 'Car Refinance' },
    { value: 'used-car-refinance', label: 'Used Car Refinance' },
    { value: 'car-balance-transfer', label: 'Car Balance Transfer' },
    { value: 'car-top-up', label: 'Car Top-Up Loan' },
    { value: 'new-car-loan', label: 'New Car Loan' },
    { value: 'personal-loan', label: 'Personal Loan' },
    { value: 'property-loan', label: 'Property Loan' },
    { value: 'commercial-vehicle-loan', label: 'Commercial Vehicle Loan' }
  ];

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/banners');
      setBanners(response.data);
    } catch (error) {
      console.error('Error fetching banners:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size should be less than 5MB');
      return;
    }
    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    formData.append('page', selectedPage);

    try {
      await axios.post('http://localhost:3001/api/banners', formData, {
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
    if (window.confirm('Are you sure you want to delete this banner?')) {
      try {
        await axios.delete(`http://localhost:3001/api/banners/${bannerId}`);
        fetchBanners();
      } catch (error) {
        console.error('Error deleting banner:', error);
      }
    }
  };

  const filteredBanners = banners.filter((banner: any) => banner.page === selectedPage);

  return (
    <div>
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Banner Management</h3>
        <p className="text-gray-600">Manage banners for different pages</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Page</label>
            <select
              value={selectedPage}
              onChange={(e) => setSelectedPage(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {pages.map((page) => (
                <option key={page.value} value={page.value}>{page.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Banner</label>
            <label className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors cursor-pointer">
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? 'Uploading...' : 'Choose Image'}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h4 className="text-lg font-semibold text-gray-800">
            {pages.find(p => p.value === selectedPage)?.label} Banners
          </h4>
        </div>

        <div className="p-6">
          {filteredBanners.length === 0 ? (
            <div className="text-center py-8">
              <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No banners uploaded for this page</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBanners.map((banner: any) => (
                <div key={banner._id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={`http://localhost:3001${banner.image}`}
                    alt="Banner"
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        banner.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {banner.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <button
                        onClick={() => handleDeleteBanner(banner._id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Uploaded on {new Date(banner.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Contacts Manager Component
const ContactsManager = () => {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/contacts');
      setContacts(response.data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await axios.delete(`http://localhost:3001/api/contacts/${contactId}`);
        fetchContacts();
      } catch (error) {
        console.error('Error deleting contact:', error);
      }
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Contact Messages</h3>
        <p className="text-gray-600">Manage customer inquiries and contact messages</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h4 className="text-lg font-semibold text-gray-800">All Contacts ({contacts.length})</h4>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Info</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loan Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contacts.map((contact: any) => (
                <tr key={contact._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{contact.fullName}</p>
                      <p className="text-sm text-gray-500">{contact.email}</p>
                      <p className="text-sm text-gray-500">{contact.phoneNumber}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm text-gray-900">{contact.loanType}</p>
                      <p className="text-sm text-gray-500">{contact.loanAmount}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(contact.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedContact(contact)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteContact(contact._id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {contacts.length === 0 && (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No contact messages found</p>
            </div>
          )}
        </div>
      </div>

      {/* Contact Details Modal */}
      {selectedContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Contact Details</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <p className="text-gray-900">{selectedContact.fullName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="text-gray-900">{selectedContact.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <p className="text-gray-900">{selectedContact.phoneNumber}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Loan Type</label>
                  <p className="text-gray-900">{selectedContact.loanType}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Loan Amount</label>
                  <p className="text-gray-900">{selectedContact.loanAmount}</p>
                </div>
                {selectedContact.message && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Message</label>
                    <p className="text-gray-900">{selectedContact.message}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSelectedContact(null)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Loans Manager Component
const LoansManager = () => {
  const [loans, setLoans] = useState([]);
  const [selectedLoan, setSelectedLoan] = useState(null);

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/loans');
      setLoans(response.data);
    } catch (error) {
      console.error('Error fetching loans:', error);
    }
  };

  const handleStatusUpdate = async (loanId: string, status: string) => {
    try {
      await axios.put(`http://localhost:3001/api/loans/${loanId}/status`, { status });
      fetchLoans();
    } catch (error) {
      console.error('Error updating loan status:', error);
    }
  };

  const handleDeleteLoan = async (loanId: string) => {
    if (window.confirm('Are you sure you want to delete this loan application?')) {
      try {
        await axios.delete(`http://localhost:3001/api/loans/${loanId}`);
        fetchLoans();
      } catch (error) {
        console.error('Error deleting loan:', error);
      }
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Loan Applications</h3>
        <p className="text-gray-600">Manage and review loan applications</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h4 className="text-lg font-semibold text-gray-800">All Applications ({loans.length})</h4>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant Info</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loan Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loans.map((loan: any) => (
                <tr key={loan._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{loan.fullName}</p>
                      <p className="text-sm text-gray-500">{loan.phoneNumber}</p>
                      <p className="text-sm text-gray-500">{loan.city}, {loan.pincode}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm text-gray-900">{loan.loanType}</p>
                      <p className="text-sm text-gray-500">{loan.employmentType}</p>
                      <p className="text-sm text-gray-500">CIBIL: {loan.cibilScore}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      loan.status === 'approved' ? 'bg-green-100 text-green-800' :
                      loan.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(loan.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedLoan(loan)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {loan.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(loan._id, 'approved')}
                            className="text-green-600 hover:text-green-800 transition-colors"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(loan._id, 'rejected')}
                            className="text-red-600 hover:text-red-800 transition-colors"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDeleteLoan(loan._id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {loans.length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No loan applications found</p>
            </div>
          )}
        </div>
      </div>

      {/* Loan Details Modal */}
      {selectedLoan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Loan Application Details</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-800 mb-3">Personal Information</h4>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Full Name</label>
                      <p className="text-gray-900">{selectedLoan.fullName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                      <p className="text-gray-900">{selectedLoan.phoneNumber}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">City</label>
                      <p className="text-gray-900">{selectedLoan.city}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Pincode</label>
                      <p className="text-gray-900">{selectedLoan.pincode}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-3">Loan Information</h4>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Loan Type</label>
                      <p className="text-gray-900">{selectedLoan.loanType}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Employment Type</label>
                      <p className="text-gray-900">{selectedLoan.employmentType}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">CIBIL Score</label>
                      <p className="text-gray-900">{selectedLoan.cibilScore}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        selectedLoan.status === 'approved' ? 'bg-green-100 text-green-800' :
                        selectedLoan.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {selectedLoan.status.charAt(0).toUpperCase() + selectedLoan.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700">Application Date</label>
                <p className="text-gray-900">{new Date(selectedLoan.createdAt).toLocaleString()}</p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-between">
              <div className="space-x-2">
                {selectedLoan.status === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        handleStatusUpdate(selectedLoan._id, 'approved');
                        setSelectedLoan(null);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        handleStatusUpdate(selectedLoan._id, 'rejected');
                        setSelectedLoan(null);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
              <button
                onClick={() => setSelectedLoan(null)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;