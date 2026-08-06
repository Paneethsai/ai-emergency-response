import { Router } from 'express';
import { protect } from '../middlewares/authMiddleware';
import { 
  getAllIncidents, 
  getUserIncidents, 
  createIncident, 
  getIncidentAnalytics,
  updateIncidentStatus,
  getIncidentResponseProtocol 
} from '../controllers/incidentController';

const router = Router();

// All incident routes require authentication
router.use(protect);

router.get('/', getAllIncidents);
router.get('/user', getUserIncidents);
router.post('/', createIncident);
router.get('/analytics', getIncidentAnalytics);
router.put('/:id/status', updateIncidentStatus);
router.get('/:id/protocol', getIncidentResponseProtocol);

export default router;
