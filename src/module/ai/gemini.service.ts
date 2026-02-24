import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

@Injectable()
export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');

    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      console.warn('GEMINI_API_KEY is not configured properly.');
    } else {
      this.genAI = new GoogleGenerativeAI(apiKey);
      // Use gemini-2.0-flash which is confirmed to be available for this API key
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    }
  }

  /**
   * Returns true if Gemini is properly configured with an API key
   */
  isConfigured(): boolean {
    return !!this.model;
  }

  async generateText(prompt: string): Promise<string> {
    if (!this.model) {
      throw new InternalServerErrorException('Gemini AI is not configured.');
    }

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      return response.text();
    } catch (error: any) {
      console.error('Gemini API Error:', error);

      if (error?.status === 429) {
        throw new InternalServerErrorException(
          'AI rate limit reached. Please wait a moment and try again later.',
        );
      }

      throw new InternalServerErrorException(
        'Failed to generate content from AI.',
      );
    }
  }

  async generateJsonResponse<T>(prompt: string): Promise<T> {
    const jsonPrompt = `${prompt}\n\nReturn the response strictly as a JSON object. No markdown, no triple backticks.`;
    const text = await this.generateText(jsonPrompt);
    try {
      // Clean up potential markdown if Gemini still adds it despite instructions
      const cleanText = text
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();
      return JSON.parse(cleanText) as T;
    } catch (parseError) {
      console.error('Failed to parse Gemini JSON response:', text, parseError);
      throw new InternalServerErrorException(
        'AI returned invalid JSON format.',
      );
    }
  }
}
