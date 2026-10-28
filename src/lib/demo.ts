import { lessons, words } from "../data/course";
import { CAPTURE_DATE } from "./capture";
import {
  freshProgress,
  completeLesson,
  dayKey,
  type Progress,
} from "./progress";
/** Isolated, reproducible fixture. Never stored or sent to Supabase. */
export function createDemoProgress(): Progress {
  let p = freshProgress();
  p.motion = "full";
  p.goal = 10;
  p.placement = 60;
  for (let n = 6; n >= 0; n--) {
    const d = new Date(CAPTURE_DATE);
    d.setDate(d.getDate() - n);
    const key = dayKey(d);
    p.studied.push(key);
    p.activity[key] = n === 0 ? 0 : 10;
  }
  lessons.slice(0, 3).forEach((lesson, i) => {
    const d = new Date(CAPTURE_DATE);
    d.setDate(d.getDate() - (2 - i));
    p = completeLesson(
      p,
      lesson.id,
      100,
      words.filter((w) => w.lesson === i).map((w) => w.id),
      d,
    );
  });
  return p;
}
