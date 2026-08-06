import { GoogleGenerativeAI } from '@google/generative-ai';
import { IncidentSeverity } from '../../models/Incident';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface AIAnalysisResult {
  severity: IncidentSeverity;
  priorityScore: number;
  summary: string;
  tags: string[];
}

export const analyzeIncident = async (description: string, type: string, mediaUrls: string[] = []): Promise<AIAnalysisResult> => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY not set, skipping AI analysis.');
      throw new Error('No API Key');
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    
    const prompt = `
      You are an emergency dispatch AI.
      Analyze the following incident report.
      Type: ${type}
      Description: ${description}
      Has Media Attached: ${mediaUrls.length > 0 ? 'Yes' : 'No'}

      Respond strictly with a JSON object containing the following keys:
      - severity: Must be exactly one of ["Low", "Medium", "High", "Critical"].
      - priorityScore: A number from 1 to 100 representing how urgent this is.
      - summary: A very brief 1-2 sentence summary of the incident for responders.
      - tags: An array of 3-5 relevant string tags (e.g. ["fire", "residential", "evacuation"]).

      Do not include markdown blocks like \`\`\`json, just the raw JSON object.
    `;

    const contents: any[] = [{ text: prompt }];

    // Fetch the first image if available and attach it as inlineData for Gemini Vision
    if (mediaUrls && mediaUrls.length > 0) {
      try {
        const response = await fetch(mediaUrls[0]);
        const arrayBuffer = await response.arrayBuffer();
        const base64Data = Buffer.from(arrayBuffer).toString('base64');
        const mimeType = response.headers.get('content-type') || 'image/jpeg';
        
        contents.push({
          inlineData: {
            data: base64Data,
            mimeType
          }
        });
      } catch (imgErr) {
        console.error('Failed to process image for Gemini:', imgErr);
      }
    }

    const result = await model.generateContent(contents);
    const response = await result.response;
    const text = response.text().trim().replace(/^```json/i, '').replace(/```$/i, '').trim();

    const analysis = JSON.parse(text);
    return {
      severity: (analysis.severity as IncidentSeverity) || IncidentSeverity.Medium,
      priorityScore: analysis.priorityScore || 50,
      summary: analysis.summary || 'Summary unavailable',
      tags: analysis.tags || [],
    };
  } catch (error) {
    console.error('Gemini AI Analysis failed:', error);
    // Fallback if AI fails or no key
    return {
      severity: IncidentSeverity.Medium,
      priorityScore: 50,
      summary: 'AI analysis unavailable. Please review manually.',
      tags: ['unclassified'],
    };
  }
};

export const generateResponseProtocol = async (description: string, type: string, severity: string): Promise<string[]> => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('No API Key');
    }
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    const prompt = `
      You are an emergency command assistant AI.
      Create a step-by-step emergency response protocol (action plan) for first responders based on this incident:
      Type: ${type}
      Description: ${description}
      Severity: ${severity}

      Respond strictly with a JSON array of strings, where each string is a step-by-step instruction (e.g. ["Secure the perimeter", "Deploy suppression gear", ...]).
      Limit to 4-6 highly actionable, clear steps.
      Do not include markdown blocks like \`\`\`json, just the raw JSON array.
    `;
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim().replace(/^```json/i, '').replace(/```$/i, '').trim();
    return JSON.parse(text);
  } catch (error) {
    console.error('Gemini Protocol Generation failed:', error);
    // Fallback response steps
    return [
      'Establish incident command post and assess hazards.',
      'Coordinate safety gear check and deploy to the hot zone.',
      'Secure scene boundaries and evacuate immediate vicinity.',
      'Perform primary rescue and medical triage as needed.',
      'Maintain active communication channel with dispatch headquarters.'
    ];
  }
};
