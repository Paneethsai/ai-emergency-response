import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Incident, IncidentStatus } from '../models/Incident';
import { analyzeIncident, generateResponseProtocol } from '../services/ai/geminiService';
import { getIO } from '../utils/socket';
import { Notification } from '../models/Notification';

export const getAllIncidents = async (req: Request, res: Response): Promise<void> => {
  try {
    const role = req.user?.role?.toLowerCase();
    let filter = {};
    if (role === 'police') filter = { type: { $in: ['Crime', 'Road_Accident'] } };
    else if (role === 'fire') filter = { type: { $in: ['Fire', 'Building_Collapse', 'Smoke', 'Gas_Leak'] } };
    else if (role === 'ambulance') filter = { type: { $in: ['Medical_Emergency', 'Road_Accident'] } };
    const incidents = await Incident.find(filter).populate('reporterId', 'name email phone').sort({ createdAt: -1 });
    res.status(200).json(incidents);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getUserIncidents = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const incidents = await Incident.find({ reporterId: userId }).sort({ createdAt: -1 });
    res.status(200).json(incidents);
  } catch (error: any) {
    console.error('Error fetching incidents:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createIncident = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { type, description, longitude, latitude, address, media } = req.body;

    if (!type || !description || longitude === undefined || latitude === undefined) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    const aiAnalysis = await analyzeIncident(description, type, media || []);

    const newIncident = await Incident.create({
      reporterId: new mongoose.Types.ObjectId(userId),
      type,
      description,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude],
      },
      address,
      media: media || [],
      aiAnalysis,
      status: IncidentStatus.Pending,
    });

    try {
      getIO().emit('new_incident', newIncident);
    } catch (e) {
      console.error('Socket emission failed:', e);
    }

    // Create a notification for the reporter
    await Notification.create({
      userId,
      title: 'Emergency Reported',
      message: `Your report for ${type.replace('_', ' ')} has been successfully submitted and is under AI analysis.`
    });

    res.status(201).json(newIncident);
  } catch (error: any) {
    console.error('Error creating incident:', error);
    res.status(500).json({ message: 'Failed to create incident', error: error.message });
  }
};

export const getIncidentAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const analytics = await Incident.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);
    const formatted = analytics.map(a => ({ name: a._id, value: a.count }));
    res.status(200).json(formatted);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateIncidentStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const incident = await Incident.findByIdAndUpdate(id, { status }, { new: true });
    if (!incident) {
      res.status(404).json({ message: 'Incident not found' });
      return;
    }

    getIO().emit('status_update', incident);

    if (status === 'Resolved' && incident.reporterId) {
      await Notification.create({
        userId: incident.reporterId,
        title: 'Emergency Resolved',
        message: `Your reported emergency (${incident.type.replace('_', ' ')}) has been successfully resolved by responders.`
      });
    }

    res.status(200).json(incident);
  } catch (error: any) {
    console.error('Error updating status:', error);
    res.status(500).json({ message: 'Failed to update status', error: error.message });
  }
};

export const getIncidentResponseProtocol = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const incidentId = Array.isArray(id) ? id[0] : id;
    if (!mongoose.Types.ObjectId.isValid(incidentId)) {
      res.status(400).json({ message: 'Invalid incident ID' });
      return;
    }

    const incident = await Incident.findById(incidentId);
    if (!incident) {
      res.status(404).json({ message: 'Incident not found' });
      return;
    }

    const protocol = await generateResponseProtocol(
      incident.description,
      incident.type,
      incident.aiAnalysis?.severity || 'Medium'
    );

    res.status(200).json({ protocol });
  } catch (error: any) {
    console.error('Error generating protocol:', error);
    res.status(500).json({ message: 'Failed to generate protocol', error: error.message });
  }
};
