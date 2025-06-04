import { createClient } from 'npm:@supabase/supabase-js@2.39.7';
import { Configuration, OpenAIApi } from 'npm:openai@4.28.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface QuestionRequest {
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  personalInfo?: {
    age: number;
    interests: string[];
    familyMembers: { name: string; relation: string }[];
    dailyRoutine: string[];
    importantDates: { date: string; description: string; type: string }[];
    favoriteLocations: string[];
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { category, difficulty, personalInfo }: QuestionRequest = await req.json();

    // Initialize OpenAI
    const configuration = new Configuration({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    });
    const openai = new OpenAIApi(configuration);

    // Construct the prompt based on category and personal info
    let prompt = `Generate 10 multiple-choice questions about ${category} with difficulty level ${difficulty}. `;

    if (personalInfo) {
      prompt += `\nPersonalize the questions for someone who:\n`;
      prompt += `- Is ${personalInfo.age} years old\n`;
      if (personalInfo.interests.length > 0) {
        prompt += `- Is interested in: ${personalInfo.interests.join(', ')}\n`;
      }
      if (personalInfo.familyMembers.length > 0) {
        prompt += `- Has family members: ${personalInfo.familyMembers.map(m => `${m.name} (${m.relation})`).join(', ')}\n`;
      }
      if (personalInfo.dailyRoutine.length > 0) {
        prompt += `- Daily routine includes: ${personalInfo.dailyRoutine.join(', ')}\n`;
      }
      if (personalInfo.importantDates.length > 0) {
        prompt += `- Important dates: ${personalInfo.importantDates.map(d => `${d.description} on ${d.date}`).join(', ')}\n`;
      }
      if (personalInfo.favoriteLocations.length > 0) {
        prompt += `- Favorite locations: ${personalInfo.favoriteLocations.join(', ')}\n`;
      }
    }

    prompt += `\nFormat each question as a JSON object with the following structure:
    {
      "text": "question text",
      "options": ["option1", "option2", "option3", "option4"],
      "correctAnswer": "correct option"
    }
    
    Return an array of 10 such question objects.`;

    // Call OpenAI API
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{
        role: "user",
        content: prompt
      }],
      temperature: 0.7,
    });

    const response = completion.data.choices[0].message?.content || '[]';
    const questions = JSON.parse(response);

    // Add IDs and XP rewards to questions
    const xpRewards = { easy: 10, medium: 20, hard: 30 };
    const formattedQuestions = questions.map((q: any, index: number) => ({
      id: `${category}-${index}`,
      text: q.text,
      options: q.options,
      correctAnswer: q.correctAnswer,
      difficulty,
      xpReward: xpRewards[difficulty]
    }));

    return new Response(JSON.stringify(formattedQuestions), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate questions' }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  }
});