import { createClient } from "npm:@supabase/supabase-js@2";

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
        const waitTime = baseDelay * Math.pow(2, i);
        await delay(waitTime);
        continue;
      }
      throw error;
    }
  }
  
  throw lastError;
}

// Enhanced default questions with better categorization
function generateDefaultQuestions(category: string, difficulty: string, personalInfo?: PersonalInfo): Question[] {
  const questionSets: Record<string, any[]> = {
    dailyTasks: [
      {
        text: personalInfo?.dailyRoutine.length ? 
          `Based on your routine, what's important to do ${personalInfo.dailyRoutine[0]?.toLowerCase().includes('morning') ? 'in the morning' : 'during your daily activities'}?` :
          "What is typically the first thing you do after waking up?",
        options: ["Brush teeth", "Make coffee", "Check phone", "Take a shower"],
        correctAnswer: "Brush teeth"
      },
      {
        text: personalInfo?.favoriteLocations.includes('kitchen') || personalInfo?.interests.includes('cooking') ?
          "In the kitchen, which appliance would you use to heat up leftovers quickly?" :
          "Which appliance would you use to heat up leftovers quickly?",
        options: ["Oven", "Microwave", "Stovetop", "Toaster"],
        correctAnswer: "Microwave"
      },
      {
        text: "What should you do before going to bed?",
        options: ["Brush teeth", "Watch TV", "Drink coffee", "Exercise"],
        correctAnswer: "Brush teeth"
      },
      {
        text: personalInfo?.interests.includes('health') || personalInfo?.interests.includes('fitness') ?
          "As someone interested in health, which is the best morning habit?" :
          "Which is a healthy morning habit?",
        options: ["Drink water", "Skip breakfast", "Check social media", "Stay in bed"],
        correctAnswer: "Drink water"
      },
      {
        text: "What do you typically use to wash dishes?",
        options: ["Dish soap and water", "Just water", "Paper towels", "Hand sanitizer"],
        correctAnswer: "Dish soap and water"
      },
      {
        text: personalInfo?.age && personalInfo.age > 65 ?
          "For someone your age, what's important when taking medication?" :
          "What should you check before taking any medication?",
        options: ["Read the label and dosage", "Take as many as needed", "Mix with other medicines", "Take without water"],
        correctAnswer: "Read the label and dosage"
      }
    ],
    familyRecognition: [
      {
        text: personalInfo?.familyMembers.length ?
          `You mentioned ${personalInfo.familyMembers[0]?.name} as your ${personalInfo.familyMembers[0]?.relation}. Who should you call when you need help?` :
          "Who is typically the person you call when you need help?",
        options: ["Family member", "Stranger", "Nobody", "Emergency services only"],
        correctAnswer: "Family member"
      },
      {
        text: personalInfo?.familyMembers.length ?
          `With ${personalInfo.familyMembers.length} family members you mentioned, what's important to remember about them?` :
          "What information should you remember about family members?",
        options: ["Their names and relationships", "Only their faces", "Just their phone numbers", "Nothing important"],
        correctAnswer: "Their names and relationships"
      },
      {
        text: "How often should you contact close family members?",
        options: ["Regularly", "Never", "Only in emergencies", "Once a year"],
        correctAnswer: "Regularly"
      },
      {
        text: personalInfo?.importantDates.some(d => d.type === 'birthday') ?
          "You mentioned some important birthdays. What should you remember about family birthdays?" :
          "What is important to remember about family birthdays?",
        options: ["The date and person", "Only the month", "Nothing", "Just the year"],
        correctAnswer: "The date and person"
      },
      {
        text: personalInfo?.familyMembers.find(m => m.relation.toLowerCase().includes('spouse')) ?
          "What's important in maintaining a relationship with your spouse/partner?" :
          "What's important in family relationships?",
        options: ["Communication and care", "Avoiding contact", "Only meeting on holidays", "Forgetting about them"],
        correctAnswer: "Communication and care"
      }
    ],
    simpleTasks: [
      {
        text: personalInfo?.favoriteLocations.some(loc => loc.toLowerCase().includes('street') || loc.toLowerCase().includes('downtown')) ?
          "When walking in busy areas like those you mentioned, how do you safely cross a street?" :
          "How do you safely cross a street?",
        options: ["Look both ways first", "Run across quickly", "Close your eyes", "Walk backwards"],
        correctAnswer: "Look both ways first"
      },
      {
        text: "What should you do if you smell gas in your home?",
        options: ["Leave immediately and call for help", "Light a match to see better", "Ignore it", "Open all windows and stay inside"],
        correctAnswer: "Leave immediately and call for help"
      },
      {
        text: personalInfo?.interests.includes('health') ?
          "As someone interested in health, how do you properly wash your hands?" :
          "How do you properly wash your hands?",
        options: ["Soap and water for 20 seconds", "Just rinse with water", "Wipe on clothes", "Use only hand sanitizer"],
        correctAnswer: "Soap and water for 20 seconds"
      },
      {
        text: "What should you do before taking medication?",
        options: ["Read the label and follow instructions", "Take as many as you want", "Mix with other medicines", "Take on an empty stomach always"],
        correctAnswer: "Read the label and follow instructions"
      },
      {
        text: personalInfo?.interests.includes('cooking') ?
          "Since you enjoy cooking, what's the safest way to handle kitchen knives?" :
          "What's the safest way to handle kitchen knives?",
        options: ["Keep them sharp and store safely", "Leave them anywhere", "Use them for everything", "Never clean them"],
        correctAnswer: "Keep them sharp and store safely"
      }
    ],
    memoryExercises: [
      {
        text: personalInfo?.interests.includes('reading') || personalInfo?.interests.includes('writing') ?
          "As someone who enjoys reading/writing, what's a good way to remember important information?" :
          "What is a good way to remember important information?",
        options: ["Write it down", "Hope you remember", "Tell someone else to remember", "Ignore it"],
        correctAnswer: "Write it down"
      },
      {
        text: personalInfo?.age && personalInfo.age > 60 ?
          "At your age, how can you best improve your memory?" :
          "How can you improve your memory?",
        options: ["Practice and repetition", "Sleep all day", "Avoid thinking", "Watch TV constantly"],
        correctAnswer: "Practice and repetition"
      },
      {
        text: "What helps you remember where you put things?",
        options: ["Put them in the same place each time", "Put them anywhere", "Hide them", "Throw them away"],
        correctAnswer: "Put them in the same place each time"
      },
      {
        text: personalInfo?.dailyRoutine.length ?
          "With your daily routine, what's the best way to remember your schedule?" :
          "What's the best way to remember your daily schedule?",
        options: ["Use a calendar or planner", "Just wing it", "Ask others constantly", "Don't make plans"],
        correctAnswer: "Use a calendar or planner"
      }
    ],
    timeOrientation: [
      {
        text: "How many days are in a week?",
        options: ["7", "5", "10", "14"],
        correctAnswer: "7"
      },
      {
        text: "What comes after Wednesday?",
        options: ["Thursday", "Tuesday", "Friday", "Monday"],
        correctAnswer: "Thursday"
      },
      {
        text: "How many months are in a year?",
        options: ["12", "10", "24", "6"],
        correctAnswer: "12"
      },
      {
        text: personalInfo?.importantDates.some(d => d.type === 'holiday') ?
          "You mentioned some important holidays. What season typically has the most holidays?" :
          "What season comes after summer?",
        options: ["Fall/Autumn", "Winter", "Spring", "Summer again"],
        correctAnswer: "Fall/Autumn"
      },
      {
        text: personalInfo?.importantDates.length ?
          `You have ${personalInfo.importantDates.length} important dates. What's the best way to remember them?` :
          "What's the best way to remember important dates?",
        options: ["Write them in a calendar", "Just remember them", "Ask others", "Ignore them"],
        correctAnswer: "Write them in a calendar"
      }
    ]
  };

  const categoryQuestions = questionSets[category] || questionSets.dailyTasks;
  const xpReward = { easy: 10, medium: 20, hard: 30 }[difficulty as 'easy' | 'medium' | 'hard'];

  // Shuffle and return questions
  const shuffled = [...categoryQuestions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 8).map((q, index) => ({
    id: `${category}-${difficulty}-${index}`,
    text: q.text,
    options: [...q.options].sort(() => Math.random() - 0.5), // Shuffle options too
    correctAnswer: q.correctAnswer,
    difficulty: difficulty as 'easy' | 'medium' | 'hard',
    xpReward
  }));
}

// Enhanced prompt generation for better AI responses
function generatePrompt(category: string, difficulty: string, personalInfo?: PersonalInfo): string {
  let basePrompt = `Generate 8 multiple-choice questions about ${category} with ${difficulty} difficulty level for memory training and cognitive exercises.`;
  
  // Add personalization context
  if (personalInfo) {
    let personalContext = "\n\nPersonalization context:\n";
    
    if (personalInfo.age) {
      personalContext += `- Age: ${personalInfo.age} years old\n`;
    }
    
    if (personalInfo.interests.length > 0) {
      personalContext += `- Interests: ${personalInfo.interests.join(', ')}\n`;
    }
    
    if (personalInfo.familyMembers.length > 0) {
      personalContext += `- Family: ${personalInfo.familyMembers.map(f => `${f.name} (${f.relation})`).join(', ')}\n`;
    }
    
    if (personalInfo.dailyRoutine.length > 0) {
      personalContext += `- Daily routine includes: ${personalInfo.dailyRoutine.join(', ')}\n`;
    }
    
    if (personalInfo.favoriteLocations.length > 0) {
      personalContext += `- Favorite places: ${personalInfo.favoriteLocations.join(', ')}\n`;
    }
    
    if (personalInfo.importantDates.length > 0) {
      personalContext += `- Important dates: ${personalInfo.importantDates.map(d => `${d.description} (${d.date})`).join(', ')}\n`;
    }
    
    basePrompt += personalContext;
    basePrompt += "\nPlease incorporate this personal information naturally into the questions when relevant.";
  }
  
  // Add category-specific instructions
  const categoryInstructions: Record<string, string> = {
    dailyTasks: "Focus on everyday activities, self-care, household tasks, and daily routines. Questions should be practical and relevant to independent living.",
    familyRecognition: "Focus on family relationships, social connections, and interpersonal recognition. Include questions about maintaining relationships and remembering important people.",
    simpleTasks: "Focus on basic problem-solving, safety awareness, and simple cognitive tasks. Include practical life skills and decision-making scenarios.",
    memoryExercises: "Focus on memory techniques, recall strategies, and cognitive training exercises. Include questions about improving memory and mental exercises.",
    timeOrientation: "Focus on time concepts, dates, schedules, and temporal relationships. Include questions about calendar awareness and time management."
  };
  
  basePrompt += `\n\n${categoryInstructions[category] || categoryInstructions.dailyTasks}`;
  
  // Add difficulty-specific instructions
  const difficultyInstructions: Record<string, string> = {
    easy: "Keep questions simple and straightforward. Use clear language and obvious correct answers.",
    medium: "Make questions moderately challenging with some complexity. Include scenarios that require basic reasoning.",
    hard: "Create challenging questions that require deeper thinking and complex reasoning. Include multi-step scenarios."
  };
  
  basePrompt += `\n\nDifficulty level (${difficulty}): ${difficultyInstructions[difficulty]}`;
  
  basePrompt += `\n\nFormat each question as a JSON object with:
- text: the question text (personalized when possible)
- options: array of exactly 4 possible answers
- correctAnswer: the correct answer (must exactly match one of the options)

Return a valid JSON array of 8 question objects. Ensure all questions are appropriate for memory training and cognitive health.`;

  return basePrompt;
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

    // Try to use OpenAI API if available
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    
    if (openaiApiKey) {
      try {
        const prompt = generatePrompt(category, difficulty, personalInfo);
        
        const response = await retryWithBackoff(async () => {
          return await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${openaiApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "gpt-3.5-turbo",
              messages: [
                {
                  role: "system",
                  content: "You are a helpful assistant that generates personalized quiz questions for memory training and cognitive health. Always return valid JSON arrays of question objects."
                },
                {
                  role: "user",
                  content: prompt
                }
              ],
              temperature: 0.7,
              max_tokens: 2000,
            }),
          });
        });

        if (response.ok) {
          const data = await response.json();
          const content = data.choices[0]?.message?.content;
          
          if (content) {
            try {
              const rawQuestions = JSON.parse(content);
              if (Array.isArray(rawQuestions) && rawQuestions.length > 0) {
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
              }
            } catch (parseError) {
              console.error("Failed to parse OpenAI response:", parseError);
            }
          }
        }
      } catch (openaiError) {
        console.error("OpenAI API error:", openaiError);
      }
    }

    // Fallback to enhanced default questions with personalization
    console.log("Using enhanced default questions with personalization");
    const questions = generateDefaultQuestions(category, difficulty, personalInfo);
    
    return new Response(JSON.stringify(questions), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });

  } catch (error) {
    console.error("Error generating questions:", error);
    
    // Final fallback
    const fallbackQuestions = generateDefaultQuestions('dailyTasks', 'easy');
    return new Response(JSON.stringify(fallbackQuestions), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }
});