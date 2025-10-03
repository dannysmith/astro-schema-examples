# Astro JSON Schema Generation Model

## Executive Summary

This document provides a comprehensive analysis of how Astro transforms Zod schemas defined in `content.config.ts` files into JSON Schema (Draft 7) files located at `.astro/collections/<collection_name>.schema.json`. This analysis is based on examining multiple Astro projects with varying schema complexities, from simple blog schemas to complex Starlight documentation sites.

## Core Transformation Principles

### 1. File Structure & Format

#### Input
- **Location**: `src/content.config.ts`
- **Format**: Zod schemas using `defineCollection()` and `z` object from `astro:content`
- **Loader**: Can use `glob()`, `file()`, or imported loaders like `docsLoader()` from Starlight

#### Output
- **Location**: `.astro/collections/<collection_name>.schema.json`
- **Format**: JSON Schema Draft 7
- **Structure**: Always follows this pattern:
  ```json
  {
    "$ref": "#/definitions/<collection_name>",
    "definitions": {
      "<collection_name>": {
        // actual schema content
      }
    },
    "$schema": "http://json-schema.org/draft-07/schema#"
  }
  ```

### 2. Automatic Field Additions

Every generated schema automatically includes:
- **`$schema` property**: Added as an optional string field to allow specifying the schema version in content files
- **`additionalProperties: false`**: Enforces strict schema validation - no extra fields allowed

## Type Transformation Mappings

### Basic Types

| Zod Type | JSON Schema Type | Notes |
|----------|------------------|-------|
| `z.string()` | `type: "string"` | Direct mapping |
| `z.number()` | `type: "number"` | Floating-point numbers |
| `z.number().int()` | `type: "integer"` | Integer constraint preserved |
| `z.boolean()` | `type: "boolean"` | Direct mapping |
| `z.literal("value")` | `const: "value"` | Exact value constraint |
| `z.date()` | `anyOf` with three formats | See Date Handling section |
| `z.coerce.date()` | `anyOf` with three formats | Same as `z.date()` |

### String Constraints & Formats

| Zod Constraint | JSON Schema | Example |
|----------------|-------------|---------|
| `.min(n)` | `minLength: n` | `z.string().min(5)` → `minLength: 5` |
| `.max(n)` | `maxLength: n` | `z.string().max(100)` → `maxLength: 100` |
| `.email()` | `format: "email"` | Email validation |
| `.url()` | `format: "uri"` | URL validation |

### Number Constraints

| Zod Constraint | JSON Schema | Example |
|----------------|-------------|---------|
| `.int()` | `type: "integer"` | Changes from number to integer |
| `.positive()` | `exclusiveMinimum: 0` | Greater than zero |
| `.min(n)` | `minimum: n` | Inclusive minimum |
| `.max(n)` | `maximum: n` | Inclusive maximum |

### Date Handling

All date types (`z.date()` and `z.coerce.date()`) are transformed into:
```json
{
  "anyOf": [
    { "type": "string", "format": "date-time" },  // ISO 8601 datetime
    { "type": "string", "format": "date" },        // ISO 8601 date only
    { "type": "integer", "format": "unix-time" }   // Unix timestamp
  ]
}
```

### Arrays

| Zod Type | JSON Schema | Notes |
|----------|-------------|-------|
| `z.array(z.string())` | `type: "array", items: { type: "string" }` | Basic array |
| `.min(n)` | `minItems: n` | Minimum array length |
| `.max(n)` | `maxItems: n` | Maximum array length |

**Complex Example**:
```typescript
z.array(z.string()).min(1).max(5)
```
Becomes:
```json
{
  "type": "array",
  "items": { "type": "string" },
  "minItems": 1,
  "maxItems": 5
}
```

### Enums

Enums are fully resolved at build time, including imported constants:

```typescript
// Constants can be imported or local
const STATUSES = ['draft', 'published', 'archived'] as const;
z.enum(STATUSES)
```
Becomes:
```json
{
  "type": "string",
  "enum": ["draft", "published", "archived"]
}
```

### Unions

#### Simple Union
```typescript
z.union([z.literal("public"), z.literal("private")])
```
Becomes:
```json
{
  "type": "string",
  "enum": ["public", "private"]
}
```

#### Complex Union
```typescript
z.union([z.string(), z.boolean()])
```
Becomes:
```json
{
  "anyOf": [
    { "type": "string" },
    { "type": "boolean" }
  ]
}
```

### Discriminated Unions

```typescript
z.discriminatedUnion('platform', [
  z.object({ platform: z.literal('vercel'), projectId: z.string() }),
  z.object({ platform: z.literal('netlify'), siteId: z.string() })
])
```
Becomes:
```json
{
  "anyOf": [
    {
      "type": "object",
      "properties": {
        "platform": { "type": "string", "const": "vercel" },
        "projectId": { "type": "string" }
      },
      "required": ["platform", "projectId"],
      "additionalProperties": false
    },
    {
      "type": "object",
      "properties": {
        "platform": { "type": "string", "const": "netlify" },
        "siteId": { "type": "string" }
      },
      "required": ["platform", "siteId"],
      "additionalProperties": false
    }
  ]
}
```

### Tuples

```typescript
z.tuple([z.number(), z.number()])
```
Becomes:
```json
{
  "type": "array",
  "minItems": 2,
  "maxItems": 2,
  "items": [
    { "type": "number" },
    { "type": "number" }
  ]
}
```

### Records

```typescript
z.record(z.string())
```
Becomes:
```json
{
  "type": "object",
  "additionalProperties": {
    "type": "string"
  }
}
```

### Nested Objects

Nested objects maintain their full structure:

```typescript
z.object({
  social: z.object({
    twitter: z.string().optional(),
    github: z.string().optional()
  })
})
```
Becomes:
```json
{
  "social": {
    "type": "object",
    "properties": {
      "twitter": { "type": "string" },
      "github": { "type": "string" }
    },
    "additionalProperties": false
  }
}
```

## Special Astro Features

### References to Other Collections

```typescript
reference('authors')
```
Becomes a complex `anyOf` allowing three forms:
```json
{
  "anyOf": [
    { "type": "string" },  // Simple string reference
    {
      "type": "object",
      "properties": {
        "id": { "type": "string" },
        "collection": { "type": "string" }
      },
      "required": ["id", "collection"],
      "additionalProperties": false
    },
    {
      "type": "object",
      "properties": {
        "slug": { "type": "string" },
        "collection": { "type": "string" }
      },
      "required": ["slug", "collection"],
      "additionalProperties": false
    }
  ]
}
```

### Image Fields

```typescript
image()
```
Simply becomes:
```json
{ "type": "string" }
```

## Required vs Optional Fields

### Rules for `required` Array

A field appears in the `required` array if:
1. It has NO `.optional()` modifier
2. It has NO `.default()` value

Examples:
- `z.string()` → Required
- `z.string().optional()` → NOT required
- `z.string().default("value")` → NOT required

### Default Values

Default values are preserved in the JSON schema:
```typescript
z.boolean().default(false)
```
Becomes:
```json
{
  "type": "boolean",
  "default": false
}
```

## Descriptions and Metadata

Zod descriptions are preserved and duplicated:
```typescript
z.string().describe('The main title')
```
Becomes:
```json
{
  "type": "string",
  "description": "The main title",
  "markdownDescription": "The main title"  // Duplicated for VS Code
}
```

## Validations and Refinements

### What's Preserved
- Basic constraints (min, max, length)
- Format validations (email, url)
- Error messages for simple constraints

### What's Lost
- Custom refinement logic
- Complex validation functions
- Transform functions

Example:
```typescript
z.array(z.string())
  .min(1, 'At least one tag is required')
  .refine(
    (tags) => tags.every(tag => tag.length >= 2),
    'All tags must be at least 2 characters long'
  )
```
Becomes:
```json
{
  "type": "array",
  "items": { "type": "string" },
  "minItems": 1,
  "errorMessage": {
    "minItems": "At least one tag is required"
  }
  // The refine() validation is NOT preserved
}
```

## Transforms

Transform functions are completely ignored - only the base type is preserved:
```typescript
z.string().transform((val) => val.toLowerCase().replace(/\s+/g, '-'))
```
Becomes:
```json
{ "type": "string" }  // Transform logic is lost
```

## File Loader Specifics

When using `file()` loader (for JSON/YAML data files), the schema structure changes:

```typescript
const documentation = defineCollection({
  loader: file("src/content/documentation/docs.json"),
  schema: z.object({ /* schema */ })
});
```

The generated JSON schema uses `additionalProperties` to define the schema for each entry in the loaded file:
```json
{
  "type": "object",
  "properties": {
    "$schema": { "type": "string" }
  },
  "additionalProperties": {
    // The actual schema for each entry
  }
}
```

## Imported Schemas (e.g., Starlight)

When using imported schemas like `docsSchema()` from Starlight:
- The entire resolved schema is included in the generated JSON
- All nested structures, enums, and complex validations are fully expanded
- Can result in very large JSON schema files (600+ lines for Starlight)

## Key Insights for Parser Development

1. **Predictable Structure**: All schemas follow the same wrapper structure with `$ref` and `definitions`

2. **Type Safety**: The `additionalProperties: false` ensures strict validation - useful for GUI field generation

3. **Date Flexibility**: The `anyOf` for dates allows multiple input formats, important for editor UX

4. **Reference Handling**: The complex structure for references means editors need to handle multiple reference formats

5. **Lost Information**: Custom validations, transforms, and complex refinements are not preserved - editors may need alternative validation strategies

6. **Enum Resolution**: All enums are fully resolved at build time, so the JSON schema contains actual values, not references

7. **Required Field Detection**: Check the `required` array, not individual field definitions, to determine if a field is mandatory

8. **Default Values**: Preserved in the schema, allowing editors to pre-populate fields

9. **Nested Structure Preservation**: Complex nested objects maintain their full structure, making it possible to generate nested form inputs

10. **Format Hints**: String formats (email, uri) provide validation hints for input fields

## Recommendations for Astro Editor Development

1. **Parse the `required` array** to determine which fields must be filled
2. **Use `default` values** to pre-populate form fields
3. **Leverage format hints** (`email`, `uri`) for input validation
4. **Handle the three reference formats** for collection references
5. **Support the three date formats** in date picker implementations
6. **Use `enum` arrays** to generate select/dropdown inputs
7. **Respect `minLength`/`maxLength`** for text input constraints
8. **Parse nested objects recursively** to generate grouped form sections
9. **Consider `additionalProperties: false`** to warn users about invalid fields
10. **Use descriptions** for field help text/tooltips

## Testing Recommendations

To fully test an Astro Editor against these patterns:

1. Test with simple schemas (minimal-blog)
2. Test with complex nested objects (comprehensive-schemas)
3. Test with imported schemas (starlight-minimal)
4. Test with file loaders (documentation collection)
5. Test with all date input formats
6. Test with collection references
7. Test with enums and unions
8. Test with array constraints
9. Test with default values
10. Test with required vs optional field

## Conclusion

Astro's transformation from Zod to JSON Schema is sophisticated but predictable. While some Zod features (transforms, complex refinements) are lost, the generated schemas provide enough information to build a robust content editor. The key is understanding the transformation patterns documented here and designing the editor to work within these constraints while leveraging the rich type information that is preserved.