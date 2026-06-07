/** Média e estrelas a partir da lista de reviews ({ nota }). */
export function computeReviewSummary(reviews) {
  const list = Array.isArray(reviews) ? reviews : [];
  if (!list.length) {
    return { average: 0, roundedAverage: 0, fullStars: 0, count: 0 };
  }
  const sum = list.reduce((s, r) => s + (Number(r.nota) || 0), 0);
  const average = sum / list.length;
  const roundedAverage = Math.round(average * 10) / 10;
  const fullStars = fullStarsFromRating(average);
  return { average, roundedAverage, fullStars, count: list.length };
}

/** Estrelas cheias (0–5) a partir da média numérica — arredonda para o inteiro mais próximo. */
export function fullStarsFromRating(rating) {
  const n = Number(rating) || 0;
  return Math.min(5, Math.max(0, Math.round(n)));
}
