/**
 * List of inspirational quotes for daily practice reminders
 */
const inspirationalQuotes = [
  {
    text: 'Continuous improvement is better than delayed perfection.',
    author: 'Mark Twain',
  },
  {
    text: 'The secret of getting ahead is getting started.',
    author: 'Mark Twain',
  },
  {
    text: 'Success is the sum of small efforts, repeated day in and day out.',
    author: 'Robert Collier',
  },
  {
    text: 'Skill comes from consistent and deliberate practice.',
    author: 'John Wooden',
  },
  {
    text: 'The only way to learn is by doing.',
    author: 'Richard Branson',
  },
  {
    text: "Practice isn't the thing you do once you're good. It's the thing you do that makes you good.",
    author: 'Malcolm Gladwell',
  },
  {
    text: 'An hour of practice is worth five hours of foot-dragging.',
    author: 'Pancho Segura',
  },
  {
    text: 'Knowledge is not power. The implementation of knowledge is power.',
    author: 'Larry Winget',
  },
  {
    text: "Don't wish it were easier. Wish you were better.",
    author: 'Jim Rohn',
  },
  {
    text: 'The expert in anything was once a beginner.',
    author: 'Helen Hayes',
  },
];

/**
 * Email template for daily practice reminder
 * @param quizLink - Link to quiz page
 * @param name - User's name
 */
export const getReminderEmailHTML = (quizLink: string, name: string = '') => {
  // Choose a random quote
  const randomQuote = inspirationalQuotes[Math.floor(Math.random() * inspirationalQuotes.length)];
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Daily Practice Reminder - SkillIelts</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .logo {
          text-align: center;
          margin-bottom: 20px;
        }
        .logo-text {
          color: #0EA5E9;
          font-size: 28px;
          font-weight: bold;
        }
        .container {
          border: 1px solid #e1e1e1;
          border-radius: 5px;
          padding: 30px;
          background-color: #f9f9f9;
        }
        .button {
          display: inline-block;
          background-color: #4F46E5;
          color: white !important;
          text-decoration: none;
          padding: 12px 30px;
          border-radius: 4px;
          margin: 20px 0;
          font-weight: bold;
        }
        .footer {
          margin-top: 30px;
          font-size: 12px;
          color: #666;
          text-align: center;
        }
        .highlight {
          font-weight: bold;
          color: #4F46E5;
        }
        .stats-container {
          background-color: #f0f0f0;
          border-radius: 8px;
          padding: 15px;
          margin: 15px 0;
        }
        .stat-box {
          display: inline-block;
          text-align: center;
          width: 32%;
          padding: 10px 0;
        }
        .stat-number {
          font-size: 24px;
          font-weight: bold;
          color: #4F46E5;
        }
        .stat-label {
          font-size: 12px;
          text-transform: uppercase;
          color: #666;
        }
        .inspiration {
          font-style: italic;
          color: #555;
          text-align: center;
          margin: 20px 0;
          padding: 10px;
          border-left: 3px solid #4F46E5;
        }
      </style>
    </head>
    <body>
      <div class="logo">
        <span class="logo-text">SkillIelts</span>
      </div>
      
      <div class="container">
        <h2>Your Daily Practice Reminder</h2>
        
        <p>Hello ${name || 'there'}!</p>
        
        <p>We noticed you haven't completed any quiz today. <span class="highlight">Consistent practice</span> is key to improving your technical skills.</p>
        
        <div class="stats-container">
          <div class="stat-box">
            <div class="stat-number">10</div>
            <div class="stat-label">Minutes needed</div>
          </div>
          <div class="stat-box">
            <div class="stat-number">+5%</div>
            <div class="stat-label">Daily progress</div>
          </div>
          <div class="stat-box">
            <div class="stat-number">💪</div>
            <div class="stat-label">Skills improved</div>
          </div>
        </div>
        
        <p>Take just 10 minutes today to maintain your learning streak!</p>
        
        <div class="inspiration">
          "${randomQuote.text}" - ${randomQuote.author}
        </div>
        
        <div style="text-align: center;">
          <a href="${quizLink}" class="button">Take a Quiz Now</a>
        </div>
      </div>
      
      <div class="footer">
        <p>© ${new Date().getFullYear()} SkillIelts. All rights reserved.</p>
        <p>If you want to change your notification preferences, visit your <a href="${quizLink.replace('/quiz', '/settings')}">account settings</a>.</p>
      </div>
    </body>
    </html>
  `;
};






