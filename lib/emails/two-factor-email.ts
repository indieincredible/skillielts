/**
 * Email template for two-factor authentication
 * @param token - The 2FA verification code
 * @param name - User's name
 */
export const getTwoFactorEmailHTML = (token: string, name: string = '') => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your 2FA Code - SkillIelts</title>
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
        .code-container {
          background-color: #e9f7ff;
          border: 1px dashed #0EA5E9;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
          text-align: center;
        }
        .code {
          font-family: monospace;
          font-size: 28px;
          font-weight: bold;
          color: #0EA5E9;
          letter-spacing: 5px;
        }
        .footer {
          margin-top: 30px;
          font-size: 12px;
          color: #666;
          text-align: center;
        }
        .highlight {
          font-weight: bold;
          color: #0EA5E9;
        }
        .warning {
          color: #777;
          font-size: 13px;
          font-style: italic;
        }
      </style>
    </head>
    <body>
      <div class="logo">
        <span class="logo-text">SkillIelts</span>
      </div>
      
      <div class="container">
        <h2>Your Two-Factor Authentication Code</h2>
        
        <p>Hello ${name ? name : ''},</p>
        
        <p>You requested a two-factor authentication code for your <span class="highlight">SkillIelts</span> account. Please use the code below to complete your sign-in:</p>
        
        <div class="code-container">
          <div class="code">${token}</div>
        </div>
        
        <p class="warning">This code will expire in 10 minutes. If you didn't request this code, please secure your account by changing your password immediately.</p>
      </div>
      
      <div class="footer">
        <p>© ${new Date().getFullYear()} SkillIelts. All rights reserved.</p>
        <p>If you have any questions, please contact us at <a href="mailto:support@skillielts.dev">support@skillielts.dev</a></p>
      </div>
    </body>
    </html>
  `;
};






