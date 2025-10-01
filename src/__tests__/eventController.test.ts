import { EventController } from '../controllers/eventController';
import { EventRequest } from '../types';

// Mock the services
jest.mock('../services/ollamaService');
jest.mock('../services/flyerGenerator');

describe('EventController', () => {
  let eventController: EventController;
  let mockRequest: any;
  let mockResponse: any;

  beforeEach(() => {
    eventController = new EventController();
    mockRequest = {
      body: {
        eventName: 'Test Event',
        eventType: 'Conference',
        additionalDetails: 'A test event for unit testing',
      },
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe('generateEventDescription', () => {
    it('should validate required fields', async () => {
      mockRequest.body = {};

      await eventController.generateEventDescription(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Validation error',
        errors: expect.any(Array),
      });
    });

    it('should accept valid event request', async () => {
      // Mock the OLLama service
      const mockOLLamaService = require('../services/ollamaService').OLLamaService;
      mockOLLamaService.prototype.checkHealth = jest.fn().mockResolvedValue(true);
      mockOLLamaService.prototype.generateEventDescription = jest.fn().mockResolvedValue('Test description');

      await eventController.generateEventDescription(mockRequest, mockResponse);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
        message: 'Event description generated successfully',
      });
    });
  });
});
