import axios, { AxiosInstance } from 'axios';
import { OLLamaResponse, OLLamaError } from '../types';

export class OLLamaService {
  private client: AxiosInstance;
  private baseUrl: string;
  private descriptionModel: string;
  private imageModel: string;

  constructor() {
    this.baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    this.descriptionModel = process.env.OLLAMA_MODEL_DESCRIPTION || 'llama2';
    this.imageModel = process.env.OLLAMA_MODEL_IMAGE || 'llava';
    
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Generate event description using text model
   */
  async generateEventDescription(eventName: string, additionalDetails?: string): Promise<string> {
    try {
      const prompt = this.buildDescriptionPrompt(eventName, additionalDetails);
      
      const response = await this.client.post('/api/generate', {
        model: this.descriptionModel,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 500,
        },
      });

      const data: OLLamaResponse = response.data;
      return data.response.trim();
    } catch (error) {
      console.error('Error generating event description:', error);
      throw new Error(`Failed to generate event description: ${error}`);
    }
  }

  /**
   * Generate flyer description using vision model
   */
  async generateFlyerDescription(eventDescription: string, style: string = 'modern'): Promise<string> {
    try {
      const prompt = this.buildFlyerPrompt(eventDescription, style);
      
      const response = await this.client.post('/api/generate', {
        model: this.imageModel,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.8,
          top_p: 0.9,
          max_tokens: 300,
        },
      });

      const data: OLLamaResponse = response.data;
      return data.response.trim();
    } catch (error) {
      console.error('Error generating flyer description:', error);
      throw new Error(`Failed to generate flyer description: ${error}`);
    }
  }

  /**
   * Check if OLLama service is available
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await this.client.get('/api/tags');
      return response.status === 200;
    } catch (error) {
      console.error('OLLama service is not available:', error);
      return false;
    }
  }

  /**
   * Get available models
   */
  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await this.client.get('/api/tags');
      const models = response.data.models || [];
      return models.map((model: any) => model.name);
    } catch (error) {
      console.error('Error fetching models:', error);
      return [];
    }
  }

  private buildDescriptionPrompt(eventName: string, additionalDetails?: string): string {
    return `You are an expert event planner. Generate a comprehensive event description for "${eventName}".

${additionalDetails ? `Additional details: ${additionalDetails}` : ''}

Please provide a detailed description that includes:
1. A compelling title
2. A detailed description of what the event is about
3. Key points or highlights
4. Target audience
5. Event type/category
6. Suggested date and time
7. Suggested location

Format your response as a structured description that would be suitable for marketing materials.`;
  }

  private buildFlyerPrompt(eventDescription: string, style: string): string {
    return `You are a graphic design expert. Based on this event description, create a detailed flyer design specification:

Event Description: ${eventDescription}

Style: ${style}

Please provide:
1. Color scheme recommendations
2. Typography suggestions
3. Layout structure
4. Visual elements to include
5. Text hierarchy
6. Call-to-action suggestions
7. Overall design concept

Format this as a detailed design brief that can be used to create a professional flyer.`;
  }
}
