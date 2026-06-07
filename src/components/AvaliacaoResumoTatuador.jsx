import { computeReviewSummary } from "../lib/rating";

/**
 * Exibe média em estrelas e quantidade de avaliações (somente leitura; envio fica no app mobile).
 */
export default function AvaliacaoResumoTatuador({ reviews, loading }) {
  if (loading) {
    return (
      <p className="text-gray-500 text-sm" role="status">
        Carregando avaliações…
      </p>
    );
  }

  const list = Array.isArray(reviews) ? reviews : [];
  if (list.length === 0) {
    return (
      <p className="text-gray-500 text-sm mt-1 max-w-md mx-auto">
        Nenhuma avaliação ainda. Clientes podem avaliar após a sessão concluída no app.
      </p>
    );
  }

  const { roundedAverage, fullStars, count } = computeReviewSummary(list);

  const label = `Média ${roundedAverage} de 5, ${count} ${
    count === 1 ? "avaliação" : "avaliações"
  }`;

  return (
    <div
      className="mt-3 flex flex-col items-center gap-1"
      role="img"
      aria-label={label}
    >
      <div className="flex items-center gap-1.5 text-amber-400 text-2xl leading-none">
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} className="select-none">
            {i < fullStars ? "\u2605" : "\u2606"}
          </span>
        ))}
      </div>
      <p className="text-white text-base font-medium">
        {roundedAverage}
        <span className="text-gray-400 text-sm font-normal ml-2">
          ({count} {count === 1 ? "avaliação" : "avaliações"})
        </span>
      </p>
    </div>
  );
}
