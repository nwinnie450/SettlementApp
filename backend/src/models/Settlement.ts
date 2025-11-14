import mongoose, { Document, Schema } from 'mongoose';

export interface ISettlement extends Document {
  _id: mongoose.Types.ObjectId;
  groupId: mongoose.Types.ObjectId;
  fromUserId: mongoose.Types.ObjectId;
  toUserId: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  status: 'pending' | 'completed';
  paidAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const settlementSchema = new Schema<ISettlement>(
  {
    groupId: {
      type: Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
      index: true,
    },
    fromUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'From user is required'],
    },
    toUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'To user is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    currency: {
      type: String,
      required: [true, 'Currency is required'],
      uppercase: true,
      length: 3,
    },
    status: {
      type: String,
      enum: ['pending', 'completed'],
      default: 'pending',
      index: true,
    },
    paidAt: {
      type: Date,
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
settlementSchema.index({ groupId: 1, status: 1 });
settlementSchema.index({ fromUserId: 1 });
settlementSchema.index({ toUserId: 1 });

// Remove __v from JSON responses
settlementSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete (ret as any).__v;
    return ret;
  },
});

export const Settlement = mongoose.model<ISettlement>('Settlement', settlementSchema);
