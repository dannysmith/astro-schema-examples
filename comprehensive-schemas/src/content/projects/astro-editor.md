---
name: "Astro Editor"
type: "project"
visibility: "public"
coordinates: [37.7749, -122.4194]
relatedPosts: ["first-post"]
deployment:
  platform: "vercel"
  projectId: "prj_abc123xyz"
startDate: "2024-01-01"
slug: "Astro Editor Project"
config:
  build:
    command: "pnpm build"
    outputDir: "dist"
  env:
    NODE_ENV: "production"
    API_URL: "https://api.example.com"
---

# Astro Editor

A desktop editor for Astro content collections.
