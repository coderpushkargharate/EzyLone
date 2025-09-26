import React, { useState } from "react";
import axios from "axios";

import Footer from "../components/Footer";
import Hero from "../components/HeroSection";

const ApplyNowPage: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    loanType: "",
    employmentType: "",
    city: "",
    pincode: "",
    cibilScore: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  // Handle Input Change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Submit Form Data to API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage("");

    try {
      await axios.post("http://localhost:3001/api/loans", formData);
      setSubmitMessage(
        "✅ Thank you! Your loan application has been submitted successfully. We will contact you soon."
      );

      // Reset form
      setFormData({
        fullName: "",
        phoneNumber: "",
        loanType: "",
        employmentType: "",
        city: "",
        pincode: "",
        cibilScore: "",
      });
    } catch (error) {
      console.error("Error submitting loan application:", error);
      setSubmitMessage(
        "❌ Sorry, there was an error submitting your application. Please try again."
      );
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">

            <div className="max-w-10xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 lg:pt-28 max-sm:pt-32">

{/* Hero Image Section */}
        <div className="relative mb-16 max-w-8xl mx-auto overflow-hidden rounded-2xl shadow-xl">
        {/* Hero */}
      <Hero
        page="apply"
        title="Apply for Loan"
        subtitle="Get quick approval for your loan application"
      />
        </div>
      
    </div>

      {/* Form + Benefits Section */}
      <div className="pt-16 sm:pt-20 lg:pt-24">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Loan Application Form */}
            <div className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg p-8 text-white">
              <h2 className="text-2xl font-bold mb-6">Apply for Your Loan</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Details */}
                <div>
                  <h3 className="font-semibold mb-4 text-blue-100">
                    Personal Details
                  </h3>
                  <div className="space-y-4">
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      placeholder="Enter your full name"
                      className="w-full px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-blue-300 outline-none text-gray-900"
                    />
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      required
                      placeholder="Enter your phone number"
                      className="w-full px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-blue-300 outline-none text-gray-900"
                    />
                  </div>
                </div>

                {/* Loan Type */}
                <div>
                  <h3 className="font-semibold mb-4 text-blue-100">
                    Loan Details
                  </h3>
                  <select
                    name="loanType"
                    value={formData.loanType}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-blue-300 outline-none text-gray-900"
                  >
                    <option value="">Select Loan Type</option>
                    <option value="personal">Personal Loan</option>
                    <option value="car">Car Loan</option>
                    <option value="home">Home Loan</option>
                    <option value="business">Business Loan</option>
                    <option value="property">Property Loan</option>
                    <option value="commercial-vehicle">
                      Commercial Vehicle Loan
                    </option>
                  </select>
                </div>

                {/* Employment */}
                <div>
                  <h3 className="font-semibold mb-4 text-blue-100">
                    Employment Details
                  </h3>
                  <select
                    name="employmentType"
                    value={formData.employmentType}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-blue-300 outline-none text-gray-900"
                  >
                    <option value="">Employment Type</option>
                    <option value="salaried">Salaried</option>
                    <option value="self-employed">Self Employed</option>
                    <option value="business">Business Owner</option>
                    <option value="professional">Professional</option>
                    <option value="retired">Retired</option>
                    <option value="student">Student</option>
                    <option value="housewife">Housewife</option>
                  </select>
                </div>

                {/* Address */}
                <div>
                  <h3 className="font-semibold mb-4 text-blue-100">
                    Address Details
                  </h3>
                  <div className="space-y-4">
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      placeholder="City *"
                      className="w-full px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-blue-300 outline-none text-gray-900"
                    />
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      required
                      placeholder="Pincode *"
                      className="w-full px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-blue-300 outline-none text-gray-900"
                    />
                  </div>
                </div>

                {/* CIBIL */}
                <div>
                  <h3 className="font-semibold mb-4 text-blue-100">
                    Additional Information
                  </h3>
                  <select
                    name="cibilScore"
                    value={formData.cibilScore}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-blue-300 outline-none text-gray-900"
                  >
                    <option value="">CIBIL Score Range</option>
                    <option value="300-549">300-549 (Poor)</option>
                    <option value="550-649">550-649 (Fair)</option>
                    <option value="650-749">650-749 (Good)</option>
                    <option value="750-900">750-900 (Excellent)</option>
                    <option value="not-sure">Not Sure</option>
                  </select>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-white text-blue-600 py-3 px-6 rounded-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting..." : "Submit Application"}
                </button>

                {/* Message */}
                {submitMessage && (
                  <div
                    className={`p-4 rounded-lg ${
                      submitMessage.includes("error")
                        ? "bg-red-50 text-red-800"
                        : "bg-green-50 text-green-800"
                    }`}
                  >
                    {submitMessage}
                  </div>
                )}
              </form>
            </div>

            {/* Right Side - Benefits */}
            <div className="space-y-6 sm:space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                  Why Choose EzyLoan?
                </h2>
                <p className="text-gray-600">
                  Experience hassle-free loan processing with competitive rates
                </p>
              </div>

              {/* Benefits */}
              <div className="space-y-6">
                <BenefitCard
                  iconColor="blue"
                  title="Swift Online Process"
                  desc="Complete your application online in minutes with our streamlined process."
                />
                <BenefitCard
                  iconColor="green"
                  title="Lower Interest Rate"
                  desc="Get competitive interest rates tailored to your financial profile."
                />
                <BenefitCard
                  iconColor="purple"
                  title="Fast and Efficient"
                  desc="Quick approval process with minimal documentation required."
                />
                <BenefitCard
                  iconColor="orange"
                  title="Clear and Transparent"
                  desc="No hidden charges or fees. Complete transparency in all our dealings."
                />
              </div>

              {/* Contact */}
              <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-4 sm:p-6 rounded-xl text-white">
                <h3 className="text-xl font-semibold mb-4">Need Help?</h3>
                <div className="space-y-2">
                  <p className="flex items-center">
                    📞 +91 98765 43210
                  </p>
                  <p className="flex items-center">
                    ✉️ support@ezyloan.com
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

// Reusable Benefit Card Component
const BenefitCard = ({
  iconColor,
  title,
  desc,
}: {
  iconColor: string;
  title: string;
  desc: string;
}) => {
  return (
    <div className="flex items-start space-x-4 p-6 bg-white rounded-xl shadow-lg">
      <div
        className={`w-12 h-12 bg-${iconColor}-100 rounded-full flex items-center justify-center flex-shrink-0`}
      >
        <span className={`text-${iconColor}-600 text-xl`}>✔</span>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600">{desc}</p>
      </div>
    </div>
  );
};

export default ApplyNowPage;
