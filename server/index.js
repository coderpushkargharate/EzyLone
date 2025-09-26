// server/index.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Create uploads directory
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// ===== EMAIL SERVICE (Initialize first) =====
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
};

// Email functions
const sendContactConfirmation = async (contactData) => {
    if (!transporter || !contactData.email) return;
    const mailOptions = {
        from: process.env.FROM_EMAIL,
        to: contactData.email,
        subject: 'Thank you for contacting EzyLoan!',
        html: `<h2>Thank you ${contactData.fullName}!</h2>`
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log('✅ Contact email sent');
    } catch (error) {
        console.error('❌ Email error:', error);
    }
};

const sendLoanApplicationConfirmation = async (loanData) => {
    if (!transporter || !loanData.email) return;
    const mailOptions = {
        from: process.env.FROM_EMAIL,
        to: loanData.email,
        subject: 'Loan Application Received',
        html: `<h2>Application Received!</h2>`
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log('✅ Loan confirmation email sent');
    } catch (error) {
        console.error('❌ Email error:', error);
    }
};

const sendLoanApprovalEmail = async (loan) => {
    if (!transporter || !loan.email) return;
    const mailOptions = {
        from: process.env.FROM_EMAIL,
        to: loan.email,
        subject: '🎉 Loan Approved!',
        html: `<h2>Congratulations! Your loan is approved!</h2>`
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log('✅ Approval email sent');
    } catch (error) {
        console.error('❌ Email error:', error);
    }
};

const sendLoanRejectionEmail = async (loan) => {
    if (!transporter || !loan.email) return;
    const mailOptions = {
        from: process.env.FROM_EMAIL,
        to: loan.email,
        subject: 'Loan Application Update',
        html: `<h2>Thank you for your interest</h2>`
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log('✅ Rejection email sent');
    } catch (error) {
        console.error('❌ Email error:', error);
    }
};

// ===== MODELS =====
const BannerSchema = new mongoose.Schema({
    image: { type: String, required: true },
    page: { 
        type: String, 
        required: true,
        enum: ['home', 'about', 'contact', 'apply', 'car-refinance', 'used-car-refinance', 'car-balance-transfer', 'car-top-up', 'new-car-loan', 'personal-loan', 'property-loan', 'commercial-vehicle-loan']
    },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

const ContactSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    loanType: { type: String, required: true },
    loanAmount: { type: String, required: true },
    message: { type: String }
}, { timestamps: true });

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

const Banner = mongoose.model('Banner', BannerSchema);
const Contact = mongoose.model('Contact', ContactSchema);
const LoanApplication = mongoose.model('LoanApplication', LoanApplicationSchema);
const User = mongoose.model('User', UserSchema);

// ===== AUTHENTICATION =====
// Create admin ONLY after DB connection is ready
const createDefaultAdmin = async () => {
    try {
        const adminExists = await User.findOne({ username: 'pushkar' });
        if (!adminExists) {
            await User.create({
                username: 'pushkar',
                password: 'pushkar3011'
            });
            console.log('✅ Default admin created');
        }
    } catch (error) {
        if (error.code !== 11000) {
            console.error('❌ Admin error:', error);
        }
    }
};

// ===== MONGODB CONNECTION WITH RETRY =====
const connectDB = async () => {
    try {
        // Add connection options for better reliability
        await mongoose.connect(process.env.DATABASE_URL, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            maxPoolSize: 10,
            dbName: 'mydatabase'
        });
        console.log('✅ Connected to MongoDB');
        return true;
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        return false;
    }
};

// ===== ROUTES =====
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

// Auth Routes
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

        res.json({
            token,
            user: { id: user._id, username: user.username }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/auth/verify', authenticateToken, (req, res) => {
    res.json({ user: req.user });
});

// Banner Routes
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'banner-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('Only images allowed'), false);
    },
    limits: { fileSize: 10 * 1024 * 1024 }
});

app.get('/api/banners', async (req, res) => {
    try {
        const { page } = req.query;
        const query = page ? { page } : {};
        const banners = await Banner.find(query).sort({ order: 1, createdAt: -1 });
        res.json(banners);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching banners', error: error.message });
    }
});

app.post('/api/banners', upload.single('image'), async (req, res) => {
    try {
        if (!req.file || !req.body.page) {
            return res.status(400).json({ message: 'Image and page required' });
        }

        const banner = new Banner({
            image: `/uploads/${req.file.filename}`,
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

app.delete('/api/banners/:id', async (req, res) => {
    try {
        const banner = await Banner.findById(req.params.id);
        if (!banner) return res.status(404).json({ message: 'Banner not found' });

        const imagePath = path.join(__dirname, banner.image);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }

        await Banner.findByIdAndDelete(req.params.id);
        res.json({ message: 'Banner deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting banner', error: error.message });
    }
});

app.put('/api/banners/:id/order', async (req, res) => {
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

// Contact Routes
app.get('/api/contacts', async (req, res) => {
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
        
        try {
            await sendContactConfirmation(req.body);
        } catch (e) {
            console.error('Email failed:', e);
        }
        
        res.status(201).json({ message: 'Contact submitted', contact });
    } catch (error) {
        console.error('Contact error:', error);
        res.status(500).json({ message: 'Error submitting contact', error: error.message });
    }
});

app.delete('/api/contacts/:id', async (req, res) => {
    try {
        await Contact.findByIdAndDelete(req.params.id);
        res.json({ message: 'Contact deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting contact', error: error.message });
    }
});

// Loan Routes
app.get('/api/loans', async (req, res) => {
    try {
        const loans = await LoanApplication.find().sort({ createdAt: -1 });
        res.json(loans);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching loans', error: error.message });
    }
});

app.post('/api/loans', async (req, res) => {
    try {
        const { fullName, phoneNumber, loanType, employmentType, city, pincode, cibilScore } = req.body;
        if (!fullName || !phoneNumber || !loanType || !employmentType || !city || !pincode || !cibilScore) {
            return res.status(400).json({ message: 'All fields required' });
        }

        const loanApplication = new LoanApplication(req.body);
        await loanApplication.save();
        
        try {
            await sendLoanApplicationConfirmation(req.body);
        } catch (e) {
            console.error('Email failed:', e);
        }
        
        res.status(201).json({ message: 'Loan submitted', loanApplication });
    } catch (error) {
        console.error('Loan error:', error);
        res.status(500).json({ message: 'Error submitting loan', error: error.message });
    }
});

app.put('/api/loans/:id/status', async (req, res) => {
    try {
        const loan = await LoanApplication.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        );
        
        try {
            if (req.body.status === 'approved') {
                await sendLoanApprovalEmail(loan);
            } else if (req.body.status === 'rejected') {
                await sendLoanRejectionEmail(loan);
            }
        } catch (e) {
            console.error('Status email failed:', e);
        }
        
        res.json(loan);
    } catch (error) {
        res.status(500).json({ message: 'Error updating status', error: error.message });
    }
});

app.delete('/api/loans/:id', async (req, res) => {
    try {
        await LoanApplication.findByIdAndDelete(req.params.id);
        res.json({ message: 'Loan deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting loan', error: error.message });
    }
});

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server running' });
});

// Error Handling
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({ 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// 404 Handler
app.use('*', (req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// ===== START SERVER WITH DB CONNECTION =====
const startServer = async () => {
    // Attempt MongoDB connection with retry
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
    
    // Create admin user after successful connection
    await createDefaultAdmin();
    
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`🌐 Website: http://localhost:5173`);
    });
};

startServer();