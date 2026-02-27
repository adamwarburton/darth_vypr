import type {
  Answer,
  Question,
  MonadicSplitAnswer,
  SingleChoiceAnswer,
  MultipleChoiceAnswer,
  ScaledResponseAnswer,
  OpenTextAnswer,
  RankingAnswer,
  MaxDiffAnswer,
  GaborGrangerAnswer,
  VanWestendorpAnswer,
  AnchoredPricingAnswer,
  ImplicitAssociationAnswer,
  ImageHeatmapAnswer,
  ChoiceOption,
  MonadicSplitAggregation,
  SingleChoiceAggregation,
  MultipleChoiceAggregation,
  ScaledResponseAggregation,
  OpenTextAggregation,
  RankingAggregation,
  MaxDiffAggregation,
  GaborGrangerAggregation,
  VanWestendorpAggregation,
  ImplicitAssociationAggregation,
  ImageHeatmapAggregation,
} from "@/types";

// --- Helpers ---

function mean(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function stdDev(nums: number[]): number {
  if (nums.length < 2) return 0;
  const m = mean(nums);
  const variance = nums.reduce((sum, v) => sum + (v - m) ** 2, 0) / nums.length;
  return Math.sqrt(variance);
}

function getAnswersForQuestion(answers: Answer[], questionId: string): Answer[] {
  return answers.filter((a) => a.question_id === questionId);
}

// --- Monadic Split ---

export function aggregateMonadicSplit(
  answers: Answer[],
  question: Question
): MonadicSplitAggregation {
  const qAnswers = getAnswersForQuestion(answers, question.id);
  const responseFormat =
    question.settings?.responseFormat === "five_point" ? "five_point" : "binary";
  const variantCount = question.settings?.variantCount ?? 2;

  const variantKeys = ["a", "b", ...(variantCount === 3 ? ["c"] : [])];
  const variants = variantKeys.map((key) => {
    const variantAnswers = qAnswers.filter(
      (a) => (a.value as MonadicSplitAnswer).variant === key
    );
    const sampleSize = variantAnswers.length;

    if (responseFormat === "binary") {
      const yesCount = variantAnswers.filter(
        (a) => (a.value as MonadicSplitAnswer).response === "yes"
      ).length;
      return {
        key,
        label: `Variant ${key.toUpperCase()}`,
        sampleSize,
        yesPercent: sampleSize > 0 ? (yesCount / sampleSize) * 100 : 0,
      };
    } else {
      const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      variantAnswers.forEach((a) => {
        const rating = (a.value as MonadicSplitAnswer).response as number;
        distribution[rating] = (distribution[rating] || 0) + 1;
      });
      const top2Count = (distribution[4] || 0) + (distribution[5] || 0);
      return {
        key,
        label: `Variant ${key.toUpperCase()}`,
        sampleSize,
        distribution,
        top2Box: sampleSize > 0 ? (top2Count / sampleSize) * 100 : 0,
      };
    }
  });

  const winnerKey =
    responseFormat === "binary"
      ? variants.reduce((best, v) =>
          (v.yesPercent ?? 0) > (best.yesPercent ?? 0) ? v : best
        ).key
      : variants.reduce((best, v) =>
          (v.top2Box ?? 0) > (best.top2Box ?? 0) ? v : best
        ).key;

  return {
    variants,
    responseFormat,
    totalResponses: qAnswers.length,
    winnerKey,
  };
}

// --- Single Choice ---

export function aggregateSingleChoice(
  answers: Answer[],
  question: Question
): SingleChoiceAggregation {
  const qAnswers = getAnswersForQuestion(answers, question.id);
  const totalResponses = qAnswers.length;
  const optionDefs = (question.options as ChoiceOption[]) || [];

  const counts: Record<string, number> = {};
  optionDefs.forEach((o) => (counts[o.id] = 0));
  counts["none"] = 0;

  qAnswers.forEach((a) => {
    const selected = (a.value as SingleChoiceAnswer).selected;
    counts[selected] = (counts[selected] || 0) + 1;
  });

  const options = optionDefs
    .map((o) => ({
      id: o.id,
      label: o.label,
      count: counts[o.id] || 0,
      percent: totalResponses > 0 ? ((counts[o.id] || 0) / totalResponses) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count);

  const noneCount = counts["none"] || 0;
  const nonePercent =
    totalResponses > 0 ? (noneCount / totalResponses) * 100 : 0;

  const topPercent = options[0]?.percent ?? 0;
  const secondPercent = options[1]?.percent ?? 0;

  return {
    options,
    totalResponses,
    noneCount,
    nonePercent,
    clearWinner: topPercent > 40,
    closeContest: Math.abs(topPercent - secondPercent) <= 5,
  };
}

// --- Multiple Choice ---

export function aggregateMultipleChoice(
  answers: Answer[],
  question: Question
): MultipleChoiceAggregation {
  const qAnswers = getAnswersForQuestion(answers, question.id);
  const totalResponses = qAnswers.length;
  const optionDefs = (question.options as ChoiceOption[]) || [];

  const counts: Record<string, number> = {};
  optionDefs.forEach((o) => (counts[o.id] = 0));

  let totalSelections = 0;
  qAnswers.forEach((a) => {
    const selected = (a.value as MultipleChoiceAnswer).selected;
    totalSelections += selected.length;
    selected.forEach((s) => {
      counts[s] = (counts[s] || 0) + 1;
    });
  });

  const options = optionDefs
    .map((o) => ({
      id: o.id,
      label: o.label,
      count: counts[o.id] || 0,
      percent: totalResponses > 0 ? ((counts[o.id] || 0) / totalResponses) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // Find natural cut line — largest gap > 15% between consecutive ranked options
  let cutLineIndex: number | null = null;
  for (let i = 0; i < options.length - 1; i++) {
    if (options[i].percent - options[i + 1].percent > 15) {
      cutLineIndex = i;
      break;
    }
  }

  return {
    options,
    totalResponses,
    avgSelectionsPerRespondent:
      totalResponses > 0 ? totalSelections / totalResponses : 0,
    cutLineIndex,
  };
}

// --- Scaled Response ---

export function aggregateScaledResponse(
  answers: Answer[],
  question: Question
): ScaledResponseAggregation {
  const qAnswers = getAnswersForQuestion(answers, question.id);
  const scaleMax = question.settings?.scalePoints ?? 7;
  const scaleLabels = question.settings?.scaleLabels ?? [];
  const ratings = qAnswers.map((a) => (a.value as ScaledResponseAnswer).rating);

  const distribution: Array<{ point: number; label: string; count: number; percent: number }> = [];
  for (let i = 1; i <= scaleMax; i++) {
    const count = ratings.filter((r) => r === i).length;
    distribution.push({
      point: i,
      label: scaleLabels[i - 1] || `${i}`,
      count,
      percent: ratings.length > 0 ? (count / ratings.length) * 100 : 0,
    });
  }

  const top2Count = ratings.filter((r) => r >= scaleMax - 1).length;
  const bottom2Count = ratings.filter((r) => r <= 2).length;

  return {
    distribution,
    mean: mean(ratings),
    stdDev: stdDev(ratings),
    scaleMax,
    top2Box: ratings.length > 0 ? (top2Count / ratings.length) * 100 : 0,
    bottom2Box: ratings.length > 0 ? (bottom2Count / ratings.length) * 100 : 0,
    netScore:
      ratings.length > 0
        ? ((top2Count - bottom2Count) / ratings.length) * 100
        : 0,
    totalResponses: ratings.length,
  };
}

// --- Open Text ---

export function aggregateOpenText(
  answers: Answer[],
  question: Question
): OpenTextAggregation {
  const qAnswers = getAnswersForQuestion(answers, question.id);
  const responses = qAnswers.map((a) => ({
    text: (a.value as OpenTextAnswer).text,
    answeredAt: a.answered_at,
  }));

  const totalLength = responses.reduce((sum, r) => sum + r.text.length, 0);

  return {
    totalResponses: responses.length,
    avgLength: responses.length > 0 ? totalLength / responses.length : 0,
    responses,
  };
}

// --- Ranking ---

export function aggregateRanking(
  answers: Answer[],
  question: Question
): RankingAggregation {
  const qAnswers = getAnswersForQuestion(answers, question.id);
  const optionDefs = (question.options as ChoiceOption[]) || [];
  const totalResponses = qAnswers.length;

  const itemRanks: Record<string, number[]> = {};
  optionDefs.forEach((o) => (itemRanks[o.id] = []));

  qAnswers.forEach((a) => {
    const ranked = (a.value as RankingAnswer).ranked;
    ranked.forEach((itemId, index) => {
      if (!itemRanks[itemId]) itemRanks[itemId] = [];
      itemRanks[itemId].push(index + 1);
    });
  });

  const items = optionDefs.map((o) => {
    const ranks = itemRanks[o.id] || [];
    const rankFrequency: Record<number, number> = {};
    for (let i = 1; i <= optionDefs.length; i++) rankFrequency[i] = 0;
    ranks.forEach((r) => (rankFrequency[r] = (rankFrequency[r] || 0) + 1));

    return {
      id: o.id,
      label: o.label,
      avgRank: mean(ranks),
      stdDev: stdDev(ranks),
      firstPlacePercent:
        totalResponses > 0
          ? ((rankFrequency[1] || 0) / totalResponses) * 100
          : 0,
      rankFrequency,
    };
  });

  items.sort((a, b) => a.avgRank - b.avgRank);

  const avgStdDev = mean(items.map((i) => i.stdDev));
  const consensusLevel: "high" | "medium" | "low" =
    avgStdDev < 1 ? "high" : avgStdDev < 2 ? "medium" : "low";

  return { items, totalResponses, consensusLevel };
}

// --- MaxDiff ---

export function aggregateMaxDiff(
  answers: Answer[],
  question: Question
): MaxDiffAggregation {
  const qAnswers = getAnswersForQuestion(answers, question.id);
  const optionDefs = (question.options as ChoiceOption[]) || [];

  const itemStats: Record<string, { best: number; worst: number; shown: number }> = {};
  optionDefs.forEach(
    (o) => (itemStats[o.id] = { best: 0, worst: 0, shown: 0 })
  );

  let totalSets = 0;
  qAnswers.forEach((a) => {
    const { sets } = a.value as MaxDiffAnswer;
    totalSets += sets.length;
    sets.forEach((set) => {
      set.items.forEach((itemId) => {
        if (!itemStats[itemId])
          itemStats[itemId] = { best: 0, worst: 0, shown: 0 };
        itemStats[itemId].shown++;
      });
      if (itemStats[set.best]) itemStats[set.best].best++;
      if (itemStats[set.worst]) itemStats[set.worst].worst++;
    });
  });

  const items = optionDefs.map((o) => {
    const s = itemStats[o.id] || { best: 0, worst: 0, shown: 0 };
    const utility = s.shown > 0 ? (s.best - s.worst) / s.shown : 0;
    return {
      id: o.id,
      label: o.label,
      bestCount: s.best,
      worstCount: s.worst,
      shownCount: s.shown,
      utility,
      preferenceShare: 0,
    };
  });

  // Calculate preference shares (rescale to sum to 100)
  const minUtil = Math.min(...items.map((i) => i.utility));
  const shifted = items.map((i) => i.utility - minUtil + 0.01);
  const total = shifted.reduce((a, b) => a + b, 0);
  items.forEach((item, i) => {
    item.preferenceShare = (shifted[i] / total) * 100;
  });

  items.sort((a, b) => b.utility - a.utility);

  return { items, totalSets, totalResponses: qAnswers.length };
}

// --- Gabor-Granger ---

export function aggregateGaborGranger(
  answers: Answer[],
  question: Question
): GaborGrangerAggregation {
  const qAnswers = getAnswersForQuestion(answers, question.id);
  const currency = (question.settings?.currency as string) || "£";

  const priceResponses: Record<number, { yes: number; total: number }> = {};

  qAnswers.forEach((a) => {
    const val = a.value as GaborGrangerAnswer;
    val.responses.forEach((r) => {
      if (!priceResponses[r.price]) priceResponses[r.price] = { yes: 0, total: 0 };
      priceResponses[r.price].total++;
      if (r.wouldBuy) priceResponses[r.price].yes++;
    });
  });

  const pricePoints = Object.entries(priceResponses)
    .map(([price, data]) => ({
      price: parseFloat(price),
      wouldBuyPercent: data.total > 0 ? (data.yes / data.total) * 100 : 0,
      revenueIndex: 0,
    }))
    .sort((a, b) => a.price - b.price);

  // Calculate revenue index (price × buy probability)
  const maxRevenue = Math.max(
    ...pricePoints.map((p) => p.price * (p.wouldBuyPercent / 100)),
    1
  );
  pricePoints.forEach((p) => {
    p.revenueIndex = ((p.price * (p.wouldBuyPercent / 100)) / maxRevenue) * 100;
  });

  const optimalPrice =
    pricePoints.reduce(
      (best, p) =>
        p.price * (p.wouldBuyPercent / 100) >
        best.price * (best.wouldBuyPercent / 100)
          ? p
          : best,
      pricePoints[0] || { price: 0, wouldBuyPercent: 0 }
    )?.price ?? 0;

  const priceCeiling =
    [...pricePoints].reverse().find((p) => p.wouldBuyPercent >= 50)?.price ??
    pricePoints[0]?.price ??
    0;

  return {
    pricePoints,
    optimalPrice,
    priceCeiling,
    totalResponses: qAnswers.length,
    currency,
  };
}

// --- Van Westendorp ---

export function aggregateVanWestendorp(
  answers: Answer[],
  question: Question
): VanWestendorpAggregation {
  const qAnswers = getAnswersForQuestion(answers, question.id);
  const currency = (question.settings?.currency as string) || "£";

  const tooCheapVals: number[] = [];
  const bargainVals: number[] = [];
  const expensiveVals: number[] = [];
  const tooExpensiveVals: number[] = [];

  qAnswers.forEach((a) => {
    const val = a.value as VanWestendorpAnswer;
    tooCheapVals.push(val.tooCheap);
    bargainVals.push(val.bargain);
    expensiveVals.push(val.expensive);
    tooExpensiveVals.push(val.tooExpensive);
  });

  const allPrices = [
    ...tooCheapVals,
    ...bargainVals,
    ...expensiveVals,
    ...tooExpensiveVals,
  ].sort((a, b) => a - b);
  const minPrice = allPrices[0] ?? 0;
  const maxPrice = allPrices[allPrices.length - 1] ?? 10;

  // Create cumulative distribution curves
  const steps = 50;
  const stepSize = (maxPrice - minPrice) / steps;
  const priceRange: number[] = [];
  for (let i = 0; i <= steps; i++) {
    priceRange.push(Math.round((minPrice + i * stepSize) * 100) / 100);
  }

  function cumPercent(values: number[], price: number, ascending: boolean) {
    const count = ascending
      ? values.filter((v) => v <= price).length
      : values.filter((v) => v >= price).length;
    return values.length > 0 ? (count / values.length) * 100 : 0;
  }

  const curves = {
    tooCheap: priceRange.map((p) => ({
      price: p,
      cumPercent: cumPercent(tooCheapVals, p, false),
    })),
    bargain: priceRange.map((p) => ({
      price: p,
      cumPercent: cumPercent(bargainVals, p, false),
    })),
    expensive: priceRange.map((p) => ({
      price: p,
      cumPercent: cumPercent(expensiveVals, p, true),
    })),
    tooExpensive: priceRange.map((p) => ({
      price: p,
      cumPercent: cumPercent(tooExpensiveVals, p, true),
    })),
  };

  // Find intersection points
  function findIntersection(
    curve1: Array<{ price: number; cumPercent: number }>,
    curve2: Array<{ price: number; cumPercent: number }>
  ): number {
    for (let i = 0; i < curve1.length - 1; i++) {
      const diff1 = curve1[i].cumPercent - curve2[i].cumPercent;
      const diff2 = curve1[i + 1].cumPercent - curve2[i + 1].cumPercent;
      if (diff1 * diff2 <= 0) {
        return (curve1[i].price + curve1[i + 1].price) / 2;
      }
    }
    return (minPrice + maxPrice) / 2;
  }

  const pmc = findIntersection(curves.tooCheap, curves.expensive);
  const pme = findIntersection(curves.bargain, curves.tooExpensive);
  const idp = findIntersection(curves.bargain, curves.expensive);
  const opp = findIntersection(curves.tooCheap, curves.tooExpensive);

  return {
    priceRange,
    curves,
    opp,
    idp,
    pmc,
    pme,
    totalResponses: qAnswers.length,
    currency,
  };
}

// --- Implicit Association ---

export function aggregateImplicitAssociation(
  answers: Answer[],
  question: Question
): ImplicitAssociationAggregation {
  const qAnswers = getAnswersForQuestion(answers, question.id);
  const allAttributes = question.settings?.attributes || [];

  const attrStats: Record<
    string,
    { fits: number; doesntFit: number; reactionTimes: number[]; total: number }
  > = {};

  allAttributes.forEach((attr: string) => {
    attrStats[attr] = { fits: 0, doesntFit: 0, reactionTimes: [], total: 0 };
  });

  let excludedTooFast = 0;
  let flaggedTooSlow = 0;

  qAnswers.forEach((a) => {
    const { associations } = a.value as ImplicitAssociationAnswer;
    associations.forEach((assoc) => {
      if (assoc.reactionTimeMs < 200) {
        excludedTooFast++;
        return;
      }
      if (assoc.reactionTimeMs > 800) flaggedTooSlow++;

      if (!attrStats[assoc.attribute]) {
        attrStats[assoc.attribute] = {
          fits: 0,
          doesntFit: 0,
          reactionTimes: [],
          total: 0,
        };
      }
      const s = attrStats[assoc.attribute];
      s.total++;
      if (assoc.response === "fits") s.fits++;
      else s.doesntFit++;
      s.reactionTimes.push(assoc.reactionTimeMs);
    });
  });

  const attributes = Object.entries(attrStats).map(([attr, s]) => ({
    attribute: attr,
    fitsPercent: s.total > 0 ? (s.fits / s.total) * 100 : 0,
    doesntFitPercent: s.total > 0 ? (s.doesntFit / s.total) * 100 : 0,
    avgReactionTimeMs: mean(s.reactionTimes),
    totalResponses: s.total,
  }));

  attributes.sort(
    (a, b) =>
      b.fitsPercent - b.doesntFitPercent - (a.fitsPercent - a.doesntFitPercent)
  );

  const allReactionTimes = attributes.flatMap((a) =>
    attrStats[a.attribute].reactionTimes
  );

  return {
    attributes,
    avgReactionTimeMs: mean(allReactionTimes),
    excludedTooFast,
    flaggedTooSlow,
    totalResponses: qAnswers.length,
  };
}

// --- Image Heatmap ---

export function aggregateImageHeatmap(
  answers: Answer[],
  question: Question
): ImageHeatmapAggregation {
  const qAnswers = getAnswersForQuestion(answers, question.id);

  const allClicks: Array<{ x: number; y: number; comment?: string }> = [];
  qAnswers.forEach((a) => {
    const { clicks } = a.value as ImageHeatmapAnswer;
    allClicks.push(...clicks);
  });

  return {
    clicks: allClicks,
    totalClicks: allClicks.length,
    avgClicksPerRespondent:
      qAnswers.length > 0 ? allClicks.length / qAnswers.length : 0,
    totalResponses: qAnswers.length,
    imageUrl: question.media_url,
  };
}
