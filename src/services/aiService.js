// AI Service for generating video scripts

// IMPORTANT: API Key Management
// In a production environment, never expose your API key in frontend code.
// This key should be stored securely, typically in a backend environment variable,
// and your frontend should make requests to your backend, which then calls the AI API.
// For Vite, you can use .env files and import.meta.env.VITE_OPENAI_API_KEY
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'; // Or your preferred compatible endpoint

const MOCK_SCRIPT_ENABLED = !OPENAI_API_KEY;

// Function to generate a script using an AI model
export async function generateScript(topic) {
  if (MOCK_SCRIPT_ENABLED) {
    console.warn("OpenAI API key not found. Returning mock script.");
    return generateMockScript(topic);
  }

  const prompt = `
    You are an expert educational content creator.
    Generate a script for an engaging short educational video (around 2-3 minutes) on the topic: "${topic}".
    The script should be structured with clear scenes. Each scene should include:
    - A scene number (e.g., SCENE 1)
    - A brief visual description (e.g., VISUALS: Animated graphic of a brain with neurons firing)
    - Narration or dialogue for that scene. (e.g., NARRATOR: ...)

    Keep the language clear, concise, and accessible for a general audience.
    Ensure the content is accurate and informative.
    The video should have an introduction, a few key points, and a conclusion.
    Output the script directly.
  `;

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo', // Or another model like gpt-4 if available
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7, // Adjust for creativity vs. factuality
        max_tokens: 1000, // Adjust as needed for script length
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API Error:', errorData);
      throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    if (data.choices && data.choices.length > 0 && data.choices[0].message) {
      return data.choices[0].message.content.trim();
    } else {
      console.error('Invalid response structure from OpenAI API:', data);
      throw new Error('Failed to parse script from API response.');
    }
  } catch (error) {
    console.error('Error generating script:', error);
    throw error; // Re-throw to be caught by the caller
  }
}

// Function to generate a mock script for development/testing
function generateMockScript(topic) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`
SCENE 1
VISUALS: Title card: "The Amazing World of ${topic}" with upbeat music.
NARRATOR: Welcome! Today, we're diving into the fascinating world of ${topic}. Get ready to learn something new!

SCENE 2
VISUALS: Animated graphic explaining a key concept of ${topic}.
NARRATOR: One of the most interesting things about ${topic} is [mention a key concept]. Imagine it like this... [simple analogy].

SCENE 3
VISUALS: Quick montage of real-world examples or applications of ${topic}.
NARRATOR: You can see ${topic} in action all around us! For example, [give a real-world example]. And also in [another example].

SCENE 4
VISUALS: A question mark animation, then a summary graphic.
NARRATOR: So, what have we learned? ${topic} is all about [reiterate main point]. It's a fundamental part of [its importance].

SCENE 5
VISUALS: End screen with "Thanks for watching!" and a call to action (e.g., "Learn more at...").
NARRATOR: Thanks for joining us on this quick journey through ${topic}. Keep exploring, and stay curious!
      `.trim());
    }, 1000); // Simulate network delay
  });
}
