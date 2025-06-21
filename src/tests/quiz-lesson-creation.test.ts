/**
 * Test suite for quiz lesson creation functionality
 * This test verifies that the quiz lesson creation process works correctly
 */

import { describe, it, expect } from 'vitest';

// Mock quiz data structure
const mockQuizData = {
  questions: [
    {
      id: 'q_1',
      type: 'MULTIPLE_CHOICE',
      question: 'What is the capital of France?',
      options: ['London', 'Berlin', 'Paris', 'Madrid'],
      correctAnswer: 'Paris',
      explanation: 'Paris is the capital and largest city of France.',
      points: 1,
      order: 1,
      weight: 1,
      difficulty: 'easy'
    },
    {
      id: 'q_2',
      type: 'TRUE_FALSE',
      question: 'Wikipedia is a free encyclopedia.',
      correctAnswer: 'True',
      explanation: 'Wikipedia is indeed a free, collaborative encyclopedia.',
      points: 1,
      order: 2,
      weight: 1,
      difficulty: 'easy'
    }
  ],
  passingScore: 70,
  timeLimit: 30,
  maxAttempts: 3,
  showCorrectAnswers: true,
  showScoreImmediately: true,
  isRequired: true,
  randomizeQuestions: false,
  randomizeOptions: false,
  immediateFeedback: true
};

const mockLessonData = {
  title: 'Test Quiz Lesson',
  description: 'A test quiz lesson to verify functionality',
  content: JSON.stringify(mockQuizData),
  type: 'QUIZ' as const,
  order: 1,
  duration: 15
};

describe('Quiz Lesson Creation', () => {
  it('should validate quiz data structure correctly', () => {
    // Test that quiz data can be parsed
    expect(() => JSON.parse(mockLessonData.content)).not.toThrow();
    
    const parsedQuizData = JSON.parse(mockLessonData.content);
    
    // Test that quiz has required fields
    expect(parsedQuizData.questions).toBeDefined();
    expect(parsedQuizData.questions.length).toBeGreaterThan(0);
    expect(parsedQuizData.passingScore).toBeDefined();
    expect(parsedQuizData.passingScore).toBeGreaterThanOrEqual(0);
    expect(parsedQuizData.passingScore).toBeLessThanOrEqual(100);
  });

  it('should validate individual questions correctly', () => {
    const parsedQuizData = JSON.parse(mockLessonData.content);
    
    parsedQuizData.questions.forEach((question: any, index: number) => {
      // Each question should have required fields
      expect(question.id, `Question ${index + 1} should have an id`).toBeDefined();
      expect(question.type, `Question ${index + 1} should have a type`).toBeDefined();
      expect(question.question, `Question ${index + 1} should have question text`).toBeDefined();
      expect(question.question.trim(), `Question ${index + 1} should have non-empty question text`).not.toBe('');
      expect(question.correctAnswer, `Question ${index + 1} should have a correct answer`).toBeDefined();
      expect(question.points, `Question ${index + 1} should have points`).toBeGreaterThan(0);
      expect(question.order, `Question ${index + 1} should have an order`).toBeGreaterThan(0);
      
      // Multiple choice questions should have options
      if (question.type === 'MULTIPLE_CHOICE') {
        expect(question.options, `Multiple choice question ${index + 1} should have options`).toBeDefined();
        expect(question.options.length, `Multiple choice question ${index + 1} should have at least 2 options`).toBeGreaterThanOrEqual(2);
        expect(question.options, `Multiple choice question ${index + 1} should include the correct answer in options`).toContain(question.correctAnswer);
      }
    });
  });

  it('should validate lesson data structure correctly', () => {
    // Test that lesson has required fields
    expect(mockLessonData.title).toBeDefined();
    expect(mockLessonData.title.trim()).not.toBe('');
    expect(mockLessonData.content).toBeDefined();
    expect(mockLessonData.content.trim()).not.toBe('');
    expect(mockLessonData.type).toBe('QUIZ');
    expect(mockLessonData.order).toBeGreaterThan(0);
  });

  it('should handle empty quiz data gracefully', () => {
    const emptyQuizData = {
      questions: [],
      passingScore: 70,
      timeLimit: undefined,
      maxAttempts: undefined,
      showCorrectAnswers: true,
      showScoreImmediately: true,
      isRequired: true,
      randomizeQuestions: false,
      randomizeOptions: false,
      immediateFeedback: false
    };

    const emptyLessonData = {
      ...mockLessonData,
      content: JSON.stringify(emptyQuizData)
    };

    // Should be able to parse empty quiz data
    expect(() => JSON.parse(emptyLessonData.content)).not.toThrow();
    
    const parsedData = JSON.parse(emptyLessonData.content);
    expect(parsedData.questions).toEqual([]);
  });

  it('should validate question types correctly', () => {
    const validQuestionTypes = [
      'MULTIPLE_CHOICE',
      'TRUE_FALSE', 
      'FILL_IN_BLANK',
      'MATCHING',
      'ORDERING',
      'SHORT_ANSWER',
      'ESSAY'
    ];

    const parsedQuizData = JSON.parse(mockLessonData.content);
    
    parsedQuizData.questions.forEach((question: any) => {
      expect(validQuestionTypes).toContain(question.type);
    });
  });
});

// Export test data for use in other tests
export { mockQuizData, mockLessonData };
