import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  productId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema: Schema = new Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Product', index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  userName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
}, {
  timestamps: true,
});

// Prevent duplicate reviews from the same user for the same product
ReviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

const Review = mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);

export default Review;
