import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import { validateListeningQuestions } from "@/lib/listening-questions";

const questionFiles = [
  "l1-questions.yaml",
  "l2-questions.yaml",
  "l4-questions.yaml",
  "i-l1-questions.yaml",
  "i-l2-questions.yaml",
];

// Vietnamese support belongs in explanations, rather than the exercise itself.
const vietnameseLetters = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/iu;

describe("bundled listening exercise language", () => {
  it.each(questionFiles)("uses English questions and options in %s", (filename) => {
    const document = parse(readFileSync(resolve("content/english-lab/texts", filename), "utf8"));
    const result = validateListeningQuestions(document.questions);

    expect(result.errors).toEqual([]);
    expect(result.value.length).toBeGreaterThan(0);
    for (const question of result.value) {
      expect(question.prompt).not.toMatch(vietnameseLetters);
      for (const option of question.options) {
        expect(option.text).not.toMatch(vietnameseLetters);
      }
    }
  });
});
