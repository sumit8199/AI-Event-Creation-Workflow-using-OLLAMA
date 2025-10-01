import { Request, Response } from 'express';
import { OLLamaService } from '../services/ollamaService';
import { FlyerGenerator } from '../services/flyerGenerator';
import { EventRequest, EventDescription, FlyerRequest } from '../types';
import Joi from 'joi';

export class EventController {
  private ollamaService: OLLamaService;
  private flyerGenerator: FlyerGenerator;

  constructor() {
    this.ollamaService = new OLLamaService();
    this.flyerGenerator = new FlyerGenerator();
  }

  /**
   * Generate event description from event name
   */
  generateEventDescription = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate request
      const schema = Joi.object({
        eventName: Joi.string().required().min(3).max(100),
        eventType: Joi.string().optional().max(50),
        date: Joi.string().optional(),
        location: Joi.string().optional().max(100),
        additionalDetails: Joi.string().optional().max(500),
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map((detail: any) => detail.message),
        });
        return;
      }

      const eventRequest: EventRequest = value;

      // Check if OLLama service is available
      const isHealthy = await this.ollamaService.checkHealth();
      if (!isHealthy) {
        res.status(503).json({
          success: false,
          message: 'OLLama service is not available. Please ensure OLLama is running.',
        });
        return;
      }

      // Generate event description
      const description = await this.ollamaService.generateEventDescription(
        eventRequest.eventName,
        eventRequest.additionalDetails
      );

      // Parse the description into structured format
      const eventDescription = this.parseEventDescription(description, eventRequest);

      res.json({
        success: true,
        data: eventDescription,
        message: 'Event description generated successfully',
      });
    } catch (error) {
      console.error('Error in generateEventDescription:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Generate flyer for an event
   */
  generateFlyer = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate request
      const schema = Joi.object({
        eventDescription: Joi.object({
          title: Joi.string().required(),
          description: Joi.string().required(),
          keyPoints: Joi.array().items(Joi.string()).required(),
          targetAudience: Joi.string().required(),
          eventType: Joi.string().required(),
          suggestedDate: Joi.string().required(),
          suggestedLocation: Joi.string().required(),
        }).required(),
        style: Joi.string().valid('modern', 'classic', 'creative', 'minimal').optional(),
        colorScheme: Joi.string().optional(),
        includeQRCode: Joi.boolean().optional(),
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map((detail: any) => detail.message),
        });
        return;
      }

      const flyerRequest: FlyerRequest = value;

      // Generate flyer
      const flyerResponse = await this.flyerGenerator.generateFlyer(flyerRequest);

      res.json({
        success: true,
        data: flyerResponse,
        message: 'Flyer generated successfully',
      });
    } catch (error) {
      console.error('Error in generateFlyer:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Generate both event description and flyer in one request
   */
  generateEventAndFlyer = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate request
      const schema = Joi.object({
        eventName: Joi.string().required().min(3).max(100),
        eventType: Joi.string().optional().max(50),
        date: Joi.string().optional(),
        location: Joi.string().optional().max(100),
        additionalDetails: Joi.string().optional().max(500),
        style: Joi.string().valid('modern', 'classic', 'creative', 'minimal').optional(),
        colorScheme: Joi.string().optional(),
        includeQRCode: Joi.boolean().optional(),
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map((detail: any) => detail.message),
        });
        return;
      }

      const { eventName, eventType, date, location, additionalDetails, style, colorScheme, includeQRCode } = value;

      // Check if OLLama service is available
      const isHealthy = await this.ollamaService.checkHealth();
      if (!isHealthy) {
        res.status(503).json({
          success: false,
          message: 'OLLama service is not available. Please ensure OLLama is running.',
        });
        return;
      }

      // Generate event description
      const description = await this.ollamaService.generateEventDescription(eventName, additionalDetails);
      const eventDescription = this.parseEventDescription(description, { eventName, eventType, date, location, additionalDetails });

      // Generate flyer
      const flyerRequest: FlyerRequest = {
        eventDescription,
        style,
        colorScheme,
        includeQRCode,
      };

      const flyerResponse = await this.flyerGenerator.generateFlyer(flyerRequest);

      res.json({
        success: true,
        data: {
          eventDescription,
          flyer: flyerResponse,
        },
        message: 'Event description and flyer generated successfully',
      });
    } catch (error) {
      console.error('Error in generateEventAndFlyer:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Get OLLama service status
   */
  getServiceStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const isHealthy = await this.ollamaService.checkHealth();
      const models = await this.ollamaService.getAvailableModels();

      res.json({
        success: true,
        data: {
          healthy: isHealthy,
          models,
          baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
        },
        message: isHealthy ? 'OLLama service is running' : 'OLLama service is not available',
      });
    } catch (error) {
      console.error('Error in getServiceStatus:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Parse AI-generated description into structured format
   */
  private parseEventDescription(description: string, eventRequest: EventRequest): EventDescription {
    // Simple parsing logic - in a real implementation, you might use more sophisticated NLP
    const lines = description.split('\n').filter(line => line.trim());
    
    const title = eventRequest.eventName;
    const eventDescription = lines.find(line => 
      line.toLowerCase().includes('description') || 
      line.toLowerCase().includes('about')
    ) || lines[1] || 'A wonderful event you won\'t want to miss!';
    
    const keyPoints = lines
      .filter(line => line.includes('•') || line.includes('-') || line.includes('*'))
      .map(line => line.replace(/^[•\-*]\s*/, '').trim())
      .slice(0, 5);
    
    const targetAudience = lines.find(line => 
      line.toLowerCase().includes('audience') || 
      line.toLowerCase().includes('target')
    ) || 'General public';
    
    const eventType = eventRequest.eventType || 'General Event';
    const suggestedDate = eventRequest.date || 'TBD';
    const suggestedLocation = eventRequest.location || 'TBD';

    return {
      title,
      description: eventDescription,
      keyPoints: keyPoints.length > 0 ? keyPoints : ['Exciting activities', 'Great networking opportunities', 'Memorable experience'],
      targetAudience,
      eventType,
      suggestedDate,
      suggestedLocation,
    };
  }
}
