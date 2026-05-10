/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Student {
  name: string;
  schoolFee?: string;
  displayId?: string;
  behavior?: string;
  level?: string;
  teachers?: string;
  startDate?: string;
  deadline?: string;
  time?: string;
  time2?: string;
  subject?: string;
  schedule?: string;
  assistant?: string;
  duration?: string;
  shift?: string;
  penaltyType1?: string;
  penaltyDate1?: string;
  penaltyType2?: string;
  penaltyDate2?: string;
  penaltyType3?: string;
  penaltyDate3?: string;
  penaltyComments?: string;
  payments?: Record<string, string>;
}

export type ExtractionMode = 'Hall' | 'Finance' | 'Attendance' | 'DailyTask' | 'Penalty' | 'PenaltyHall';

export interface LessonData {
  letter: string;
  word: string;
  imageKeyword: string;
  imageUrl?: string;
  questions: {
    question: string;
    answer: string;
    type: 'identity' | 'color' | 'like' | 'location' | 'count' | 'spelling';
  }[];
}

export type AppMode = 'menu' | 'lesson' | 'exercise' | 'extractor';
