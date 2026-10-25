/** "Open in" links for model targets that have a chat app we can send people to. */

export interface OpenIn {
  label: string;
  url: string;
  /** True when the prompt is not in the URL, so the caller must copy it first. */
  needsCopy: boolean;
}

/** Past this many characters of encoded prompt, some browsers and clients drop the URL. */
export const MAX_PROMPT_URL_LENGTH = 2000;

const CHATGPT = "https://chatgpt.com/";
// Gemini's web app has no supported prefill parameter.
const GEMINI = "https://gemini.google.com/app";

export function openInFor(target: string, prompt: string): OpenIn | null {
  if (target === "gpt-image") {
    const url = `${CHATGPT}?q=${encodeURIComponent(prompt)}`;
    return url.length <= MAX_PROMPT_URL_LENGTH
      ? { label: "Open in ChatGPT", url, needsCopy: false }
      : { label: "Open in ChatGPT", url: CHATGPT, needsCopy: true };
  }
  if (target === "gemini") {
    return { label: "Copy & open Gemini", url: GEMINI, needsCopy: true };
  }
  return null;
}
