# Security policy

## Supported versions

Only the latest release on `main` receives security fixes.

## Reporting a vulnerability

Please do not open a public issue for a security problem. Use GitHub's [private vulnerability reporting](https://github.com/difegam/visual-prompt-studio/security/advisories/new) for this repository, or email difegam3@gmail.com.

Include what you found, how to reproduce it, and the impact you expect. You should get a reply within a week.

## Scope

Visual Prompt Studio is a static site. It has no server, accounts or API, and it stores the user's recipe only in their browser. Relevant reports include cross-site scripting through imported recipe JSON or content, unsafe handling of stored data, and weaknesses in the build or deployment workflows.
