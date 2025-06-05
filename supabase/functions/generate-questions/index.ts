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

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Retry function with exponential backoff
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      if (error instanceof Error && error.message.includes('429')) {
        // If rate limited, wait with exponential backoff
        const waitTime = baseDelay * Math.pow(2, i);
        await delay(waitTime);
        continue;
      }
      throw error;
    }
  }
  
  throw lastError;
}

// Generate default questions if OpenAI fails
function generateDefaultQuestions(category: string, difficulty: string): Question[] {
  const baseQuestions = [
    {
      text: "What is typically the first thing you do after waking up?",
      options: ["Brush teeth", "Make coffee", "Check phone", "Take a shower"],
      correctAnswer: "Brush teeth"
    },
    {
      text: "Which appliance would you use to heat up leftovers quickly?",
      options: ["Oven", "Microwave", "Stovetop", "Toaster"],
      correctAnswer: "Microwave"
    },
    // Add more default questions as needed
  ];

  return baseQuestions.map((q, index) => ({
    id: `${category}-${difficulty}-${index}`,
    ...q,
    difficulty: difficulty as 'easy' | 'medium' | 'hard',
    xpReward: { easy: 10, medium: 20, hard: 30 }[difficulty as 'easy' | 'medium' | 'hard']
  }));
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

    // If no OpenAI key is available, return default questions
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      console.log("No OpenAI API key found, using default questions");
      return new Response(
        JSON.stringify(generateDefaultQuestions(category, difficulty)),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Initialize OpenAI
    const configuration = new Configuration({ apiKey });
    const openai = new OpenAIApi(configuration);

    // Create the prompt based on category and difficulty
    const prompt = `Generate 10 multiple-choice questions about ${category} with ${difficulty} difficulty.
    ${personalInfo ? `Personalize the questions using this information: ${JSON.stringify(personalInfo)}` : ''}
    
    Format each question as a JSON object with:
    - text: the question text
    - options: array of 4 possible answers
    - correctAnswer: the correct answer (must be one of the options)
    
    Return an array of these question objects.`;

    // Generate questions using OpenAI with retry logic
    const completion = await retryWithBackoff(async () => {
      return await openai.createChatCompletion({
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
        temperature: 0.7,
        max_tokens: 2000,
      });
    });

    const content = completion.data.choices[0].message?.content;
    if (!content) {
      console.log("No content in OpenAI response, using default questions");
      return new Response(
        JSON.stringify(generateDefaultQuestions(category, difficulty)),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    let rawQuestions;
    try {
      rawQuestions = JSON.parse(content);
      if (!Array.isArray(rawQuestions)) {
        throw new Error("OpenAI response is not an array");
      }
    } catch (error) {
      console.error("Failed to parse OpenAI response:", error);
      return new Response(
        JSON.stringify(generateDefaultQuestions(category, difficulty)),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

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
      JSON.stringify(generateDefaultQuestions(category, 'easy')),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});