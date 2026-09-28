(function() {
  const capture = window.__TK_REVIEW_CAPTURE__;
  return {
    href: location.origin + location.pathname,
    readyState: document.readyState,
    isolated: !!(typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.id),
    hooked: window.__TK_REVIEW_CAPTURE_HOOKED__ === true,
    requestCount: capture && Array.isArray(capture.requests) ? capture.requests.length : 0,
    schemas: capture && capture.schemas || [], storeErrors: capture && capture.storeErrors || [],
    filterScriptPresent: typeof window.__TK_REVIEW_PRODUCT_FILTER__ === "function",
    filterJob: window.__TK_REVIEW_FILTER_JOB__ ? { command: window.__TK_REVIEW_FILTER_JOB__.command, done: window.__TK_REVIEW_FILTER_JOB__.done, error: window.__TK_REVIEW_FILTER_JOB__.error } : null,
    pageSizeCandidates: Array.from(document.querySelectorAll(".core-select-view-value, [class*='select-view-value'], [aria-label='Page size']")).map(el => (el.textContent || "").trim()).filter(text => /\d/.test(text)).slice(0, 10),
    fetchPresent: typeof window.fetch === "function", xhrPresent: typeof XMLHttpRequest === "function",
    paginationItems: document.querySelectorAll(".core-pagination-item").length,
    nextButtons: document.querySelectorAll(".core-pagination-item-next, [aria-label='Next']").length,
    frames: document.querySelectorAll("iframe").length,
    searchInputs: Array.from(document.querySelectorAll("input:not([type='hidden']):not([type='checkbox']):not([type='radio'])"))
      .filter(input => { const rect = input.getBoundingClientRect(); return rect.width > 0 && rect.height > 0; })
      .slice(0, 20).map(input => ({ type: input.type, id: input.id, name: input.getAttribute("name"), placeholder: input.getAttribute("placeholder"), ariaLabel: input.getAttribute("aria-label") }))
  };
})();
