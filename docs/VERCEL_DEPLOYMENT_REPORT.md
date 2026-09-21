# SIH26025 Vercel Production Deployment & Diagnostic Report

## 1. System Identity & Environment
- **Project**: SIH2026 — SIH26025
- **Problem Statement**: AI-Enabled Low-Cost Real-Time Mine Subsidence Monitoring, Prediction and Early Warning System for Underground Coal Mines in India
- **Repository**: [RONALD-REX-7/sih26025](https://github.com/RONALD-REX-7/sih26025)
- **Target Platform**: Vercel (Hobby Tier)
- **Node Engine**: 24.x
- **Framework**: Next.js 16.3.5 (Turbopack, App Router)
- **Production URL**: [https://sih26025.vercel.app](https://sih26025.vercel.app)

## 2. Root Cause Forensic Analysis (Commit Author Association)
- **Observed Symptoms**:
  - Vercel dashboard displayed: `This deployment has been blocked`.
  - Deployment statuses for both Git pushes and CLI invocations remained `UNKNOWN` with 0ms build duration and 0 CPU cores assigned.
- **Root Cause**:
  - **Category A — Git Author Identity Mismatch**.
  - Local repository Git configuration was set to `ronaldrexch@gmail.com`.
  - GitHub API inspection of commit `edf1b9f6e775058827904edf743d718a62891c82` revealed `"author": null` and `"committer": null`, proving `ronaldrexch@gmail.com` was not registered or verified on GitHub account `RONALD-REX-7`.
  - GitHub account `RONALD-REX-7` (ID: `211186833`) is registered with primary email `ronaldrex21.2007@gmail.com`.
  - On Vercel Hobby tier accounts, repository collaboration is disabled; any commit authored by an unverified/unlinked email is treated as an unauthorized external collaborator push and blocked immediately at the gateway before build machine allocation.

## 3. Remediation & Verification Pass
- **Remediation**:
  - Configured repository-local Git identity:
    ```bash
    git config --local user.name "RONALD REX C H"
    git config --local user.email "ronaldrex21.2007@gmail.com"
    ```
  - Preserved 100% of application code, Next.js architecture, and Supabase integration.
  - Created verified diagnostic commit `bfe22074f261853a16dcc364a59126503cce3c47`.
  - Confirmed GitHub API attribution:
    - `"author": { "login": "RONALD-REX-7", "id": 211186833 }`
    - `"committer": { "login": "RONALD-REX-7", "id": 211186833 }`
  - Pushed to both `main` and `master` branches on `origin`.
- **Deployment Outcome**:
  - Vercel transitioned immediately from `BLOCKED` (`UNKNOWN`) to `● Queued` → `● Building` → `● Ready`.
  - **Production Deployment**: `https://sih26025-mvwnakp5z-spirit16.vercel.app` (ID: `dpl_DQb4p8erY5oTL9jp7aX4RxqUk48g`, Duration: 33s).
  - **Canonical Live Production Alias**: `https://sih26025.vercel.app`.
  - **Preview Deployment**: `https://sih26025-ikzgde658-spirit16.vercel.app` (ID: `dpl_VurYViwSEJVHwNWT9PxXdAbmsQ3g`, Duration: 1m).
