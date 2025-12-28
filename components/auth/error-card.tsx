import CardWrapper from '@/components/auth/card-wrapper';
import { AlertTriangle } from 'lucide-react';

const ErrorCard = () => {
  return (
    <CardWrapper
      headerLabel="Oops! Something went wrong!"
      backButtonHref="/auth/login"
      backButtonLabel="Back to login"
    >
      <div className="w-full flex items-center justify-center">
        <AlertTriangle className="h-6 w-6 text-destructive" />
      </div>
    </CardWrapper>
  );
};

export default ErrorCard;






