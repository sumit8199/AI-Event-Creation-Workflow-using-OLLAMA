export interface EventRequest {
  eventName: string;
  eventType?: string;
  date?: string;
  location?: string;
  additionalDetails?: string;
}

export interface EventDescription {
  title: string;
  description: string;
  keyPoints: string[];
  targetAudience: string;
  eventType: string;
  suggestedDate: string;
  suggestedLocation: string;
}

export interface FlyerRequest {
  eventDescription: EventDescription;
  style?: 'modern' | 'classic' | 'creative' | 'minimal';
  colorScheme?: string;
  includeQRCode?: boolean;
}

export interface FlyerResponse {
  imagePath: string;
  imageUrl: string;
  metadata: {
    width: number;
    height: number;
    format: string;
    size: number;
  };
}

export interface OLLamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
}

export interface OLLamaError {
  error: string;
  code?: number;
}
