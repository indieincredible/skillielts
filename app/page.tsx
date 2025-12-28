'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Brain, Users, Bot } from 'lucide-react';
import { Terminal } from './(dashboard)/terminal';

export default function HomePage() {

  return (
    <main>
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <h1 className="text-4xl font-bold text-black dark:text-white tracking-tight sm:text-5xl md:text-6xl">
                English Skills Assessment
                <span className="block text-gray-700 dark:text-gray-300">Fast & Accurate</span>
              </h1>
              <p className="mt-3 text-base text-gray-600 dark:text-gray-400 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                Real-time English skills assessment platform through timed quizzes. Supporting both
                companies in recruitment and candidates in self-evaluation.
              </p>
              <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
                <Button
                  className="bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black rounded-full text-lg px-8 py-4 inline-flex items-center justify-center"
                >
                  Get Started
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
                  High Demand from Companies
                </h2>
                <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
                  Help HR and hiring managers quickly and accurately assess candidate skills before
                  in-depth interviews.
                </p>
              </div>
            </div>

            <div className="mt-10 lg:mt-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-black dark:bg-white text-white dark:text-black">
                <Brain className="h-6 w-6" />
              </div>
              <div className="mt-5">
                <h2 className="text-lg font-medium text-black dark:text-white">
                  Skills Assessment & Improvement
                </h2>
                <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
                  Help learners and candidates self-assess their current level, identify weaknesses,
                  and improve skills effectively.
                </p>
              </div>
            </div>

            <div className="mt-10 lg:mt-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-black dark:bg-white text-white dark:text-black">
                <Bot className="h-6 w-6" />
              </div>
              <div className="mt-5">
                <h2 className="text-lg font-medium text-black dark:text-white">
                  AI-Powered Testing
                </h2>
                <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
                  Apply AI to generate smart questions, adjust difficulty based on ability, and
                  suggest personalized learning paths.
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
                Ready for the Challenge?
              </h2>
              <p className="mt-3 max-w-3xl text-lg text-gray-600 dark:text-gray-400">
                Experience timed multiple-choice tests to assess your English skills now. Get detailed
                feedback and improvement suggestions after each test.
              </p>
            </div>
            <div className="mt-8 lg:mt-0 flex justify-center lg:justify-end">
              <Button
                className="bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black rounded-full text-xl px-12 py-6 inline-flex items-center justify-center transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                Take a Test
                <ArrowRight className="ml-3 h-6 w-6 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}






