'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Clock, FileText, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AssessmentResult } from './AssessmentResult';

interface WritingTopic {
  taskType: string;
  topic: string;
  question: string;
  wordCount: number;
  timeLimit: number;
  difficulty: string;
  essayType?: string;
}

interface WritingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskType: 'task1' | 'task2';
}

export function WritingDialog({ open, onOpenChange, taskType }: WritingDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [topic, setTopic] = useState<WritingTopic | null>(null);
  const [essay, setEssay] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [isAssessing, setIsAssessing] = useState(false);
  const [assessmentStep, setAssessmentStep] = useState(0);
  const [assessment, setAssessment] = useState<any>(null);
  const [showResult, setShowResult] = useState(false);

  const assessmentSteps = [
    'Analyzing your essay structure...',
    'Evaluating task response and coherence...',
    'Checking vocabulary and lexical resource...',
    'Detecting grammar and spelling errors...',
    'Highlighting errors in your essay...',
    'Calculating band scores...',
    'Generating detailed feedback...',
    'Preparing your assessment report...',
  ];

  // Storage keys
  const TOPIC_STORAGE_KEY = `ielts_writing_topic_${taskType}`;
  const ESSAY_STORAGE_KEY = `ielts_writing_essay_${taskType}`;

  // Load saved data on component mount
  useEffect(() => {
    const savedTopic = localStorage.getItem(TOPIC_STORAGE_KEY);
    const savedEssay = localStorage.getItem(ESSAY_STORAGE_KEY);

    if (savedTopic) {
      try {
        setTopic(JSON.parse(savedTopic));
        setIsFirstLoad(false);
      } catch (error) {
        console.error('Error parsing saved topic:', error);
      }
    }

    if (savedEssay) {
      setEssay(savedEssay);
    }
  }, [taskType]);

  // Fetch topic when dialog opens for the first time
  useEffect(() => {
    if (open && isFirstLoad && !topic) {
      fetchTopic();
    }
  }, [open, isFirstLoad, topic]);

  // Calculate word count
  useEffect(() => {
    const words = essay.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [essay]);

  // Save essay to localStorage whenever it changes
  useEffect(() => {
    if (essay) {
      localStorage.setItem(ESSAY_STORAGE_KEY, essay);
    }
  }, [essay, ESSAY_STORAGE_KEY]);

  const fetchTopic = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/writing/generate-topic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ taskType }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate topic');
      }

      const result = await response.json();
      const newTopic = result.data;
      
      setTopic(newTopic);
      setIsFirstLoad(false);
      
      // Save topic to localStorage
      localStorage.setItem(TOPIC_STORAGE_KEY, JSON.stringify(newTopic));
    } catch (err) {
      setError('Failed to load writing topic. Please try again.');
      console.error('Error fetching topic:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Don't clear data, just close the dialog
    onOpenChange(false);
  };

  const handleSubmit = async () => {
    if (!essay || !topic) return;

    setIsAssessing(true);
    setAssessmentStep(0);
    setError(null);

    // Quickly animate through first 7 steps
    const quickSteps = async () => {
      for (let i = 0; i < assessmentSteps.length - 1; i++) {
        setAssessmentStep(i);
        await new Promise(resolve => setTimeout(resolve, 800)); // 0.8 seconds per step
      }
      // Set to last step (step 7 - index 7)
      setAssessmentStep(assessmentSteps.length - 1);
    };

    try {
      // Start quick animation and API call simultaneously
      const [_, response] = await Promise.all([
        quickSteps(),
        fetch('/api/writing/assess', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            essay,
            topic: {
              taskType: topic.taskType,
              topic: topic.topic,
              question: topic.question,
              wordCount: topic.wordCount,
            },
          }),
        })
      ]);

      if (!response.ok) {
        throw new Error('Failed to assess essay');
      }

      const result = await response.json();
      setAssessment(result.data);
      setShowResult(true);

      // Clear localStorage after successful assessment
      localStorage.removeItem(TOPIC_STORAGE_KEY);
      localStorage.removeItem(ESSAY_STORAGE_KEY);
    } catch (err) {
      setError('Failed to assess your essay. Please try again.');
      console.error('Error assessing essay:', err);
    } finally {
      setIsAssessing(false);
      setAssessmentStep(0);
    }
  };

  const handleStartNew = () => {
    // Reset all states for new essay
    setAssessment(null);
    setShowResult(false);
    setTopic(null);
    setEssay('');
    setWordCount(0);
    setIsFirstLoad(true);
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent 
        className="max-w-6xl h-[95vh] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 [&::-webkit-scrollbar-thumb]:rounded-full"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6" />
            IELTS Writing {taskType === 'task1' ? 'Task 1' : 'Task 2'} - {showResult ? 'Assessment Result' : 'Assessment Test'}
          </DialogTitle>
          <DialogDescription>
            {showResult 
              ? 'Review your assessment results and feedback below'
              : 'Complete this writing task to assess your current level and get a personalized learning path'
            }
          </DialogDescription>
        </DialogHeader>

        {(loading || isAssessing) && (
          <div className="flex flex-col items-center justify-center min-h-[400px] py-12 space-y-6">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            <div className="text-center max-w-md space-y-2">
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {loading ? 'Generating your writing topic...' : assessmentSteps[assessmentStep]}
              </p>
              {isAssessing && (
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <span>Step {assessmentStep + 1} of {assessmentSteps.length}</span>
                  <span>•</span>
                  <span>Please wait...</span>
                </div>
              )}
            </div>
            {isAssessing && (
              <div className="w-full max-w-md">
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 transition-all duration-1000 ease-out"
                    style={{ width: `${((assessmentStep + 1) / assessmentSteps.length) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {showResult && assessment && (
          <div className="space-y-6">
            <AssessmentResult assessment={assessment} essay={essay} />
            
            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-4 border-t">
              <Button
                variant="outline"
                onClick={handleClose}
                className="cursor-pointer"
              >
                Close
              </Button>

              <Button
                onClick={handleStartNew}
                className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
                disabled={true}
              >
                Start New Essay
              </Button>
            </div>
          </div>
        )}

        {!loading && !isAssessing && !error && !showResult && topic && (
          <div className="space-y-6">
            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Topic Info */}
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 space-y-4 sticky top-0">
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {topic.topic}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {topic.timeLimit} minutes
                      </Badge>
                      <Badge variant="secondary">
                        {topic.wordCount} words minimum
                      </Badge>
                      <Badge variant="outline">
                        {topic.difficulty}
                      </Badge>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-md p-4">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                      {topic.question}
                    </p>
                  </div>

                  {topic.essayType && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Essay Type:</span> {topic.essayType}
                    </div>
                  )}

                  <div className="pt-4 border-t space-y-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      💡 <span className="font-medium">Tips:</span>
                    </p>
                    <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1 pl-4">
                      <li>• Plan your essay structure first</li>
                      <li>• Check Task Response & Coherence</li>
                      <li>• Use varied vocabulary</li>
                      <li>• Review grammar accuracy</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Right Column - Writing Area */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-900 dark:text-white">
                    Your Essay
                  </label>
                  <div className="flex items-center gap-4 text-sm">
                    <span className={`font-medium ${
                      wordCount < topic.wordCount 
                        ? 'text-orange-600 dark:text-orange-400' 
                        : 'text-green-600 dark:text-green-400'
                    }`}>
                      {wordCount} / {topic.wordCount} words
                    </span>
                  </div>
                </div>

                <Textarea
                  value={essay}
                  onChange={(e) => setEssay(e.target.value)}
                  placeholder="Start writing your essay here..."
                  className="min-h-[500px] font-sans text-base resize-none"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-4 border-t">
              <Button
                variant="outline"
                onClick={handleClose}
                className="cursor-pointer"
              >
                Cancel
              </Button>

              <Button
                onClick={handleSubmit}
                disabled={wordCount === 0}
                className="bg-blue-600 hover:bg-blue-700 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              >
                Submit for Assessment
                {wordCount === 0 ? (
                  <span className="ml-2 text-xs opacity-75">
                    (Start writing to submit)
                  </span>
                ) : wordCount < topic.wordCount && (
                  <span className="ml-2 text-xs opacity-75">
                    ({topic.wordCount - wordCount} more words needed)
                  </span>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

