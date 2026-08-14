import { PREDICTION_POINTS } from "./enums";

export type PredictionScoringInput = {
  predictedHomeScore: number;
  predictedAwayScore: number;
  predictedFirstScorer?: string | null;
  actualHomeScore: number;
  actualAwayScore: number;
  actualFirstScorer?: string | null;
};

function outcome(home: number, away: number): "home" | "away" | "draw" {
  if (home > away) return "home";
  if (away > home) return "away";
  return "draw";
}

function normalizeScorer(name?: string | null): string {
  return (name ?? "").trim().toLowerCase();
}

/**
 * Stacking formula (PRD §4.5, kept deliberately simple — fan fun, not
 * fantasy football): exact scoreline = 3, correct outcome only = 1,
 * correct first goalscorer = +1 bonus stacking with either. Max 4/match.
 * The scorer bonus never applies if the actual scorer wasn't recorded
 * (e.g. a 0-0 draw) — nobody can "guess" a goal that didn't happen.
 */
export function computePredictionPoints(input: PredictionScoringInput): number {
  const {
    predictedHomeScore,
    predictedAwayScore,
    predictedFirstScorer,
    actualHomeScore,
    actualAwayScore,
    actualFirstScorer,
  } = input;

  let points = 0;

  const exactMatch = predictedHomeScore === actualHomeScore && predictedAwayScore === actualAwayScore;
  if (exactMatch) {
    points += PREDICTION_POINTS.exactScore;
  } else if (outcome(predictedHomeScore, predictedAwayScore) === outcome(actualHomeScore, actualAwayScore)) {
    points += PREDICTION_POINTS.correctOutcomeOnly;
  }

  const actualScorerNorm = normalizeScorer(actualFirstScorer);
  const predictedScorerNorm = normalizeScorer(predictedFirstScorer);
  if (actualScorerNorm && predictedScorerNorm && actualScorerNorm === predictedScorerNorm) {
    points += PREDICTION_POINTS.correctScorerBonus;
  }

  return points;
}
