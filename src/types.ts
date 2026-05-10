/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

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

export type AppMode = 'menu' | 'lesson' | 'exercise';
