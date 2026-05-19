// AI Service for generating video scripts

// AI Service for generating video scripts via Backend Proxy (Gemini 3.5 Flash)

const BACKEND_AI_PROXY_URL = '/api/generate-script';

// Function to generate a script using an AI model via backend proxy
export async function generateScript(topic) {
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
    const response = await fetch(BACKEND_AI_PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('AI Proxy Error:', errorData);
      throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorData.error || 'Unknown error'}`);
    }

    const data = await response.json();
    if (data.response) {
      return data.response.trim();
    } else {
      console.error('Invalid response structure from AI Proxy:', data);
      throw new Error('Failed to parse script from API response.');
    }
  } catch (error) {
    console.error('Error generating script:', error);
    // Fallback to mock for development if backend fails or is not reachable
    console.warn("Falling back to mock script due to error.");
    return generateMockScript(topic);
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
