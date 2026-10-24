# Deployment

This starter builds a static Astro site and deploys its `dist/` output as Cloudflare Workers Static Assets. Development and production use separate, named Wrangler environments and separate Worker names. Pull requests build a noindex preview and cannot deploy. Deployment runs only when a GitHub release is published or a `v*` tag is pushed, and only if the tagged commit is part of `main`.

## First-time Cloudflare setup

1. Create the two Workers in the Cloudflare dashboard before configuring per-Worker tokens:
   - `astroplate-starter-development`
   - `astroplate-starter-production`
2. Create an account-owned API token for each Worker. Give each token the Workers `Editor` role scoped to its one Worker. If you later attach or change a route or custom domain through Wrangler, add the required zone-scoped Workers Routes permission.
3. In GitHub, create `development` and `production` Actions environments. Restrict production deployments to the `main` branch and `v*` tags (the workflow runs on tags, not branch pushes). The development environment is only used for manual deploys. Add these environment secrets to each environment:
   - `CLOUDFLARE_ACCOUNT_ID`
   - `CLOUDFLARE_API_TOKEN`
4. Configure production environment approval rules if the repository plan and release process support them. The deployment workflow only reads those environment secrets in its final deploy step.

Do not use one account-wide admin token for both environments. Cloudflare permits an existing Worker to be deployed with the `Editor` role scoped to that Worker; creating new Workers requires a broader Admin role, so the two names are pre-created before using narrowly scoped deploy tokens.

## Automated deployment

| Trigger                                      | Build mode             | Wrangler environment | Worker                          |
| -------------------------------------------- | ---------------------- | -------------------- | ------------------------------- |
| Release published, tagged commit on `main`   | `SITE_MODE=production` | `production`         | `astroplate-starter-production` |
| `v*` tag pushed, tagged commit on `main`     | `SITE_MODE=production` | `production`         | `astroplate-starter-production` |
| Tag not on `main`, branch push, pull request | none                   | none                 | no deployment                   |

Creating a release from a new tag fires both triggers; the runs share a concurrency group, so the second queues behind the first and redeploys the same build. The development Worker is not deployed automatically; use the manual commands below. To release:

```sh
git checkout main && git pull
git tag v1.2.0 && git push origin v1.2.0
```

The quality workflow runs the preview build for pull requests and the production build on pushes to `development` or `main`. The security workflow audits dependencies and scans the repository history for secrets. Neither job receives Cloudflare credentials. GitHub Actions dependencies are pinned to full commit SHAs; review and update those pins periodically.

The Gitleaks action does not require a license for personal repositories. Organization repositories need a Gitleaks license stored as a separate GitHub secret; it is unrelated to Cloudflare deployment credentials.

## Local commands

```sh
pnpm install --frozen-lockfile
pnpm run check
pnpm run build:preview
pnpm run preview:cf-workers
```

Build, validate, and deploy to the development Worker:

```sh
pnpm run deploy:cf-workers:development
```

Build, validate, and deploy to production:

```sh
pnpm run deploy:cf-workers:production
```

`wrangler dev --env development` runs the development environment locally. `wrangler deploy` changes a remote Worker, so use the explicit deployment scripts only when you intend to deploy.

## Configuration notes

- `wrangler.jsonc` is the deployment source of truth. `assets.directory` points to Astro's `dist/` output and `not_found_handling` serves Astro's generated `404.html`.
- The compatibility date is set to the date this starter was prepared. Review Cloudflare runtime changes before advancing it.
- Preview builds add `noindex,nofollow` to every page and deny all crawlers in `robots.txt`; production builds use the configured site URL for canonical and sitemap output.
- The starter does not set custom domains or routes. Configure those after creating and verifying the Workers, and scope any additional Cloudflare token permission to the relevant zone.

## Verify a deployment

After deploying, open the Worker URL shown in Cloudflare and inspect its home page, a blog route, `robots.txt`, and `sitemap-index.xml`. Confirm the development Worker retains the preview noindex directive and the production Worker does not. The CI deployment does not publish or assume a domain for this template.

## References

- [Cloudflare Wrangler configuration and environment inheritance](https://developers.cloudflare.com/workers/wrangler/configuration/)
- [Cloudflare Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/)
- [Cloudflare Workers roles and permissions](https://developers.cloudflare.com/workers/authorization/workers/)
- [Cloudflare GitHub Actions setup](https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/)
- [GitHub deployment environments and environment secrets](https://docs.github.com/en/actions/concepts/workflows-and-actions/deployment-environments)
- [GitHub Actions secure use reference](https://docs.github.com/en/actions/reference/security/secure-use)
