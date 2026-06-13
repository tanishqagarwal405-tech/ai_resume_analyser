require('dotenv').config();
const Groq = require('groq-sdk');

const getPrompt = (resumeText, jobDescription = null) => {
  const jdSection = jobDescription
    ? `\n\nJOB DESCRIPTION:\n${jobDescription}\n\nCalculate jobMatchScore (0-100) and fill jobMatchDetails.`
    : '\nNo job description provided. Set jobMatchScore to null.';

  return `You are an expert ATS and career coach AI. Analyze the following resume.

RESUME TEXT:
${resumeText}
${jdSection}

Respond ONLY with a valid JSON object (no markdown, no explanation):
{
  "atsScore": <0-100>,
  "overallScore": <0-100>,
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2", "weakness3"],
  "suggestions": ["suggestion1", "suggestion2", "suggestion3", "suggestion4", "suggestion5"],
  "skillsFound": ["skill1", "skill2"],
  "missingSkills": ["skill1", "skill2"],
  "keywordsFound": ["keyword1", "keyword2"],
  "missingKeywords": ["keyword1", "keyword2"],
  "sectionScores": {
    "contact": <0-100>,
    "summary": <0-100>,
    "experience": <0-100>,
    "education": <0-100>,
    "skills": <0-100>,
    "formatting": <0-100>
  },
  "jobMatchScore": <0-100 or null>,
  "jobMatchDetails": {
    "matchedSkills": ["skill1"],
    "missingSkills": ["skill1"],
    "recommendations": ["rec1", "rec2"]
  }
}`;
};

const parseAIResponse = (rawText) => {
  try {
    const cleaned = rawText
      .replace(/```json\n?/gi, '')
      .replace(/```\n?/gi, '')
      .trim();
    return JSON.parse(cleaned);
  } catch {
    throw new Error('AI returned invalid JSON. Please try again.');
  }
};

const analyzeResume = async (resumeText, jobDescription = null) => {
  if (!resumeText || resumeText.trim().length < 50) {
    throw new Error('Resume text is too short to analyze.');
  }

  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
  });

  console.log('🤖 Analyzing with Groq AI...');

  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: 'You are an expert ATS and career coach AI. Always respond with valid JSON only, no markdown.'
      },
      {
        role: 'user',
        content: getPrompt(resumeText, jobDescription)
      }
    ],
    model: 'llama-3.3-70b-versatile',
    temperature: 0.3,
    max_tokens: 2048,
  });

  const text = completion.choices[0].message.content;
  console.log('✅ Groq analysis complete!');
  return parseAIResponse(text);
};

module.exports = { analyzeResume };