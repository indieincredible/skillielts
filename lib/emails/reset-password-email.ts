/**
 * Email template for password reset
 * @param resetLink - Link to reset password
 * @param name - User's name
 */
export const getResetPasswordEmailHTML = (resetLink: string, name: string = '') => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset - SkillIelts</title>
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
          background-color: #0EA5E9;
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
        <h2>Reset Your Password</h2>
        
        <p>Hello ${name ? name : ''},</p>
        
        <p>We received a request to reset your password for your <span class="highlight">SkillIelts</span> account. If you didn't make this request, you can safely ignore this email.</p>
        
        <p>To reset your password, click the button below:</p>
        
        <div style="text-align: center;">
          <a href="${resetLink}" class="button">Reset Password</a>
        </div>
        
        <p class="warning">This link will expire in 24 hours for security reasons. If you need a new reset link after that time, please make another password reset request.</p>
      </div>
      
      <div class="footer">
        <p>© ${new Date().getFullYear()} SkillIelts. All rights reserved.</p>
        <p>If you have any questions, please contact us at <a href="mailto:support@skillielts.dev">support@skillielts.dev</a></p>
      </div>
    </body>
    </html>
  `;
};






