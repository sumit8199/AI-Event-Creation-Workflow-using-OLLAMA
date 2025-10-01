import { createCanvas, loadImage, Canvas, CanvasRenderingContext2D } from 'canvas';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { EventDescription, FlyerRequest, FlyerResponse } from '../types';

export class FlyerGenerator {
  private uploadDir: string;

  constructor() {
    this.uploadDir = process.env.UPLOAD_DIR || 'uploads';
    this.ensureUploadDir();
  }

  /**
   * Generate a flyer image based on event description
   */
  async generateFlyer(request: FlyerRequest): Promise<FlyerResponse> {
    try {
      const { eventDescription, style = 'modern', colorScheme, includeQRCode = false } = request;
      
      // Create canvas
      const canvas = createCanvas(800, 1200);
      const ctx = canvas.getContext('2d');
      
      // Apply style and colors
      const colors = this.getColorScheme(style, colorScheme);
      this.drawBackground(ctx, canvas, colors);
      
      // Draw content
      this.drawTitle(ctx, eventDescription.title, colors);
      this.drawDescription(ctx, eventDescription.description, colors);
      this.drawKeyPoints(ctx, eventDescription.keyPoints, colors);
      this.drawEventDetails(ctx, eventDescription, colors);
      
      if (includeQRCode) {
        await this.drawQRCode(ctx, canvas, colors);
      }
      
      // Save image
      const filename = `flyer_${Date.now()}.png`;
      const filepath = join(this.uploadDir, filename);
      const buffer = canvas.toBuffer('image/png');
      writeFileSync(filepath, buffer);
      
      return {
        imagePath: filepath,
        imageUrl: `/uploads/${filename}`,
        metadata: {
          width: canvas.width,
          height: canvas.height,
          format: 'PNG',
          size: buffer.length,
        },
      };
    } catch (error) {
      console.error('Error generating flyer:', error);
      throw new Error(`Failed to generate flyer: ${error}`);
    }
  }

  private ensureUploadDir(): void {
    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  private getColorScheme(style: string, customScheme?: string): any {
    const schemes = {
      modern: {
        primary: '#2563eb',
        secondary: '#1e40af',
        accent: '#3b82f6',
        background: '#ffffff',
        text: '#1f2937',
        lightText: '#6b7280',
      },
      classic: {
        primary: '#dc2626',
        secondary: '#991b1b',
        accent: '#ef4444',
        background: '#fef2f2',
        text: '#1f2937',
        lightText: '#6b7280',
      },
      creative: {
        primary: '#7c3aed',
        secondary: '#5b21b6',
        accent: '#a855f7',
        background: '#faf5ff',
        text: '#1f2937',
        lightText: '#6b7280',
      },
      minimal: {
        primary: '#000000',
        secondary: '#374151',
        accent: '#6b7280',
        background: '#ffffff',
        text: '#000000',
        lightText: '#6b7280',
      },
    };

    return customScheme ? this.parseCustomColorScheme(customScheme) : schemes[style as keyof typeof schemes] || schemes.modern;
  }

  private parseCustomColorScheme(scheme: string): any {
    // Simple parsing for custom color schemes
    const colors = scheme.split(',').map(c => c.trim());
    return {
      primary: colors[0] || '#2563eb',
      secondary: colors[1] || '#1e40af',
      accent: colors[2] || '#3b82f6',
      background: colors[3] || '#ffffff',
      text: colors[4] || '#1f2937',
      lightText: colors[5] || '#6b7280',
    };
  }

  private drawBackground(ctx: CanvasRenderingContext2D, canvas: Canvas, colors: any): void {
    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, colors.background);
    gradient.addColorStop(1, this.lightenColor(colors.background, 0.1));
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Decorative elements
    ctx.fillStyle = this.lightenColor(colors.primary, 0.1);
    ctx.beginPath();
    ctx.arc(canvas.width - 100, 100, 150, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawTitle(ctx: CanvasRenderingContext2D, title: string, colors: any): void {
    ctx.fillStyle = colors.primary;
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(title, 400, 150);
    
    // Underline
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(200, 170);
    ctx.lineTo(600, 170);
    ctx.stroke();
  }

  private drawDescription(ctx: CanvasRenderingContext2D, description: string, colors: any): void {
    ctx.fillStyle = colors.text;
    ctx.font = '20px Arial';
    ctx.textAlign = 'left';
    
    const words = description.split(' ');
    const lines = [];
    let currentLine = '';
    
    for (const word of words) {
      const testLine = currentLine + word + ' ';
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > 600) {
        lines.push(currentLine);
        currentLine = word + ' ';
      } else {
        currentLine = testLine;
      }
    }
    lines.push(currentLine);
    
    lines.forEach((line, index) => {
      ctx.fillText(line, 100, 250 + (index * 30));
    });
  }

  private drawKeyPoints(ctx: CanvasRenderingContext2D, keyPoints: string[], colors: any): void {
    ctx.fillStyle = colors.secondary;
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Key Highlights:', 100, 400);
    
    ctx.fillStyle = colors.text;
    ctx.font = '18px Arial';
    
    keyPoints.forEach((point, index) => {
      ctx.fillText(`• ${point}`, 120, 440 + (index * 30));
    });
  }

  private drawEventDetails(ctx: CanvasRenderingContext2D, eventDescription: EventDescription, colors: any): void {
    const details = [
      `Date: ${eventDescription.suggestedDate}`,
      `Location: ${eventDescription.suggestedLocation}`,
      `Type: ${eventDescription.eventType}`,
      `Audience: ${eventDescription.targetAudience}`,
    ];
    
    ctx.fillStyle = colors.lightText;
    ctx.font = '16px Arial';
    ctx.textAlign = 'left';
    
    details.forEach((detail, index) => {
      ctx.fillText(detail, 100, 600 + (index * 25));
    });
  }

  private async drawQRCode(ctx: CanvasRenderingContext2D, canvas: Canvas, colors: any): Promise<void> {
    // Simple QR code placeholder - in a real implementation, you'd use a QR code library
    ctx.fillStyle = colors.primary;
    ctx.fillRect(canvas.width - 120, canvas.height - 120, 100, 100);
    
    ctx.fillStyle = colors.background;
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('QR Code', canvas.width - 70, canvas.height - 60);
  }

  private lightenColor(color: string, factor: number): string {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    const newR = Math.min(255, Math.floor(r + (255 - r) * factor));
    const newG = Math.min(255, Math.floor(g + (255 - g) * factor));
    const newB = Math.min(255, Math.floor(b + (255 - b) * factor));
    
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  }
}
