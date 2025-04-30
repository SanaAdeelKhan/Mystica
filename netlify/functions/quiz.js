const fetch = require("node-fetch"); // Ensure node-fetch is available in the project
require("dotenv").config();

exports.handler = async (event) => {
  try {
    console.log("Request received. Body:", event.body);

    // Parse the incoming request body
    const { age, subject } = JSON.parse(event.body || "{}");
    console.log("Parsed inputs:", { age, subject });

    // Validate the inputs
    if (!age || !subject) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Age and Subject are required." }),
      };
    }

    // Define the prompt for AIML API
    const prompt = `
You are a quiz generator. Based on a student's age (${age}) and subject ("${subject}"), create ONE multiple-choice quiz question.

Respond ONLY in this strict JSON format:
{
  "question": "Your question here?",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "answer": "Correct answer",
  "difficulty": "easy | medium | hard"
}
Do NOT include any explanation or extra text. Only return valid JSON.
`;

    console.log("Sending prompt to AIML API:\n" + prompt);

    // Send the request to AIML API (OpenAI-compatible endpoint)
    const response = await fetch("https://api.aimlapi.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.AIML_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    // Ensure the response is OK
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error from AIML API: ${errorText}`);
    }

    const data = await response.json();

    // Clean the response and remove triple backticks
    const rawText = (data.choices?.[0]?.message?.content || "{}")
      .replace(/```json|```/g, "")
      .trim();

    console.log("AIML raw response (cleaned):", rawText);

    let quiz;
    try {
      quiz = JSON.parse(rawText);
    } catch (err) {
      console.error("JSON parse error from AIML API:", err.message);
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "Invalid JSON returned from AIML API",
          rawResponse: rawText,
        }),
      };
    }

    console.log("Parsed quiz object:", quiz);

    // Return the generated quiz
    return {
      statusCode: 200,
      body: JSON.stringify({
        question: quiz.question,
        options: quiz.options,
        correctAnswer: quiz.answer,
        difficulty: quiz.difficulty,
      }),
    };
  } catch (error) {
    console.error("Function error:", error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to generate quiz.",
        details: error.message,
      }),
    };
  }
};
