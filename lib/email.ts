import nodemailer, { Transporter } from 'nodemailer';

// Lazily-created shared transporter. Returns null if SMTP creds are absent so
// the app still runs (emails simply skipped) — same behaviour as before.
let transporter: Transporter | null | undefined;

function getTransporter(): Transporter | null {
  if (transporter !== undefined) return transporter;

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('⚠️ Email credentials missing');
    transporter = null;
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '465', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  return transporter;
}

const LEAD_EMAILS = ['contact@ezyloan.co.in', 'cbWR9lQS-PZAJZtsu@v1-incoming-leads.privyr.com'];

// 📧 Welcome/Confirmation Email (Contact & Loan Application submissions)
export async function sendWelcomeEmail(customerName: string, email?: string, submissionType: 'enquiry' | 'loan' = 'enquiry') {
  const t = getTransporter();
  if (!t || !email) return;

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
      </div>`,
  };

  try {
    await t.sendMail(mailOptions);
  } catch (error) {
    console.error('❌ Welcome email error:', error);
  }
}

// 📧 In-Principle Approval Email
export async function sendLoanApprovalEmail(loan: { fullName: string; email?: string }) {
  const t = getTransporter();
  if (!t || !loan.email) return;

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
      </div>`,
  };

  try {
    await t.sendMail(mailOptions);
  } catch (error) {
    console.error('❌ Approval email error:', error);
  }
}

// 📧 Loan Rejection Email
export async function sendLoanRejectionEmail(loan: { fullName: string; email?: string }) {
  const t = getTransporter();
  if (!t || !loan.email) return;

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
      </div>`,
  };

  try {
    await t.sendMail(mailOptions);
  } catch (error) {
    console.error('❌ Rejection email error:', error);
  }
}

// 📧 Admin Notification for Contact Form
export async function sendContactAdminNotification(contactData: any) {
  const t = getTransporter();
  if (!t) return;

  const adminMail = {
    from: process.env.FROM_EMAIL,
    to: LEAD_EMAILS,
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
      </div>`,
  };

  try {
    await t.sendMail(adminMail);
  } catch (error) {
    console.error('❌ Admin contact email error:', error);
  }
}

// 📧 Admin Notification for Loan Application
export async function sendLoanAdminNotification(loanData: any) {
  const t = getTransporter();
  if (!t) return;

  const adminMail = {
    from: process.env.FROM_EMAIL,
    to: LEAD_EMAILS,
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
      </div>`,
  };

  try {
    await t.sendMail(adminMail);
  } catch (error) {
    console.error('❌ Admin loan email error:', error);
  }
}

// 📧 Career Application Email (user confirmation + admin notification)
export async function sendCareerApplicationEmail(applicationData: any) {
  const t = getTransporter();
  if (!t) return;

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
        </div>`,
    };
    try {
      await t.sendMail(userMail);
    } catch (error) {
      console.error('❌ User career email error:', error);
    }
  }

  const adminMail = {
    from: process.env.FROM_EMAIL,
    to: LEAD_EMAILS,
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
      </div>`,
  };

  try {
    await t.sendMail(adminMail);
  } catch (error) {
    console.error('❌ Admin career email error:', error);
  }
}

// 📧 Career Shortlist Email
export async function sendCareerShortlistEmail(application: { fullName: string; email?: string; jobTitle: string }) {
  const t = getTransporter();
  if (!t || !application.email) return;

  try {
    await t.sendMail({
      from: process.env.FROM_EMAIL,
      to: application.email,
      subject: '🎉 Shortlisted! Next Steps - ' + application.jobTitle,
      html: `<h2>Great news, ${application.fullName}!</h2>
             <p>Your application for <strong>${application.jobTitle}</strong> has been shortlisted.</p>
             <p>Our HR team will contact you within 24 hours to schedule the next round.</p>`,
    });
  } catch (error) {
    console.error('❌ Shortlist email error:', error);
  }
}
