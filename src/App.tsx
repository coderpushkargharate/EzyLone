import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";
import Loader from "./components/Loader";
import VoiceAssistant from "./components/VoiceAssistant";

// Import pages
import HomePage from "./pages/HomePage";
import UsedCarRefinancePage from "./pages/UsedCarRefinancePage";
import NewCarLoanPage from "./pages/NewCarLoanPage";
import UsedCarBTPage from "./pages/UsedCarBTPage";
import PersonalLoanPage from "./pages/PersonalLoanPage";
import PropertyLoanPage from "./pages/PropertyLoanPage";
import CommercialVehicleLoanPage from "./pages/CommercialVehicleLoanPage";
import EMICalculatorPage from "./pages/EMICalculatorPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import ApplyNowPage from "./pages/ApplyNowPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";

// Import new car loan components
import CarLoanRefinance from "./components/CarLoanRefinance";
import CarLoanTopUp from "./components/CarLoanTopUp";
import CarLoanBalanceTransfer from "./components/CarLoanBalanceTransfer";

// Admin
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";

// Component to handle scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // 2 seconds loading time

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/car-refinance" element={<UsedCarRefinancePage />} />
            <Route path="/car-loan-refinance" element={<CarLoanRefinance />} />
            <Route path="/car-loan-topup" element={<CarLoanTopUp />} />
            <Route
              path="/car-loan-balance-transfer"
              element={<CarLoanBalanceTransfer />}
            />
            <Route path="/new-car-loan" element={<NewCarLoanPage />} />
            <Route path="/used-car-bt" element={<UsedCarBTPage />} />
            <Route path="/personal-loan" element={<PersonalLoanPage />} />
            <Route path="/property-loan" element={<PropertyLoanPage />} />
            <Route
              path="/commercial-vehicle-loan"
              element={<CommercialVehicleLoanPage />}
            />
            <Route path="/emi-calculator" element={<EMICalculatorPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/apply-now" element={<ApplyNowPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<Login />} />
            <Route path="/admin/*" element={<Dashboard />} />
          </Routes>
        </main>

        <Footer />
        <VoiceAssistant />
      </div>
    </Router>
  );
}

export default App;
