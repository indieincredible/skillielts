import { Resend } from 'resend';
import { getVerificationEmailHTML } from './emails/verification-email';
import { getResetPasswordEmailHTML } from './emails/reset-password-email';
import { getTwoFactorEmailHTML } from './emails/two-factor-email';
import { getReminderEmailHTML } from './emails/reminder-email';
import { logger } from './logger';

const resend = new Resend(process.env.RESEND_API_KEY);
const domain = process.env.BASE_URL;
const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

export const sendPasswordResetEmail = async (email: string, token: string, name?: string) => {
  const resetLink = `${domain}/auth/new-password?token=${token}`;

  try {
    logger.debug('Sending password reset email', { email, hasName: !!name });
    const result = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Reset your password',
      html: getResetPasswordEmailHTML(resetLink, name),
    });

    if (result.data) {
      return { success: true, data: result.data };
    } else {
      logger.error('Failed to send reset email:', new Error('Reset email failed'), {
        resultData: JSON.stringify(result),
      });
      return { success: false, error: 'Failed to send reset email' };
    }
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('Error sending reset email:', err);
    return {
      success: false,
      error: err.message || 'Unknown error occurred',
    };
  }
};

export const sendVerificationEmail = async (email: string, token: string, name?: string) => {
  const confirmLink = `${domain}/auth/new-verification?token=${token}`;

  try {
    const result = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Confirm your email',
      html: getVerificationEmailHTML(confirmLink, name),
    });

    if (result.data) {
      return { success: true, data: result.data };
    } else {
      logger.error('Failed to send verification email:', new Error('Verification email failed'), {
        resultData: JSON.stringify(result),
      });
      return { success: false, error: 'Failed to send verification email' };
    }
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('Error sending verification email:', err);
    return {
      success: false,
      error: err.message || 'Unknown error occurred',
    };
  }
};

export const sendTwoFactorTokenEmail = async (email: string, token: string, name?: string) => {
  try {
    logger.debug('Sending 2FA code email', { email, hasName: !!name });
    const result = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Your SkillIelts 2FA Code',
      html: getTwoFactorEmailHTML(token, name),
    });

    if (result.data) {
      return { success: true, data: result.data };
    } else {
      logger.error('Failed to send 2FA email:', new Error('2FA email failed'), {
        resultData: JSON.stringify(result),
      });
      return { success: false, error: 'Failed to send 2FA email' };
    }
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('Error sending 2FA email:', err);
    return {
      success: false,
      error: err.message || 'Unknown error occurred',
    };
  }
};

export const sendReminderEmail = async (email: string, name: string) => {
  const quizLink = `${domain}/quiz`;

  try {
    logger.debug('Sending reminder email', { email, hasName: !!name });
    const result = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: "Don't forget to practice your skills today!",
      html: getReminderEmailHTML(quizLink, name),
    });

    if (result.data) {
      return { success: true, data: result.data };
    } else {
      logger.error('Failed to send reminder email:', new Error('Reminder email failed'), {
        resultData: JSON.stringify(result),
      });
      return { success: false, error: 'Failed to send reminder email' };
    }
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('Error sending reminder email:', err);
    return { success: false, error: 'Error sending reminder email' };
  }
};






