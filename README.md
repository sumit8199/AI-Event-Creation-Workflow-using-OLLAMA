# Event Flyer Generator API

A Node.js TypeScript backend service that uses OLLama's multi-model approach to generate event descriptions and create professional flyers.

## Features

- 🤖 **AI-Powered Event Description Generation** using OLLama text models
- 🎨 **Automatic Flyer Generation** with multiple design styles
- 🔄 **Multi-Model Approach** leveraging different OLLama models for different tasks
- 🎯 **RESTful API** with comprehensive error handling
- 📱 **TypeScript** for type safety and better development experience
- 🛡️ **Security** with Helmet, CORS, and input validation
- 📊 **Health Monitoring** and service status endpoints

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- OLLama installed and running locally
- At least one OLLama model (e.g., llama2, llava)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd event-flyer-generator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   # OLLama Configuration
   OLLAMA_BASE_URL=http://localhost:11434
   OLLAMA_MODEL_DESCRIPTION=llama2
   OLLAMA_MODEL_IMAGE=llava

   # Server Configuration
   PORT=3000
   NODE_ENV=development

   # File Upload Configuration
   MAX_FILE_SIZE=10485760
   UPLOAD_DIR=uploads

   # CORS Configuration
   CORS_ORIGIN=http://localhost:4200
   ```

4. **Install and setup OLLama**
   
   Follow the [OLLama installation guide](https://ollama.ai/docs/installation) for your operating system.
   
   Pull the required models:
   ```bash
   ollama pull llama2
   ollama pull llava
   ```

5. **Build the project**
   ```bash
   npm run build
   ```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3000` (or the port specified in your `.env` file).

## API Endpoints

### Health Check
- **GET** `/health` - Check server status

### Event Management
- **POST** `/api/events/description` - Generate event description
- **POST** `/api/events/flyer` - Generate flyer from event description
- **POST** `/api/events/generate` - Generate both description and flyer
- **GET** `/api/events/status` - Check OLLama service status

## API Usage Examples

### 1. Generate Event Description

```bash
curl -X POST http://localhost:3000/api/events/description \
  -H "Content-Type: application/json" \
  -d '{
    "eventName": "Tech Conference 2024",
    "eventType": "Conference",
    "additionalDetails": "Focus on AI and Machine Learning"
  }'
```

### 2. Generate Flyer

```bash
curl -X POST http://localhost:3000/api/events/flyer \
  -H "Content-Type: application/json" \
  -d '{
    "eventDescription": {
      "title": "Tech Conference 2024",
      "description": "A comprehensive conference on AI and ML",
      "keyPoints": ["Expert speakers", "Hands-on workshops", "Networking"],
      "targetAudience": "Developers and AI enthusiasts",
      "eventType": "Conference",
      "suggestedDate": "2024-06-15",
      "suggestedLocation": "Convention Center"
    },
    "style": "modern",
    "includeQRCode": true
  }'
```

### 3. Generate Both Description and Flyer

```bash
curl -X POST http://localhost:3000/api/events/generate \
  -H "Content-Type: application/json" \
  -d '{
    "eventName": "Startup Pitch Night",
    "eventType": "Networking",
    "style": "creative",
    "includeQRCode": true
  }'
```

## Request/Response Schemas

### Event Description Request
```typescript
{
  eventName: string;           // Required
  eventType?: string;          // Optional
  date?: string;              // Optional
  location?: string;          // Optional
  additionalDetails?: string; // Optional
}
```

### Event Description Response
```typescript
{
  success: boolean;
  data: {
    title: string;
    description: string;
    keyPoints: string[];
    targetAudience: string;
    eventType: string;
    suggestedDate: string;
    suggestedLocation: string;
  };
  message: string;
}
```

### Flyer Request
```typescript
{
  eventDescription: EventDescription; // Required
  style?: 'modern' | 'classic' | 'creative' | 'minimal';
  colorScheme?: string;
  includeQRCode?: boolean;
}
```

### Flyer Response
```typescript
{
  success: boolean;
  data: {
    imagePath: string;
    imageUrl: string;
    metadata: {
      width: number;
      height: number;
      format: string;
      size: number;
    };
  };
  message: string;
}
```

## Design Styles

The flyer generator supports four different design styles:

- **Modern**: Clean, contemporary design with blue color scheme
- **Classic**: Traditional design with red color scheme
- **Creative**: Vibrant design with purple color scheme
- **Minimal**: Simple, clean design with black and white

## Error Handling

The API includes comprehensive error handling:

- **400 Bad Request**: Invalid input data
- **503 Service Unavailable**: OLLama service not available
- **500 Internal Server Error**: Server-side errors

All errors return a consistent format:
```typescript
{
  success: false;
  message: string;
  errors?: string[];
}
```

## Development

### Project Structure
```
src/
├── controllers/     # Request handlers
├── middleware/      # Custom middleware
├── routes/         # API routes
├── services/       # Business logic
├── types/          # TypeScript type definitions
├── app.ts          # Express app configuration
└── index.ts        # Application entry point
```

### Available Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run tests

### Adding New Models

To use different OLLama models, update the environment variables:
```env
OLLAMA_MODEL_DESCRIPTION=your-text-model
OLLAMA_MODEL_IMAGE=your-vision-model
```

## Troubleshooting

### OLLama Service Issues
1. Ensure OLLama is running: `ollama serve`
2. Check if models are installed: `ollama list`
3. Verify the base URL in your `.env` file

### Common Issues
- **Port already in use**: Change the PORT in `.env`
- **Canvas module issues**: Ensure you have the required system dependencies
- **Memory issues**: Increase Node.js memory limit if needed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Open an issue on GitHub
