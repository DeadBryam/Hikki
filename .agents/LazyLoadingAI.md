
## LazyLoadingAI MCP Tools

Use these tools instead of basic file operations for better token efficiency and semantic understanding.

### Quick Reference

| Task | Tool |
|------|------|
| Find code by name | `search_symbols` |
| Find code by signature | `search_symbols` |
| Browse indexed files | `list_files` |
| List signatures in a file | `list_functions` |
| Read a function | `get_function` |
| Read a class | `get_class` |
| Understand a function fully | `get_related_context` |
| Find where something is used | `find_references` |
| Trace callers/callees | `trace_calls` |
| Trace hierarchy/implementations | `trace_types` |
| Map module dependencies | `get_module_dependencies` |
| Get architecture overview | `get_architecture_overview` |
| Discover adjacent symbols | `suggest_related` |
| After editing files | `sync_index` |

---

### Canonical Retrieval Pipeline (MUST Follow In Order)

1. `Step 1 (Locate candidate symbols/files):` use `search_symbols` and/or `list_functions` (optionally `list_files` when scope is unknown).
2. `Step 2 (Hydrate implementation):` use `get_function` or `get_class` on selected candidate.
3. `Step 3 (Expand immediate context):` use `get_related_context` for types/callees/tests (tests only when needed).
4. `Step 4 (Trace flow):` use `trace_calls` first, then `find_references` for exhaustive usage validation.
5. `Step 5 (High-level architecture only):` use `get_architecture_overview` only for module/entrypoint/public-API questions, not symbol lookup.
6. `Hard rules:` do not use `ask_codebase`; do not jump to Step 5 for targeted lookup; use native `Read/Grep` only as fallback when MCP output is insufficient/ambiguous.

This ordered pipeline is mandatory for targeted retrieval questions.

### Code Discovery

- **`search_symbols`** - Find functions, classes, interfaces by name with fuzzy matching and synonym expansion
- **`list_files`** - Browse indexed files with summaries, filter by directory/language
- **`list_functions`** - List signatures in a file; set `include_source: true` to inline top implementations

### Reading Code

- **`get_function`** - Get full source code of a specific function
- **`get_class`** - Get full source code of a class with all methods
- **`get_related_context`** - Bundle a function with its types, callees, and related tests (best for deep understanding)

### Dependency and Type Tracing

- **`find_references`** - Find all usages of a symbol across the codebase
- **`trace_calls`** - Trace callers, callees, or both in one tool (supports depth 1-3)
- **`trace_types`** - Trace inheritance hierarchy or interface implementations
- **`get_module_dependencies`** - Import graph for a file (imports, reverse deps, cycles)

### Architecture

- **`get_architecture_overview`** - Module map, dependency graph, entry points, and absorbed public API (high-level architecture only)

### AI-Powered Discovery

- **`suggest_related`** - Use after finding one relevant symbol to discover related code you did not know to search for

### Index Management

- **`sync_index`** - **Call this after editing files** to keep the index current
- **`sync_index({ rebuild_chains: true })`** - Rebuild relationship chains when call/type/import relationships changed significantly

---

### When to Use What

**Starting with a new codebase?**
→ `get_architecture_overview` → `list_files` → `search_symbols`

**Looking for specific code?**
→ `search_symbols` (name + optional `return_type` / `param_type`)

**Understanding a function?**
→ `get_related_context` bundles everything, then `get_function` for exact implementation details

**Tracing data flow?**
→ `trace_calls` with `direction` and `depth`

**Tracing inheritance or implementations?**
→ `trace_types` with `mode`

**After making edits?**
→ Always call `sync_index({ files: ["path/to/file.ts"] })`
