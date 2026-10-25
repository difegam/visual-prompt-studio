# Content authoring

Content lives in `src/content/` and is validated by the schemas in `src/content.config.ts`. The build fails if frontmatter does not match.

| Content | Location                      | Notes                                        |
| ------- | ----------------------------- | -------------------------------------------- |
| Blog    | `src/content/blog/*.md`       | One file per post; the filename is the slug. |
| Authors | `src/content/authors/*.md`    | Posts link to `/authors/<slugified author>`. |
| About   | `src/content/about/-index.md` | Rendered at `/about`.                        |

Entries beginning with `-` are collection data (page titles and descriptions), not published as single routes.

## Blog posts

Common fields: `title`, `meta_title`, `description`, `date`, `image`, `author` (must match an entry in `authors/`), `categories`, `tags`, `draft`. Posts with `draft: true` or a future `date` are left out of builds.

Markdown is enough for posts. Reading time and word count come from `src/plugins/remarkArticleMetrics.mjs`.

## Images

Put images in `public/images/` and reference them with absolute paths such as `/images/post-origin.jpg`. Write useful alt text for informative images; the build checks for it. Use only media you have permission to publish.

## Studio data

The composer's options (styles, palettes, fonts, exclusions, directions, references) are typed data in `src/lib/prompt-studio/domain/`, not content collections. Edit them there and run `pnpm test:discovery`.
