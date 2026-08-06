import mongoose, { Document, Schema } from 'mongoose';

export enum IncidentSeverity {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Critical = 'Critical',
}

export enum IncidentStatus {
  Pending = 'Pending',
  Dispatched = 'Dispatched',
  InProgress = 'InProgress',
  Resolved = 'Resolved',
  Closed = 'Closed',
}

export interface IIncident extends Document {
  reporterId: mongoose.Types.ObjectId;
  type: string;
  description: string;
  location: {
    type: string;
    coordinates: number[];
  };
  address?: string;
  media: string[];
  aiAnalysis?: {
    severity: IncidentSeverity;
    priorityScore: number;
    summary: string;
    tags: string[];
  };
  assignedResponders: mongoose.Types.ObjectId[];
  status: IncidentStatus;
}

const incidentSchema = new Schema<IIncident>(
  {
    reporterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true },
    description: { type: String, required: true },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true },
    },
    address: { type: String },
    media: [{ type: String }],
    aiAnalysis: {
      severity: { type: String, enum: Object.values(IncidentSeverity) },
      priorityScore: { type: Number },
      summary: { type: String },
      tags: [{ type: String }],
    },
    assignedResponders: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    status: {
      type: String,
      enum: Object.values(IncidentStatus),
      default: IncidentStatus.Pending,
    },
  },
  { timestamps: true }
);

incidentSchema.index({ location: '2dsphere' });
incidentSchema.index({ reporterId: 1 });

export const Incident = mongoose.model<IIncident>('Incident', incidentSchema);
