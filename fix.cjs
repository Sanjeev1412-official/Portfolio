const fs = require('fs');
let content = fs.readFileSync('src/index.css', 'utf8');
let fixed = content.split('@media (max-width: 640px) {')[0] + `@media (max-width: 640px) {
  .conn-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  .conn-card {
    padding: 1.2rem;
    min-height: auto;
  }
}

/* ============================================================
   SECTION 6 — MESSAGE (CHAPTER VI)
   ============================================================ */
.panel-message {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 4rem;
  overflow: hidden;
}

.msg-inner {
  width: 100%;
  max-width: 1000px;
  padding: 0.5rem 6vw 0.5rem 6vw;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  transform-origin: center center;
}

/* ── Header ──────────────────────────────────────── */
.msg-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.35rem;
}

.msg-label {
  font-family: var(--font-cinema);
  font-size: clamp(0.45rem, 0.75vw, 0.62rem);
  letter-spacing: 0.65em;
  color: rgba(255,255,255,0.22);
  text-transform: uppercase;
}

.msg-heading {
  font-family: var(--font-display);
  font-size: clamp(2.2rem, 4.5vw, 4.2rem);
  font-weight: 900;
  letter-spacing: 0.02em;
  line-height: 1.0;
  text-transform: uppercase;
  margin: 0;
}

.msg-hollow {
  color: transparent;
  -webkit-text-stroke: 2px var(--white);
}

.msg-sub {
  font-family: var(--font-hud);
  font-size: clamp(0.58rem, 0.9vw, 0.72rem);
  letter-spacing: 0.25em;
  color: rgba(255,255,255,0.38);
  text-transform: uppercase;
  font-weight: 500;
  max-width: 560px;
  line-height: 1.45;
  margin: 0;
}

.msg-header-rule {
  width: 80px;
  height: 1px;
  background: linear-gradient(90deg, rgba(255,255,255,0.15), rgba(255,255,255,0.03));
  margin-top: 0.3rem;
}

/* ── Form ────────────────────────────────────────── */
.msg-form-wrapper {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  padding: clamp(1.5rem, 4vw, 3rem);
  border-radius: 4px;
  width: 100%;
}

.msg-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.msg-form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.msg-input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.msg-input-group label {
  font-family: var(--font-hud);
  font-size: 0.65rem;
  letter-spacing: 0.2em;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
}

.msg-input-group input,
.msg-input-group textarea {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1rem;
  color: var(--white);
  font-family: var(--font-body);
  font-size: 0.9rem;
  outline: none;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.msg-input-group input:focus,
.msg-input-group textarea:focus {
  border-color: rgba(255, 255, 255, 0.3);
  background: rgba(0, 0, 0, 0.6);
}

.msg-submit-btn {
  align-self: flex-start;
  background: var(--white);
  color: var(--black);
  border: none;
  padding: 1rem 2.5rem;
  font-family: var(--font-hud);
  font-size: 0.75rem;
  letter-spacing: 0.15em;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
  margin-top: 0.5rem;
}

.msg-submit-btn:hover {
  background: rgba(255, 255, 255, 0.8);
  transform: translateX(5px);
}

.msg-btn-arrow {
  font-size: 1rem;
  transition: transform 0.3s ease;
}

.msg-submit-btn:hover .msg-btn-arrow {
  transform: translate(2px, -2px);
}

@media (max-width: 768px) {
  .msg-form-row {
    grid-template-columns: 1fr;
  }
}
`;
fs.writeFileSync('src/index.css', fixed, 'utf8');
