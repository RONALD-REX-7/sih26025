import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PerspectiveProvider, usePerspective } from './perspective-context';

function TestConsumer() {
  const { perspective, setPerspective, perspectiveLabel } = usePerspective();
  return (
    <div>
      <span data-testid="perspective">{perspective}</span>
      <span data-testid="perspective-label">{perspectiveLabel}</span>
      <button onClick={() => setPerspective('PLANNER')}>Switch to Planner</button>
      <button onClick={() => setPerspective('REGULATOR')}>Switch to Regulator</button>
      <button onClick={() => setPerspective('OPERATOR')}>Switch to Operator</button>
    </div>
  );
}

describe('PerspectiveContext', () => {
  it('defaults to OPERATOR perspective with correct metadata', () => {
    render(
      <PerspectiveProvider>
        <TestConsumer />
      </PerspectiveProvider>
    );

    expect(screen.getByTestId('perspective').textContent).toBe('OPERATOR');
    expect(screen.getByTestId('perspective-label').textContent).toContain('Mine Operator');
  });

  it('allows switching to PLANNER and REGULATOR perspectives', () => {
    render(
      <PerspectiveProvider>
        <TestConsumer />
      </PerspectiveProvider>
    );

    fireEvent.click(screen.getByText('Switch to Planner'));
    expect(screen.getByTestId('perspective').textContent).toBe('PLANNER');
    expect(screen.getByTestId('perspective-label').textContent).toContain('Mine Planner');

    fireEvent.click(screen.getByText('Switch to Regulator'));
    expect(screen.getByTestId('perspective').textContent).toBe('REGULATOR');
    expect(screen.getByTestId('perspective-label').textContent).toContain('Statutory Regulator');

    fireEvent.click(screen.getByText('Switch to Operator'));
    expect(screen.getByTestId('perspective').textContent).toBe('OPERATOR');
  });
});
