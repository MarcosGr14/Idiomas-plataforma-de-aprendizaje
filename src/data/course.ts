import course from "../../content/japanese-pilot.json";
import hiragana from "../../content/japanese-hiragana.json";
export type Word = {
  id: string;
  jp: string;
  reading: string;
  es: string;
  note: string;
  lesson: number;
  category: string;
};
export type Question = {
  prompt: string;
  options: string[];
  correct: number;
  explanation: string;
  jp?: string;
  listening?: string;
};
export type Lesson = {
  id: string;
  unit: number;
  title: string;
  subtitle: string;
  symbol: string;
  minutes: number;
  objective: string;
  paragraphs: string[];
  questions: Question[];
};
export const words: Word[] = [...course.words, ...hiragana.words];
export const lessons: Lesson[] = [
  ...course.lessons.map((lesson) => ({ ...lesson, unit: 0 })),
  ...hiragana.lessons,
];
export const units = course.units;
export const placement: Question[] = course.placement;
