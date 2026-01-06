'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';

interface Step {
  id: number;
  content: string;
}

const hiringSteps: Step[] = [
  { id: 1, content: 'Choose IELTS Writing Task 1 or Task 2' },
  {
    id: 2,
    content:
      'Select topic from 500+ question bank (charts, essays, diagrams)',
  },
  { id: 3, content: 'Write your essay directly on the platform' },
  { id: 4, content: 'AI analyzes and scores based on IELTS criteria' },
  { id: 5, content: 'Review detailed feedback and band score breakdown' },
];

const candidateSteps: Step[] = [
  { id: 1, content: 'Choose your writing task (Task 1 or Task 2)' },
  { id: 2, content: 'Write your essay with real-time word count' },
  {
    id: 3,
    content:
      'AI evaluates: Task Response, Coherence, Lexical Resource, Grammar',
  },
  { id: 4, content: 'Get personalized feedback and improvement suggestions' },
  { id: 5, content: 'Track progress and practice to achieve Band 7.0+' },
];

export function Terminal() {
  const [activeTab, setActiveTab] = useState('hiring');

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 },
  };

  return (
    <div className="w-full rounded-lg bg-black/90 backdrop-blur-sm text-white p-6 font-mono text-sm shadow-xl border border-gray-800">
      {/* Terminal Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div className="text-gray-400 text-xs">skillielts-terminal</div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full bg-gray-800/50 mb-6 p-1 rounded-lg">
          {false && (
            <TabsTrigger
              value="hiring"
              className="flex-1 data-[state=active]:bg-gray-700 rounded-md py-2 flex items-center justify-center gap-2 text-white"
            >
              <Building2 className="w-4 h-4" />
              Quick Start
            </TabsTrigger>
          )}
          <TabsTrigger
            value="candidate"
            className="flex-1 data-[state=active]:bg-gray-700 rounded-md py-2 flex items-center justify-center gap-2 text-white"
          >
            <GraduationCap className="w-4 h-4" />
            Learning Path
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hiring" className="mt-0">
          <motion.div className="space-y-4" variants={container} initial="hidden" animate="show">
            {hiringSteps.map(step => (
              <motion.div
                key={step.id}
                className="flex items-start space-x-3 bg-gray-800/30 p-3 rounded-lg"
                variants={item}
              >
                <span className="text-green-400 font-bold">{'>'}</span>
                <span className="flex-1">
                  <span className="text-green-400">{step.id}. </span>
                  <span className="text-gray-300">{step.content}</span>
                </span>
              </motion.div>
            ))}
            <motion.div
              className="flex items-center space-x-2 text-green-400 bg-green-500/10 p-3 rounded-lg"
              variants={item}
            >
              <span>✓</span>
              <span>Ready to improve your IELTS Writing!</span>
            </motion.div>
          </motion.div>
        </TabsContent>

        <TabsContent value="candidate" className="mt-0">
          <motion.div className="space-y-4" variants={container} initial="hidden" animate="show">
            {candidateSteps.map(step => (
              <motion.div
                key={step.id}
                className="flex items-start space-x-3 bg-gray-800/30 p-3 rounded-lg"
                variants={item}
              >
                <span className="text-blue-400 font-bold">{'>'}</span>
                <span className="flex-1">
                  <span className="text-blue-400">{step.id}. </span>
                  <span className="text-gray-300">{step.content}</span>
                </span>
              </motion.div>
            ))}
            <motion.div
              className="flex items-center space-x-2 text-blue-400 bg-blue-500/10 p-3 rounded-lg"
              variants={item}
            >
              <span>✓</span>
              <span>Start your journey to Band 7.0+!</span>
            </motion.div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

