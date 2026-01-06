import { NextResponse } from 'next/server';

interface AssessmentRequest {
  essay: string;
  topic: {
    taskType: string;
    topic: string;
    question: string;
    wordCount: number;
  };
}

export async function POST(request: Request) {
  try {
    const { essay, topic }: AssessmentRequest = await request.json();

    // Validate input
    if (!essay || !topic) {
      return NextResponse.json(
        { error: 'Essay and topic are required' },
        { status: 400 }
      );
    }

    // Check if OpenAI API key exists
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Prepare assessment prompt
    const assessmentPrompt = `You are an expert IELTS Writing examiner. Assess the following essay and provide detailed feedback.

TASK TYPE: ${topic.taskType.toUpperCase()}
TOPIC: ${topic.topic}
QUESTION: ${topic.question}
REQUIRED WORDS: ${topic.wordCount}

ESSAY TO ASSESS:
${essay}

Please provide a comprehensive assessment in the following JSON format:
{
  "overallBandScore": 6.5,
  "scores": {
    "taskResponse": 6.5,
    "coherenceCohesion": 7.0,
    "lexicalResource": 6.0,
    "grammaticalRange": 6.5
  },
  "overallComment": "A brief 2-3 sentence summary of the essay's strengths and weaknesses",
  "detailedFeedback": {
    "taskResponse": "Detailed analysis of how well the essay addresses the task",
    "coherenceCohesion": "Detailed analysis of organization and linking",
    "lexicalResource": "Detailed analysis of vocabulary usage",
    "grammaticalRange": "Detailed analysis of grammar and sentence structures"
  },
  "strengths": [
    "Strength point 1",
    "Strength point 2",
    "Strength point 3"
  ],
  "improvements": [
    "Improvement suggestion 1",
    "Improvement suggestion 2",
    "Improvement suggestion 3"
  ],
  "errors": [
    {
      "text": "the exact wrong phrase from the essay",
      "correction": "the corrected version",
      "type": "grammar/vocabulary/spelling",
      "explanation": "why this is wrong and how to fix it"
    }
  ],
  "wordCount": ${essay.trim().split(/\s+/).length},
  "estimatedTime": "20 minutes"
}

IMPORTANT:
- Be strict but fair in scoring according to IELTS standards
- Identify ALL grammar, vocabulary, and spelling errors
- Provide specific, actionable feedback
- Band scores should be realistic (0.5 increments)
- Overall band score is the average of the 4 criteria scores`;

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert IELTS Writing examiner with 10+ years of experience. You provide detailed, accurate assessments following official IELTS criteria. Always respond with valid JSON only.',
          },
          {
            role: 'user',
            content: assessmentPrompt,
          },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      return NextResponse.json(
        { error: 'Failed to assess essay' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const assessment = JSON.parse(data.choices[0].message.content);

    return NextResponse.json({
      success: true,
      data: assessment,
    });
  } catch (error) {
    console.error('Error assessing essay:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

