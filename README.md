# Web Scraper Rebuild Handoff Notes

This document is written for Claude, Codex, or another AI/developer that may continue this work later.

The important context: this is not a new Chrome extension built from scratch. It is a rebuilt and modified copy of the original Web Scraper Chrome Extension v1.107.22, with cloud-related behavior removed and TikTok Shop review scraping improvements added.

## Folder Relationship

Workspace:

```text
E:\OneDrive\1. AI\webscraper\
+-- 1.107.22_0\          Original unpacked extension reference
+-- webscraper-rebuilt\  Current rebuilt extension, loaded in Chrome
```

Rules for future work:

- Do not modify `1.107.22_0`; it is the reference copy.
- Modify `webscraper-rebuilt`; this is the current working unpacked extension.
- The root JS bundle files inside `webscraper-rebuilt` are the real runnable files.
- The `webscraper-rebuilt/src/` folder contains extracted webpack module fragments for reference. It is not currently a complete buildable source tree.

## Project Goal

The original Web Scraper extension is functional, but it includes WebScraper.io cloud account, cloud sync, cloud job, external website bridge, and first-install web onboarding behavior.

The user does not want to run or configure any cloud service.

The rebuild goals are:

- Keep local scraping, sitemap creation, preview, and export functionality.
- Disable or remove original WebScraper.io cloud integration.
- Keep the extension loadable as a Chrome unpacked extension.
- Improve the wizard for TikTok Shop Seller Center product review scraping.
- Add TikTok review star rating extraction.
- Add max-page limiting for next-page pagination.

## Original Extension Logic Summary

The original extension uses Web Scraper's sitemap and selector model.

Main runtime files:

```text
webscraper-rebuilt/manifest.json
webscraper-rebuilt/background_script.js
webscraper-rebuilt/content_script.js
webscraper-rebuilt/devtools_panel.js
webscraper-rebuilt/sidepanel.js
webscraper-rebuilt/scraper.js
```

High-level flow:

1. User selects a repeating record area on a page.
2. Wizard generates a wrapper `SelectorElement`.
3. Child selectors such as `SelectorText`, `SelectorLink`, `SelectorImage` are generated under that wrapper.
4. If pagination is enabled, a `SelectorPagination` is added.
5. Preview and real scrape both use the generated sitemap selectors to extract records.

Important runtime distinction:

- `sidepanel.js`: current Chrome side panel wizard UI and data preview.
- `devtools_panel.js`: DevTools panel UI.
- `content_script.js`: injected page-side DOM selection and extraction.
- `scraper.js`: actual scrape execution page.
- `background_script.js`: service worker, storage, jobs, page driving, cloud-related entry points.

## Completed Rebuild Work

### Restored runnable bundle baseline

The rebuilt folder now contains the root bundle files needed to load the extension:

```text
background_script.js
content_script.js
devtools_init_page.js
devtools_panel.js
extension_installed.js
options.js
popup.js
scraper.js
settings.js
set_timeout_worker.js
sidepanel.js
```

These root bundle files are currently patched directly.

### Cloud service removal / disabling

Completed work:

- `manifest.json`
  - Removed `externally_connectable`.
  - Removed WebScraper.io-related `web_accessible_resources`.
  - Removed the non-standard `_NOTE` field that caused Chrome manifest warnings.
- `popup.html` / `popup.js`
  - Removed cloud promo and cloud button behavior.
- `background_script.js`
  - Cloud sync/auth/upload/download/automation entry points are disabled or short-circuited.
  - External message bridge to WebScraper.io is disabled.
- `devtools_panel.js`
  - Cloud login, cloud ad, and cloud columns are hidden or removed.
- `sidepanel.js`
  - Cloud promo card removed.
- First-install web page jump disabled:
  - Original target was `https://webscraper.io/web-scraper-first-time-install`.
  - Extension should no longer open this page after install.

## TikTok Shop Custom Work

Target page:

```text
https://seller.tiktokshopglobalselling.com/product/rating
```

Current direction: do not use DOM star scraping for TikTok ratings. A dedicated `TK Reviews` side panel tab now fetches TikTok review API data directly from the current logged-in TikTok page context.

New files:

```text
webscraper-rebuilt/tiktok_reviews.html
webscraper-rebuilt/tiktok_reviews.css
webscraper-rebuilt/tiktok_reviews.js
webscraper-rebuilt/sidepanel_shell.js
```

The side panel shell now has two tabs:

```text
Web Scraper
TK Reviews
```

`TK Reviews` flow:

1. Open TikTok Shop rating page.
2. Open the extension side panel.
3. Switch to `TK Reviews`.
4. Click `Install Capture & Refresh`.
5. The extension registers a document-start hook and reloads the page.
6. Wait for TikTok reviews to load, then click `Read Captured Data`.
7. Select how many pages to fetch.
8. Click `Fetch Reviews`.
9. Download CSV.

The API response should contain:

```text
data.list[]
data.total
data.next_cursor
```

The rating field should come from `star_level`, not from DOM stars.

The UI intentionally only asks for page count now. Total count, fetch count, page size, and manual URL entry were removed from the main flow.

### Auto-generated rating field

For the TikTok product rating page, the side panel wizard inserts a `rating` selector.

Current selector:

```css
[class*="ratingStar"], div:has(> svg[class*="activeStar"]), span:has(> svg[class*="activeStar"])
```

This should only be added for the TikTok product rating page, to avoid affecting other sites or other TikTok pages.

Status: this DOM-based auto insertion is currently disabled because it caused repeated preview/runtime errors. Keep it disabled unless deliberately returning to DOM scraping.

### Star rating extraction

TikTok ratings are not text. Each star is an SVG.

Observed DOM behavior:

- Filled star class contains `activeStar`.
- Empty star class contains `defaultStar`.
- Both filled and empty stars can share generic star/icon classes.

Therefore:

- Do not count all SVGs.
- Do not count all `star-fill` icons.
- Correct rating value is the count of `activeStar` occurrences inside the rating container HTML.

Examples:

```text
1 activeStar + 4 defaultStar => rating 1
5 activeStar                 => rating 5
```

Rating fallback logic was added to:

```text
background_script.js
scraper.js
devtools_panel.js
sidepanel.js
content_script.js
src/selectors/SelectorText.js
```

The key helper names added or modified:

```text
isTikTokRatingPage()
inferStarRating()
```

The extraction only runs when:

- Current page URL matches `seller.tiktokshopglobalselling.com/product/rating`, and
- selector id is `rating`, or selector contains `ratingStar` / `activeStar`.

### Data preview error fix

There was a preview-stage error:

```text
Something went wrong while extracting data from this page...
```

Likely cause:

- A previous patch used the wrong async helper in some webpack bundle copies.
- Syntax checks still passed, but runtime preview could fail.

Fixed in:

```text
sidepanel.js
scraper.js
devtools_panel.js
```

Additional guards added:

- If `getPageUrl()` does not exist in a preview context, do not throw.
- If `getText()` returns `undefined` or `null`, normalize to empty string.
- If `getWrappedHTML()` returns `undefined` or `null`, normalize to empty string.

### Pagination max pages

When the wizard's second step selects a next-page button, a page limit was added:

```text
Max pages = 1-X
```

Meaning:

```text
1 => scrape current page only, do not click next
5 => scrape pages 1 through 5 at most
empty => unlimited, use original stop logic
```

Original stopping behavior was mainly:

- next button not found
- duplicate batch detection
- page load/network state conditions

The earlier "stopped at page 23" behavior was not based on user page limit. It was the original unlimited stopping behavior. The rebuilt version now passes `maxPages` through `SelectorPagination` into the click pagination strategy.

## Where Most Time Was Spent

### 1. Understanding webpack bundle structure

The extension is bundled. The same logical module appears in multiple root JS bundles.

Changing only `src/` is not enough. Changing only one root bundle is often not enough.

### 2. Removing cloud behavior without breaking local scraping

Cloud logic is spread across manifest, popup, background, devtools, side panel, and service modules. Some code was disabled instead of physically deleted because local behavior may still depend on shared helpers.

### 3. TikTok star DOM analysis

The difficult part was discovering that rating is not text and that filled and empty stars must be distinguished by `activeStar` versus `defaultStar`.

### 4. Preview versus real scrape paths

Preview, side panel, DevTools, scraper execution, and page content script can use different bundles or duplicated modules. Fixes often need to be synchronized across:

```text
background_script.js
scraper.js
devtools_panel.js
sidepanel.js
content_script.js
src/... reference module
```

### 5. Runtime-only errors

`node --check` only catches syntax errors. It does not catch wrong webpack async helper usage or missing methods in a specific runtime context.

## Current Verification Commands

Run after editing root bundle files:

```powershell
& 'C:\Users\YUNGE\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --check 'webscraper-rebuilt\background_script.js'
& 'C:\Users\YUNGE\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --check 'webscraper-rebuilt\scraper.js'
& 'C:\Users\YUNGE\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --check 'webscraper-rebuilt\devtools_panel.js'
& 'C:\Users\YUNGE\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --check 'webscraper-rebuilt\sidepanel.js'
& 'C:\Users\YUNGE\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --check 'webscraper-rebuilt\content_script.js'
& 'C:\Users\YUNGE\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' -e "JSON.parse(require('fs').readFileSync('webscraper-rebuilt/manifest.json','utf8')); console.log('manifest ok')"
```

Important: syntax checks are necessary but not sufficient. Chrome runtime testing is still required.

## Chrome Test Procedure

After every code change:

1. Open `chrome://extensions`.
2. Reload `webscraper-rebuilt`.
3. Refresh the TikTok target page.
4. Close and reopen the Web Scraper side panel.
5. Re-run data setup and preview.

An already-open side panel may keep old JavaScript loaded.

## Current Known Risks / Blockers

### Blocker 1: rating column may still be empty or preview may error

Possible causes:

- Extension was not reloaded after patching.
- Page was not refreshed after extension reload.
- Side panel was not reopened.
- TikTok changed class names.
- The selector matches an outer container that does not include `activeStar` in its wrapped HTML.
- One runtime bundle still has an unsynchronized copy of selector logic.

Debug plan:

1. In Chrome DevTools, inspect one selected rating node.
2. Confirm its HTML contains `activeStar`.
3. Confirm the generated selector actually selects the same node.
4. If selector is too broad, try:

```css
[class*="ratingStar"]:has(svg[class*="activeStar"])
```

5. If preview still errors, inspect:
   - side panel console
   - extension service worker console
   - page console
6. Capture the exact stack trace before changing more bundle code.

### Blocker 2: no real source build pipeline

Current work patches bundled JS directly. This is fragile.

Long-term plan:

1. Keep `1.107.22_0` as untouched reference.
2. Map webpack module ids to extracted files in `src/`.
3. Reconstruct a build pipeline if possible.
4. Move changes into source modules.
5. Generate root bundles instead of editing them manually.

### Blocker 3: cloud code is disabled, not fully removed

Some cloud code still exists in bundles as dead or short-circuited code.

Future cleanup plan:

1. Identify all cloud modules and API clients.
2. Separate truly unused modules from shared helpers.
3. Remove dead UI and unreachable cloud paths incrementally.
4. Test local scrape after each removal.

## Recommended Next Priorities

1. Stabilize TikTok product rating scraping.
   - Rating output must be 1-5.
   - CSV/XLSX export should include stable `rating` column.
   - Pagination max pages must stop exactly.

2. Add temporary debug logging for rating extraction.
   - Current page URL.
   - Selector id.
   - Selector string.
   - Matched element count.
   - Active star count.
   - Remove logs after stable.

3. Build or reconstruct a maintainable source pipeline.

4. Continue removing cloud UI and dead cloud code once local scraping is stable.

## Key Files

```text
webscraper-rebuilt/manifest.json
  Extension declaration. Cloud bridge fields and non-standard note removed.

webscraper-rebuilt/background_script.js
  Service worker. Cloud entry points disabled. Scrape/background logic.

webscraper-rebuilt/content_script.js
  Injected into target pages. DOM extraction and TikTok rating fallback added.

webscraper-rebuilt/sidepanel.js
  Main current UI. Rating selector insertion, max-page UI, data preview.

webscraper-rebuilt/scraper.js
  Actual scrape execution. Must sync selector/rating/pagination logic here.

webscraper-rebuilt/devtools_panel.js
  DevTools UI. Contains duplicated selector logic.

webscraper-rebuilt/src/selectors/SelectorText.js
  Reference module for text/rating extraction.

webscraper-rebuilt/src/selectors/SelectorPagination.js
  Reference module for pagination and maxPages.

webscraper-rebuilt/src/scraper/ClickMoreElementExtractorStrategy.js
  Reference module for next-button pagination stopping.
```

## Reminder For The Next AI

- Do not modify `1.107.22_0`.
- Do not assume `src/` changes affect runtime.
- Root bundle files are the current runtime.
- Sync changes across all relevant bundles.
- `node --check` is not enough.
- Always reload extension, refresh page, and reopen side panel before testing.
