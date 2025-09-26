import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Privacy Policy
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Your privacy is important to us. Learn how we collect, use, and protect your information.
            </p>
          </div>
        </div>
      </div>

      {/* Privacy Policy Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            
            {/* Last Updated */}
            <div className="mb-8 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">
                Last Updated: {new Date().toLocaleDateString('en-IN')}
              </p>
            </div>

            {/* Introduction */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Introduction</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                EzyLoan ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our loan services.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site or use our services.
              </p>
            </section>

            {/* Information We Collect */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Information We Collect</h2>
              
              <h3 className="text-xl font-semibold text-gray-700 mb-3">Personal Information</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                We may collect personal information that you provide directly to us, including:
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
                <li>Full name, email address, and phone number</li>
                <li>Date of birth, gender, and marital status</li>
                <li>Employment information and income details</li>
                <li>Address and identification documents (PAN, Aadhar)</li>
                <li>Bank account details and financial information</li>
                <li>Credit score and loan history</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-700 mb-3">Automatically Collected Information</h3>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                <li>IP address and browser information</li>
                <li>Device information and operating system</li>
                <li>Website usage data and cookies</li>
                <li>Location data (with your consent)</li>
              </ul>
            </section>

            {/* How We Use Information */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">How We Use Your Information</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We use the information we collect for various purposes, including:
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                <li>Processing loan applications and providing financial services</li>
                <li>Verifying your identity and conducting credit checks</li>
                <li>Communicating with you about our services</li>
                <li>Improving our website and user experience</li>
                <li>Complying with legal and regulatory requirements</li>
                <li>Preventing fraud and ensuring security</li>
                <li>Marketing our services (with your consent)</li>
              </ul>
            </section>

            {/* Information Sharing */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Information Sharing and Disclosure</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We may share your information in the following circumstances:
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                <li>With lending partners and financial institutions</li>
                <li>With credit bureaus and verification agencies</li>
                <li>With service providers who assist in our operations</li>
                <li>When required by law or legal process</li>
                <li>To protect our rights and prevent fraud</li>
                <li>With your explicit consent</li>
              </ul>
            </section>

            {/* Data Security */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Data Security</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                <li>SSL encryption for data transmission</li>
                <li>Secure servers and databases</li>
                <li>Regular security audits and updates</li>
                <li>Access controls and employee training</li>
                <li>Data backup and recovery procedures</li>
              </ul>
            </section>

            {/* Your Rights */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Rights</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                You have certain rights regarding your personal information:
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                <li>Right to access your personal data</li>
                <li>Right to correct inaccurate information</li>
                <li>Right to delete your data (subject to legal requirements)</li>
                <li>Right to restrict processing</li>
                <li>Right to data portability</li>
                <li>Right to withdraw consent</li>
                <li>Right to object to processing</li>
              </ul>
            </section>

            {/* Cookies */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Cookies and Tracking</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We use cookies and similar tracking technologies to enhance your experience on our website. Cookies help us:
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                <li>Remember your preferences and settings</li>
                <li>Analyze website traffic and usage patterns</li>
                <li>Provide personalized content and advertisements</li>
                <li>Improve website functionality and performance</li>
              </ul>
              <p className="text-gray-600 leading-relaxed">
                You can control cookies through your browser settings, but disabling cookies may affect website functionality.
              </p>
            </section>

            {/* Data Retention */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Data Retention</h2>
              <p className="text-gray-600 leading-relaxed">
                We retain your personal information for as long as necessary to fulfill the purposes outlined in this privacy policy, comply with legal obligations, resolve disputes, and enforce our agreements. The retention period may vary depending on the type of information and applicable legal requirements.
              </p>
            </section>

            {/* Third-Party Links */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Third-Party Links</h2>
              <p className="text-gray-600 leading-relaxed">
                Our website may contain links to third-party websites. We are not responsible for the privacy practices or content of these external sites. We encourage you to review the privacy policies of any third-party websites you visit.
              </p>
            </section>

            {/* Children's Privacy */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Children's Privacy</h2>
              <p className="text-gray-600 leading-relaxed">
                Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children under 18. If you believe we have collected information from a child under 18, please contact us immediately.
              </p>
            </section>

            {/* Changes to Privacy Policy */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Changes to This Privacy Policy</h2>
              <p className="text-gray-600 leading-relaxed">
                We may update this privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page and updating the "Last Updated" date. We encourage you to review this privacy policy periodically for any changes.
              </p>
            </section>

            {/* Contact Information */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Contact Us</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                If you have any questions about this privacy policy or our data practices, please contact us:
              </p>
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="space-y-2">
                  <p className="text-gray-700"><strong>Email:</strong> privacy@ezyloans.com</p>
                  <p className="text-gray-700"><strong>Phone:</strong> +91 9876543210</p>
                  <p className="text-gray-700"><strong>Address:</strong> EzyLoan Financial Services, Mumbai, Maharashtra, India</p>
                </div>
              </div>
            </section>

            {/* Consent */}
            <section className="mb-8">
              <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Your Consent</h3>
                <p className="text-blue-700">
                  By using our website and services, you consent to the collection, use, and disclosure of your information as described in this privacy policy.
                </p>
              </div>
            </section>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PrivacyPolicyPage;