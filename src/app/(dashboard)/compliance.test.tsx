import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import PrivacyPolicyPage from './privacy/page';
import TermsOfUsePage from './terms/page';
import TransparencyPage from './transparency/page';
import AboutProjectPage from './about/page';
import { Footer } from '@/components/layout/footer';

describe('Compliance, Legal & Transparency Pages', () => {
  describe('Footer Component', () => {
    it('renders prototype and safety disclaimer', () => {
      render(<Footer />);
      expect(screen.getByText(/Prototype & Safety Disclaimer:/i)).toBeInTheDocument();
      expect(screen.getByText(/student engineering prototype developed for Smart India Hackathon 2026/i)).toBeInTheDocument();
    });

    it('renders navigation links to legal and transparency routes', () => {
      render(<Footer />);
      expect(screen.getByRole('link', { name: /privacy policy/i })).toHaveAttribute('href', '/privacy');
      expect(screen.getByRole('link', { name: /terms of use/i })).toHaveAttribute('href', '/terms');
      expect(screen.getByRole('link', { name: /transparency/i })).toHaveAttribute('href', '/transparency');
      expect(screen.getByRole('link', { name: /system architecture/i })).toHaveAttribute('href', '/about');
    });

    it('displays zero tracking cookies and self-hosted fonts notice', () => {
      render(<Footer />);
      expect(screen.getByText(/Zero Tracking Cookies • Self-Hosted Fonts/i)).toBeInTheDocument();
    });
  });

  describe('Privacy Policy Page', () => {
    it('renders title and data minimization declaration', () => {
      render(<PrivacyPolicyPage />);
      expect(screen.getByText(/Privacy Policy & Data Minimization Notice/i)).toBeInTheDocument();
      expect(screen.getByText(/Zero Tracking/i)).toBeInTheDocument();
      expect(screen.getByText(/Data Minimization & Engineering Truth Commitment/i)).toBeInTheDocument();
    });

    it('truthfully discloses local storage usage for alarm muted state', () => {
      render(<PrivacyPolicyPage />);
      expect(screen.getByText(/sih26025_alarm_muted/i)).toBeInTheDocument();
      expect(screen.getByText(/Stores the user's preference for muting\/unmuting the Web Audio audible siren/i)).toBeInTheDocument();
    });

    it('discloses self-hosted typography without runtime CDN calls', () => {
      render(<PrivacyPolicyPage />);
      expect(screen.getByText(/Self-Hosted Typography:/i)).toBeInTheDocument();
    });
  });

  describe('Terms of Use Page', () => {
    it('renders statutory safety boundary notice', () => {
      render(<TermsOfUsePage />);
      expect(screen.getByText(/Terms of Use & Evaluation Conditions/i)).toBeInTheDocument();
      expect(screen.getByText(/Statutory Safety Notice & Regulatory Boundary/i)).toBeInTheDocument();
      expect(screen.getByText(/substitute for official statutory mine safety procedures/i)).toBeInTheDocument();
    });

    it('clarifies prototype scope for SIH 2026', () => {
      render(<TermsOfUsePage />);
      expect(screen.getAllByText(/SIH26025/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Ministry of Coal/i).length).toBeGreaterThan(0);
    });
  });

  describe('Transparency & Attributions Page', () => {
    it('renders 4-tier architecture breakdown', () => {
      render(<TransparencyPage />);
      expect(screen.getByText(/System Transparency, Data Provenance & Attributions/i)).toBeInTheDocument();
      expect(screen.getByText(/Tier 1: Subsurface Sensing & Edge Hardware/i)).toBeInTheDocument();
      expect(screen.getByText(/Tier 2: Ingestion Backhaul & Validation/i)).toBeInTheDocument();
      expect(screen.getByText(/Tier 3: Statistical Risk Engine & Fusion/i)).toBeInTheDocument();
      expect(screen.getByText(/Tier 4: Statutory Operations & Vector GIS/i)).toBeInTheDocument();
    });

    it('renders the data provenance classification matrix', () => {
      render(<TransparencyPage />);
      expect(screen.getByText(/Data Classification & Truthfulness Matrix/i)).toBeInTheDocument();
      expect(screen.getAllByText('LIVE').length).toBeGreaterThan(0);
      expect(screen.getAllByText('SIMULATED').length).toBeGreaterThan(0);
      expect(screen.getAllByText(/EXTERNAL \/ BENCHMARK/i).length).toBeGreaterThan(0);
    });

    it('displays the unit hardware bill of materials', () => {
      render(<TransparencyPage />);
      expect(screen.getByText(/Hardware Bill of Materials \(BOM\) & Cost Analysis/i)).toBeInTheDocument();
      expect(screen.getAllByText(/₹ 4,850/i).length).toBeGreaterThan(0);
    });
  });

  describe('About Project Page', () => {
    it('renders SIH26025 problem statement details', () => {
      render(<AboutProjectPage />);
      expect(screen.getByText(/About MINE GUARD • Project Mission & Scope/i)).toBeInTheDocument();
      expect(screen.getAllByText(/SIH26025/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Ministry of Coal/i).length).toBeGreaterThan(0);
    });

    it('displays implementation status matrix', () => {
      render(<AboutProjectPage />);
      expect(screen.getByText(/Implementation Status & Engineering Truth Matrix/i)).toBeInTheDocument();
      expect(screen.getByText(/BENCH-TESTED/i)).toBeInTheDocument();
      expect(screen.getAllByText(/PROPOSED/i).length).toBeGreaterThan(0);
    });
  });
});
