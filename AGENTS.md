# Hikki - AI Development Context & Code Standards

**Project Type:** Fullstack AI Assistant  
**Stack:** Bun, Turborepo, ElysiaJS, SvelteKit 5, SQLite + Drizzle

---

## Search Rule
Use `rg`, `ack`, `ag` when searching for code patterns, definitions, usages, or related files.  
- Always prefer **exact matches** and **specific directories**.  
- Avoid broad searches that waste tokens.

---

## Architecture
apps/api/src/  → routes/ → services/ → database/repositories/
apps/web/src/  → routes/ → lib/{components,features,stores}/

---

**Layer Rules:**  
- Routes (HTTP) → Services (logic) → Repositories (DB)  
- Never access DB directly from services.

---

## MCPs & Skills
- Use MCPs and Skills **always when possible** to maximize efficiency.  
- Prefer free MCPs first; trial MCPs only if free ones are insufficient.  
- Read, save and analyze memories of project using mpcs.

---

## Token Efficiency
- Don’t re-read files you just wrote or edited — you know the contents  
- Don’t re-run commands to “verify” unless the outcome was uncertain  
- Don’t echo back large blocks of code or file contents unless asked  
- Batch related edits into single operations  
- Skip confirmations like “I’ll continue…” — just do it  
- If a task needs 1 tool call, don’t use 3 — plan before acting  
- Don’t summarize what you just did unless the result is ambiguous or you need input  
- **Always use skills and MCOs (multi-tool orchestration) when applicable**

---

## Ultracite Quick Reference
- **Format code**: `bun x ultracite fix`  
- **Check for issues**: `bun x ultracite check`  
- **Diagnose setup**: `bun x ultracite doctor`  

Biome (the underlying engine) provides robust linting and formatting. Most issues are automatically fixable.

---

## Core Principles
- Type-safe, accessible, performant, maintainable  
- Clarity > Brevity — explicit intent over clever shortcuts  
- Single responsibility — one job per service/component/repository  
- Layer separation — never access DB directly from services  
- Pre-commit: `ultracite fix` | Pre-push: `ultracite check + tests`  
- Remove `console.log`, `debugger`, and `alert` from production code  
- Use semantic HTML and ARIA attributes for accessibility  
- Handle async with `async/await` and proper error handling  
- Prefer early returns over nested conditionals  
- Avoid `eval()`, unsafe HTML injection, and direct cookie assignment  
- Optimize performance with memoization, lazy loading, and efficient imports  

---

IMPORTANT: Always ask to user for more context if you are unsure about the next steps. Do not make assumptions.