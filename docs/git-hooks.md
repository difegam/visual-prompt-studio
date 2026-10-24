# Git hooks and quality checks

The starter uses [Lefthook](https://lefthook.dev/) to run a small set of local checks from one `lefthook.yml`. It works across languages and filters pre-commit commands to staged files. The current setup runs ESLint auto-fix, then Prettier, and stages their fixes. Those commands run sequentially because both can edit the same file. Hook commands go through `scripts/with-node.sh`, which puts the Node version from `.nvmrc` first on `PATH` (when installed with nvm) so commits from Git GUIs and desktop apps do not fail on an older default Node.

The formatter intentionally skips the pnpm lockfile, generated search/theme files, build output, and agent scratch. Reformat the source inputs instead of generated files.

Lefthook's package install script installs its Git hook shims. The `pnpm-workspace.yaml` build policy explicitly allows this one hook-install script. If your install policy skips it or hooks are missing, run:

```sh
pnpm exec lefthook install
```

The pre-push hook runs `pnpm run check`, which regenerates the search index and runs Astro's diagnostics across the project. Astro documents `astro check` as a project diagnostic intended for CI; it is not a staged-file check. CI repeats lint, formatting, Astro checks, and both build modes. Git hooks can be bypassed, so CI remains the enforcement point.

Use these commands directly when needed:

```sh
pnpm run lint
pnpm run format:check
pnpm run check
pnpm run build:preview
```

The lint configuration uses Astro's recommended rules and TypeScript's recommended rules, with `no-explicit-any` disabled for TypeScript and Astro files because several retained Astroplate helpers use it today. `astro check` still runs over the whole project, and the new portfolio component uses an explicit project type. A derived project can re-enable that rule after tightening the inherited helpers.

## Add checks when a project needs them

Keep hook commands quick and predictable. Add a hook only when the project has the corresponding feature and the check catches errors before CI without relying on a flaky external service.

| Project need                                              | Possible hook or check                                              | Where it fits                                                                                                                |
| --------------------------------------------------------- | ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Automated releases or changelog generation                | `commit-msg` validation for a chosen commit convention              | Local hook when the team enforces the convention; validate again in CI.                                                      |
| Secrets in a changed patch                                | Gitleaks or another staged-diff scanner                             | Optional pre-commit for fast feedback; keep a full repository scan in CI.                                                    |
| Large Markdown or MDX site                                | Frontmatter/content rules, required metadata, broken local anchors  | Pre-commit only for quick changed-file rules; run Astro/content-wide validation on pre-push and CI.                          |
| Public docs or content with many outbound links           | Link checker                                                        | Prefer CI or a scheduled workflow for network checks; local hooks should not fail because a remote site is temporarily down. |
| Multiple locales                                          | Translation-key parity, missing-message checks, route coverage      | Pre-commit for changed locale files if fast; run complete locale coverage in CI.                                             |
| React islands, forms, maps, or other browser interactions | Accessibility and browser checks such as axe and Playwright         | Run focused checks locally only if they are fast; keep full browser coverage in CI.                                          |
| React components with state and effects                   | React Hooks ESLint rules                                            | Add the React-specific plugin to lint and CI when the project has enough React code to justify framework-specific rules.     |
| API schemas, database models, or migrations               | Schema validation, migration ordering, generated-client consistency | Run cheap static validation before push; verify full compatibility in CI.                                                    |
| Checked-in generated code or assets                       | Regenerate and confirm the working tree is clean                    | Use only if generated output is committed; otherwise keep generated files out of the staged-file hook.                       |
| Large client bundles or image-heavy pages                 | Bundle-size and image-budget checks                                 | Run against production output in CI, where the build artifact is available.                                                  |
| Complex standalone CSS beyond Tailwind utilities          | Stylelint with project-specific rules                               | Add only when CSS has enough independent structure to benefit; Prettier already handles formatting.                          |

For a JS-only repository that already uses the common Husky and lint-staged setup, keep that convention rather than migrating solely for the template. A Python or polyglot repository may prefer `pre-commit`; Lefthook is the starter's single-tool default because it handles multiple languages with one configuration. `simple-git-hooks` is another lightweight option for teams that want its smaller configuration surface.

## References

- [Lefthook install command](https://lefthook.dev/usage/commands/install/)
- [Lefthook staged-file filters](https://lefthook.dev/examples/filters/)
- [Astro `check` command](https://docs.astro.build/en/reference/cli-reference/#astro-check)
- [ESLint plugin for Astro](https://github.com/ota-meshi/eslint-plugin-astro)
- [pnpm build-script approval](https://pnpm.io/cli/approve-builds)
