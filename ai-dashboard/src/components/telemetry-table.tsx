'use client';

import { useState, useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';

interface TelemetryLog {
  id: string;
  request_id: string;
  user_id: string;
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
  latency_ms: number;
  status: string;
  eval_context: { environment: string; expected_task: string } | null;
  timestamp: string;
}

interface TelemetryTableProps {
  logs: TelemetryLog[];
}

function IconClock({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconZap({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M13 2L3 14h7l-1 8L21 10h-7l-1-8z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

function IconCheck({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconChevronLeft({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconChevronRight({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M9 19l7-7-7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function TelemetryTable({ logs }: TelemetryTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const sortedLogs = useMemo(() => {
    return [...(logs ?? [])].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [logs]);

  const totalPages = Math.ceil((sortedLogs?.length ?? 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLogs = sortedLogs?.slice(startIndex, endIndex) ?? [];

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    if (start > 1) pages.push(1);
    if (start > 2) pages.push('...');

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages - 1) pages.push('...');
    if (end < totalPages) pages.push(totalPages);

    return pages;
  };

  return (
    <section className="rounded-md border border-white/10 bg-[linear-gradient(145deg,rgba(18,23,31,0.8),rgba(10,14,21,0.95))]">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 md:px-6">
        <div>
          <h2 className="text-lg font-medium text-white">Telemetry Table</h2>
          <p className="mt-1 text-sm text-white/45">Most recent gateway executions with latency, token usage, and status.</p>
        </div>
        <div className="rounded-[2px] border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-emerald-300">
          Streaming live
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.2em] text-white/35">
            <tr className="border-b border-white/10">
              <th className="px-5 py-4 font-medium md:px-6">Timestamp</th>
              <th className="px-5 py-4 font-medium md:px-6">Developer ID</th>
              <th className="px-5 py-4 font-medium md:px-6">Model</th>
              <th className="px-5 py-4 font-medium md:px-6">Eval task</th>
              <th className="px-5 py-4 font-medium text-right md:px-6">Latency</th>
              <th className="px-5 py-4 font-medium text-right md:px-6">Tokens</th>
              <th className="px-5 py-4 font-medium text-center md:px-6">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {paginatedLogs.map((log: TelemetryLog) => (
              <tr key={log.id} className="transition-colors hover:bg-white/[0.025]">
                <td className="px-5 py-4 whitespace-nowrap text-white/50 md:px-6">
                  {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                </td>
                <td className="px-5 py-4 font-mono text-cyan-300 md:px-6">{log.user_id}</td>
                <td className="px-5 py-4 md:px-6">
                  <span className="inline-flex rounded-[2px] border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-white/75">
                    {log.model}
                  </span>
                </td>
                <td className="max-w-xs truncate px-5 py-4 text-white/70 md:px-6">{log.eval_context?.expected_task || '—'}</td>
                <td className="px-5 py-4 text-right tabular-nums md:px-6">
                  <div className="flex items-center justify-end gap-1.5 text-amber-300">
                    <IconClock className="h-3.5 w-3.5" />
                    {log.latency_ms}ms
                  </div>
                </td>
                <td className="px-5 py-4 text-right tabular-nums text-white/55 md:px-6">
                  <div className="flex items-center justify-end gap-1.5">
                    <IconZap className="h-3.5 w-3.5 text-sky-300" />
                    {log.prompt_tokens + log.completion_tokens}
                  </div>
                </td>
                <td className="px-5 py-4 text-center md:px-6">
                  {log.status === 'success' ? (
                    <span className="inline-flex items-center gap-2 rounded-[2px] border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
                      <IconCheck className="h-3.5 w-3.5" /> Success
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 rounded-[2px] border border-red-400/20 bg-red-400/10 px-3 py-1 text-xs font-medium text-red-300">
                      <span className="h-2 w-2 rounded-full bg-red-400" /> Failed
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t border-white/10 px-5 py-4 md:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/45">Items per page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="rounded-[2px] border border-white/10 bg-slate-950/80 px-3 py-1.5 text-sm text-white transition-colors hover:border-white/20 focus:border-cyan-400/50 focus:outline-none"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-sm text-white/45">
              Showing {startIndex + 1}–{Math.min(endIndex, sortedLogs?.length ?? 0)} of {sortedLogs?.length ?? 0}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="inline-flex items-center gap-2 rounded-[2px] border border-white/10 bg-slate-950/80 px-3 py-1.5 text-sm text-white transition-colors hover:border-white/20 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Previous page"
            >
              <IconChevronLeft className="h-4 w-4" />
              Previous
            </button>

            <div className="flex items-center gap-1">
              {getPageNumbers().map((page, index) => (
                <button
                  key={index}
                  onClick={() => typeof page === 'number' && handlePageClick(page)}
                  disabled={page === '...'}
                  className={`min-w-[2.5rem] rounded-[2px] px-2 py-1.5 text-sm font-medium transition-colors ${
                    page === currentPage
                      ? 'border border-cyan-400/30 bg-cyan-400/10 text-cyan-300'
                      : page === '...'
                        ? 'cursor-default text-white/35'
                        : 'border border-white/10 bg-slate-950/80 text-white hover:border-white/20'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="inline-flex items-center gap-2 rounded-[2px] border border-white/10 bg-slate-950/80 px-3 py-1.5 text-sm text-white transition-colors hover:border-white/20 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Next page"
            >
              Next
              <IconChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
