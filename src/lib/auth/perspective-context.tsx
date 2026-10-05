'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type ViewPerspective = 'OPERATOR' | 'PLANNER' | 'REGULATOR';

interface PerspectiveContextType {
  perspective: ViewPerspective;
  setPerspective: (p: ViewPerspective) => void;
  perspectiveLabel: string;
}

const PerspectiveContext = createContext<PerspectiveContextType>({
  perspective: 'OPERATOR',
  setPerspective: () => {},
  perspectiveLabel: 'Mine Operator (Live Command & Early Warning)',
});

export function PerspectiveProvider({ children }: { children: React.ReactNode }) {
  const [perspective, setPerspectiveState] = useState<ViewPerspective>('OPERATOR');

  useEffect(() => {
    const saved = localStorage.getItem('mineguard_perspective');
    if (saved === 'OPERATOR' || saved === 'PLANNER' || saved === 'REGULATOR') {
      setPerspectiveState(saved);
    }
  }, []);

  const setPerspective = (p: ViewPerspective) => {
    setPerspectiveState(p);
    localStorage.setItem('mineguard_perspective', p);
  };

  const getLabel = (p: ViewPerspective) => {
    switch (p) {
      case 'PLANNER':
        return 'Mine Planner (Geotechnical Forecast & Goaf Subsidence)';
      case 'REGULATOR':
        return 'Statutory Regulator (DGMS CMR 112 Audit & Evidence)';
      default:
        return 'Mine Operator (Live Command & Early Warning)';
    }
  };

  return (
    <PerspectiveContext.Provider
      value={{
        perspective,
        setPerspective,
        perspectiveLabel: getLabel(perspective),
      }}
    >
      {children}
    </PerspectiveContext.Provider>
  );
}

export const usePerspective = () => useContext(PerspectiveContext);
