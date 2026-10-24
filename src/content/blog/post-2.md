---
title: "Choose a rendering boundary for each interaction"
image: "/images/starter-post-rendering-boundaries.jpg"
description: "A sample article on keeping static pages static and hydrating only interactive UI."
date: 2026-10-21T09:00:00Z
categories: ["Astro", "React"]
author: "Starter Team"
tags: ["islands", "performance"]
draft: false
---

Astro renders ordinary pages and content to HTML. Use a React island when a browser interaction needs React state or an existing React component. The rest of a page does not need to become a client-side application.

Prefer the narrowest hydration directive that fits the interaction. Render useful HTML on the server, keep the component's props serializable, and make keyboard behavior and focus states part of the component contract.

This starter keeps its existing React search and MDX shortcodes. A second UI framework would add another component model and client runtime; use one only when a project has a concrete need that justifies it.
