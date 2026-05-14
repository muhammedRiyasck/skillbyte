import { GoogleGenerativeAI, SchemaType, Schema } from '@google/generative-ai';
import { IAIQuizService, IGenerateQuestionsInput } from './IAIQuizService';
import { QuizQuestion } from '../../../modules/quiz/domain/entities/QuizQuestion';
import logger from '../../utils/Logger';
import {
  sanitizeCourseTitle,
  sanitizeTopics,
  isValidQuestion,
} from './GeminiQuizService.utils';
import {
  GEMINI_FALLBACK_MODELS,
  AI_MAX_OUTPUT_TOKENS,
  MAX_QUESTIONS_PER_QUIZ,
  MIN_QUESTIONS_PER_QUIZ,
  QUIZ_GENERATION_PADDING_PERCENT,
  QUIZ_GENERATION_MIN_PADDING,
} from '../../constants/QuizConstants';

export class GeminiQuizService implements IAIQuizService {
  private genAIInstances: GoogleGenerativeAI[] = [];
  private currentKeyIndex: number = 0;
  private readonly fallbackModels: string[] = GEMINI_FALLBACK_MODELS;

  constructor() {
    this.initializeInstances();
  }

  private initializeInstances(): void {
    const keys: string[] = [];
    if (process.env.GEMINI_API_KEY)
      keys.push(process.env.GEMINI_API_KEY.trim());

    Object.keys(process.env).forEach((envKey) => {
      if (envKey.startsWith('GEMINI_API_KEY_') && process.env[envKey]) {
        keys.push(process.env[envKey]!.trim());
      }
    });

    if (keys.length === 0) {
      logger.warn('No Gemini API keys found in environment variables');
    }

    this.genAIInstances = keys.map((key) => new GoogleGenerativeAI(key));
    logger.info(
      `Initialized Gemini AI with ${this.genAIInstances.length} API keys`,
    );
  }

  private getNextInstance(): GoogleGenerativeAI {
    if (this.genAIInstances.length === 0) {
      throw new Error('No Gemini AI instances available');
    }
    const instance = this.genAIInstances[this.currentKeyIndex];
    this.currentKeyIndex =
      (this.currentKeyIndex + 1) % this.genAIInstances.length;
    return instance;
  }

  async generateQuestions(
    input: IGenerateQuestionsInput,
  ): Promise<QuizQuestion[]> {
    const safeTitle = sanitizeCourseTitle(input.courseTitle);
    const safeTopics = sanitizeTopics(input.topics);
    const safeCount = Math.min(
      Math.max(MIN_QUESTIONS_PER_QUIZ, Math.floor(input.questionCount)),
      MAX_QUESTIONS_PER_QUIZ,
    );

    // Padding to account for potential validation filtering
    const requestedCount =
      safeCount +
      Math.max(
        QUIZ_GENERATION_MIN_PADDING,
        Math.ceil(safeCount * QUIZ_GENERATION_PADDING_PERCENT),
      );

    const safeDiff = ['easy', 'medium', 'hard'].includes(input.difficulty)
      ? input.difficulty
      : 'medium';
    const safeTypes = input.questionTypes.filter((t) =>
      ['mcq', 'true_false'].includes(t),
    );

    if (safeTopics.length === 0) {
      throw new Error('No valid topics provided for quiz generation.');
    }

    const prompt = this.buildQuizPrompt(
      requestedCount,
      safeTitle,
      safeTopics,
      safeDiff,
      safeTypes,
    );
    const schema = this.getQuizSchema();

    for (const modelName of this.fallbackModels) {
      try {
        logger.info(`Attempting quiz generation with model: ${modelName}`);
        const genAI = this.getNextInstance();
        const model = genAI.getGenerativeModel({ model: modelName });

        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: schema as unknown as Schema,
            maxOutputTokens: AI_MAX_OUTPUT_TOKENS,
          },
        });

        const parsedData = JSON.parse(result.response.text());
        const rawQuestions = (parsedData.questions || []) as QuizQuestion[];

        const validQuestions = rawQuestions.filter((q, idx) => {
          const valid = isValidQuestion(q);
          if (!valid)
            logger.warn(
              `[QuizGen] Discarded invalid question at index ${idx} (${modelName})`,
            );
          return valid;
        });

        if (validQuestions.length === 0) {
          throw new Error(`Model ${modelName} returned zero valid questions.`);
        }

        logger.info(
          `Successfully generated ${validQuestions.length} valid questions using ${modelName}`,
        );

        return validQuestions.slice(0, safeCount).map((q, idx) => ({
          ...q,
          questionId: q.questionId || `q_${Date.now()}_${idx}`,
        }));
      } catch (error) {
        logger.warn(
          `Failed to generate with model ${modelName}:`,
          (error as Error).message,
        );
      }
    }

    throw new Error(
      'All Gemini models failed to generate questions. Check API keys and quotas.',
    );
  }

  private buildQuizPrompt(
    count: number,
    title: string,
    topics: string[],
    diff: string,
    types: string[],
  ): string {
    return `You are a professional quiz generator. Generate exactly ${count} quiz questions.
    
## RULES
1. Every "questionText" MUST be self-contained and end with a "?".
2. NO setup sentences like "Consider the following...".
3. Difficulty: ${diff}.
4. Types: ${types.join(', ')}.
5. Course: ${title}
6. Topics: ${topics.join('; ')}

Return strictly JSON.`;
  }

  private getQuizSchema(): object {
    return {
      type: SchemaType.OBJECT,
      properties: {
        questions: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              questionId: { type: SchemaType.STRING },
              type: { type: SchemaType.STRING, enum: ['mcq', 'true_false'] },
              questionText: { type: SchemaType.STRING },
              topicTag: { type: SchemaType.STRING },
              difficulty: {
                type: SchemaType.STRING,
                enum: ['easy', 'medium', 'hard'],
              },
              explanation: { type: SchemaType.STRING },
              options: {
                type: SchemaType.ARRAY,
                items: { type: SchemaType.STRING },
              },
              correctOptionIndex: { type: SchemaType.INTEGER },
              correctAnswer: { type: SchemaType.BOOLEAN },
            },
            required: [
              'questionId',
              'type',
              'questionText',
              'topicTag',
              'difficulty',
              'explanation',
            ],
          },
        },
      },
      required: ['questions'],
    };
  }

  async generateFeedbackSummary(
    input: import('./IAIQuizService').IGenerateFeedbackInput,
  ): Promise<string> {
    const safeScore = Math.min(100, Math.max(0, Math.floor(input.score)));
    const prompt = `Review student performance: Score ${safeScore}%, Passed: ${input.passed ? 'Yes' : 'No'}. 
    Topics: ${input.topics.join(', ')}. Strong: ${input.strongAreas.join(', ')}. Weak: ${input.weakAreas.join(', ')}.
    Provide a short, constructive 2-3 sentence feedback message. Plain text only.`;

    for (const modelName of this.fallbackModels) {
      try {
        const model = this.getNextInstance().getGenerativeModel({
          model: modelName,
        });
        const result = await model.generateContent(prompt);
        return result.response.text().trim();
      } catch {
        logger.error(`Feedback generation failed with ${modelName}`);
      }
    }

    return input.passed
      ? 'Great job! You passed.'
      : 'Keep practicing, you will get there!';
  }
}

export const aiQuizService = new GeminiQuizService();
