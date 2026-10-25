# Contributing

Thanks for helping improve Visual Prompt Studio. Bug reports, ideas, docs fixes and code are all welcome.

## Before you start

- Search [existing issues](https://github.com/difegam/visual-prompt-studio/issues) first.
- For anything larger than a small fix, open an issue to discuss it before writing code.
- The product has a few fixed principles (see [PRODUCT.md](PRODUCT.md)): the compiled prompt is the product, art direction is layered, prompts adapt to the target model, and the app stays local-first and copy-first with no accounts, server or generation. Changes that conflict with these are unlikely to be accepted.

## Set up

You need the Node.js version in `.nvmrc` and pnpm 11.17.0.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

The dev server runs on <http://localhost:4321>. Lefthook installs Git hooks on install; see [git hooks](docs/git-hooks.md).

## Before you open a pull request

```sh
pnpm lint
pnpm format:check
pnpm check
pnpm test:discovery
pnpm build:preview
```

For UI changes, also check the page in a real browser at desktop and mobile widths and with the keyboard. [AGENTS.md](AGENTS.md) describes the `playwright-cli` workflow.

## Pull request guidelines

- Keep each pull request focused on one change.
- Add or update tests in `scripts/test-prompt-discovery.mjs` when you change the compiler, recipe schema or discovery logic.
- Update the docs and [CHANGELOG.md](CHANGELOG.md) for user-visible changes.
- Use conventional commit messages (`feat:`, `fix:`, `docs:`, `chore:`).

## Common contributions

- **Add a model target:** see [adding a target](docs/adding-a-target.md).
- **Write or edit a blog post:** see [content authoring](docs/content-authoring.md).
- **Add a style, palette, font, exclusion or reference:** edit the typed data in `src/lib/prompt-studio/domain/` (see [architecture](docs/architecture.md)).

## Content and assets

Only submit text, images and fonts you have the right to share under the project license. Do not paste material from third-party guides.

## License

By contributing you agree that your contributions are licensed under the [Apache License 2.0](LICENSE).
