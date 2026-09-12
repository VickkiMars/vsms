# Definition of Done (DoD) & Quality Assurance Standards

**Project Title:** Computerized Guest Information Tracking System (VSMS)  
**Source Spec:** [`Computerised.docx`](file:///home/kami/Desktop/codebase/vsms/Computerised.docx)  

---

## 1. Feature Level Definition of Done

A user story or feature artifact is considered **DONE** if and only if it satisfies all of the following conditions:

1. **Code Completeness**:
   - All functional criteria specified in the user story are fully implemented.
   - Code adheres to React 18 / ES2022 standards and passing zero JSX/JS linter errors.
   - No `console.log` debug statements or hardcoded test credentials in production paths.

2. **UI & Design Compliance**:
   - Adheres strictly to the OpenAI + Material Design 3 monochrome visual design system.
   - High-contrast, accessible visual state indications (hover, focus, active, disabled).
   - Responsive layout functioning on desktop, tablet, and mobile displays without horizontal scroll overflow.

3. **Data Integrity & Persistence**:
   - All mutations execute valid SQL statements against the WebAssembly SQLite database engine.
   - Data persists cleanly to `localStorage` under `vsms_sqlite_db_bin`.
   - Input fields implement strict validation preventing empty, malformed, or malicious injections.

4. **Testing & Verification**:
   - Feature passes all corresponding E2E integration test cases.
   - Feature passes all Tier 5 Adversarial Stress Tests (SQL injection, ReDoS, prototype pollution, clock skew, storage quota limits).
   - Automated test suite command `npm test` executes cleanly with 100% pass rate.

5. **Build Integrity**:
   - Production bundle command `npm run build` compiles with 0 errors and generates minified output in `dist/`.

---

## 2. Quality Gates & Test Suite Structure

| Suite ID | Focus Area | Description | Test File | Target |
|---|---|---|---|---|
| **Tier 1** | Unit Invariants | Core functions, date formatters, duration calculations. | `test/run-e2e-tests.js` | 100% Pass |
| **Tier 2** | Component State | Modal toggles, form state, cascade selector rules. | `test/run-e2e-tests.js` | 100% Pass |
| **Tier 3** | Integration Flows | Full check-in to check-out lifecycle, pass printing. | `test/run-e2e-tests.js` | 100% Pass |
| **Tier 4** | E2E Data Pipeline | SQLite persistence, search queries, CSV export RFC-4180. | `test/run-e2e-tests.js` | 100% Pass |
| **Tier 5** | Adversarial Stress | Malicious payloads, high load (50k string queries, 1000 records). | `test/adversarial-stress-tests.js` | 100% Pass |

---

## 3. Security & Compliance Checklist

- [x] Passwords stored using SHA/salt hashes, never plain text.
- [x] Input sanitization prevents XSS and SQL injection.
- [x] Session state isolates administrative controls to authorized roles (`admin`, `security`).
- [x] Audit logs record critical actions with timestamp and user ID.
- [x] CSV export escapes special characters (`"`, `,`, `\n`) adhering to RFC 4180.
