import { Router } from 'express';
import { EventController } from '../controllers/eventController';

const router = Router();
const eventController = new EventController();

// Event description routes
router.post('/description', eventController.generateEventDescription);
router.post('/flyer', eventController.generateFlyer);
router.post('/generate', eventController.generateEventAndFlyer);

// Service status route
router.get('/status', eventController.getServiceStatus);

export default router;
