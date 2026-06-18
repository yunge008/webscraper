# Web Scraper Chrome Extension - Rebuilt Source

Extracted and reorganized from `v1.107.22` webpack bundle.

## Current Rebuild Status

- The root `*.js` bundles have been restored from `1.107.22_0`, so this directory is now the runnable unpacked-extension baseline.
- Cloud integration with the original Web Scraper cloud service is intentionally disabled.
- `manifest.json` no longer exposes `externally_connectable` or `web_accessible_resources` for `webscraper.io`.
- Background cloud sync/auth/upload/download/automation entry points now short-circuit with disabled errors.
- DevTools, side panel, and popup cloud promotion/sign-in UI has been hidden or removed.
- The `src/` files remain extracted webpack module fragments for reference and future source-level rebuild work; they are not yet a standalone buildable source tree.

## Directory Structure

```
webscraper-rebuilt/
├── src/
│   ├── background/        # Background service worker & extension lifecycle
│   │   ├── BackgroundScript.js   ← Main entry, wires everything together
│   │   ├── Config.js             ← Extension config (API URLs, timeouts)
│   │   ├── BrowserAction.js      ← Toolbar icon badge logic
│   │   ├── ContentScriptLoader.js← Injects content_script into pages
│   │   ├── ExtensionUpdate.js    ← Version update handling
│   │   ├── ExternalMessageService.js ← webscraper.io website ↔ extension bridge
│   │   ├── FirstTimeInstall.js   ← Onboarding flow
│   │   └── WizardPageType.js     ← Wizard page type enum
│   │
│   ├── chrome/            # Chrome API wrappers
│   │   ├── ChromeTab.js          ← Tab open/close/navigate
│   │   ├── ChromeWindow.js       ← Window management
│   │   ├── ChromeStorage.js      ← chrome.storage.sync wrapper
│   │   ├── ChromeStorageLocal.js ← chrome.storage.local wrapper
│   │   ├── ChromeDeclarativeNetRequest.js ← Header modification rules
│   │   ├── ChromeClient.js       ← Low-level Chrome API facade
│   │   ├── ChromeTabStatus.js    ← Tab status enum
│   │   ├── WebPageChromeTab.js   ← High-level page driver
│   │   └── WebPageChromeTabElement.js ← Page element interaction
│   │
│   ├── scraper/           # Core scraping engine
│   │   ├── Sitemap.js            ← Sitemap model (selectors tree + start URLs)
│   │   ├── Selector.js           ← Base selector class
│   │   ├── SelectorGroup.js      ← Groups multiple selectors
│   │   ├── SelectorList.js       ← List/collection of selectors
│   │   ├── DataExtractor.js      ← Orchestrates data extraction
│   │   ├── SitemapRepository.js  ← Load/save sitemaps from storage
│   │   ├── SitemapDataRepository.js ← Scraped data storage
│   │   ├── SitemapDataTransformer.js← Transform raw data for export
│   │   ├── ActionClick.js        ← Click action
│   │   ├── ActionScrollDown.js   ← Scroll action
│   │   ├── ClickActionTypes.js   ← Click type enum
│   │   ├── PaginationLinkExtractorStrategy.js
│   │   ├── LinkFromHrefExtractor.js
│   │   ├── LinkFromAttributesExtractor.js
│   │   ├── LinkFromInlineScriptExtractor.js
│   │   ├── LinkFromInnerTextExtractor.js
│   │   └── LinkFromRedirectExtractor.js
│   │
│   ├── selectors/         # Selector type implementations
│   │   ├── SelectorText.js       ← Extract text content
│   │   ├── SelectorLink.js       ← Extract links
│   │   ├── SelectorImage.js      ← Extract image src/alt
│   │   ├── SelectorHTML.js       ← Extract raw HTML
│   │   ├── SelectorTable.js      ← Extract table data
│   │   ├── SelectorXlsx.js       ← Excel-style extraction
│   │   ├── SelectorPagination.js ← Handle pagination
│   │   ├── SelectorPopupLink.js  ← Popup/modal links
│   │   ├── SelectorScriptData.js ← Data from JS scripts
│   │   ├── SelectorSitemapXmlLink.js ← XML sitemap links
│   │   ├── SelectorElement.js    ← DOM element wrapper
│   │   ├── SelectorElementAttribute.js
│   │   ├── SelectorElementClick.js
│   │   ├── SelectorElementScroll.js
│   │   ├── CssSelector.js        ← CSS selector engine
│   │   ├── ElementSelector.js    ← Element picker
│   │   ├── ElementSelectorTransformer.js
│   │   ├── ElementQuery.js       ← Query abstraction
│   │   └── selectorFactory.js    ← Factory to instantiate by type
│   │
│   ├── events/            # Browser event listeners
│   │   ├── TabEventListener.js   ← Tab lifecycle events
│   │   ├── TabNetworkRequestListener.js ← Network request monitoring
│   │   ├── TabNetworkStatusListener.js  ← Network status tracking
│   │   ├── AjaxEventListener.js  ← AJAX request detection
│   │   ├── WebNavigationEventListener.js← Navigation events
│   │   ├── WebRequestEventListener.js  ← webRequest API
│   │   ├── RedirectInterceptor.js← Intercept redirects
│   │   ├── GlobalTimeoutEventListener.js
│   │   ├── FailOnErrorPagesEventListener.js
│   │   ├── MinDurationEventListener.js
│   │   ├── PageLoadDelayEventListener.js
│   │   ├── WaitForRootElementEventListener.js
│   │   └── LockEventListener.js
│   │
│   ├── formatters/        # Export formatters
│   │   ├── BaseDataFormatter.js
│   │   ├── ArrayJoinFormatter.js
│   │   ├── StringEscapeFormatter.js
│   │   ├── TypeTransformer.js
│   │   └── formatterFactory.js
│   │
│   ├── cloud/             # Cloud API
│   │   ├── CloudApiClient.js     ← REST API client for webscraper.io cloud
│   │   ├── BaseExtensionApiClient.js
│   │   ├── CloudAuthenticationService.js
│   │   └── CloudSitemapService.js← Sync sitemaps to cloud
│   │
│   ├── utils/             # Utilities
│   │   ├── Str.js                ← String helpers
│   │   ├── Url.js                ← URL parsing/manipulation
│   │   ├── Obj.js                ← Object helpers
│   │   ├── SetHelper.js          ← Set operations
│   │   ├── CSV.js                ← CSV serialization
│   │   ├── Log.js                ← Logging system
│   │   ├── Async.js              ← Async utilities
│   │   ├── HttpRequest.js        ← Fetch wrapper
│   │   ├── Stats.js              ← Scrape statistics
│   │   └── ...
│   │
│   ├── ui/                # React components (DevTools panel)
│   │   ├── DevtoolsPanel.js      ← Root panel component
│   │   ├── Navigation.js         ← Top navigation bar
│   │   ├── SitemapListView.js    ← List all sitemaps
│   │   ├── SitemapScrapeView.js  ← Run scrape UI
│   │   ├── EditSitemapSelectorView.js ← Edit a selector
│   │   ├── CreateSitemapView.js  ← Create new sitemap
│   │   └── ...
│   │
│   └── content_script/    # Injected into target pages
│       ├── DomEditor.js          ← DOM manipulation
│       ├── HighlightOverlayStore.js ← Element highlight overlay
│       ├── Selection.js          ← User element selection
│       └── ...
│
├── images/                # Extension icons
├── _locales/en/           # i18n strings
├── manifest.json          # Extension manifest (MV3)
├── *.html                 # Panel/popup HTML pages
└── *.css                  # Styles

## Key Customization Points

### 1. Change scraping behavior
- `src/scraper/DataExtractor.js` — core extraction loop
- `src/scraper/Sitemap.js` — sitemap model, start URL handling
- `src/selectors/SelectorText.js` etc. — per-type extraction logic

### 2. Modify export formats
- `src/utils/CSV.js` — CSV output
- `src/selectors/SelectorXlsx.js` — Excel output
- `src/formatters/` — data transformation pipeline

### 3. Adjust Chrome API behavior
- `src/chrome/ChromeTab.js` — tab timing/timeout settings
- `src/chrome/ChromeStorage.js` — storage key names
- `src/events/PageLoadDelayEventListener.js` — page load wait time

### 4. UI changes
- `src/ui/DevtoolsPanel.js` — main panel layout
- `src/ui/SitemapScrapeView.js` — scrape progress view
- All UI components use React + MUI

### 5. Cloud/API settings
- `src/cloud/CloudApiClient.js` — API base URL
- `src/background/Config.js` — global config constants

## How to Rebuild

The original bundle uses webpack. To rebuild after modifications:

```bash
# These source files are the extracted modules.
# Variable names still use minified single-letter names from the original.
# To use them, you need to:
# 1. Replace variable names (manual or with a rename tool)
# 2. Re-bundle with webpack, or
# 3. Directly edit the original .js files in the 1.107.22_0/ folder
```

## Notes

- All JS was extracted from webpack bundle (MV3, webpack 5)
- Variable names (e, t, r, n etc.) preserved from minification
- Framework: React 18 + MUI (Material UI) for UI components
- Background uses TypeScript compiled to JS (async/await patterns visible)
- Content script uses bcrypt for some operations
