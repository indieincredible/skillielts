declare namespace NodeJS {
  interface ProcessEnv {
    SHOW_QUIZ_ANSWERS: string; // "true" | "false"
    OPENAI_API_KEY: string;
    OPENAI_MODEL: 'gpt-3.5-turbo' | 'gpt-4o' | 'gpt-4-turbo-preview' | 'gpt-4o-mini';
    NODE_ENV: 'development' | 'production' | 'test';
  }
}






