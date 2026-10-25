import { PURPOSES, type PurposeId, type Recipe } from "./recipe";

/**
 * One editorial example brief per format, for trying the studio quickly.
 * These are typical real-world briefs, not usage data.
 */
export interface BriefExample {
  readonly pill: string;
  readonly idea: string;
  readonly headline: string;
  readonly extraText: readonly string[];
  readonly detail: string;
}

export const BRIEF_EXAMPLES: Readonly<Record<PurposeId, BriefExample>> = {
  poster: {
    pill: "Gig poster",
    idea: "A concert poster for a jazz quartet playing a rooftop venue at sunset",
    headline: "Rooftop Jazz Nights",
    extraText: ["Fridays in July", "Doors 7 PM"],
    detail: "Tickets at the door",
  },
  flyer: {
    pill: "Community flyer",
    idea: "A flyer for a neighborhood open-mic night at a corner café",
    headline: "Open Mic Night",
    extraText: ["Every second Thursday", "Sign up from 6 PM"],
    detail: "Free entry",
  },
  "book-cover": {
    pill: "Novel cover",
    idea: "A cover for a literary mystery novel set in a fog-bound coastal town",
    headline: "The Salt Lantern",
    extraText: ["A Novel"],
    detail: "Author name at the bottom",
  },
  "album-cover": {
    pill: "EP cover",
    idea: "A cover for an indie electronic EP about late-night city drives",
    headline: "Night Signals",
    extraText: ["EP"],
    detail: "Artist name small above the title",
  },
  social: {
    pill: "Launch post",
    idea: "A social media post announcing a new handmade ceramics collection",
    headline: "New Collection",
    extraText: ["Now in the shop"],
    detail: "Shop link in bio",
  },
  story: {
    pill: "Story promo",
    idea: "A vertical story cover promoting a weekend farmers market sale",
    headline: "Market Day",
    extraText: ["Saturday 9 AM"],
    detail: "Swipe up for the map",
  },
  editorial: {
    pill: "Magazine feature",
    idea: "An editorial illustration for a magazine article about remote work and loneliness",
    headline: "",
    extraText: [],
    detail: "Leave space at the top for the article title",
  },
  banner: {
    pill: "Festival banner",
    idea: "A wide banner for an outdoor food and music festival in a city park",
    headline: "Park Feast Festival",
    extraText: ["June 14 to 16", "Live music and street food"],
    detail: "Free entry",
  },
};

/** Replaces only the brief fields; the visual look, target and pattern stay as they are. */
export function applyBriefExample(
  recipe: Recipe,
  purposeId: PurposeId,
): Recipe {
  const purpose = PURPOSES.find(({ id }) => id === purposeId);
  if (!purpose) return recipe;
  const example = BRIEF_EXAMPLES[purposeId];
  return {
    ...recipe,
    purpose: purpose.id,
    aspect: purpose.aspect,
    textMode: "render",
    idea: example.idea,
    headline: example.headline,
    extraText: [...example.extraText],
    detail: example.detail,
  };
}
