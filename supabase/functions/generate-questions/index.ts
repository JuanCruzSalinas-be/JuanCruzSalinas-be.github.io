import { createClient } from "npm:@supabase/supabase-js@2";
import { Configuration, OpenAIApi } from "npm:openai@3.3.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface FamilyMember {
  name: string;
  relation: string;
  birthDate?: string;
}

interface ImportantDate {
  date: string;
  description: string;
  type: 'birthday' | 'anniversary' | 'holiday' | 'other';
}

interface PersonalInfo {
  age: number;
  interests: string[];
  familyMembers: FamilyMember[];
  dailyRoutine: string[];
  importantDates: ImportantDate[];
  favoriteLocations: string[];
}

interface RequestBody {
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  personalInfo?: PersonalInfo;
}

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  xpReward: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    const { category, difficulty, personalInfo } = await req.json() as RequestBody;

    // Initialize OpenAI
    const configuration = new Configuration({
      apiKey: Deno.env.get("OPENAI_API_KEY"),
    });
    const openai = new OpenAIApi(configuration);

    // Create the prompt based on category and difficulty
    const prompt = `Generate 10 multiple-choice questions about ${category} with ${difficulty} difficulty.
    ${personalInfo ? `Personalize the questions using this information: ${JSON.stringify(personalInfo)}` : ''}
    
    Format each question as a JSON object with:
    - text: the question text
    - options: array of 4 possible answers
    - correctAnswer: the correct answer (must be one of the options)
    
    Return an array of these question objects.`;

    // Generate questions using OpenAI
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that generates quiz questions. Always return valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const rawQuestions = JSON.parse(completion.data.choices[0].message?.content || "[]");

    // Format questions with additional fields
    const questions: Question[] = rawQuestions.map((q: any, index: number) => ({
      id: `${category}-${difficulty}-${index}`,
      text: q.text,
      options: q.options,
      correctAnswer: q.correctAnswer,
      difficulty,
      xpReward: { easy: 10, medium: 20, hard: 30 }[difficulty],
    }));

    return new Response(JSON.stringify(questions), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error generating questions:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate questions" }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});