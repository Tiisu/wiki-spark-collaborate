import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Play,
  CheckCircle,
  RotateCcw,
  Lightbulb,
  Target,
  Award
} from 'lucide-react';

interface InteractiveExerciseProps {
  title: string;
  description: string;
  onComplete: () => void;
}

export function InteractiveExercise({ title, description, onComplete }: InteractiveExerciseProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [progress, setProgress] = useState(0);

  // Mock interactive steps for demonstration
  const steps = [
    {
      title: "Step 1: Understanding the Basics",
      description: "Learn the fundamental concepts",
      action: "Read the introduction",
      completed: false
    },
    {
      title: "Step 2: Hands-on Practice",
      description: "Apply what you've learned",
      action: "Complete the exercise",
      completed: false
    },
    {
      title: "Step 3: Test Your Knowledge",
      description: "Verify your understanding",
      action: "Answer the questions",
      completed: false
    }
  ];

  const [stepStates, setStepStates] = useState(steps);

  const handleStepComplete = (stepIndex: number) => {
    const newStepStates = [...stepStates];
    newStepStates[stepIndex].completed = true;
    setStepStates(newStepStates);

    const completedSteps = newStepStates.filter(step => step.completed).length;
    const newProgress = (completedSteps / steps.length) * 100;
    setProgress(newProgress);

    if (completedSteps === steps.length) {
      setIsCompleted(true);
      onComplete();
    } else if (stepIndex === currentStep) {
      setCurrentStep(stepIndex + 1);
    }
  };

  const resetExercise = () => {
    setStepStates(steps.map(step => ({ ...step, completed: false })));
    setCurrentStep(0);
    setProgress(0);
    setIsCompleted(false);
  };

  return (
    <div className="space-y-6">
      {/* Exercise Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-orange-600" />
                <span>{title}</span>
              </CardTitle>
              <p className="text-muted-foreground mt-2">{description}</p>
            </div>
            <Badge variant={isCompleted ? "default" : "secondary"} className="bg-orange-100 text-orange-800">
              {isCompleted ? (
                <>
                  <Award className="h-3 w-3 mr-1" />
                  Completed
                </>
              ) : (
                <>
                  <Play className="h-3 w-3 mr-1" />
                  In Progress
                </>
              )}
            </Badge>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2 mt-4">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Exercise Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>
      </Card>

      {/* Interactive Steps */}
      <div className="space-y-4">
        {stepStates.map((step, index) => (
          <Card key={index} className={`transition-all duration-200 ${
            step.completed 
              ? 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/10' 
              : index === currentStep 
                ? 'border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-900/10' 
                : 'opacity-60'
          }`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-start space-x-4">
                  <div className={`rounded-full p-2 ${
                    step.completed 
                      ? 'bg-green-100 dark:bg-green-900/40' 
                      : index === currentStep 
                        ? 'bg-orange-100 dark:bg-orange-900/40' 
                        : 'bg-gray-100 dark:bg-gray-800'
                  }`}>
                    {step.completed ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <span className="h-5 w-5 flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{step.title}</h3>
                    <p className="text-muted-foreground text-sm mb-3">{step.description}</p>
                    {!step.completed && index === currentStep && (
                      <div className="flex items-center space-x-2">
                        <Lightbulb className="h-4 w-4 text-orange-600" />
                        <span className="text-sm text-orange-700 dark:text-orange-300">
                          {step.action}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                {!step.completed && index === currentStep && (
                  <Button 
                    onClick={() => handleStepComplete(index)}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    Complete Step
                  </Button>
                )}
                
                {step.completed && (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Done
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Exercise Actions */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {isCompleted ? (
                <>
                  <Award className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-600">Exercise Completed!</span>
                </>
              ) : (
                <>
                  <Target className="h-5 w-5 text-orange-600" />
                  <span className="font-medium">Complete all steps to finish the exercise</span>
                </>
              )}
            </div>
            
            <div className="flex space-x-2">
              <Button variant="outline" onClick={resetExercise}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
