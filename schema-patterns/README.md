# Astro Starter Kit: Minimal

```sh
pnpm create astro@latest -- --template minimal
```

## Schema Patterns Example (PRIORITY)

Create a new example site called `schema-patterns` to test how Astro's JSON schema generation handles JavaScript patterns commonly used in real-world configs (like astro.build).

**Goal**: Understand if/how Astro inlines module-level JavaScript into generated JSON schemas.

**Specific tests needed**:

1. **Constants in enums (same file)**

   - Define `const STATUSES = ['draft', 'published', 'archived'] as const`
   - Use: `status: z.enum(STATUSES)`
   - Check: Does JSON contain literal values or a reference?

2. **Imported constants from external file**

   - Create `src/constants.ts` with exported constant array
   - Import and use in enum/union
   - Check: Does this work? Do values appear in JSON?

3. **Reusable schema fragments**

   - Define `const seoSchema = z.object({ title: z.string().min(5).max(120), description: z.string() })`
   - Use via `.merge(seoSchema)` in multiple collections
   - Check: Is schema duplicated or referenced in JSON?

4. **Computed/derived default values**

   - Define: `const DEFAULT_AUTHOR = 'System'`
   - Use: `author: z.string().default(DEFAULT_AUTHOR)`
   - Check: Does JSON show "System" or a reference?

5. **Descriptions on fields**

   - Use `.describe('This is a title field')` on multiple fields
   - Check: Do descriptions appear in JSON schema (as `description` property)?

6. **Custom refinements/validations**
   - Use `.refine(val => val.length > 0, 'Must not be empty')`
   - Check: How does this appear in JSON? Is it lost?

**What we're learning**:

- Whether Astro fully evaluates JS before generating JSON (likely yes)
- How to handle configs that aren't simple inline Zod calls
- If there are any edge cases where JS patterns break JSON generation

**Site structure**: Minimal Astro site, one collection, focus entirely on the config.ts patterns
