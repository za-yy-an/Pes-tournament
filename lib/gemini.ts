import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function generateMatchCommentary(p1: string, p2: string, s1: number, s2: number, walkover: boolean) {
  if (walkover) return `Walkover! ${p1} takes the default win over ${p2}.`;
  
  const prompt = `Write a short, punchy, single-sentence reaction commentary (like a football tweet with emojis) for a tournament match where ${p1} scored ${s1} and ${p2} scored ${s2}.`;
  
  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

export async function analyzeQualifiers(standings: any[], pendingMatches: any[]) {
  const prompt = `
    You are an expert sports data analyst. 
    Here is the current points table (JSON): ${JSON.stringify(standings)}
    Here are the remaining fixtures (JSON): ${JSON.stringify(pendingMatches)}
    
    Analyze the math based on remaining matches (3 points for a win, 1 for a draw). 
    Determine exactly who is:
    1. Mathematically Qualified (Top 4 advance)
    2. In Contention
    3. Eliminated
    
    Return the response in a clean, short Markdown format with bolding. Do not explain your calculations, just give the final verdict.
  `;

  const result = await model.generateContent(prompt);
  return result.response.text();
}
