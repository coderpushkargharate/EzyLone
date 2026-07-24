import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

// Admins (bootstrapped from env) and Employees share this collection.
// - Admins: role 'admin' (default), see every tab.
// - Employees: role 'employee', log in with their email, and only see the tabs
//   listed in `permissions` (an array of admin-panel tab ids).

export interface IUser extends Document {
  username: string;
  email?: string;
  name?: string;
  password: string;
  role: 'admin' | 'employee';
  permissions: string[];
  comparePassword(password: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true },
    // Employees log in with email; admins may not have one. Sparse so multiple
    // admins without an email don't collide on the unique index.
    email: { type: String, trim: true, lowercase: true, unique: true, sparse: true },
    name: { type: String, trim: true },
    password: { type: String, required: true },
    // Defaults to 'admin' so the existing env-bootstrapped admin (which has no
    // role field stored) keeps full access. Employees are created with role
    // explicitly set to 'employee'.
    role: { type: String, enum: ['admin', 'employee'], default: 'admin' },
    permissions: { type: [String], default: [] },
  },
  { timestamps: true }
);

// Hash password whenever it is set/changed.
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.methods.comparePassword = function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

export const User: Model<IUser> =
  (mongoose.models.User as Model<IUser>) || mongoose.model<IUser>('User', UserSchema);
