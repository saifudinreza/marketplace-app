export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = start + maxVisible - 1;
    if (end > totalPages) { end = totalPages; start = Math.max(1, end - maxVisible + 1); }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const visiblePages = getVisiblePages();

  const btnBase = "px-3.5 py-2 min-w-10 rounded-[6px] border text-[13px] font-bold cursor-pointer transition-all duration-200 disabled:opacity-45 disabled:cursor-not-allowed";
  const btnOutline = `${btnBase} bg-transparent border-line text-primary hover:bg-page hover:border-secondary hover:text-secondary`;
  const btnPrimary = `${btnBase} bg-primary border-primary text-white`;

  return (
    <div className="flex justify-center gap-1.5 mt-7 mb-2 flex-wrap">
      <button className={btnOutline} onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
        « Prev
      </button>

      {visiblePages[0] > 1 && (
        <>
          <button className={btnOutline} onClick={() => onPageChange(1)}>1</button>
          {visiblePages[0] > 2 && <span className="flex items-center px-1 text-muted text-base select-none">…</span>}
        </>
      )}

      {visiblePages.map((p) => (
        <button
          key={p}
          className={p === currentPage ? btnPrimary : btnOutline}
          onClick={() => onPageChange(p)}
        >
          {p}
        </button>
      ))}

      {visiblePages[visiblePages.length - 1] < totalPages && (
        <>
          {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
            <span className="flex items-center px-1 text-muted text-base select-none">…</span>
          )}
          <button className={btnOutline} onClick={() => onPageChange(totalPages)}>{totalPages}</button>
        </>
      )}

      <button className={btnOutline} onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
        Next »
      </button>
    </div>
  );
}
