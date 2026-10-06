# Contributing to SIH26025 (MINEGUARD)

Thank you for contributing to the **SIH26025 Mine Subsidence Monitoring & Early Warning System**!

## Engineering Standards

This project integrates embedded firmware (ESP32-S3), TinyML anomaly detection, and a statutory DGMS-compliant web dashboard.

### Verification Checklist
Before submitting a PR:
1. **Frontend Tests**: `npx vitest run` (must pass all 42 tests).
2. **Typecheck**: `npx tsc --noEmit`.
3. **ML Compilation & Benchmark**:
   ```bash
   python -m py_compile ml/*.py
   python ml/evaluate_model.py
   ```
4. **Firmware Integrity**: Ensure any changes to `firmware/include/tinyml_weights.h` are generated via `python ml/tinyml_export.py`.
5. **No Secret Commitments**: Never commit `.env.local`, Supabase service role keys, or cellular credentials.
