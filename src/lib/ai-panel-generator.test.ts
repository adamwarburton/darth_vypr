import { describe, it, expect } from "vitest";
import {
  seededRandom,
  pickWeighted,
  shuffle,
  normalRandom,
  generateSingleChoiceAnswers,
  generateMultipleChoiceAnswers,
  generateScaledAnswers,
  generateOpenTextAnswers,
  generateMonadicSplitAnswers,
  generateRankingAnswers,
  generateMaxDiffAnswers,
  generateGaborGrangerAnswers,
  generateVanWestendorpAnswers,
  generateImplicitAssociationAnswers,
  generateImageHeatmapAnswers,
  buildPrompt,
} from "./ai-panel-generator";
import type { Question } from "@/types";

// ---------------------------------------------------------------------------
// Random Helpers
// ---------------------------------------------------------------------------

describe("seededRandom", () => {
  it("returns deterministic values for the same seed", () => {
    const r1 = seededRandom(42);
    const r2 = seededRandom(42);
    const vals1 = Array.from({ length: 10 }, () => r1());
    const vals2 = Array.from({ length: 10 }, () => r2());
    expect(vals1).toEqual(vals2);
  });

  it("returns values between 0 and 1", () => {
    const r = seededRandom(123);
    for (let i = 0; i < 1000; i++) {
      const v = r();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it("returns different sequences for different seeds", () => {
    const r1 = seededRandom(1);
    const r2 = seededRandom(2);
    const v1 = r1();
    const v2 = r2();
    expect(v1).not.toBe(v2);
  });
});

describe("pickWeighted", () => {
  it("returns an item from the list", () => {
    const r = seededRandom(42);
    const items = ["a", "b", "c"];
    const result = pickWeighted(items, [1, 1, 1], r);
    expect(items).toContain(result);
  });

  it("heavily favors items with high weights", () => {
    const r = seededRandom(42);
    const counts: Record<string, number> = { a: 0, b: 0, c: 0 };
    for (let i = 0; i < 1000; i++) {
      counts[pickWeighted(["a", "b", "c"], [100, 0, 0], r)]++;
    }
    expect(counts.a).toBe(1000);
    expect(counts.b).toBe(0);
    expect(counts.c).toBe(0);
  });

  it("handles all-zero weights without crashing", () => {
    const r = seededRandom(42);
    const result = pickWeighted(["a", "b"], [0, 0], r);
    expect(["a", "b"]).toContain(result);
  });
});

describe("shuffle", () => {
  it("returns an array of the same length", () => {
    const r = seededRandom(42);
    const arr = [1, 2, 3, 4, 5];
    const result = shuffle(arr, r);
    expect(result).toHaveLength(5);
  });

  it("contains all original elements", () => {
    const r = seededRandom(42);
    const arr = [1, 2, 3, 4, 5];
    const result = shuffle(arr, r);
    expect(result.sort()).toEqual([1, 2, 3, 4, 5]);
  });

  it("does not mutate the original array", () => {
    const r = seededRandom(42);
    const arr = [1, 2, 3];
    shuffle(arr, r);
    expect(arr).toEqual([1, 2, 3]);
  });
});

describe("normalRandom", () => {
  it("generates values centered around the mean", () => {
    const r = seededRandom(42);
    const values = Array.from({ length: 5000 }, () => normalRandom(100, 10, r));
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    expect(avg).toBeCloseTo(100, 0);
  });

  it("generates values with approximate expected standard deviation", () => {
    const r = seededRandom(42);
    const values = Array.from({ length: 5000 }, () => normalRandom(0, 15, r));
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const variance =
      values.reduce((a, v) => a + (v - avg) ** 2, 0) / values.length;
    const sd = Math.sqrt(variance);
    expect(sd).toBeCloseTo(15, 0);
  });
});

// ---------------------------------------------------------------------------
// Response Generators
// ---------------------------------------------------------------------------

describe("generateSingleChoiceAnswers", () => {
  const rand = seededRandom(42);

  it("generates the correct number of answers", () => {
    const answers = generateSingleChoiceAnswers(
      { opt_a: 50, opt_b: 50 },
      100,
      rand
    );
    expect(answers).toHaveLength(100);
  });

  it("only selects from provided options", () => {
    const answers = generateSingleChoiceAnswers(
      { opt_a: 30, opt_b: 70 },
      500,
      seededRandom(42)
    );
    for (const a of answers) {
      expect(["opt_a", "opt_b"]).toContain(a.selected);
    }
  });

  it("roughly follows the distribution", () => {
    const answers = generateSingleChoiceAnswers(
      { opt_a: 80, opt_b: 20 },
      1000,
      seededRandom(42)
    );
    const aCount = answers.filter((a) => a.selected === "opt_a").length;
    expect(aCount).toBeGreaterThan(700);
    expect(aCount).toBeLessThan(900);
  });
});

describe("generateMultipleChoiceAnswers", () => {
  it("generates the correct number of answers", () => {
    const answers = generateMultipleChoiceAnswers(
      { a: 50, b: 50 },
      200,
      seededRandom(42)
    );
    expect(answers).toHaveLength(200);
  });

  it("each answer has at least one selection", () => {
    const answers = generateMultipleChoiceAnswers(
      { a: 1, b: 1, c: 1 },
      500,
      seededRandom(42)
    );
    for (const a of answers) {
      expect(a.selected.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("high rates produce more selections", () => {
    const answers = generateMultipleChoiceAnswers(
      { a: 99, b: 99, c: 99 },
      500,
      seededRandom(42)
    );
    const avgSelections =
      answers.reduce((sum, a) => sum + a.selected.length, 0) / answers.length;
    expect(avgSelections).toBeGreaterThan(2.5);
  });
});

describe("generateScaledAnswers", () => {
  it("generates the correct count", () => {
    const answers = generateScaledAnswers(
      { "1": 10, "2": 20, "3": 30, "4": 25, "5": 15 },
      500,
      seededRandom(42)
    );
    expect(answers).toHaveLength(500);
  });

  it("all ratings are valid scale points", () => {
    const answers = generateScaledAnswers(
      { "1": 10, "2": 20, "3": 40, "4": 20, "5": 10 },
      500,
      seededRandom(42)
    );
    for (const a of answers) {
      expect([1, 2, 3, 4, 5]).toContain(a.rating);
    }
  });
});

describe("generateOpenTextAnswers", () => {
  it("generates the correct count", () => {
    const answers = generateOpenTextAnswers(
      ["Great!", "Okay", "Bad"],
      100,
      seededRandom(42)
    );
    expect(answers).toHaveLength(100);
  });

  it("only uses provided responses", () => {
    const pool = ["Great!", "Okay", "Bad"];
    const answers = generateOpenTextAnswers(pool, 100, seededRandom(42));
    for (const a of answers) {
      expect(pool).toContain(a.text);
    }
  });

  it("falls back to 'No response' for empty pool", () => {
    const answers = generateOpenTextAnswers([], 5, seededRandom(42));
    for (const a of answers) {
      expect(a.text).toBe("No response");
    }
  });
});

describe("generateMonadicSplitAnswers", () => {
  it("assigns variants from the provided list", () => {
    const answers = generateMonadicSplitAnswers(
      { a: { yesPercent: 60 }, b: { yesPercent: 40 } },
      ["a", "b"],
      "binary",
      500,
      seededRandom(42)
    );
    for (const a of answers) {
      expect(["a", "b"]).toContain(a.variant);
    }
  });

  it("binary format produces yes/no responses", () => {
    const answers = generateMonadicSplitAnswers(
      { a: { yesPercent: 50 } },
      ["a"],
      "binary",
      200,
      seededRandom(42)
    );
    for (const a of answers) {
      expect(["yes", "no"]).toContain(a.response);
    }
  });

  it("five_point format produces 1-5 ratings", () => {
    const answers = generateMonadicSplitAnswers(
      {
        a: { distribution: { "1": 10, "2": 20, "3": 30, "4": 25, "5": 15 } },
      },
      ["a"],
      "five_point",
      200,
      seededRandom(42)
    );
    for (const a of answers) {
      expect([1, 2, 3, 4, 5]).toContain(a.response);
    }
  });

  it("handles missing variant data gracefully", () => {
    const answers = generateMonadicSplitAnswers(
      {},
      ["a", "b"],
      "five_point",
      10,
      seededRandom(42)
    );
    expect(answers).toHaveLength(10);
    for (const a of answers) {
      expect(a.response).toBe(3); // fallback
    }
  });
});

describe("generateRankingAnswers", () => {
  it("each ranking contains all items exactly once", () => {
    const scores = { a: 90, b: 70, c: 50, d: 30, e: 10 };
    const answers = generateRankingAnswers(scores, 200, seededRandom(42));
    for (const a of answers) {
      expect(a.ranked).toHaveLength(5);
      expect([...a.ranked].sort()).toEqual(["a", "b", "c", "d", "e"]);
    }
  });

  it("higher-strength items tend to rank first", () => {
    const scores = { a: 100, b: 1, c: 1 };
    const answers = generateRankingAnswers(scores, 500, seededRandom(42));
    const aFirstCount = answers.filter((a) => a.ranked[0] === "a").length;
    expect(aFirstCount).toBeGreaterThan(300);
  });
});

describe("generateMaxDiffAnswers", () => {
  it("generates the correct count", () => {
    const answers = generateMaxDiffAnswers(
      { a: 3, b: 1, c: -1, d: -3 },
      4,
      100,
      seededRandom(42)
    );
    expect(answers).toHaveLength(100);
  });

  it("each set has correct item count", () => {
    const answers = generateMaxDiffAnswers(
      { a: 3, b: 1, c: -1, d: -3 },
      4,
      50,
      seededRandom(42)
    );
    for (const a of answers) {
      for (const set of a.sets) {
        expect(set.items).toHaveLength(4);
        expect(set.items).toContain(set.best);
        expect(set.items).toContain(set.worst);
        expect(set.best).not.toBe(set.worst);
      }
    }
  });
});

describe("generateGaborGrangerAnswers", () => {
  it("generates correct count with all price points", () => {
    const answers = generateGaborGrangerAnswers(
      { "0.99": 90, "1.49": 60, "1.99": 30 },
      200,
      seededRandom(42)
    );
    expect(answers).toHaveLength(200);
    for (const a of answers) {
      expect(a.method).toBe("gabor_granger");
      expect(a.responses).toHaveLength(3);
      expect(a.responses.map((r) => r.price)).toEqual([0.99, 1.49, 1.99]);
      for (const r of a.responses) {
        expect(typeof r.wouldBuy).toBe("boolean");
      }
    }
  });
});

describe("generateVanWestendorpAnswers", () => {
  it("enforces logical price ordering", () => {
    const answers = generateVanWestendorpAnswers(
      { tooCheap: 1.0, bargain: 1.5, expensive: 2.5, tooExpensive: 3.5 },
      { tooCheap: 0.3, bargain: 0.3, expensive: 0.3, tooExpensive: 0.3 },
      500,
      seededRandom(42)
    );
    expect(answers).toHaveLength(500);
    for (const a of answers) {
      expect(a.method).toBe("van_westendorp");
      expect(a.tooCheap).toBeLessThan(a.bargain);
      expect(a.bargain).toBeLessThan(a.expensive);
      expect(a.expensive).toBeLessThan(a.tooExpensive);
      expect(a.tooCheap).toBeGreaterThan(0);
    }
  });
});

describe("generateImplicitAssociationAnswers", () => {
  it("generates correct structure with all attributes", () => {
    const answers = generateImplicitAssociationAnswers(
      {
        Premium: { fitsPercent: 80, avgReactionMs: 450 },
        Cheap: { fitsPercent: 20, avgReactionMs: 550 },
      },
      100,
      seededRandom(42)
    );
    expect(answers).toHaveLength(100);
    for (const a of answers) {
      expect(a.associations).toHaveLength(2);
      const attrs = a.associations.map((x) => x.attribute);
      expect(attrs).toContain("Premium");
      expect(attrs).toContain("Cheap");
      for (const assoc of a.associations) {
        expect(["fits", "doesnt_fit"]).toContain(assoc.response);
        expect(assoc.reactionTimeMs).toBeGreaterThanOrEqual(200);
      }
    }
  });

  it("high fitsPercent produces mostly 'fits' responses", () => {
    const answers = generateImplicitAssociationAnswers(
      { Premium: { fitsPercent: 95, avgReactionMs: 400 } },
      1000,
      seededRandom(42)
    );
    const fitsCount = answers.filter(
      (a) => a.associations[0].response === "fits"
    ).length;
    expect(fitsCount).toBeGreaterThan(900);
  });
});

describe("generateImageHeatmapAnswers", () => {
  const hotspots = [
    { x: 30, y: 20, weight: 60, radius: 10, comments: ["Logo", "Name"] },
    { x: 70, y: 60, weight: 40, radius: 8, comments: ["Image"] },
  ];

  it("generates correct count with clicks in range", () => {
    const answers = generateImageHeatmapAnswers(
      hotspots,
      3,
      200,
      seededRandom(42)
    );
    expect(answers).toHaveLength(200);
    for (const a of answers) {
      expect(a.clicks.length).toBeGreaterThanOrEqual(1);
      expect(a.clicks.length).toBeLessThanOrEqual(3);
      for (const click of a.clicks) {
        expect(click.x).toBeGreaterThanOrEqual(0);
        expect(click.x).toBeLessThanOrEqual(100);
        expect(click.y).toBeGreaterThanOrEqual(0);
        expect(click.y).toBeLessThanOrEqual(100);
      }
    }
  });

  it("assigns comments from hotspot data", () => {
    const answers = generateImageHeatmapAnswers(
      hotspots,
      3,
      200,
      seededRandom(42)
    );
    const allComments = answers.flatMap((a) =>
      a.clicks.filter((c) => c.comment).map((c) => c.comment)
    );
    for (const c of allComments) {
      expect(["Logo", "Name", "Image"]).toContain(c);
    }
  });
});

// ---------------------------------------------------------------------------
// Prompt Builder
// ---------------------------------------------------------------------------

describe("buildPrompt", () => {
  const baseQuestion: Question = {
    id: "q1",
    project_id: "p1",
    type: "single_choice",
    title: "Which flavour?",
    description: null,
    options: [
      { id: "a", label: "Apple" },
      { id: "b", label: "Banana" },
    ],
    media_url: null,
    required: true,
    order_index: 0,
    settings: null,
    created_at: "2025-01-01",
  };

  it("includes the project title and survey framing", () => {
    const prompt = buildPrompt("Test Survey", null, [baseQuestion]);
    expect(prompt).toContain("Test Survey");
    expect(prompt).toContain("500 UK adults");
    expect(prompt).toContain("Return ONLY valid JSON");
  });

  it("includes project description when provided", () => {
    const prompt = buildPrompt("Test", "A test description", [baseQuestion]);
    expect(prompt).toContain("A test description");
  });

  it("includes all question IDs", () => {
    const q2: Question = {
      ...baseQuestion,
      id: "q2",
      type: "scaled_response",
      title: "Rate this",
      order_index: 1,
      options: null,
    };
    const prompt = buildPrompt("Test", null, [baseQuestion, q2]);
    expect(prompt).toContain("q1");
    expect(prompt).toContain("q2");
  });

  it("handles single_choice with includeNone", () => {
    const q: Question = {
      ...baseQuestion,
      settings: { includeNone: true },
    };
    const prompt = buildPrompt("Test", null, [q]);
    expect(prompt).toContain('none="None of these"');
  });

  it("handles scaled_response with labels", () => {
    const q: Question = {
      ...baseQuestion,
      type: "scaled_response",
      options: null,
      settings: {
        scalePoints: 5 as 5,
        scaleLabels: ["Terrible", "Poor", "OK", "Good", "Excellent"],
      },
    };
    const prompt = buildPrompt("Test", null, [q]);
    expect(prompt).toContain("1-5");
    expect(prompt).toContain("Terrible");
    expect(prompt).toContain("Excellent");
  });

  it("handles open_text with description", () => {
    const q: Question = {
      ...baseQuestion,
      type: "open_text",
      description: "Be honest",
      options: null,
    };
    const prompt = buildPrompt("Test", null, [q]);
    expect(prompt).toContain("Be honest");
    expect(prompt).toContain("50 unique");
  });

  it("handles monadic_split binary format", () => {
    const q: Question = {
      ...baseQuestion,
      type: "monadic_split",
      settings: { responseFormat: "binary" as "binary" },
    };
    const prompt = buildPrompt("Test", null, [q]);
    expect(prompt).toContain("binary");
    expect(prompt).toContain("yesPercent");
  });

  it("handles anchored_pricing gabor_granger", () => {
    const q: Question = {
      ...baseQuestion,
      type: "anchored_pricing",
      options: null,
      settings: {
        pricingMethod: "gabor_granger" as "gabor_granger",
        pricePoints: [0.99, 1.49, 1.99],
        currency: "£",
      },
    };
    const prompt = buildPrompt("Test", null, [q]);
    expect(prompt).toContain("gabor_granger");
    expect(prompt).toContain("£0.99");
  });

  it("handles implicit_association attributes", () => {
    const q: Question = {
      ...baseQuestion,
      type: "implicit_association",
      options: null,
      settings: { attributes: ["Premium", "Cheap"] },
    };
    const prompt = buildPrompt("Test", null, [q]);
    expect(prompt).toContain("Premium");
    expect(prompt).toContain("avgReactionMs");
  });
});
