import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Incident, IncidentStatus, IncidentSeverity } from './models/Incident';
import { connectDB } from './config/db';

dotenv.config();

const seedDB = async () => {
  await connectDB();
  
  await Incident.deleteMany({});
  
  const demoIncidents = [
    {
      type: 'Fire',
      description: 'Large fire at the central market',
      location: { type: 'Point', coordinates: [-74.006, 40.7128] },
      address: 'Central Market, NYC',
      aiAnalysis: { severity: IncidentSeverity.Critical, priorityScore: 95, summary: 'Major fire, immediate evacuation needed.', tags: ['fire', 'market'] },
      status: IncidentStatus.Pending,
    },
    {
      type: 'Road_Accident',
      description: 'Multi-car collision on the highway',
      location: { type: 'Point', coordinates: [-73.935242, 40.730610] },
      address: 'I-95 Northbound',
      aiAnalysis: { severity: IncidentSeverity.High, priorityScore: 80, summary: 'Multiple injuries, traffic blocked.', tags: ['accident', 'highway'] },
      status: IncidentStatus.Dispatched,
    },
    {
      type: 'Medical_Emergency',
      description: 'Heart attack in residential building',
      location: { type: 'Point', coordinates: [-73.985428, 40.748817] },
      address: '123 Main St, Apt 4B',
      aiAnalysis: { severity: IncidentSeverity.High, priorityScore: 85, summary: 'Elderly patient, possible cardiac arrest.', tags: ['medical', 'residential'] },
      status: IncidentStatus.Pending,
    },
    {
      type: 'Crime',
      description: 'Robbery in progress at local bank',
      location: { type: 'Point', coordinates: [-73.968285, 40.785091] },
      address: 'First National Bank, 5th Ave',
      aiAnalysis: { severity: IncidentSeverity.Critical, priorityScore: 90, summary: 'Armed robbery, suspects inside.', tags: ['crime', 'bank', 'armed'] },
      status: IncidentStatus.Pending,
    },
    {
      type: 'Gas_Leak',
      description: 'Strong smell of gas near elementary school',
      location: { type: 'Point', coordinates: [-73.9965, 40.7289] },
      address: 'PS 101, Oak Street',
      aiAnalysis: { severity: IncidentSeverity.High, priorityScore: 88, summary: 'Potential gas leak near school.', tags: ['gas', 'school', 'evacuation'] },
      status: IncidentStatus.Resolved,
    }
  ];

  try {
    for (const data of demoIncidents) {
      await Incident.create({ ...data, reporterId: new mongoose.Types.ObjectId() });
    }
    console.log('Database seeded with demo incidents! You can view them on the dashboards now.');
  } catch (error) {
    console.error('Error seeding DB', error);
  } finally {
    process.exit(0);
  }
};

seedDB();
