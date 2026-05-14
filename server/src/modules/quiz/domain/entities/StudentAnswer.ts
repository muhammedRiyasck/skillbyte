export interface IBaseAnswer {
  questionId: string;
  type: 'mcq' | 'true_false' | 'short_answer' | 'essay';
}

export interface IMCQAnswer extends IBaseAnswer {
  type: 'mcq';
  selectedOptionIndex: number;
}

export interface ITrueFalseAnswer extends IBaseAnswer {
  type: 'true_false';
  selectedAnswer: boolean;
}

export interface IShortAnswerAnswer extends IBaseAnswer {
  type: 'short_answer';
  writtenText: string;
}

export interface IEssayAnswer extends IBaseAnswer {
  type: 'essay';
  writtenText: string;
}

export type StudentAnswer =
  | IMCQAnswer
  | ITrueFalseAnswer
  | IShortAnswerAnswer
  | IEssayAnswer;
