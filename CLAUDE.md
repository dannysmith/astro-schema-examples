# Claude Instructions: Astro Schema Examples

This repository contains a number of minimal Astro implementations, with a variety of different content collection schemas in their `content.config.ts`. This is intended solely for help with testing and developing [Astro Editor](https://astroeditor.danny.is/)

## Background

I have built a Desktop editor for markdown files in Astro content collections which reads the Zod schemas in `content.config.ts` I'm going to go ahead and place the correct fields for each content type visually in a GUI. Currently this uses a fairly "dumb" parser to read the zod schema directly. This means support is very limited, and doesn't work for any kind of complex schema at all (including starlight sites which import special loaders and schemas from the starlight package). In an effort to improve this I am investigating using the generated `<collectionname>.schema.json` files found in `.astro/collections`. But to do this well, I need to have a variety of different astro sites with a variety of different content schemas, And then I need to pair generated files for each of their Zod schemers so I can fully understand exactly how these generated JSON schemas work.

Remember, the primary goal here is me learning how differen `content.config.ts` are transformed into `<collectionname>.schema.json` files by Astro, and eventually having a reference for how this is done. NOTHING MORE.

## Guidance for Claude

Check `instructions.md` for the next tasks.

When working in this repository:

- Assume that we only care about Astro > 5.0 for now (content collections work quite differently in older versions)
- **IMPORTANT**: Content collection configuration should be in `src/content.config.ts` (not `src/content/config.ts`). This is the current best practice as of recent Astro versions.
- Always use the latest Astro documentation and best practices when creating content collection schemas.
- Create any new astro projects in their own directory in the root.
- When creating new astro projects from an online template, just generate a basic site from that template and change as little as possible.
- When creating new example sites (not from a template) keep them as simplistic as possile. There should never be any need for any CSS or other boilerplate for example.

## Reference

- Astro Content Collections Guide: https://docs.astro.build/en/guides/content-collections/
- Astro Content Collections API Docs: https://docs.astro.build/en/reference/modules/astro-content/
- Astro Content Loader API Docs: https://docs.astro.build/en/reference/content-loader-reference/#built-in-loaders
-
