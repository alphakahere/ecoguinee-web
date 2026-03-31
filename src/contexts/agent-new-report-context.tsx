'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';

type Value = { openNewReportModal: () => void };

const AgentNewReportContext = createContext<Value | null>(null);

export function AgentNewReportProvider({
  children,
  openNewReportModal,
}: {
  children: ReactNode;
  openNewReportModal: () => void;
}) {
  const value = useMemo(() => ({ openNewReportModal }), [openNewReportModal]);
  return (
    <AgentNewReportContext.Provider value={value}>{children}</AgentNewReportContext.Provider>
  );
}

export function useAgentOpenNewReport() {
  const ctx = useContext(AgentNewReportContext);
  if (!ctx) {
    throw new Error('useAgentOpenNewReport must be used within AgentNewReportProvider');
  }
  return ctx;
}
