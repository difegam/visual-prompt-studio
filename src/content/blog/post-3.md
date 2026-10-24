---
title: "Make a component reusable when its contract is real"
image: "/images/starter-post-component-contracts.jpg"
description: "A sample article on deciding which site patterns deserve a shared component."
date: 2026-10-22T09:00:00Z
categories: ["Components", "Astro"]
author: "Example Author"
tags: ["reuse", "accessibility"]
draft: false
---

Share a component when it has multiple consumers or owns a meaningful behavior, content contract, or accessibility requirement. A wrapper that only forwards a class and a slot often makes the call site harder to read.

`ProjectCard.astro` is an optional example because project entries have a specific shape: title, summary, destination, tags, and an optional image with alt text. A generic `Card.astro` would hide less than the markup it replaces.

Before extracting a component, check who will use it, which values it owns, and whether that boundary makes a change easier to apply consistently.
