/** "Open in" links for model targets that have a hosted app we can send people to. */

export interface OpenIn {
  label: string;
  url: string;
  /** True when the prompt is not in the URL, so the caller must copy it first. */
  needsCopy: boolean;
}

/** Past this many characters of encoded prompt, some browsers and clients drop the URL. */
export const MAX_PROMPT_URL_LENGTH = 2000;

const CHATGPT = "https://chatgpt.com/";

/** Apps with no supported prompt URL: we copy the prompt, then open the app to paste it. */
const COPY_THEN_OPEN: Record<string, { name: string; url: string }> = {
  gemini: { name: "Gemini", url: "https://gemini.google.com/app" },
  midjourney: { name: "Midjourney", url: "https://www.midjourney.com/imagine" },
  flux: { name: "FLUX", url: "https://playground.bfl.ai" },
};

export function openInFor(target: string, prompt: string): OpenIn | null {
  if (target === "gpt-image") {
    const url = `${CHATGPT}?q=${encodeURIComponent(prompt)}`;
    return url.length <= MAX_PROMPT_URL_LENGTH
      ? { label: "Open in ChatGPT", url, needsCopy: false }
      : { label: "Open in ChatGPT", url: CHATGPT, needsCopy: true };
  }
  const app = COPY_THEN_OPEN[target];
  return app
    ? { label: `Copy & open ${app.name}`, url: app.url, needsCopy: true }
    : null;
}
