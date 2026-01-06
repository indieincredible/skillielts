'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Brain, Users, Bot } from 'lucide-react';
import { Terminal } from './(dashboard)/terminal';
import { WritingDialog } from '@/components/writing/WritingDialog';

export default function HomePage() {
  const [writingDialogOpen, setWritingDialogOpen] = useState(false);
  const [selectedTaskType, setSelectedTaskType] = useState<'task1' | 'task2'>('task2');

  const handleStartWriting = (taskType: 'task1' | 'task2' = 'task2') => {
    setSelectedTaskType(taskType);
    setWritingDialogOpen(true);
  };

  return (
    <main>
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 text-sm font-medium mb-4">
                <span className="mr-2">✍️</span>
                IELTS Writing Practice Platform
              </div>
              <h1 className="text-4xl font-bold text-black dark:text-white tracking-tight sm:text-5xl md:text-6xl">
                Master IELTS Writing
                <span className="block text-gray-700 dark:text-gray-300">Task 1 & Task 2</span>
              </h1>
              <p className="mt-3 text-base text-gray-600 dark:text-gray-400 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                Improve your IELTS Writing skills with AI-powered feedback, detailed analysis, and personalized learning paths. Achieve your target band score faster.
              </p>
              <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
                <Button
                  onClick={() => handleStartWriting('task2')}
                  className="bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black rounded-full text-lg px-8 py-4 inline-flex items-center justify-center"
                >
                  Start Writing Practice
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
            <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
              <Terminal />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white dark:bg-gray-900 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-3 lg:gap-8">
            <div>
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-black dark:bg-white text-white dark:text-black">
                <Users className="h-6 w-6" />
              </div>
              <div className="mt-5">
                <h2 className="text-lg font-medium text-black dark:text-white">
                  IELTS Writing Task 1
                </h2>
                <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
                  Practice describing charts, graphs, tables, and diagrams. Get instant feedback on your academic writing skills with detailed band score analysis.
                </p>
              </div>
            </div>

            <div className="mt-10 lg:mt-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-black dark:bg-white text-white dark:text-black">
                <Brain className="h-6 w-6" />
              </div>
              <div className="mt-5">
                <h2 className="text-lg font-medium text-black dark:text-white">
                  IELTS Writing Task 2
                </h2>
                <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
                  Master essay writing with opinion, discussion, and problem-solution formats. Improve coherence, vocabulary, and grammatical accuracy.
                </p>
              </div>
            </div>

            <div className="mt-10 lg:mt-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-black dark:bg-white text-white dark:text-black">
                <Bot className="h-6 w-6" />
              </div>
              <div className="mt-5">
                <h2 className="text-lg font-medium text-black dark:text-white">
                  AI-Powered Feedback
                </h2>
                <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
                  Get instant scoring based on IELTS criteria: Task Response, Coherence & Cohesion, Lexical Resource, and Grammar accuracy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold text-black dark:text-white sm:text-4xl">
                Ready to Achieve Band 7.0+?
              </h2>
              <p className="mt-3 max-w-3xl text-lg text-gray-600 dark:text-gray-400">
                Start practicing IELTS Writing Task 1 and Task 2 now. Get AI-powered feedback, track your progress, and improve your band score with personalized learning paths.
              </p>
            </div>
            <div className="mt-8 lg:mt-0 flex justify-center lg:justify-end">
              <Button
                onClick={() => handleStartWriting('task2')}
                className="bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black rounded-full text-xl px-12 py-6 inline-flex items-center justify-center transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                Start Writing Now
                <ArrowRight className="ml-3 h-6 w-6 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Writing Dialog */}
      <WritingDialog
        open={writingDialogOpen}
        onOpenChange={setWritingDialogOpen}
        taskType={selectedTaskType}
      />
    </main>
  );
}

