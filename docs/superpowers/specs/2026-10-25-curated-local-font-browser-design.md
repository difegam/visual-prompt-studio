# Curated local font browser

## Intent

Help poster makers find a type character that fits the image they are art-directing, then carry that choice into the copied prompt. Keep font assets available locally so the composer does not request specimen fonts from a third-party host while building, testing, or previewing.

## Goals and boundaries

- Keep an intentionally curated catalog, adding widely used families that complement the existing display and editorial range: Roboto, Open Sans, Montserrat, and Poppins.
- Bundle font files and styles through pinned Fontsource packages. Preserve the app's local-first behavior and avoid a runtime font catalog API.
- Make it easy to search and filter by useful design categories such as sans, serif, condensed/display, and mono.
- Let users compare the specimen in regular, bold, and italic treatments, with a representative poster line that updates immediately.
- Carry selected family and supported emphasis into the compiled prompt. Make clear that image models receive a type description, not the actual font file; exact lettering can be typeset after generation.

## Approaches

- **Curated local browser (selected):** a small pinned library with local font assets, search, category filters, a live specimen, and emphasis controls. It fits the app's local-first constraint and keeps browsing manageable.
- **Large on-demand catalog:** many remotely discovered fonts and styles. It offers breadth, but adds network dependencies and distracts from the curated image-making choices.

## Font research

The 2025 HTTP Archive Web Almanac reports Roboto, Noto Sans JP, Poppins, Open Sans, Lato, and Montserrat among the most requested Google-hosted families, with Inter also present in the self-hosted usage data. Use Roboto, Open Sans, Montserrat, and Poppins as the missing high-use additions to the existing Inter family, while retaining display and editorial faces for poster-specific range. These are general web-usage signals, not a ranking of fonts preferred by image-generation users. Source: [HTTP Archive Web Almanac 2025: Fonts](https://almanac.httparchive.org/en/2025/fonts).

## Proposed experience

Extend the existing Typography section inside “Fine-tune the direction.” Keep the current selection visible as a compact dropdown trigger. Expanding it reveals a search field, category filter chips, and a scrollable list of specimens with family name and category. Selecting a specimen closes the list and updates the preview. Search and filters combine, and an empty state offers a clear-search action.

Show a live poster specimen beside the font controls. Bold and italic toggles alter the specimen and the selected prompt description; unsupported styles are disabled for families that lack the corresponding bundled face. Keep “Let the style decide” available as the recommended default. Add concise helper text explaining the model limitation and a field-info note about how to typeset exact text after generation.

## Constraints and calls

- The prompt studio already imports Fontsource assets locally for ten font families; keep that import-and-bundle pattern and pin additions through the package manager lockfile.
- The site shell separately requests Heebo and Signika from Bunny Fonts. As part of the local-font objective, bundle the needed shell faces locally and remove that external stylesheet request, while preserving the configured visual roles.
- Do not add user uploads, remote discovery, an account, or an external font API.
- Keep existing recipe import/export compatibility. New emphasis fields must have safe defaults when older saved recipes are loaded.
- The exact visible list order, sample copy, and supported weight/style combinations are implementation calls guided by the current catalog and actual Fontsource package variants.
