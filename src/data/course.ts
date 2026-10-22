import course from "../../content/japanese-pilot.json";
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
  title: string;
  subtitle: string;
  symbol: string;
  minutes: number;
  objective: string;
  paragraphs: string[];
  questions: Question[];
};
export const words: Word[] = course.words;
export const lessons: Lesson[] = course.lessons;
export const units = course.units;
export const placement: Question[] = course.placement;
