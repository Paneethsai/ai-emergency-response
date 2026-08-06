import mongoose, { Document, Schema } from 'mongoose';

export enum UserRole {
  Citizen = 'Citizen',
  Police = 'Police',
  Ambulance = 'Ambulance',
  Fire = 'Fire',
  Disaster_Response = 'Disaster_Response',
  Hospital = 'Hospital',
  Government_Officer = 'Government_Officer',
  Admin = 'Admin',
}

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  id: string;
  firebaseUid: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  currentLocation?: {
    type: string;
    coordinates: number[];
  };
  status: 'Active' | 'Inactive' | 'Busy';
  fcmToken?: string;
}

const userSchema = new Schema<IUser>(
  {
    firebaseUid: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.Citizen,
    },
    phone: { type: String },
    currentLocation: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] },
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Busy'],
      default: 'Active',
    },
    fcmToken: { type: String },
  },
  { timestamps: true }
);

userSchema.index({ currentLocation: '2dsphere' });

export const User = mongoose.model<IUser>('User', userSchema);
