import type { ImageMetadata } from "astro";

export interface PortfolioProject {
  title: string;
  summary: string;
  href: string;
  tags?: readonly string[];
  image?: {
    src: ImageMetadata;
    alt: string;
  };
}

export const projects: readonly PortfolioProject[] = [
  {
    title: "Sample project",
    summary:
      "Replace this entry with a project description that explains the problem, your contribution, and the outcome.",
    href: "https://example.com/sample-project",
    tags: ["Astro", "TypeScript"],
  },
  {
    title: "Another sample",
    summary:
      "Keep each card focused on one project. Add a locally imported image only when it helps explain the work.",
    href: "https://example.com/another-sample",
    tags: ["Content", "Design"],
  },
];
