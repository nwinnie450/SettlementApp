import mongoose, { Document, Schema } from 'mongoose';

export interface IExpenseSplit {
  userId: mongoose.Types.ObjectId;
  amount: number;
  percentage: number;
}

export interface IExpense extends Document {
  _id: mongoose.Types.ObjectId;
  groupId: mongoose.Types.ObjectId;
  description: string;
  amount: number;
  currency: string;
  baseCurrencyAmount: number;
  category: string;
  date: Date;
  paidBy: mongoose.Types.ObjectId;
  photoUrl?: string;
  splits: IExpenseSplit[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const expenseSplitSchema = new Schema<IExpenseSplit>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0, 'Split amount cannot be negative'],
    },
    percentage: {
      type: Number,
      required: true,
      min: [0, 'Percentage cannot be negative'],
      max: [100, 'Percentage cannot exceed 100'],
    },
  },
  { _id: false }
);

const expenseSchema = new Schema<IExpense>(
  {
    groupId: {
      type: Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters'],
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
    baseCurrencyAmount: {
      type: Number,
      required: true,
      min: [0.01, 'Base currency amount must be greater than 0'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'food',
        'transport',
        'entertainment',
        'utilities',
        'shopping',
        'healthcare',
        'education',
        'travel',
        'housing',
        'other',
      ],
      default: 'other',
    },
    date: {
      type: Date,
      required: true,
      index: true,
      default: Date.now,
    },
    paidBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Paid by is required'],
    },
    photoUrl: {
      type: String,
    },
    splits: {
      type: [expenseSplitSchema],
      required: true,
      validate: {
        validator: function (splits: IExpenseSplit[]) {
          return splits.length > 0;
        },
        message: 'At least one split is required',
      },
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
expenseSchema.index({ groupId: 1, date: -1 });
expenseSchema.index({ paidBy: 1 });
expenseSchema.index({ createdBy: 1 });

// Remove __v from JSON responses
expenseSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete (ret as any).__v;
    return ret;
  },
});

export const Expense = mongoose.model<IExpense>('Expense', expenseSchema);
