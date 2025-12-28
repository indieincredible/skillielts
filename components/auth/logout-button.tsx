'use client';

import { logout } from '@/actions/auth/logout';
import { logger } from '@/lib/logger';
import { getItemWithTTL } from '@/lib/localStorage-utils';

interface LogoutButtonProps {
  children?: React.ReactNode;
}

export const LogoutButton = ({ children }: LogoutButtonProps) => {
  const onClick = () => {
    // Force remove quiz banner immediately
    const banner = document.querySelector('[data-banner="quiz-notification"]');
    if (banner) {
      banner.remove();
      document.body.style.paddingTop = '';
      logger.info('Force removed quiz banner on logout');
    }

    // Clear quiz data from localStorage before logout
    if (typeof window !== 'undefined') {
      const resultId = getItemWithTTL('latestQuizResultId');
      if (resultId) {
        localStorage.removeItem(`quiz_data_${resultId}`);
        localStorage.removeItem(`ai-analysis-${resultId}`);
        localStorage.removeItem('latestQuizResultId');
        logger.info('Cleared quiz data on logout');
      }

      // Clear any other quiz-related data
      localStorage.removeItem('selectedProgrammingLanguage');
      localStorage.removeItem('surveyResponseId');
    }

    logout();
  };

  return (
    <span onClick={onClick} className="cursor-pointer">
      {children}
    </span>
  );
};






