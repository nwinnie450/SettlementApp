import mongoose, { Document, Schema } from 'mongoose';

export interface IGroupMember {
  userId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  role: 'admin' | 'member';
  joinedAt: Date;
  isActive: boolean;
}

export interface IGroup extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  baseCurrency: string;
  members: IGroupMember[];
  inviteCode: string;
  createdBy: mongoose.Types.ObjectId;
  adminIds: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const groupMemberSchema = new Schema<IGroupMember>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member',
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
);

const groupSchema = new Schema<IGroup>(
  {
    name: {
      type: String,
      required: [true, 'Group name is required'],
      trim: true,
      minlength: [3, 'Group name must be at least 3 characters'],
      maxlength: [50, 'Group name cannot exceed 50 characters'],
    },
    description: {
      type: String,
      maxlength: [200, 'Description cannot exceed 200 characters'],
    },
    baseCurrency: {
      type: String,
      required: [true, 'Base currency is required'],
      uppercase: true,
      length: 3,
    },
    members: [groupMemberSchema],
    inviteCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    adminIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes
groupSchema.index({ 'members.userId': 1 });
groupSchema.index({ createdBy: 1 });
groupSchema.index({ inviteCode: 1 });

// Remove __v from JSON responses
groupSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete (ret as any).__v;
    return ret;
  },
});

export const Group = mongoose.model<IGroup>('Group', groupSchema);
