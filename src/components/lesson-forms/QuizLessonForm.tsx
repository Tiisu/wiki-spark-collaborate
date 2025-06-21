import React, { useState } from 'react';
import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HelpCircle, Plus, Trash2, Settings } from 'lucide-react';
import { CreateLessonData, QuizQuestion } from '@/lib/api';

interface QuizLessonFormProps {
  register: UseFormRegister<CreateLessonData>;
  setValue: UseFormSetValue<CreateLessonData>;
  watch: UseFormWatch<CreateLessonData>;
  errors: FieldErrors<CreateLessonData>;
}

const QuizLessonForm: React.FC<QuizLessonFormProps> = ({
  register,
  setValue,
  watch,
  errors
}) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [passingScore, setPassingScore] = useState(70);
  const [timeLimit, setTimeLimit] = useState<number | undefined>();
  const [maxAttempts, setMaxAttempts] = useState<number | undefined>();
  const [randomizeQuestions, setRandomizeQuestions] = useState(false);
  const [randomizeOptions, setRandomizeOptions] = useState(false);
  const [questionsPerAttempt, setQuestionsPerAttempt] = useState<number | undefined>();
  const [questionBank, setQuestionBank] = useState<QuizQuestion[]>([]);
  const [immediateFeedback, setImmediateFeedback] = useState(false);

  const addQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: `q_${Date.now()}`,
      type: 'MULTIPLE_CHOICE',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      explanation: '',
      points: 1,
      order: questions.length + 1,
      maxLength: undefined,
      minLength: undefined,
      keywords: undefined,
      rubric: undefined,
      caseSensitive: false,
      allowPartialCredit: false,
      weight: 1,
      difficulty: 'medium'
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (index: number, field: keyof QuizQuestion, value: any) => {
    const updatedQuestions = [...questions];
    const currentQuestion = updatedQuestions[index];

    // Handle question type changes by resetting appropriate fields
    if (field === 'type') {
      const newQuestion = { ...currentQuestion, [field]: value };

      // Reset fields based on new question type
      switch (value) {
        case 'MULTIPLE_CHOICE':
          newQuestion.options = ['', '', '', ''];
          newQuestion.correctAnswer = '';
          break;
        case 'TRUE_FALSE':
          newQuestion.options = undefined;
          newQuestion.correctAnswer = '';
          break;
        case 'SHORT_ANSWER':
          newQuestion.options = undefined;
          newQuestion.correctAnswer = '';
          newQuestion.maxLength = undefined;
          newQuestion.caseSensitive = false;
          newQuestion.keywords = undefined;
          break;
        case 'ESSAY':
          newQuestion.options = undefined;
          newQuestion.correctAnswer = '';
          newQuestion.minLength = undefined;
          newQuestion.maxLength = undefined;
          break;
        case 'MATCHING':
          newQuestion.options = ['', '', '', ''];
          newQuestion.correctAnswer = '';
          break;
        case 'ORDERING':
          newQuestion.options = ['', '', ''];
          newQuestion.correctAnswer = '';
          break;
        default:
          break;
      }

      updatedQuestions[index] = newQuestion;
    } else {
      updatedQuestions[index] = { ...currentQuestion, [field]: value };
    }

    setQuestions(updatedQuestions);
  };

  const removeQuestion = (index: number) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    setQuestions(updatedQuestions);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updatedQuestions = [...questions];
    if (updatedQuestions[questionIndex].options) {
      const oldValue = updatedQuestions[questionIndex].options![optionIndex];
      updatedQuestions[questionIndex].options![optionIndex] = value;

      // If the old value was the correct answer and it's being changed to empty, clear the correct answer
      if (updatedQuestions[questionIndex].correctAnswer === oldValue && value.trim() === '') {
        updatedQuestions[questionIndex].correctAnswer = '';
      }
      // If the old value was the correct answer and it's being changed to something else, update the correct answer
      else if (updatedQuestions[questionIndex].correctAnswer === oldValue && value.trim() !== '') {
        updatedQuestions[questionIndex].correctAnswer = value;
      }

      setQuestions(updatedQuestions);
    }
  };

  // Update form data when questions change
  React.useEffect(() => {
    const quizData = {
      questions,
      passingScore,
      timeLimit,
      maxAttempts,
      showCorrectAnswers: true,
      showScoreImmediately: true,
      isRequired: true,
      randomizeQuestions,
      randomizeOptions,
      questionsPerAttempt,
      questionBank,
      immediateFeedback
    };

    // Always set content, even if empty, to ensure form validation passes
    const contentString = JSON.stringify(quizData);
    const currentContent = watch('content');

    // Only update if content has actually changed to prevent infinite loops
    if (currentContent !== contentString) {
      setValue('content', contentString);
    }

    // Debug logging (only when questions count changes to avoid spam)
    if (questions.length !== (window as any).lastQuestionCount) {
      console.log('Quiz form updated:', {
        questionCount: questions.length,
        contentLength: contentString.length,
        hasValidQuestions: questions.length > 0 && questions.every(q => q.question && q.correctAnswer)
      });
      (window as any).lastQuestionCount = questions.length;
    }

    // Also set a default duration for quiz lessons if not set
    const currentDuration = watch('duration');
    if (!currentDuration || currentDuration === 0) {
      setValue('duration', Math.max(10, questions.length * 2)); // 2 minutes per question, minimum 10 minutes
    }
  }, [questions, passingScore, timeLimit, maxAttempts, randomizeQuestions, randomizeOptions, questionsPerAttempt, questionBank, immediateFeedback, setValue]);

  return (
    <div className="space-y-6">
      {/* Quiz Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Quiz Settings
          </CardTitle>
          <CardDescription>
            Configure the basic settings for your quiz
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Quiz Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Describe what this quiz will test and any special instructions..."
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="passingScore">Passing Score (%)</Label>
              <Input
                id="passingScore"
                type="number"
                min="0"
                max="100"
                value={passingScore}
                onChange={(e) => setPassingScore(Number(e.target.value))}
                placeholder="70"
              />
              <p className="text-xs text-muted-foreground">
                Minimum score to pass the quiz
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
              <Input
                id="timeLimit"
                type="number"
                min="1"
                value={timeLimit || ''}
                onChange={(e) => setTimeLimit(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="No limit"
              />
              <p className="text-xs text-muted-foreground">
                Leave empty for no time limit
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxAttempts">Max Attempts</Label>
              <Input
                id="maxAttempts"
                type="number"
                min="1"
                value={maxAttempts || ''}
                onChange={(e) => setMaxAttempts(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="Unlimited"
              />
              <p className="text-xs text-muted-foreground">
                Leave empty for unlimited attempts
              </p>
            </div>
          </div>

          {/* Randomization Settings */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="font-medium text-sm">Randomization Settings</h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={randomizeQuestions}
                  onCheckedChange={setRandomizeQuestions}
                />
                <Label>Randomize Question Order</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={randomizeOptions}
                  onCheckedChange={setRandomizeOptions}
                />
                <Label>Randomize Answer Options</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={immediateFeedback}
                  onCheckedChange={setImmediateFeedback}
                />
                <Label>Immediate Feedback</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="questionsPerAttempt">Questions Per Attempt (Optional)</Label>
              <Input
                id="questionsPerAttempt"
                type="number"
                min="1"
                value={questionsPerAttempt || ''}
                onChange={(e) => setQuestionsPerAttempt(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="Show all questions"
              />
              <p className="text-xs text-muted-foreground">
                If set, only this many questions will be randomly selected from the question bank for each attempt
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Quiz Questions ({questions.length})
          </CardTitle>
          <CardDescription>
            Add and configure questions for your quiz
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {questions.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <HelpCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">No questions added yet</p>
              <p className="text-sm text-amber-600 mb-4">⚠️ Quiz lessons require at least one question</p>
              <Button onClick={addQuestion}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Question
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {questions.map((question, index) => (
                <Card key={question.id} className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Question {index + 1}</CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeQuestion(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Question Type</Label>
                        <Select
                          value={question.type}
                          onValueChange={(value) => updateQuestion(index, 'type', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
                            <SelectItem value="TRUE_FALSE">True/False</SelectItem>
                            <SelectItem value="FILL_IN_BLANK">Fill in the Blank</SelectItem>
                            <SelectItem value="SHORT_ANSWER">Short Answer</SelectItem>
                            <SelectItem value="ESSAY">Essay</SelectItem>
                            <SelectItem value="MATCHING">Matching</SelectItem>
                            <SelectItem value="ORDERING">Ordering</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Points</Label>
                        <Input
                          type="number"
                          min="1"
                          max="10"
                          value={question.points}
                          onChange={(e) => updateQuestion(index, 'points', Number(e.target.value))}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Weight</Label>
                        <Input
                          type="number"
                          min="0.1"
                          max="5"
                          step="0.1"
                          value={question.weight || 1}
                          onChange={(e) => updateQuestion(index, 'weight', Number(e.target.value) || 1)}
                        />
                        <p className="text-xs text-muted-foreground">
                          Question weight for scoring (default: 1)
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label>Difficulty</Label>
                        <Select
                          value={question.difficulty || 'medium'}
                          onValueChange={(value) => updateQuestion(index, 'difficulty', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="easy">Easy</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="hard">Hard</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center space-x-2 pt-6">
                        <Switch
                          checked={question.allowPartialCredit || false}
                          onCheckedChange={(checked) => updateQuestion(index, 'allowPartialCredit', checked)}
                        />
                        <Label>Allow Partial Credit</Label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Question Text</Label>
                      <Textarea
                        value={question.question}
                        onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                        placeholder="Enter your question here..."
                        rows={2}
                      />
                    </div>

                    {question.type === 'MULTIPLE_CHOICE' && (
                      <div className="space-y-2">
                        <Label>Answer Options</Label>
                        <p className="text-xs text-muted-foreground">
                          Fill in the options and select the correct answer using the radio button
                        </p>
                        {question.options?.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-center gap-2">
                            <Input
                              value={option}
                              onChange={(e) => updateOption(index, optionIndex, e.target.value)}
                              placeholder={`Option ${optionIndex + 1}`}
                              className={option.trim() === '' ? 'border-gray-300' : 'border-green-300'}
                            />
                            <div className="flex items-center">
                              <input
                                type="radio"
                                name={`correct_${question.id}`}
                                checked={question.correctAnswer === option}
                                onChange={() => {
                                  if (option.trim() !== '') {
                                    updateQuestion(index, 'correctAnswer', option);
                                  }
                                }}
                                disabled={option.trim() === ''}
                                className="w-4 h-4 disabled:opacity-50"
                              />
                              {option.trim() === '' && (
                                <span className="ml-1 text-xs text-gray-400">Fill option first</span>
                              )}
                              {question.correctAnswer === option && option.trim() !== '' && (
                                <span className="ml-1 text-xs text-green-600">✓ Correct</span>
                              )}
                            </div>
                          </div>
                        ))}
                        {!question.correctAnswer && (
                          <p className="text-xs text-amber-600">⚠️ Please select a correct answer</p>
                        )}
                      </div>
                    )}

                    {question.type === 'TRUE_FALSE' && (
                      <div className="space-y-2">
                        <Label>Correct Answer</Label>
                        <Select
                          value={question.correctAnswer as string}
                          onValueChange={(value) => updateQuestion(index, 'correctAnswer', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select correct answer" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="True">True</SelectItem>
                            <SelectItem value="False">False</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {question.type === 'SHORT_ANSWER' && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Expected Answer</Label>
                          <Input
                            value={question.correctAnswer as string}
                            onChange={(e) => updateQuestion(index, 'correctAnswer', e.target.value)}
                            placeholder="Enter the expected answer..."
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Max Length (characters)</Label>
                            <Input
                              type="number"
                              value={question.maxLength || ''}
                              onChange={(e) => updateQuestion(index, 'maxLength', Number(e.target.value) || undefined)}
                              placeholder="e.g., 100"
                            />
                          </div>

                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={question.caseSensitive || false}
                              onCheckedChange={(checked) => updateQuestion(index, 'caseSensitive', checked)}
                            />
                            <Label>Case Sensitive</Label>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Keywords for Auto-grading (Optional)</Label>
                          <Input
                            value={question.keywords?.join(', ') || ''}
                            onChange={(e) => updateQuestion(index, 'keywords', e.target.value.split(',').map(k => k.trim()).filter(k => k))}
                            placeholder="Enter keywords separated by commas..."
                          />
                          <p className="text-xs text-muted-foreground">
                            If provided, answers containing all keywords will be marked correct
                          </p>
                        </div>
                      </div>
                    )}

                    {question.type === 'ESSAY' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Min Length (characters)</Label>
                            <Input
                              type="number"
                              value={question.minLength || ''}
                              onChange={(e) => updateQuestion(index, 'minLength', Number(e.target.value) || undefined)}
                              placeholder="e.g., 200"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Max Length (characters)</Label>
                            <Input
                              type="number"
                              value={question.maxLength || ''}
                              onChange={(e) => updateQuestion(index, 'maxLength', Number(e.target.value) || undefined)}
                              placeholder="e.g., 1000"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Sample Answer (for instructor reference)</Label>
                          <Textarea
                            value={question.correctAnswer as string}
                            onChange={(e) => updateQuestion(index, 'correctAnswer', e.target.value)}
                            placeholder="Provide a sample answer or key points..."
                            rows={4}
                          />
                        </div>

                        <div className="text-sm text-muted-foreground p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                          <strong>Note:</strong> Essay questions require manual grading by the instructor.
                        </div>
                      </div>
                    )}

                    {(question.type === 'MATCHING' || question.type === 'ORDERING') && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Items {question.type === 'MATCHING' ? '(pairs)' : '(in correct order)'}</Label>
                          {question.options?.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground w-8">
                                {question.type === 'MATCHING' ?
                                  (optionIndex % 2 === 0 ? 'A' : 'B') + Math.floor(optionIndex / 2 + 1) :
                                  optionIndex + 1
                                }
                              </span>
                              <Input
                                value={option}
                                onChange={(e) => updateOption(index, optionIndex, e.target.value)}
                                placeholder={
                                  question.type === 'MATCHING' ?
                                    (optionIndex % 2 === 0 ? 'Left column item' : 'Right column item') :
                                    `Item ${optionIndex + 1}`
                                }
                              />
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newOptions = [...(question.options || []), ''];
                              if (question.type === 'MATCHING' && newOptions.length % 2 === 1) {
                                newOptions.push(''); // Add pair
                              }
                              updateQuestion(index, 'options', newOptions);
                            }}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add {question.type === 'MATCHING' ? 'Pair' : 'Item'}
                          </Button>
                        </div>

                        <div className="text-sm text-muted-foreground p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                          <strong>Note:</strong> {question.type === 'MATCHING' ? 'Matching' : 'Ordering'} questions require manual grading by the instructor.
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>Explanation (Optional)</Label>
                      <Textarea
                        value={question.explanation || ''}
                        onChange={(e) => updateQuestion(index, 'explanation', e.target.value)}
                        placeholder="Explain why this is the correct answer..."
                        rows={2}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button onClick={addQuestion} variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Another Question
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quiz Summary */}
      {questions.length > 0 && (
        <Card className={`border-2 ${
          questions.length > 0 && questions.every(q => q.question.trim() && q.correctAnswer.trim())
            ? 'border-green-200 bg-green-50 dark:bg-green-900/20'
            : 'border-amber-200 bg-amber-50 dark:bg-amber-900/20'
        }`}>
          <CardHeader className="pb-3">
            <CardTitle className={`text-lg ${
              questions.length > 0 && questions.every(q => q.question.trim() && q.correctAnswer.trim())
                ? 'text-green-800 dark:text-green-200'
                : 'text-amber-800 dark:text-amber-200'
            }`}>
              Quiz Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium">Questions:</span> {questions.length}
              </div>
              <div>
                <span className="font-medium">Passing Score:</span> {passingScore}%
              </div>
              <div>
                <span className="font-medium">Time Limit:</span> {timeLimit ? `${timeLimit} min` : 'No limit'}
              </div>
              <div>
                <span className="font-medium">Max Attempts:</span> {maxAttempts || 'Unlimited'}
              </div>
            </div>

            {/* Validation Status */}
            <div className="mt-4 space-y-2">
              {questions.map((q, idx) => {
                const hasQuestion = q.question.trim() !== '';
                const hasCorrectAnswer = q.correctAnswer.trim() !== '';
                const isValid = hasQuestion && hasCorrectAnswer;

                return (
                  <div key={q.id} className="flex items-center gap-2 text-sm">
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
                      isValid ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                      {isValid ? '✓' : '!'}
                    </span>
                    <span>Question {idx + 1}:</span>
                    <span className={hasQuestion ? 'text-green-600' : 'text-red-600'}>
                      {hasQuestion ? 'Has question text' : 'Missing question text'}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className={hasCorrectAnswer ? 'text-green-600' : 'text-red-600'}>
                      {hasCorrectAnswer ? 'Has correct answer' : 'Missing correct answer'}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className={`mt-3 text-sm ${
              questions.length > 0 && questions.every(q => q.question.trim() && q.correctAnswer.trim())
                ? 'text-green-700 dark:text-green-300'
                : 'text-amber-700 dark:text-amber-300'
            }`}>
              {questions.length > 0 && questions.every(q => q.question.trim() && q.correctAnswer.trim())
                ? '✅ Quiz is ready to be created'
                : '⚠️ Please complete all questions before creating the quiz'
              }
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QuizLessonForm;
