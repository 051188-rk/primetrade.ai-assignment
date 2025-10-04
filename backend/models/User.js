import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, default: '' },
  position: { type: String, default: '' },
  department: { type: String, default: '' },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  avatar: { type: String },
  lastLogin: { type: Date },
  isActive: { type: Boolean, default: true },
  preferences: {
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
    notifications: { type: Boolean, default: true },
    emailNotifications: { type: Boolean, default: true }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.__v;
      return ret;
    }
  }
});

// Pre-save hook to update the updatedAt field
UserSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const User = mongoose.model('User', UserSchema);

export default User;
