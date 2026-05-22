// server/index.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import slugify from 'slugify';
import compression from 'compression'; // 🆕 Added for faster responses

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// 🆕 COMPRESSION - Reduces response size by ~60%
app.use(compression({ level: 6, threshold: 1024 }));

// 🆕 CACHE HEADERS - Browser caching for images (instant repeat loads)
app.use((req, res, next) => {
  if (req.path.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/i)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }
  next();
});

// 🔥 Request Logger
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.url}`);
  next();
});

// ===== CLOUDINARY SETUP =====
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Helper: Extract public_id from Cloudinary URL (unchanged)
const extractPublicIdFromUrl = (url) => {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const filename = pathParts[pathParts.length - 1];
    const publicId = filename.split('.')[0];
    const folderPath = pathParts.slice(0, -1).join('/').replace('/image/upload', '');
    return folderPath ? `${folderPath}/${publicId}` : publicId;
  } catch (e) {
    const match = url.match(/\/v\d+\/(.+)\.[a-zA-Z]+$/);
    return match ? match[1] : url;
  }
};

// ===== CORS Configuration =====
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  'https://saddlebrown-gorilla-762394.hostingersite.com',
  'http://72.60.204.205',
  'http://ezyloan.co.in',
  'https://ezyloan.co.in',
  'https://www.ezyloan.co.in',
  'http://srv1050467.hstgr.cloud',
  'https://srv1050467.hstgr.cloud'
].map(origin => origin.trim());

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('CORS policy: Not allowed by server'), false);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ===== EMAIL SERVICE =====
const createTransporter = () => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('⚠️ Email credentials missing');
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

const transporter = createTransporter();

if (transporter) {
  transporter.verify((error) => {
    if (error) console.warn('⚠️ Email config issue:', error.message);
    else console.log('✅ Email service ready');
  });
}

// ===== EMAIL FUNCTIONS =====

// 📧 Welcome/Confirmation Email (for Contact & Loan Application submissions)
const sendWelcomeEmail = async (customerName, email, submissionType = 'enquiry') => {
  if (!transporter || !email) return;

  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to: email,
    subject: submissionType === 'loan' ? 'Loan Enquiry Received - Ezy Loan' : 'Thank you for contacting Ezy Loan!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 650px; margin: auto; padding: 20px; color: #333;">
        <h2 style="color: #1e40af; text-align: center;">Greetings from Ezy Loan!</h2>
        
        <p>Dear ${customerName},</p>
        
        <p>Thank you for showing interest in our loan services. We have successfully received your ${submissionType === 'loan' ? 'loan application' : 'enquiry'}, and our team is currently reviewing the details shared by you.</p>
        
        <p>Please note that <strong>Ezy Loan acts solely as a loan facilitator and not a lender</strong>. We work with multiple Banks/NBFCs to help you find suitable loan options based on your profile.</p>
        
        <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
          <p style="margin: 0 0 10px 0; font-weight: bold;">What Happens Next?</p>
          <ul style="margin: 0; padding-left: 20px;">
            <li>Our representative will contact you shortly for further details, if required.</li>
            <li>We will evaluate your profile with our partner lenders.</li>
            <li>You will be informed about suitable loan options, if eligible.</li>
          </ul>
        </div>
        
        <div style="background: #fef3c7; padding: 12px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <p style="margin: 0 0 8px 0; font-weight: bold; color: #92400e;">Important Information (As per RBI Guidelines):</p>
          <ul style="margin: 0; padding-left: 20px; color: #92400e; font-size: 14px;">
            <li>Submission of enquiry does not guarantee loan approval.</li>
            <li>Final approval depends on the respective Bank/NBFC's policies and verification process.</li>
            <li>No charges are applicable unless clearly communicated and agreed upon.</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="margin: 5px 0;"><strong>For any assistance, feel free to reach us:</strong></p>
          <p style="margin: 5px 0;">📞 +91 6372977626 (Mon–Sat, 9 AM – 8 PM)</p>
          <p style="margin: 5px 0;">💬 WhatsApp Support: Instant assistance available</p>
          <p style="margin: 5px 0;">📧 <a href="mailto:contact@ezyloan.co.in" style="color: #2563eb;">contact@ezyloan.co.in</a></p>
          <p style="margin: 5px 0;">🌐 <a href="https://www.ezyloan.co.in" style="color: #2563eb;">www.ezyloan.co.in</a></p>
        </div>
        
        <p style="margin-top: 25px;">We appreciate your interest and look forward to assisting you.</p>
        
        <p style="margin-top: 30px;">Warm regards,<br><strong>Team Ezy Loan</strong><br><em>(Loan Facilitation Services)</em></p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to ${email}`);
  } catch (error) {
    console.error('❌ Welcome email error:', error);
  }
};

// 📧 In-Principle Approval Email
const sendLoanApprovalEmail = async (loan) => {
  if (!transporter || !loan.email) return;

  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to: loan.email,
    subject: '🎉 In-Principle Loan Approval - Ezy Loan',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 650px; margin: auto; padding: 20px; color: #333;">
        <h2 style="color: #16a34a; text-align: center;">Greetings from Ezy Loan!</h2>
        
        <p>Dear ${loan.fullName},</p>
        
        <p>We are pleased to inform you that based on the preliminary information and documents provided by you, your loan application has received an <strong>in-principle approval</strong>.</p>
        
        <p>Please note that <strong>Ezy Loan acts solely as a loan facilitator and not a lender</strong>. The final loan approval, applicable terms, and disbursement will be determined by our partnered Banks/NBFCs after detailed verification and credit assessment.</p>
        
        <div style="background: #fef3c7; padding: 12px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <p style="margin: 0 0 8px 0; font-weight: bold; color: #92400e;">Important Disclosures (As per RBI Guidelines):</p>
          <ul style="margin: 0; padding-left: 20px; color: #92400e; font-size: 14px;">
            <li>This is an in-principle approval and does not guarantee final sanction or disbursement.</li>
            <li>Final approval is subject to document verification, credit checks, and lender's internal policies.</li>
            <li>Ezy Loan does not charge any upfront fees without prior consent and proper disclosure.</li>
            <li>Applicable charges, if any, will be communicated by the respective lender.</li>
            <li>Customers are advised to carefully read the loan agreement before acceptance.</li>
          </ul>
        </div>
        
        <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e;">
          <p style="margin: 0 0 10px 0; font-weight: bold; color: #166534;">Next Steps:</p>
          <p style="margin: 0;">Our representative will contact you shortly to proceed with further verification and processing.</p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="margin: 5px 0;"><strong>For any assistance, feel free to reach us:</strong></p>
          <p style="margin: 5px 0;">📞 +91 6372977626 (Mon–Sat, 9 AM – 8 PM)</p>
          <p style="margin: 5px 0;">💬 WhatsApp Support: Instant assistance available</p>
          <p style="margin: 5px 0;">📧 <a href="mailto:contact@ezyloan.co.in" style="color: #2563eb;">contact@ezyloan.co.in</a></p>
          <p style="margin: 5px 0;">🌐 <a href="https://www.ezyloan.co.in" style="color: #2563eb;">www.ezyloan.co.in</a></p>
        </div>
        
        <p style="margin-top: 25px;">Thank you for choosing Ezy Loan.</p>
        
        <p style="margin-top: 30px;">Warm regards,<br><strong>Team Ezy Loan</strong><br><em>(Loan Facilitation Services)</em></p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Approval email sent');
  } catch (error) {
    console.error('❌ Email error:', error);
  }
};

// 📧 Loan Rejection Email
const sendLoanRejectionEmail = async (loan) => {
  if (!transporter || !loan.email) return;

  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to: loan.email,
    subject: 'Loan Application Update - Ezy Loan',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 650px; margin: auto; padding: 20px; color: #333;">
        <h2 style="color: #1e40af; text-align: center;">Greetings from Ezy Loan!</h2>
        
        <p>Dear ${loan.fullName},</p>
        
        <p>Thank you for choosing Ezy Loan for your financial requirements.</p>
        
        <p>We regret to inform you that, based on the evaluation conducted by our partnered Banks/NBFCs, your loan application could not be approved at this stage.</p>
        
        <p>Please note that <strong>Ezy Loan acts solely as a loan facilitator and not a lender</strong>. The decision regarding loan approval or rejection is taken by the respective Bank/NBFC based on their internal credit policies, eligibility criteria, and verification process.</p>
        
        <div style="background: #fef3c7; padding: 12px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <p style="margin: 0 0 8px 0; font-weight: bold; color: #92400e;">Important Points (As per RBI Guidelines):</p>
          <ul style="margin: 0; padding-left: 20px; color: #92400e; font-size: 14px;">
            <li>The loan decision is based on factors such as credit profile, repayment capacity, and internal risk assessment of the lender.</li>
            <li>Ezy Loan does not influence or guarantee approval decisions.</li>
            <li>No charges are applicable unless explicitly communicated and agreed upon.</li>
          </ul>
        </div>
        
        <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
          <p style="margin: 0 0 10px 0; font-weight: bold; color: #1e40af;">What You Can Do Next:</p>
          <ul style="margin: 0; padding-left: 20px;">
            <li>You may review your credit score and financial profile.</li>
            <li>You can reapply after improving eligibility criteria.</li>
            <li>Our team can assist you with alternative options, if available.</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="margin: 5px 0;"><strong>For any clarification or assistance, feel free to reach us:</strong></p>
          <p style="margin: 5px 0;">📞 +91 6372977626 (Mon–Sat, 9 AM – 8 PM)</p>
          <p style="margin: 5px 0;">💬 WhatsApp Support: Instant assistance available</p>
          <p style="margin: 5px 0;">📧 <a href="mailto:contact@ezyloan.co.in" style="color: #2563eb;">contact@ezyloan.co.in</a></p>
          <p style="margin: 5px 0;">🌐 <a href="https://www.ezyloan.co.in" style="color: #2563eb;">www.ezyloan.co.in</a></p>
        </div>
        
        <p style="margin-top: 25px;">We appreciate your interest in Ezy Loan and look forward to assisting you in the future.</p>
        
        <p style="margin-top: 30px;">Warm regards,<br><strong>Team Ezy Loan</strong><br><em>(Loan Facilitation Services)</em></p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Rejection email sent');
  } catch (error) {
    console.error('❌ Email error:', error);
  }
};

// 📧 Admin Notification for Contact Form
const sendContactAdminNotification = async (contactData) => {
  if (!transporter) return;

  const adminMail = {
    from: process.env.FROM_EMAIL,
    to: [
      'contact@ezyloan.co.in',
      'cbWR9lQS-PZAJZtsu@v1-incoming-leads.privyr.com'
    ],
    subject: `📩 New Contact Form Submission - ${contactData.fullName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 700px; margin: auto; padding: 20px;">
        <h2 style="color: #1e40af; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">📩 New Contact Submission</h2>
        
        <table style="width: 100%; margin-top: 20px; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; font-weight: bold;">👤 Full Name:</td><td>${contactData.fullName}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold;">📧 Email:</td><td>${contactData.email}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold;">📱 Phone:</td><td>${contactData.phoneNumber}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold;">💼 Loan Type:</td><td>${contactData.loanType}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold;">💰 Loan Amount:</td><td>${contactData.loanAmount}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold; vertical-align: top;">💬 Message:</td><td>${contactData.message || '-'}</td></tr>
        </table>
        
        <hr style="margin: 25px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 13px;">📅 Submitted at: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
        <p style="color: #6b7280; font-size: 13px;">🔗 Manage in Admin: <a href="https://ezyloan.co.in/admin" style="color: #2563eb;">Admin Dashboard</a></p>
      </div>
    `
  };
  
  try {
    await transporter.sendMail(adminMail);
    console.log('✅ Contact notification sent to admin & Privyr');
  } catch (error) {
    console.error('❌ Admin contact email error:', error);
  }
};

// 📧 Admin Notification for Loan Application
const sendLoanAdminNotification = async (loanData) => {
  if (!transporter) return;

  const adminMail = {
    from: process.env.FROM_EMAIL,
    to: [
      'contact@ezyloan.co.in',
      'cbWR9lQS-PZAJZtsu@v1-incoming-leads.privyr.com'
    ],
    subject: `📩 New Loan Application - ${loanData.fullName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 700px; margin: auto; padding: 20px;">
        <h2 style="color: #1e40af; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">📩 New Loan Application</h2>
        
        <table style="width: 100%; margin-top: 20px; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; font-weight: bold;">👤 Full Name:</td><td>${loanData.fullName}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold;">📧 Email:</td><td>${loanData.email || '-'}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold;">📱 Phone:</td><td>${loanData.phoneNumber}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold;">💼 Loan Type:</td><td>${loanData.loanType}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold;">🏢 Employment:</td><td>${loanData.employmentType}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold;">📍 City:</td><td>${loanData.city}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold;">📮 Pincode:</td><td>${loanData.pincode}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold;">📊 CIBIL Score:</td><td>${loanData.cibilScore}</td></tr>
        </table>
        
        <hr style="margin: 25px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 13px;">📅 Submitted at: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
        <p style="color: #6b7280; font-size: 13px;">🔗 Manage in Admin: <a href="https://ezyloan.co.in/admin" style="color: #2563eb;">Admin Dashboard</a></p>
      </div>
    `
  };
  
  try {
    await transporter.sendMail(adminMail);
    console.log('✅ Loan notification sent to admin & Privyr');
  } catch (error) {
    console.error('❌ Admin loan email error:', error);
  }
};

// 📧 Career Application Email (UNCHANGED as requested)
const sendCareerApplicationEmail = async (applicationData) => {
  if (!transporter) return;

  if (applicationData.email) {
    const userMail = {
      from: process.env.FROM_EMAIL,
      to: applicationData.email,
      subject: '✅ Application Received - ' + applicationData.jobTitle + ' | EzyLoan',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e7ff; border-radius: 12px;">
          <h2 style="color: #2563eb; text-align: center;">🎉 Thank You, ${applicationData.fullName}!</h2>
          <p style="color: #374151; font-size: 16px;">We have received your application for <strong>${applicationData.jobTitle}</strong> at EzyLoan.</p>
          
          <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>📋 Application Details:</strong></p>
            <p style="margin: 5px 0;">• Position: ${applicationData.jobTitle}</p>
            <p style="margin: 5px 0;">• Experience: ${applicationData.experience || 'Not specified'}</p>
            <p style="margin: 5px 0;">• Phone: ${applicationData.phoneNumber}</p>
          </div>
          
          <p style="color: #374151;">Our HR team will review your profile and contact you within <strong>3-5 business days</strong>.</p>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">Best regards,<br><strong>EzyLoan HR Team</strong></p>
            <p style="color: #6b7280; font-size: 12px; margin-top: 10px;">📧 contact@ezyloan.co.in | 🌐 ezyloan.co.in</p>
          </div>
        </div>
      `
    };
    try {
      await transporter.sendMail(userMail);
      console.log('✅ Career confirmation sent to user:', applicationData.email);
    } catch (error) {
      console.error('❌ User career email error:', error);
    }
  }

  const adminMail = {
    from: process.env.FROM_EMAIL,
    to: [
      'contact@ezyloan.co.in',
      'cbWR9lQS-PZAJZtsu@v1-incoming-leads.privyr.com'
    ],
    subject: `📩 New Career Application - ${applicationData.jobTitle} - ${applicationData.fullName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 700px; margin: auto; padding: 20px;">
        <h2 style="color: #1e40af; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">🚀 New Job Application Received</h2>
        
        <table style="width: 100%; margin-top: 20px; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; font-weight: bold;">👤 Candidate Name:</td><td>${applicationData.fullName}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold;">📧 Email:</td><td>${applicationData.email}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold;">📱 Phone:</td><td>${applicationData.phoneNumber}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold;">💼 Position Applied:</td><td><strong>${applicationData.jobTitle}</strong></td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold;">⏱ Experience:</td><td>${applicationData.experience || 'Not specified'}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold;">💰 Current CTC:</td><td>${applicationData.currentCTC || 'Not specified'}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold;">📄 Resume:</td><td><a href="${applicationData.resumeUrl}" target="_blank" style="color: #2563eb;">View/Download Resume</a></td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold; vertical-align: top;">💬 Why Hire:</td><td>${applicationData.whyHire || '-'}</td></tr>
        </table>
        
        <div style="background: #fef3c7; padding: 12px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <p style="margin: 0; font-size: 14px; color: #92400e;">⚡ <strong>Quick Actions:</strong> Review profile → Schedule interview → Update status in admin panel</p>
        </div>
        
        <hr style="margin: 25px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 13px;">📅 Submitted at: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
        <p style="color: #6b7280; font-size: 13px;">🔗 Manage in Admin: <a href="https://ezyloan.co.in/admin" style="color: #2563eb;">Admin Dashboard</a></p>
      </div>
    `
  };
  
  try {
    await transporter.sendMail(adminMail);
    console.log('✅ Career notification sent to admin & Privyr');
  } catch (error) {
    console.error('❌ Admin career email error:', error);
  }
};

// ===== MODELS =====

// 🔥 Blog Schema
const blogSchema = new mongoose.Schema({
  title: String,
  slug: { type: String, unique: true },
  content: String,
  excerpt: String,
  category: String,
  image: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const Blog = mongoose.model("Blog", blogSchema);

// Banner Schema
const BannerSchema = new mongoose.Schema({
  image: { type: String, required: true },
  page: { 
    type: String, 
    required: true,
    enum: ['home', 'about', 'contact', 'apply', 'car-refinance', 'used-car-refinance', 'car-balance-transfer', 'car-top-up', 'new-car-loan', 'personal-loan', 'property-loan', 'commercial-vehicle-loan', 'blog']
  },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Contact Schema
const ContactSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  loanType: { type: String, required: true },
  loanAmount: { type: String, required: true },
  message: { type: String }
}, { timestamps: true });

// Loan Application Schema
const LoanApplicationSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String },
  phoneNumber: { type: String, required: true },
  loanType: { type: String, required: true },
  employmentType: { type: String, required: true },
  city: { type: String, required: true },
  pincode: { type: String, required: true },
  cibilScore: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  }
}, { timestamps: true });

// User Schema (Admin)
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}, { timestamps: true });

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

// Job Application Schema (Career)
const JobApplicationSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  jobTitle: { type: String, required: true },
  experience: { type: String },
  currentCTC: { type: String },
  resumeUrl: { type: String },
  resumePublicId: { type: String },
  whyHire: { type: String },
  status: { 
    type: String, 
    enum: ['pending', 'reviewed', 'shortlisted', 'rejected'], 
    default: 'pending' 
  }
}, { timestamps: true });

const Banner = mongoose.model('Banner', BannerSchema);
const Contact = mongoose.model('Contact', ContactSchema);
const LoanApplication = mongoose.model('LoanApplication', LoanApplicationSchema);
const User = mongoose.model('User', UserSchema);
const JobApplication = mongoose.model('JobApplication', JobApplicationSchema);

// ===== AUTH & DB HELPERS =====
const createDefaultAdmin = async () => {
  try {
    const adminExists = await User.findOne({ username: 'EzyLoan' });
    if (!adminExists) {
      await User.create({
        username: 'EzyLoan',
        password: 'Ezysunday@1'
      });
      console.log('✅ Default admin created');
    }
  } catch (error) {
    if (error.code !== 11000) {
      console.error('❌ Admin error:', error);
    }
  }
};

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      dbName: 'mydatabase'
    });
    console.log('✅ MongoDB Atlas Connected');
    
    // 🆕 Create indexes for faster banner queries (background, non-blocking)
    try {
      await Banner.collection.createIndex(
        { page: 1, order: 1, isActive: 1 }, 
        { background: true, name: 'banner_page_order_idx' }
      );
      console.log('✅ Banner indexes created');
    } catch (idxErr) {
      console.warn('⚠️ Index creation warning:', idxErr.message);
    }
    
    // Extra debug listeners
    mongoose.connection.on("connected", () => {
      console.log("🟢 Mongoose connected");
    });
    mongoose.connection.on("error", (err) => {
      console.log("🔴 Mongoose error:", err.message);
    });
    mongoose.connection.on("disconnected", () => {
      console.log("🟡 Mongoose disconnected");
    });
    
    return true;
  } catch (error) {
    console.error('❌ Mongo Error:', error.message);
    return false;
  }
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// ===== MULTER CONFIGURATION =====
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only images allowed'), false);
  },
  limits: { fileSize: 20 * 1024 * 1024 }
});

const resumeStorage = multer.memoryStorage();
const uploadResume = multer({ 
  storage: resumeStorage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, or DOCX files allowed'), false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }
});

// 🔥 BLOG GENERATOR
async function generateBlog() {
  try {
    console.log("🎯 Generating blog...");

    const title = "Personal Loan Guide " + Math.floor(Math.random() * 10000);
    const slug = slugify(title, { lower: true });

    const exists = await Blog.findOne({ slug });
    if (exists) {
      console.log("⚠️ Duplicate blog skipped");
      return null;
    }

    const blog = new Blog({
      title,
      slug,
      category: "Personal Loan",
      excerpt: "Complete guide for personal loans in India.",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d",
      content: `
        <h1>${title}</h1>
        <p>This is auto generated blog.</p>

        <h2>Eligibility</h2>
        <ul>
          <li>Income ₹15,000+</li>
          <li>CIBIL 700+</li>
        </ul>

        <h2>Benefits</h2>
        <ul>
          <li>Quick approval</li>
          <li>Low interest</li>
        </ul>

        <h2>Apply Now</h2>
        <p><a href="https://www.ezyloan.co.in">Apply Here</a></p>
      `
    });

    await blog.save();

    console.log("✅ Blog saved:", title);

    return blog;

  } catch (error) {
    console.log("❌ Generate Error:", error.message);
    return null;
  }
}

// ===== ROUTES =====

// 🔥 BLOG ROUTES
app.get("/api/blogs", async (req, res) => {
  try {
    console.log("📥 Fetching blogs...");
    // 🆕 .lean() for faster queries
    let blogs = await Blog.find().sort({ createdAt: -1 }).lean();
    console.log("📊 Count:", blogs.length);
    if (blogs.length === 0) {
      console.log("⚠️ No blogs → generating...");
      await generateBlog();
      blogs = await Blog.find().sort({ createdAt: -1 }).lean();
    }
    res.json(blogs);
  } catch (error) {
    console.log("❌ Fetch Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/blog/:slug", async (req, res) => {
  try {
    console.log("🔍 Slug:", req.params.slug);
    const blog = await Blog.findOne({ slug: req.params.slug }).lean();
    if (!blog) {
      console.log("❌ Blog not found");
      return res.status(404).json({ error: "Not found" });
    }
    console.log("✅ Blog found");
    res.json(blog);
  } catch (error) {
    console.log("❌ Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/blogs", authenticateToken, async (req, res) => {
  try {
    const { title, slug, excerpt, content, category, image } = req.body;
    
    if (!title || !slug || !excerpt || !content) {
      return res.status(400).json({ message: "Title, slug, excerpt, and content are required" });
    }

    const existing = await Blog.findOne({ slug });
    if (existing) {
      return res.status(400).json({ message: "A blog with this slug already exists" });
    }

    const blog = new Blog({
      title,
      slug,
      excerpt,
      content,
      category: category || "Personal Loan",
      image: image || "https://via.placeholder.com/800x400?text=Blog+Image"
    });

    await blog.save();
    console.log("✅ Blog created:", blog.title);
    res.status(201).json({ message: "Blog created successfully", blog });
    
  } catch (error) {
    console.error("❌ Create blog error:", error);
    res.status(500).json({ message: "Failed to create blog", error: error.message });
  }
});

app.put("/api/blogs/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, slug, excerpt, content, category, image } = req.body;
    
    if (slug) {
      const existing = await Blog.findOne({ slug, _id: { $ne: id } });
      if (existing) {
        return res.status(400).json({ message: "A blog with this slug already exists" });
      }
    }

    const updateData = {
      ...(title && { title }),
      ...(slug && { slug }),
      ...(excerpt && { excerpt }),
      ...(content && { content }),
      ...(category && { category }),
      ...(image && { image })
    };

    const blog = await Blog.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    
    console.log("✅ Blog updated:", blog.title);
    res.json({ message: "Blog updated successfully", blog });
    
  } catch (error) {
    console.error("❌ Update blog error:", error);
    res.status(500).json({ message: "Failed to update blog", error: error.message });
  }
});

app.delete("/api/blogs/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findByIdAndDelete(id);
    
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    
    console.log("✅ Blog deleted:", blog.title);
    res.json({ message: "Blog deleted successfully" });
    
  } catch (error) {
    console.error("❌ Delete blog error:", error);
    res.status(500).json({ message: "Failed to delete blog", error: error.message });
  }
});

// 🔥 Blog Image Upload Endpoint
app.post("/api/blogs/upload-image", authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Image file is required' });
    }

    const streamUpload = (buffer) => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'blogs', resource_type: 'image' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(buffer);
      });
    };

    const result = await streamUpload(req.file.buffer);
    
    res.status(201).json({ 
      message: 'Image uploaded successfully',
      imageUrl: result.secure_url,
      publicId: result.public_id
    });
    
  } catch (error) {
    console.error('❌ Blog image upload error:', error);
    res.status(500).json({ 
      message: 'Failed to upload image', 
      error: error.message 
    });
  }
});

app.get("/api/generate", async (req, res) => {
  console.log("🚀 Manual generate called");
  const blog = await generateBlog();
  res.json({
    success: true,
    blog: blog?.title || "Skipped"
  });
});

// 🔥 AUTH ROUTES
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.json({ token, user: { id: user._id, username: user.username } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/auth/verify', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// 🔥 BANNER ROUTES - ✅ OPTIMIZED (safe version - images unchanged)
app.get('/api/banners', async (req, res) => {
  try {
    const { page } = req.query;
    const query = page ? { page } : {};
    
    // 🆕 ONLY CHANGE: .lean() for 30% faster queries, NO image modification
    const banners = await Banner.find(query)
      .sort({ order: 1, createdAt: -1 })
      .lean(); // Returns plain JS objects - faster, less memory
    
    // ✅ Return banners EXACTLY as stored - no URL changes, all banners show
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching banners', error: error.message });
  }
});

app.post('/api/banners', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file || !req.body.page) {
      return res.status(400).json({ message: 'Image and page required' });
    }
    const streamUpload = (buffer) => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'banners', resource_type: 'image' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(buffer);
      });
    };
    const result = await streamUpload(req.file.buffer);
    const banner = new Banner({
      image: result.secure_url,
      page: req.body.page,
      order: req.body.order || 0,
      isActive: req.body.isActive !== undefined ? req.body.isActive : true
    });
    await banner.save();
    res.status(201).json(banner);
  } catch (error) {
    console.error('Banner error:', error);
    res.status(500).json({ message: 'Error creating banner', error: error.message });
  }
});

app.delete('/api/banners/:id', authenticateToken, async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: 'Banner not found' });
    try {
      const publicId = extractPublicIdFromUrl(banner.image);
      await cloudinary.uploader.destroy(publicId);
      console.log('✅ Deleted image from Cloudinary');
    } catch (cloudinaryError) {
      console.warn('⚠️ Cloudinary delete failed:', cloudinaryError.message);
    }
    await Banner.findByIdAndDelete(req.params.id);
    res.json({ message: 'Banner deleted' });
  } catch (error) {
    console.error('Delete banner error:', error);
    res.status(500).json({ message: 'Error deleting banner', error: error.message });
  }
});

app.put('/api/banners/:id/order', authenticateToken, async (req, res) => {
  try {
    const banner = await Banner.findByIdAndUpdate(
      req.params.id,
      { order: req.body.order },
      { new: true }
    );
    res.json(banner);
  } catch (error) {
    res.status(500).json({ message: 'Error updating order', error: error.message });
  }
});

// 🔥 CONTACT ROUTES
app.get('/api/contacts', authenticateToken, async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching contacts', error: error.message });
  }
});

app.post('/api/contacts', async (req, res) => {
  try {
    const { fullName, email, phoneNumber, loanType, loanAmount } = req.body;
    if (!fullName || !email || !phoneNumber || !loanType || !loanAmount) {
      return res.status(400).json({ message: 'All fields required' });
    }
    const contact = new Contact(req.body);
    await contact.save();
    
    // Send welcome email to user + admin notification
    await Promise.all([
      sendWelcomeEmail(fullName, email, 'enquiry'),
      sendContactAdminNotification(req.body)
    ]);
    
    res.status(201).json({ message: 'Contact submitted', contact });
  } catch (error) {
    console.error('Contact error:', error);
    res.status(500).json({ message: 'Error submitting contact', error: error.message });
  }
});

app.delete('/api/contacts/:id', authenticateToken, async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ message: 'Contact deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting contact', error: error.message });
  }
});

// 🔥 LOAN ROUTES
app.get('/api/loans', authenticateToken, async (req, res) => {
  try {
    const loans = await LoanApplication.find().sort({ createdAt: -1 });
    res.json(loans);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching loans', error: error.message });
  }
});

app.post('/api/loans', async (req, res) => {
  try {
    const { fullName, phoneNumber, loanType, employmentType, city, pincode, cibilScore, email } = req.body;
    if (!fullName || !phoneNumber || !loanType || !employmentType || !city || !pincode || !cibilScore) {
      return res.status(400).json({ message: 'All fields required' });
    }
    const loanApplication = new LoanApplication(req.body);
    await loanApplication.save();
    
    // Send welcome email to user + admin notification
    await Promise.all([
      sendWelcomeEmail(fullName, email, 'loan'),
      sendLoanAdminNotification(req.body)
    ]);
    
    res.status(201).json({ message: 'Loan submitted', loanApplication });
  } catch (error) {
    console.error('Loan error:', error);
    res.status(500).json({ message: 'Error submitting loan', error: error.message });
  }
});

app.put('/api/loans/:id/status', authenticateToken, async (req, res) => {
  try {
    const loan = await LoanApplication.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (req.body.status === 'approved') {
      await sendLoanApprovalEmail(loan);
    } else if (req.body.status === 'rejected') {
      await sendLoanRejectionEmail(loan);
    }
    res.json(loan);
  } catch (error) {
    res.status(500).json({ message: 'Error updating status', error: error.message });
  }
});

app.delete('/api/loans/:id', authenticateToken, async (req, res) => {
  try {
    await LoanApplication.findByIdAndDelete(req.params.id);
    res.json({ message: 'Loan deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting loan', error: error.message });
  }
});

// 🔥 CAREER APPLICATION ROUTES
app.get('/api/careers', authenticateToken, async (req, res) => {
  try {
    const applications = await JobApplication.find().sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching applications', error: error.message });
  }
});

app.post('/api/careers', uploadResume.single('resume'), async (req, res) => {
  try {
    const { fullName, email, phoneNumber, jobTitle, experience, currentCTC, whyHire } = req.body;
    
    if (!fullName || !email || !phoneNumber || !jobTitle) {
      return res.status(400).json({ message: 'Required fields: fullName, email, phoneNumber, jobTitle' });
    }

    let resumeUrl = '';
    let resumePublicId = '';

    if (req.file) {
      const streamUpload = (buffer, originalname) => {
        return new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { 
              folder: 'career-resumes', 
              resource_type: 'raw',
              public_id: `resume_${Date.now()}_${originalname.split('.')[0]}`
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(buffer);
        });
      };
      
      const result = await streamUpload(req.file.buffer, req.file.originalname);
      resumeUrl = result.secure_url;
      resumePublicId = result.public_id;
    }

    const application = new JobApplication({
      fullName,
      email,
      phoneNumber,
      jobTitle,
      experience: experience || '',
      currentCTC: currentCTC || '',
      whyHire: whyHire || '',
      resumeUrl,
      resumePublicId
    });
    
    await application.save();

    // Send emails (non-blocking) - Career email unchanged as requested
    sendCareerApplicationEmail({
      ...application.toObject(),
      resumeUrl
    }).catch(err => console.error('Email send failed:', err));

    res.status(201).json({ 
      message: 'Application submitted successfully! Check your email for confirmation.', 
      applicationId: application._id 
    });

  } catch (error) {
    console.error('Career application error:', error);
    res.status(500).json({ 
      message: 'Error submitting application', 
      error: error.message 
    });
  }
});

app.put('/api/careers/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'reviewed', 'shortlisted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    
    const application = await JobApplication.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (status === 'shortlisted' && application.email && transporter) {
      const shortlistMail = {
        from: process.env.FROM_EMAIL,
        to: application.email,
        subject: '🎉 Shortlisted! Next Steps - ' + application.jobTitle,
        html: `<h2>Great news, ${application.fullName}!</h2>
               <p>Your application for <strong>${application.jobTitle}</strong> has been shortlisted.</p>
               <p>Our HR team will contact you within 24 hours to schedule the next round.</p>`
      };
      transporter.sendMail(shortlistMail).catch(err => console.error('Shortlist email error:', err));
    }

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: 'Error updating status', error: error.message });
  }
});

app.delete('/api/careers/:id', authenticateToken, async (req, res) => {
  try {
    const application = await JobApplication.findById(req.params.id);
    if (!application) return res.status(404).json({ message: 'Application not found' });
    
    if (application.resumePublicId) {
      try {
        await cloudinary.uploader.destroy(application.resumePublicId, { resource_type: 'raw' });
        console.log('✅ Resume deleted from Cloudinary');
      } catch (err) {
        console.warn('⚠️ Cloudinary resume delete failed:', err.message);
      }
    }
    
    await JobApplication.findByIdAndDelete(req.params.id);
    res.json({ message: 'Application deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting application', error: error.message });
  }
});

// 🔥 HEALTH CHECK
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', time: new Date(), message: 'Server running' });
});

// ===== ERROR HANDLING =====
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ===== START SERVER =====
const startServer = async () => {
  let connected = false;
  let attempts = 0;
  const maxAttempts = 3;
  
  while (!connected && attempts < maxAttempts) {
    attempts++;
    console.log(`🔄 Attempting MongoDB connection (attempt ${attempts}/${maxAttempts})...`);
    connected = await connectDB();
    if (!connected && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  if (!connected) {
    console.error('❌ Failed to connect to MongoDB after multiple attempts');
    process.exit(1);
  }
  
  await createDefaultAdmin();
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log("\n==============================");
    console.log("🚀 SERVER STARTED");
    console.log("==============================");
    console.log(`👉 http://localhost:${PORT}`);
    console.log("👉 /api/blogs");
    console.log("👉 /api/blog/:slug");
    console.log("👉 /api/generate");
    console.log("👉 /api/auth/login");
    console.log("👉 /api/banners");
    console.log("👉 /api/contacts");
    console.log("👉 /api/loans");
    console.log("👉 /api/careers");
    console.log("👉 /api/health");
    console.log("==============================\n");
  });
};

startServer();