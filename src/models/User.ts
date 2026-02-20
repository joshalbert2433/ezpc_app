import mongoose from 'mongoose';

const CartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, default: 1, min: 1 }
}, { _id: false });

const AddressSchema = new mongoose.Schema({
  label: { type: String, required: true }, // e.g., Home, Office
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  building: { type: String, default: '' }, // e.g., Tower 1, Building Name
  houseUnit: { type: String, default: '' }, // e.g., Unit 1203, House #12
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  isDefault: { type: Boolean, default: false }
}, { timestamps: true });

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  cart: { type: [CartItemSchema], default: [] },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  addresses: { type: [AddressSchema], default: [] }
}, { timestamps: true });

// Force delete the model if it exists to ensure schema updates
if (mongoose.models.User) {
  delete mongoose.models.User;
}

export default mongoose.model('User', UserSchema);
