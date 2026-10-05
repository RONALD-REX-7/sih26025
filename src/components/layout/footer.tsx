'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-8 border-t border-[#D7DEDC] bg-[#FFFFFF] text-xs text-[#52606D] select-none">
      {/* Upper Disclaimer Section */}
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 p-3 rounded-sm bg-[#F8FAF9] border border-[#D7DEDC]">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="h-4 w-4 text-[#9A6A00] shrink-0 mt-0.5" aria-hidden="true" />
            <div className="space-y-0.5 text-xs leading-relaxed">
              <span className="font-semibold text-[#1D2933]">
                Prototype &amp; Safety Disclaimer:
              </span>{' '}
              MINE GUARD is a student engineering prototype developed for Smart India Hackathon 2026 (Problem Statement ID: SIH26025, Ministry of Coal). Demonstrations, simulated scenarios, and experimental benchmarks do not constitute formal statutory certification or proof of operational deployment under the Directorate General of Mines Safety (DGMS) Coal Mines Regulations (CMR) 2017. Real colliery deployment requires site-specific geotechnical instrumentation, mine calibration, and regulatory approvals.
            </div>
          </div>
        </div>

        {/* Links and Metadata Grid */}
        <div className="mt-4 pt-4 border-t border-[#D7DEDC] grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* Project Identity */}
          <div className="space-y-1">
            <div className="font-bold text-[#173B57] text-xs tracking-tight flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#2F6B4F]" aria-hidden="true" />
              MINE GUARD &bull; SIH26025
            </div>
            <p className="text-[11px] text-[#5B6871]">
              Smart India Hackathon 2026 &bull; Ministry of Coal &bull; Jharia Coalfield Benchmark
            </p>
          </div>

          {/* Compliance & Policy Links */}
          <nav aria-label="Compliance and Legal Links" className="flex flex-wrap items-center gap-x-4 gap-y-1.5 md:justify-center text-xs">
            <Link
              href="/about"
              className="text-[#52606D] hover:text-[#173B57] hover:underline focus-visible:ring-2 focus-visible:ring-[#173B57] focus-visible:outline-hidden rounded-xs transition-colors"
            >
              System Architecture
            </Link>
            <span className="text-[#D7DEDC]" aria-hidden="true">&bull;</span>
            <Link
              href="/transparency"
              className="text-[#52606D] hover:text-[#173B57] hover:underline focus-visible:ring-2 focus-visible:ring-[#173B57] focus-visible:outline-hidden rounded-xs transition-colors"
            >
              Transparency &amp; Licenses
            </Link>
            <span className="text-[#D7DEDC]" aria-hidden="true">&bull;</span>
            <Link
              href="/privacy"
              className="text-[#52606D] hover:text-[#173B57] hover:underline focus-visible:ring-2 focus-visible:ring-[#173B57] focus-visible:outline-hidden rounded-xs transition-colors"
            >
              Privacy Policy
            </Link>
            <span className="text-[#D7DEDC]" aria-hidden="true">&bull;</span>
            <Link
              href="/terms"
              className="text-[#52606D] hover:text-[#173B57] hover:underline focus-visible:ring-2 focus-visible:ring-[#173B57] focus-visible:outline-hidden rounded-xs transition-colors"
            >
              Terms of Use
            </Link>
          </nav>

          {/* Technical Data Minimization Badge */}
          <div className="text-[11px] font-mono-tech text-[#5B6871] md:text-right">
            <span>Zero Tracking Cookies &bull; Self-Hosted Fonts</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
