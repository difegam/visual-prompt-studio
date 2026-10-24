---
# Banner
banner:
  title: "A starting point for content-driven websites"
  content: "Edit the collections, theme tokens, and navigation to shape this site around your project."
  image: "/images/starter-hero.jpg"
  button:
    enable: true
    label: "Explore the blog"
    link: "/blog"

# Features
features:
  - title: "Content collections with real routes"
    image: "/images/starter-content-collections.jpg"
    content: "Use typed content records for blog posts, authors, site pages, and homepage sections."
    bulletpoints:
      - "Category and tag indexes link to generated static pages"
      - "Draft posts stay out of ordinary builds"
      - "Article word count and reading time come from the Markdown pipeline"
    button:
      enable: false
      label: "Get started"
      link: "/about"

  - title: "Astro pages, with React for interaction"
    image: "/images/starter-react-islands.jpg"
    content: "Static presentation stays in Astro. Existing React components handle search and the registered MDX shortcodes."
    bulletpoints:
      - "Tailwind CSS 4 and daisyUI 5 style the site without adding widget JavaScript"
      - "Hydrate only the components that need browser interaction"
      - "Use one UI framework by default to keep the component model focused"
    button:
      enable: false
      label: "Read the docs"
      link: "/about"

  - title: "Preview and production checks"
    image: "/images/starter-build-validation.jpg"
    content: "Build modes keep previews out of search and validate important output before deployment."
    bulletpoints:
      - "Canonical links use the configured site origin"
      - "Preview output includes noindex metadata and a deny-all robots file"
      - "A build validator checks generated pages, taxonomies, sitemap, and robots output"
    button:
      enable: false
      label: ""
      link: ""
---
