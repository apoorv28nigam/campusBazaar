const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  supabaseId: { type: String, unique: true, sparse: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: false }, // Optional for older OTP users, required for new
  avatar: { type: String, default: '' },
  college: { type: String, required: false, trim: true }, // Optional during initial sign up
  course: { type: String, trim: true, default: '' },
  year: { type: String, default: '' },
  bio: { type: String, default: '' },
  phone: { type: String, default: '' },
  isVerified: { type: Boolean, default: false }, // Now false by default until OTP verification
  verificationToken: { type: String },
  rating: { type: Number, default: 0 },
  reviewsCount: { type: Number, default: 0 },
  totalRating: { type: Number, default: 0 },
  savedItems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item' }],
  recentlyViewed: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item' }],
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getAverageRating = function () {
  return this.reviewsCount > 0 ? (this.totalRating / this.reviewsCount).toFixed(1) : 0;
};

module.exports = mongoose.model('User', userSchema);
