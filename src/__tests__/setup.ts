// Test setup file
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';
process.env.OLLAMA_BASE_URL = 'http://localhost:11434';
process.env.PORT = '3001';
