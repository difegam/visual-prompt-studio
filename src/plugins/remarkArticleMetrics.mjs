const wordPattern =
  /[\p{L}\p{N}][\p{L}\p{N}\p{M}]*(?:['’][\p{L}\p{N}\p{M}]+)*/gu;
const excludedNodeTypes = new Set([
  "code",
  "inlineCode",
  "math",
  "inlineMath",
  "html",
  "mdxjsEsm",
  "mdxFlowExpression",
  "mdxTextExpression",
]);

function collectProse(node, text) {
  if (!node || excludedNodeTypes.has(node.type)) return;

  if (node.type === "text" && typeof node.value === "string") {
    text.push(node.value);
    return;
  }

  if (Array.isArray(node.children)) {
    node.children.forEach((child) => collectProse(child, text));
  }
}

/**
 * Adds metrics to Astro's render-only frontmatter for Markdown and MDX content.
 * Code blocks and inline code are excluded from the estimate.
 * @param {{ wordsPerMinute?: number }} options
 */
export default function remarkArticleMetrics({ wordsPerMinute = 200 } = {}) {
  if (!Number.isFinite(wordsPerMinute) || wordsPerMinute <= 0) {
    throw new TypeError("wordsPerMinute must be a positive number");
  }

  return (tree, file) => {
    const prose = [];
    collectProse(tree, prose);

    const wordCount = (prose.join(" ").match(wordPattern) ?? []).length;
    const readingTimeMinutes =
      wordCount === 0 ? 0 : Math.ceil(wordCount / wordsPerMinute);

    file.data.astro ??= {};
    file.data.astro.frontmatter ??= {};
    file.data.astro.frontmatter.wordCount = wordCount;
    file.data.astro.frontmatter.readingTimeMinutes = readingTimeMinutes;
  };
}
