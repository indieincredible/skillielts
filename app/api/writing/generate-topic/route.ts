import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { taskType } = await request.json();

    // Validate task type
    if (!taskType || !['task1', 'task2'].includes(taskType)) {
      return NextResponse.json(
        { error: 'Invalid task type. Must be task1 or task2' },
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

    // Prepare prompt based on task type
    const prompts = {
      task1: `Generate an IELTS Writing Task 1 question at intermediate level (Band 5.0-6.0).
      
Requirements:
- Create a clear data visualization description task (line graph, bar chart, pie chart, or table)
- Include specific data points and time periods
- Make it realistic and similar to actual IELTS tests
- Difficulty: Intermediate level

Format your response as JSON:
{
  "taskType": "task1",
  "topic": "Brief title of the task",
  "question": "The full question prompt",
  "wordCount": 150,
  "timeLimit": 20,
  "difficulty": "intermediate"
}`,
      task2: `Generate an IELTS Writing Task 2 question at intermediate level (Band 5.0-6.0).

Requirements:
- Create an essay question on a common topic (education, technology, environment, society)
- Use one of these formats: Opinion, Discussion, Advantages/Disadvantages, or Problem/Solution
- Make it clear and similar to actual IELTS tests
- Difficulty: Intermediate level

Format your response as JSON:
{
  "taskType": "task2",
  "topic": "Brief title of the topic",
  "question": "The full essay question",
  "wordCount": 250,
  "timeLimit": 40,
  "difficulty": "intermediate",
  "essayType": "opinion/discussion/advantages-disadvantages/problem-solution"
}`
    };

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an IELTS Writing expert who creates authentic test questions. Always respond with valid JSON only, no additional text.',
          },
          {
            role: 'user',
            content: prompts[taskType as keyof typeof prompts],
          },
        ],
        temperature: 0.8,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      return NextResponse.json(
        { error: 'Failed to generate topic from OpenAI' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const generatedTopic = JSON.parse(data.choices[0].message.content);

    return NextResponse.json({
      success: true,
      data: generatedTopic,
    });
  } catch (error) {
    console.error('Error generating writing topic:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

