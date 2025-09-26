import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';

// Fix __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ----------------- MONGOOSE MODELS -----------------
const BannerSchema = new mongoose.Schema({
  image: { type: String, required: true },
  page: { 
    type: String, 
    required: true,
    enum: ['home','about','contact','apply','car-refinance','new-car-loan','personal-loan','property-loan','commercial-vehicle-loan']
  },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Banner = mongoose.model('Banner', BannerSchema);

const ContactSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  loanType: { type: String, required: true },
  loanAmount: { type: String, required: true },
  message: { type: String }
}, { timestamps: true });

const Contact = mongoose.model('Contact', ContactSchema);

const LoanApplicationSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  loanType: { type: String, required: true },
  employmentType: { type: String, required: true },
  city: { type: String, required: true },
  pincode: { type: String, required: true },
  cibilScore: { type: String, required: true },
  status: { type: String, enum: ['pending','approved','rejected'], default: 'pending' }
}, { timestamps: true });

const LoanApplication = mongoose.model('LoanApplication', LoanApplicationSchema);

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}, { timestamps: true });

UserSchema.pre('save', async function(next){
  if(!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.methods.comparePassword = async function(password){
  return bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', UserSchema);

// ----------------- DATABASE CONNECTION -----------------
mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// ----------------- CREATE DEFAULT ADMIN -----------------
const createDefaultAdmin = async () => {
  try {
    const adminExists = await User.findOne({ username: 'pushkar' });
    if (!adminExists) {
      await User.create({ username: 'pushkar', password: 'pushkar3011' });
      console.log('Default admin user created');
    }
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
};
createDefaultAdmin();

// ----------------- AUTH ROUTES -----------------
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if(!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if(!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, user: { id: user._id, username: user.username } });
  } catch(error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Token middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if(!token) return res.status(401).json({ message: 'Access token required' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if(err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

app.get('/api/auth/verify', authenticateToken, (req,res) => {
  res.json({ user: req.user });
});

// ----------------- BANNER ROUTES -----------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, 'uploads')),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'banner-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if(file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files allowed'));
  },
  limits: { fileSize: 10*1024*1024 } // 10MB
});

app.get('/api/banners', async (req,res) => {
  try {
    const { page } = req.query;
    const query = page ? { page } : {};
    const banners = await Banner.find(query).sort({ order: 1, createdAt: -1 });
    res.json(banners);
  } catch(error) {
    res.status(500).json({ message: 'Error fetching banners', error: error.message });
  }
});

app.post('/api/banners', upload.single('image'), async (req,res) => {
  try {
    if(!req.file) return res.status(400).json({ message: 'Image file is required' });

    const banner = new Banner({
      image: `/uploads/${req.file.filename}`,
      page: req.body.page,
      order: req.body.order || 0,
      isActive: req.body.isActive !== undefined ? req.body.isActive : true
    });

    await banner.save();
    res.status(201).json(banner);
  } catch(error) {
    res.status(500).json({ message: 'Error creating banner', error: error.message });
  }
});

app.delete('/api/banners/:id', async (req,res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if(!banner) return res.status(404).json({ message: 'Banner not found' });

    const imagePath = path.join(__dirname, banner.image);
    if(fs.existsSync(imagePath)) fs.unlinkSync(imagePath);

    await Banner.findByIdAndDelete(req.params.id);
    res.json({ message: 'Banner deleted successfully' });
  } catch(error) {
    res.status(500).json({ message: 'Error deleting banner', error: error.message });
  }
});

app.put('/api/banners/:id/order', async (req,res) => {
  try {
    const banner = await Banner.findByIdAndUpdate(req.params.id, { order: req.body.order }, { new: true });
    res.json(banner);
  } catch(error) {
    res.status(500).json({ message: 'Error updating banner order', error: error.message });
  }
});

// ----------------- CONTACT ROUTES -----------------
app.get('/api/contacts', async (req,res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch(error) {
    res.status(500).json({ message: 'Error fetching contacts', error: error.message });
  }
});

app.post('/api/contacts', async (req,res) => {
  try {
    const contact = new Contact(req.body);
    await contact.save();
    res.status(201).json({ message: 'Contact form submitted successfully', contact });
  } catch(error) {
    res.status(500).json({ message: 'Error submitting contact form', error: error.message });
  }
});

app.delete('/api/contacts/:id', async (req,res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ message: 'Contact deleted successfully' });
  } catch(error) {
    res.status(500).json({ message: 'Error deleting contact', error: error.message });
  }
});

// ----------------- LOAN ROUTES -----------------
app.get('/api/loans', async (req,res) => {
  try {
    const loans = await LoanApplication.find().sort({ createdAt: -1 });
    res.json(loans);
  } catch(error) {
    res.status(500).json({ message: 'Error fetching loan applications', error: error.message });
  }
});

app.post('/api/loans', async (req,res) => {
  try {
    const loanApplication = new LoanApplication(req.body);
    await loanApplication.save();
    res.status(201).json({ message: 'Loan application submitted successfully', loanApplication });
  } catch(error) {
    res.status(500).json({ message: 'Error submitting loan application', error: error.message });
  }
});

app.put('/api/loans/:id/status', async (req,res) => {
  try {
    const loan = await LoanApplication.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json(loan);
  } catch(error) {
    res.status(500).json({ message: 'Error updating loan status', error: error.message });
  }
});

app.delete('/api/loans/:id', async (req,res) => {
  try {
    await LoanApplication.findByIdAndDelete(req.params.id);
    res.json({ message: 'Loan application deleted successfully' });
  } catch(error) {
    res.status(500).json({ message: 'Error deleting loan application', error: error.message });
  }
});

// ----------------- START SERVER -----------------
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
