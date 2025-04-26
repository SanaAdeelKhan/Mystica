// netlify/functions/quiz.js

require('dotenv').config();  // Load environment variables
const fetch = require('node-fetch');

const AIML_API_KEY = process.env.AIML_API_KEY;

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { prompt, age, subject } = body;

    if (!AIML_API_KEY) {
      throw new Error('AIML_API_KEY is missing');
    }

    // Example how you might call AIML API (adjust URL based on your provider)
    const response = await fetch('https://api.aimlapi.com/v1/quiz', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AIML_API_KEY}`,
      },
      body: JSON.stringify({
        prompt: `Generate a quiz question for a ${age}-year-old on ${subject}. Here is a custom prompt: ${prompt}`,
        n: 1
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch quiz.');
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Quiz generated successfully!",
        quiz: data,  // Full quiz JSON from AIML
      }),
    };
  } catch (error) {
    console.error("Quiz function error:", error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || "Quiz generation failed." }),
    };
  }
};
