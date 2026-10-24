# Optional modules

The default starter keeps optional integrations disabled until a site configures them. Review data collection and third-party requests before enabling an integration.

## Google Tag Manager

`google_tag_manager.enable` is `false` in `src/config/config.json`. To opt in, set it to `true`, replace `GTM-XXXXXX` with the site's container ID, and update the privacy disclosures and consent behavior for the deployment. Remove `@digi4care/astro-google-tagmanager` and its imports in `src/layouts/Base.astro` if the site will not use it.

## Disqus comments

`disqus.enable` is `false`. Configure a real shortname and review the third-party requests and consent requirements before turning it on. To remove comments entirely, remove the `Disqus` import and component from `src/layouts/PostSingle.astro`, delete `src/layouts/helpers/Disqus.tsx`, and remove `disqus-react` from `package.json`.

## Portfolio example

The example route `/examples/portfolio` is noindexed and uses `ProjectCard.astro` with the `PortfolioProject` type. Keep it only if the derived site has a portfolio. Otherwise remove:

- `src/layouts/components/ProjectCard.astro`
- `src/examples/portfolio/`
- `src/pages/examples/portfolio.astro`

## Contact form

The contact page is a presentation example with no backend. The submit button is disabled while `params.contact_form_action` is empty or `#`; setting a real handler URL enables it. Verify that the service accepts the form method and fields, has suitable abuse controls, and handles submitted data appropriately.

## Testimonials and social links

The testimonial section is disabled and contains no sample quotes. Add real quotations only when they are accurate and approved for publication. Social profile links are empty in `src/config/social.json`; add only profiles owned by the site or author.

## React and other UI frameworks

React remains the single interactive UI framework in this starter because the search and MDX shortcodes use it. Keep static content in Astro. New islands should have a clear interaction and a narrow `client:*` directive. See [technology decisions](technology-decisions.md) for the React versus Svelte evaluation.

Do not install Svelte alongside React for a static card or one simple browser event. If a project chooses Svelte as its only UI framework, migrate its existing React interactions and MDX shortcodes as one planned change.

## Generated LLM files

`llms.txt`, `llms-full.txt`, and per-page Markdown output are enabled in `src/config/config.json` under `llms`. The build derives them from generated site output. Disable the corresponding options when the derived site should not publish these files, or use `include` and `exclude` to limit the routes they contain.
