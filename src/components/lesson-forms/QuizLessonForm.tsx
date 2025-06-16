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

  const addQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: `q_${Date.now()}`,
      type: 'MULTIPLE_CHOICE',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      explanation: '',
      points: 1,
      order: questions.length + 1
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (index: number, field: keyof QuizQuestion, value: any) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setQuestions(updatedQuestions);
  };

  const removeQuestion = (index: number) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    setQuestions(updatedQuestions);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updatedQuestions = [...questions];
    if (updatedQuestions[questionIndex].options) {
      updatedQuestions[questionIndex].options![optionIndex] = value;
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
      isRequired: true
    };
    setValue('content', JSON.stringify(quizData));
  }, [questions, passingScore, timeLimit, maxAttempts, setValue]);

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
                        {question.options?.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-center gap-2">
                            <Input
                              value={option}
                              onChange={(e) => updateOption(index, optionIndex, e.target.value)}
                              placeholder={`Option ${optionIndex + 1}`}
                            />
                            <input
                              type="radio"
                              name={`correct_${question.id}`}
                              checked={question.correctAnswer === option}
                              onChange={() => updateQuestion(index, 'correctAnswer', option)}
                              className="w-4 h-4"
                            />
                          </div>
                        ))}
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
    </div>
  );
};

export default QuizLessonForm;
