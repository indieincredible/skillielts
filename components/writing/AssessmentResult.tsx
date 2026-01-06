'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Award,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  FileText,
  Clock,
  Target,
  BookOpen,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface AssessmentData {
  overallBandScore: number;
  scores: {
    taskResponse: number;
    coherenceCohesion: number;
    lexicalResource: number;
    grammaticalRange: number;
  };
  overallComment: string;
  detailedFeedback: {
    taskResponse: string;
    coherenceCohesion: string;
    lexicalResource: string;
    grammaticalRange: string;
  };
  strengths: string[];
  improvements: string[];
  errors: Array<{
    text: string;
    correction: string;
    type: string;
    explanation: string;
  }>;
  wordCount: number;
  estimatedTime: string;
}

interface AssessmentResultProps {
  assessment: AssessmentData;
  essay: string;
}

export function AssessmentResult({ assessment, essay }: AssessmentResultProps) {
  const [hoveredError, setHoveredError] = useState<number | null>(null);

  // Function to highlight errors in essay
  const highlightErrors = (text: string) => {
    let highlightedText = text;
    const errorPositions: Array<{ start: number; end: number; index: number }> = [];

    // Find all error positions
    assessment.errors.forEach((error, index) => {
      const errorIndex = highlightedText.toLowerCase().indexOf(error.text.toLowerCase());
      if (errorIndex !== -1) {
        errorPositions.push({
          start: errorIndex,
          end: errorIndex + error.text.length,
          index,
        });
      }
    });

    // Sort by position (descending) to replace from end to start
    errorPositions.sort((a, b) => b.start - a.start);

    // Replace each error with highlighted version
    errorPositions.forEach(({ start, end, index }) => {
      const errorText = highlightedText.substring(start, end);
      const error = assessment.errors[index];

      const highlighted = `<span class="error-highlight" data-error-index="${index}">${errorText}</span>`;
      highlightedText = highlightedText.substring(0, start) + highlighted + highlightedText.substring(end);
    });

    return highlightedText;
  };

  const getBandColor = (score: number) => {
    if (score >= 7.0) return 'text-green-600 dark:text-green-400';
    if (score >= 6.0) return 'text-blue-600 dark:text-blue-400';
    if (score >= 5.0) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getBandBgColor = (score: number) => {
    if (score >= 7.0) return 'bg-green-100 dark:bg-green-900/20';
    if (score >= 6.0) return 'bg-blue-100 dark:bg-blue-900/20';
    if (score >= 5.0) return 'bg-orange-100 dark:bg-orange-900/20';
    return 'bg-red-100 dark:bg-red-900/20';
  };

  return (
    <div className="space-y-6">
      {/* Overall Score Card */}
      <Card className={`p-8 text-center ${getBandBgColor(assessment.overallBandScore)}`}>
        <Award className={`h-16 w-16 mx-auto mb-4 ${getBandColor(assessment.overallBandScore)}`} />
        <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Band {assessment.overallBandScore}
        </h2>
        <p className="text-lg text-gray-700 dark:text-gray-300">
          Overall IELTS Writing Score
        </p>
        <div className="mt-4 flex items-center justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            <span>{assessment.wordCount} words</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{assessment.estimatedTime}</span>
          </div>
        </div>
      </Card>

      {/* Overall Comment */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Overall Assessment
        </h3>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          {assessment.overallComment}
        </p>
      </Card>

      {/* Band Scores Breakdown */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Score Breakdown
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'taskResponse', label: 'Task Response', icon: Target },
            { key: 'coherenceCohesion', label: 'Coherence & Cohesion', icon: TrendingUp },
            { key: 'lexicalResource', label: 'Lexical Resource', icon: BookOpen },
            { key: 'grammaticalRange', label: 'Grammatical Range', icon: CheckCircle2 },
          ].map(({ key, label, icon: Icon }) => {
            const score = assessment.scores[key as keyof typeof assessment.scores];
            return (
              <div key={key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <span className="font-medium text-gray-900 dark:text-white">{label}</span>
                </div>
                <Badge className={`text-lg font-bold ${getBandColor(score)}`}>
                  {score}
                </Badge>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Detailed Feedback Tabs */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Detailed Feedback
        </h3>
        <Tabs defaultValue="taskResponse" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="taskResponse">Task Response</TabsTrigger>
            <TabsTrigger value="coherenceCohesion">Coherence</TabsTrigger>
            <TabsTrigger value="lexicalResource">Vocabulary</TabsTrigger>
            <TabsTrigger value="grammaticalRange">Grammar</TabsTrigger>
          </TabsList>
          {Object.entries(assessment.detailedFeedback).map(([key, feedback]) => (
            <TabsContent key={key} value={key} className="mt-4">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {feedback}
              </p>
            </TabsContent>
          ))}
        </Tabs>
      </Card>

      {/* Strengths and Improvements */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Strengths */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Strengths
          </h3>
          <ul className="space-y-3">
            {assessment.strengths.map((strength, index) => (
              <li key={index} className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-1 shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">{strength}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Improvements */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-600" />
            Areas for Improvement
          </h3>
          <ul className="space-y-3">
            {assessment.improvements.map((improvement, index) => (
              <li key={index} className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-orange-600 mt-1 shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">{improvement}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Essay with Error Highlighting */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-600" />
          Your Essay with Corrections
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Hover over <span className="text-red-600 underline decoration-wavy">underlined errors</span> to see corrections
        </p>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 leading-relaxed whitespace-pre-wrap">
          <TooltipProvider>
            {(() => {
              // Sort errors by length (longest first to avoid partial matches)
              const sortedErrors = [...assessment.errors].sort((a, b) => b.text.length - a.text.length);
              
              // Find all error positions in the essay
              const errorPositions: Array<{ start: number; end: number; error: typeof assessment.errors[0] }> = [];
              
              sortedErrors.forEach((error) => {
                const lowerEssay = essay.toLowerCase();
                const lowerError = error.text.toLowerCase();
                let searchStart = 0;
                
                while (true) {
                  const index = lowerEssay.indexOf(lowerError, searchStart);
                  if (index === -1) break;
                  
                  // Check if this position overlaps with existing errors
                  const overlaps = errorPositions.some(
                    (pos) => (index >= pos.start && index < pos.end) || (index + error.text.length > pos.start && index < pos.start)
                  );
                  
                  if (!overlaps) {
                    errorPositions.push({
                      start: index,
                      end: index + error.text.length,
                      error,
                    });
                  }
                  
                  searchStart = index + 1;
                }
              });
              
              // Sort positions by start index
              errorPositions.sort((a, b) => a.start - b.start);
              
              // Build segments
              const segments: React.ReactNode[] = [];
              let currentPos = 0;
              let segmentKey = 0;
              
              errorPositions.forEach((errorPos) => {
                // Add text before error
                if (currentPos < errorPos.start) {
                  segments.push(
                    <span key={`text-${segmentKey}`}>
                      {essay.substring(currentPos, errorPos.start)}
                    </span>
                  );
                  segmentKey++;
                }
                
                // Add error with tooltip
                const errorText = essay.substring(errorPos.start, errorPos.end);
                segments.push(
                  <Tooltip key={`error-${segmentKey}`}>
                    <TooltipTrigger asChild>
                      <span className="text-red-600 underline decoration-wavy decoration-red-600 cursor-help">
                        {errorText}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <div className="space-y-2">
                        <div>
                          <span className="font-semibold text-green-600">Correction: </span>
                          <span className="text-green-600">{errorPos.error.correction}</span>
                        </div>
                        <div>
                          <span className="font-semibold">Type: </span>
                          <Badge variant="outline" className="text-xs">{errorPos.error.type}</Badge>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {errorPos.error.explanation}
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
                segmentKey++;
                
                currentPos = errorPos.end;
              });
              
              // Add remaining text
              if (currentPos < essay.length) {
                segments.push(
                  <span key={`text-${segmentKey}`}>
                    {essay.substring(currentPos)}
                  </span>
                );
              }
              
              return segments;
            })()}
          </TooltipProvider>
        </div>
      </Card>

      {/* Errors List */}
      {assessment.errors.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            Errors Found ({assessment.errors.length})
          </h3>
          <div className="space-y-4">
            {assessment.errors.map((error, index) => (
              <div key={index} className="p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="destructive" className="text-xs">{error.type}</Badge>
                    </div>
                    <div className="mb-2">
                      <span className="text-red-600 dark:text-red-400 line-through">{error.text}</span>
                      <span className="mx-2">→</span>
                      <span className="text-green-600 dark:text-green-400 font-semibold">{error.correction}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {error.explanation}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

