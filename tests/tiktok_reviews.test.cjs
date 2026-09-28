const test = require("node:test");
const assert = require("node:assert/strict");
const vm = require("node:vm");
const fs = require("node:fs");
const path = require("node:path");
const base = path.join(__dirname, "../webscraper-rebuilt");
const source = fs.readFileSync(path.join(base, "tiktok_reviews.js"), "utf8");

function event() {
  const listeners = new Set();
  return { addListener: fn => listeners.add(fn), removeListener: fn => listeners.delete(fn), emit: (...args) => [...listeners].forEach(fn => fn(...args)), listeners };
}
function harness(options = {}) {
  const elements = new Map();
  const element = id => {
    if (!elements.has(id)) elements.set(id, { value: id === "productSearchId" ? "" : id === "pageEnd" ? "3" : "1", textContent: "", addEventListener() {}, appendChild() {}, disabled: false });
    return elements.get(id);
  };
  const tabs = options.tabs || [{ id: 1, active: true, url: "https://seller-mx.tiktokshop.com/product/rating?shop_id=PRIVATE" }];
  const chrome = { runtime: { getManifest: () => ({ version: "1.107.24" }) }, tabs: {
    query: (query, cb) => cb(query.active ? tabs.filter(tab => tab.active) : tabs),
    get: (id, cb) => cb(tabs.find(tab => tab.id === id)),
    reload: (_, cb) => cb(), onUpdated: event(), onRemoved: event()
  }, scripting: {} };
  const context = vm.createContext({
    document: { getElementById: element, createElement: () => ({ appendChild() {} }) },
    chrome, URL, navigator: { userAgent: "test browser" }, window: { addEventListener() {} },
    console: { error() {} }, setTimeout, clearTimeout, ...options.globals
  });
  const instrumented = source.replace("  run(refreshActiveTabStatus);", `
    window.testAPI = { isTikTokRatingUrl, getActiveTab, refreshActiveTabStatus, chromeCall, findReviewPayload,
      chooseReviewRequest, flattenReview, ensureCaptureScript, waitForTabComplete, verifyCaptureHook,
      run, runProbes, fetchPages, readCapture, diagnosticReport,
      prepareProductFilter, restoreProductFilter, payloadMatchesProduct, requireProductPayload,
      refreshAndNavigateToPage, productFilterCommand, requestPageSize,
      lock: id => { lockedTabId = id; }, stop: () => { stopRequested = true; },
      patch: overrides => {
        if (overrides.install) installCaptureRefreshAndRead = overrides.install;
        if (overrides.next) clickNextAndWaitForPayload = overrides.next;
        if (overrides.retry) refreshAndNavigateToPage = overrides.retry;
        if (overrides.replay) replayRequest = overrides.replay;
      }
    };
  `);
  vm.runInContext(instrumented, context);
  return { api: context.window.testAPI, context, chrome, tabs, elements };
}

test("regional seller pages accepted; unrelated hosts and paths rejected", () => {
  const { api } = harness();
  for (const url of ["https://seller.tiktokshopglobalselling.com/product/rating", "https://seller-mx.tiktokshop.com/product/rating/?x=1", "https://seller-us.tiktokshop.com/product/rating"]) assert.equal(api.isTikTokRatingUrl(url), true);
  for (const url of ["https://example.com/product/rating", "https://seller-mx.tiktokshop.com.evil.test/product/rating", "https://seller-mx.tiktokshop.com/foo/product/rating", "http://seller-mx.tiktokshop.com/product/rating"]) assert.equal(api.isTikTokRatingUrl(url), false);
});

test("callback-only APIs, runtime errors, and hung calls terminate explicitly", async () => {
  const { api, chrome } = harness();
  assert.equal((await api.getActiveTab()).id, 1);
  chrome.tabs.query = (_, cb) => { chrome.runtime.lastError = { message: "permission denied" }; cb(); delete chrome.runtime.lastError; };
  await assert.rejects(api.chromeCall("tabs", "query", {}), /permission denied/);
  chrome.tabs.query = () => undefined;
  await assert.rejects(api.chromeCall("tabs", "query", {}, 5), /超时/);
});

test("ambiguous windows never silently select a shop; locked tab stays fixed", async () => {
  const { api, tabs } = harness({ tabs: [
    { id: 1, active: false, url: "https://seller-mx.tiktokshop.com/product/rating" },
    { id: 2, active: false, url: "https://seller-us.tiktokshop.com/product/rating" }
  ] });
  await assert.rejects(api.getActiveTab(), /多个评价页/);
  api.lock(1); tabs[1].active = true;
  assert.equal((await api.getActiveTab()).id, 1);
  tabs[0].url = "https://seller-mx.tiktokshop.com/orders";
  await assert.rejects(api.getActiveTab(), /离开评价页/);
});

test("newest capture wins; aliases parse; empty review response is recognized", () => {
  const { api } = harness();
  const old = { capturedAt: 1, responseJson: { data: { list: [{ main_review_id: "old" }], next_cursor: "next" } } };
  const current = { capturedAt: 2, responseJson: { data: { reviewList: [{ mainReviewId: "new", starLevel: 5, reviewText: "good" }], total_count: 1 } } };
  assert.equal(api.chooseReviewRequest([old, current]), current);
  assert.equal(api.chooseReviewRequest([{ ...old, sequence: 1, capturedAt: 10 }, { ...current, sequence: 2, capturedAt: 5 }]).sequence, 2);
  assert.equal(api.chooseReviewRequest([{ ...current, status: 403 }]), null);
  assert.equal(api.flattenReview(api.findReviewPayload(current.responseJson).list[0]).review_text, "good");
  const empty = { url: "/api/review/list", capturedAt: 3, responseJson: { data: { list: [], total: 0 } } };
  assert.equal(api.chooseReviewRequest([empty]), empty);
  assert.equal(api.chooseReviewRequest([{ ...empty, url: "/orders" }]), null);
  assert.equal(api.findReviewPayload({ list: [{ order_id: 1 }] }), null);
});

test("registration avoids unregistering nonexistent script; correct seller matches", async () => {
  const { api, chrome } = harness();
  let registered;
  chrome.scripting.getRegisteredContentScripts = (_, cb) => cb(registered || []);
  chrome.scripting.unregisterContentScripts = () => { throw new Error("should not unregister absent script"); };
  chrome.scripting.registerContentScripts = (scripts, cb) => { registered = scripts; cb(); };
  await api.ensureCaptureScript();
  assert.equal(registered[0].world, "MAIN");
  assert.equal(registered[0].matches.length, 2);
  assert.ok(registered[0].matches.every(match => !match.startsWith("*://*")));
});

test("refresh listeners are registered early and removable on reload failure", async () => {
  const { api, chrome } = harness();
  const wait = api.waitForTabComplete(1);
  chrome.tabs.onUpdated.emit(1, { status: "complete" });
  await wait;
  assert.equal(chrome.tabs.onUpdated.listeners.size, 0);
  assert.equal(chrome.tabs.onRemoved.listeners.size, 0);
  const canceled = api.waitForTabComplete(1);
  canceled.cancel();
  await assert.rejects(canceled, /取消/);
  assert.equal(chrome.tabs.onUpdated.listeners.size, 0);
});

test("false MAIN world hook is reported as failure", async () => {
  const { api, chrome } = harness();
  chrome.scripting.executeScript = (_, cb) => cb([{ result: { hooked: true, mainWorld: false } }]);
  await assert.rejects(api.verifyCaptureHook(), /步骤 5\/6/);
});

test("stop during page wait prevents replay and refresh; preserves collected rows", async () => {
  const { api } = harness();
  let retries = 0;
  api.patch({ install: async () => ({ request: {}, payload: { list: [{ main_review_id: "1" }], nextCursor: "next" } }),
    next: async () => { api.stop(); return null; }, retry: async () => { retries++; }, replay: async () => { retries++; } });
  await api.run(api.fetchPages, true);
  assert.equal(retries, 0);
  assert.equal(api.diagnosticReport().rows, 1);
  assert.match(api.diagnosticReport().status, /已停止/);
});

test("duplicate page responses do not get exported twice", async () => {
  const { api } = harness();
  const payload = { list: [{ main_review_id: "same" }], nextCursor: "next" };
  api.patch({ install: async () => ({ request: {}, payload }), next: async () => payload,
    replay: async () => ({ data: { list: payload.list, next_cursor: "next" } }), retry: async () => payload });
  await api.run(api.fetchPages, true);
  assert.equal(api.diagnosticReport().rows, 1);
  assert.match(api.diagnosticReport().status, /已停止在/);
});

test("diagnostic probes do not click/reload and exclude private data", async () => {
  const { api, chrome } = harness();
  chrome.tabs.reload = () => { throw new Error("probe must never refresh"); };
  chrome.scripting.getRegisteredContentScripts = (_, cb) => cb([]);
  chrome.scripting.executeScript = (options, cb) => {
    if (options.files || !options.func.toString().includes("__TK_REVIEW_CAPTURE__")) return cb([{ result: { hooked: true, isolated: options.world === "ISOLATED" } }]);
    cb([{ result: { installedAt: 1, network: [{ url: "https://seller-mx.tiktokshop.com/api/review", status: 403 }], requests: [{
      url: "https://seller-mx.tiktokshop.com/api/review?token=PRIVATE_TOKEN", requestHeaders: { Authorization: "PRIVATE_AUTH" },
      requestBody: "PRIVATE_BODY", responseJson: { data: { list: [{ main_review_id: "PRIVATE_ID", review_text: "PRIVATE_COMMENT" }] } }
    }] } }]);
  };
  await api.runProbes();
  const report = JSON.stringify(api.diagnosticReport());
  for (const privateValue of ["PRIVATE_TOKEN", "PRIVATE_AUTH", "PRIVATE_BODY", "PRIVATE_ID", "PRIVATE_COMMENT", "shop_id"]) assert.ok(!report.includes(privateValue));
  assert.ok(report.includes("403"));
  assert.equal(api.diagnosticReport().probe.checks.length, 6);
});

test("fetch Request body/headers, failed HTTP, XHR JSON capture preserve page behavior", async () => {
  class XHR {
    constructor() { this.listeners = new Set(); }
    open() {} setRequestHeader() {} send() {}
    addEventListener(_, fn) { this.listeners.add(fn); }
    removeEventListener(_, fn) { this.listeners.delete(fn); }
    finish() { for (const fn of [...this.listeners]) fn(); }
  }
  const calls = [];
  const window = { fetch: async (...args) => { calls.push(args); return new Response(JSON.stringify({ data: { list: [{ main_review_id: "a", review_text: "ok" }] } }), { status: 403 }); } };
  const context = vm.createContext({ window, XMLHttpRequest: XHR, Request, Response, Headers, URL, location: { href: "https://seller-mx.tiktokshop.com/product/rating" } });
  const hook = fs.readFileSync(path.join(base, "tiktok_capture_hook.js"), "utf8");
  vm.runInContext(hook, context);
  const request = new Request("https://seller-mx.tiktokshop.com/api/review?token=secret", { method: "POST", headers: { "Content-Type": "application/json", Authorization: "secret" }, body: '{"cursor":"first"}' });
  const response = await window.fetch(request);
  assert.equal(response.status, 403);
  assert.ok((await response.text()).includes("review_text"));
  await new Promise(resolve => setTimeout(resolve, 30));
  const cap = window.__TK_REVIEW_CAPTURE__;
  assert.equal(cap.requests[0].requestBody, '{"cursor":"first"}');
  assert.equal(cap.requests[0].requestHeaders.authorization, "secret");
  assert.equal(cap.network[0].status, 403);
  assert.ok(!cap.network[0].url.includes("secret"));
  const xhr = new XHR(); xhr.open("POST", "/api/review"); xhr.send("{}");
  xhr.status = 200; xhr.responseType = "json"; xhr.response = { data: { reviewList: [{ mainReviewId: "b" }] } };
  xhr.finish();
  assert.equal(cap.requests[1].responseJson.data.reviewList[0].mainReviewId, "b");
  assert.equal(xhr.listeners.size, 0);
  const wrapped = window.fetch;
  vm.runInContext(hook, context);
  assert.equal(window.fetch, wrapped);
  assert.equal(calls.length, 1);
});

test("complete callback-only capture/reload/next-page flow exports exactly requested pages", async () => {
  const { api, chrome, context, elements } = harness({ globals: { setTimeout: (fn, ms) => setTimeout(fn, ms === 500 ? 1 : ms) } });
  let page = 1;
  const pageWindow = {};
  function capturePage() {
    pageWindow.__TK_REVIEW_CAPTURE__.requests.push({ url: "https://seller-mx.tiktokshop.com/api/review", status: 200,
      capturedAt: Date.now() + page, responseJson: { data: { list: [{ main_review_id: String(page), review_text: `page ${page}` }], total: 3, next_cursor: page < 3 ? String(page + 1) : "" } } });
  }
  function node(number) { return { textContent: String(number), getBoundingClientRect: () => ({ width: 10, height: 10 }) }; }
  const next = { className: "core-pagination-item-next", getBoundingClientRect: () => ({ width: 10, height: 10 }),
    getAttribute: () => page === 3 ? "true" : "false", scrollIntoView() {}, dispatchEvent() {}, click() { page++; capturePage(); } };
  const pageDocument = {
    readyState: "complete",
    querySelectorAll: selector => selector === ".core-pagination-item" ? [node(1), node(2), node(3)] : selector.includes("select-view-value") ? [{ textContent: "1 / Page" }] : selector.includes("Next") ? [next] : [],
    querySelector: () => node(page)
  };
  const pageContext = vm.createContext({ window: pageWindow, document: pageDocument, location: { href: "https://seller-mx.tiktokshop.com/product/rating" }, navigator: { userAgent: "page browser" }, MouseEvent: function() {} });
  let registered = [];
  chrome.scripting.getRegisteredContentScripts = (_, cb) => cb(registered);
  chrome.scripting.registerContentScripts = (scripts, cb) => { registered = scripts; cb(); };
  chrome.scripting.executeScript = (options, cb) => {
    pageContext.args = options.args || [];
    try {
      if (options.files) { options.files.forEach(file => vm.runInContext(fs.readFileSync(path.join(base, file), "utf8"), pageContext)); cb([{ result: undefined }]); }
      else Promise.resolve(vm.runInContext(`(${options.func.toString()})(...args)`, pageContext)).then(result => cb([{ result }]));
    }
    catch (error) { chrome.runtime.lastError = { message: error.message }; cb(); delete chrome.runtime.lastError; }
  };
  let reloads = 0;
  chrome.tabs.reload = (id, cb) => {
    reloads++; page = 1;
    pageWindow.__TK_REVIEW_CAPTURE_HOOKED__ = true;
    pageWindow.__TK_REVIEW_CAPTURE__ = { requests: [] };
    capturePage();
    // This completion arrives before the reload API's callback.
    chrome.tabs.onUpdated.emit(id, { status: "complete" }); cb();
  };
  await api.run(api.fetchPages, true);
  assert.equal(api.diagnosticReport().rows, 3);
  assert.match(api.diagnosticReport().status, /完成.*1-3/);
  assert.equal(reloads, 1);
  assert.equal(page, 3);
  assert.equal(elements.get("fetchReviews").disabled, false);
  assert.equal(chrome.tabs.onUpdated.listeners.size, 0);
});

test("fixed ID stays a string; every row must match product or SKU before export", async () => {
  const { api, chrome, elements } = harness();
  const id = "1731892023085009910";
  elements.get("productSearchId").value = id;
  const commands = [];
  let result;
  chrome.scripting.executeScript = (options, cb) => {
    if (options.files) return cb([{ result: undefined }]);
    if (options.args.length > 1) {
      commands.push(options.args);
      result = options.args[1] === "inspect" ? { found: true, descriptor: { placeholder: "商品 ID" }, value: "" } : { ready: true, trigger: "enter" };
      return cb([{ result: { started: true } }]);
    }
    cb([{ result: { done: true, result } }]);
  };
  await api.prepareProductFilter();
  await api.restoreProductFilter();
  assert.equal(commands[1][2], id);
  assert.equal(typeof commands[1][2], "string");
  assert.equal(api.payloadMatchesProduct({ list: [{ product_info: { product_id: id } }, { product_id: id }] }), true);
  assert.equal(api.payloadMatchesProduct({ list: [{ sku_id: id }] }), true);
  assert.equal(api.payloadMatchesProduct({ list: [{ product_id: id }, { product_id: "other" }] }), false);
  assert.equal(api.payloadMatchesProduct({ list: [{ review_text: "missing identity" }] }), false);
  assert.throws(() => api.requireProductPayload({ list: [{ product_id: "other" }] }), /已停止/);
  assert.equal(api.payloadMatchesProduct({ list: [] }, { requestBody: JSON.stringify({ product_id: id }) }), true);
  assert.equal(api.payloadMatchesProduct({ list: [] }, { requestBody: JSON.stringify({ product_id: "9" + id }) }), false);
});

test("existing numeric search is adopted and reapplied after each reload, including retry", async () => {
  const { api, chrome, elements } = harness();
  const id = "1731892023085009910";
  let applications = 0;
  let registered = [];
  let commandResult;
  chrome.scripting.getRegisteredContentScripts = (_, cb) => cb(registered);
  chrome.scripting.registerContentScripts = (scripts, cb) => { registered = scripts; cb(); };
  chrome.scripting.executeScript = (options, cb) => {
    if (options.files) return cb([{ result: undefined }]);
    if (options.args && options.args[1] === "inspect") { commandResult = { found: true, value: id, descriptor: { placeholder: "商品 ID" } }; return cb([{ result: { started: true } }]); }
    if (options.args && options.args[1] === "apply") { applications++; assert.equal(options.args[2], id); commandResult = { ready: true, trigger: "search-button" }; return cb([{ result: { started: true } }]); }
    if (options.args && options.args.length === 1) return cb([{ result: { done: true, result: commandResult } }]);
    if (options.func.toString().includes("hooked:")) return cb([{ result: { hooked: true, mainWorld: true } }]);
    if (options.func.toString().includes("pageNumbers")) return cb([{ result: { currentPage: 1, totalPages: 2 } }]);
    return cb([{ result: { requests: [
      { capturedAt: 2, responseJson: { data: { list: [{ product_id: "another product", main_review_id: "wrong" }] } } },
      { capturedAt: 1, responseJson: { data: { list: [{ product_id: id, main_review_id: "correct" }] } } }
    ] } }]);
  };
  chrome.tabs.reload = (tabId, cb) => { chrome.tabs.onUpdated.emit(tabId, { status: "complete" }); cb(); };
  await api.prepareProductFilter();
  assert.equal(elements.get("productSearchId").value, id);
  await api.restoreProductFilter();
  const payload = await api.refreshAndNavigateToPage(1, null, []);
  assert.equal(applications, 2);
  assert.equal(payload.list[0].main_review_id, "correct");
});

test("product search uses native setter, React-compatible events and search button", async () => {
  const id = "1731892023085009910";
  const events = [];
  let clicked = 0;
  class Input {
    constructor() { this._value = ""; this.type = "text"; this.id = "productSearch"; }
    get value() { return this._value; }
    set value(value) { this._value = value; }
    getAttribute(name) { return name === "id" ? this.id : name === "placeholder" ? "搜索商品ID" : ""; }
    getBoundingClientRect() { return { width: 200, height: 30 }; }
    closest() { return wrapper; }
    dispatchEvent(event) { events.push(event.type); }
  }
  const button = { getBoundingClientRect: () => ({ width: 20, height: 20 }), contains: () => false, click: () => { clicked++; } };
  const wrapper = { querySelectorAll: () => [button] };
  const input = new Input();
  const window = { __TK_REVIEW_CAPTURE__: { requests: [{ response: "unfiltered" }] } };
  const context = vm.createContext({ window, document: { querySelectorAll: () => [input] }, HTMLInputElement: Input, Event: class { constructor(type) { this.type = type; } }, setTimeout: fn => setTimeout(fn, 0) });
  vm.runInContext(fs.readFileSync(path.join(base, "tiktok_product_filter.js"), "utf8"), context);
  const result = await window.__TK_REVIEW_PRODUCT_FILTER__("apply", id, { id: "productSearch" });
  assert.equal(input.value, id);
  assert.deepEqual(events, ["input", "change"]);
  assert.equal(clicked, 1);
  assert.equal(result.trigger, "search-button");
  assert.equal(window.__TK_REVIEW_CAPTURE__.requests.length, 0);
});

test("ambiguous product inputs fail; invalid numeric ID never gets submitted", async () => {
  const { api, elements } = harness();
  elements.get("productSearchId").value = "1.731892e18";
  await assert.rejects(api.prepareProductFilter(), /科学计数法/);
  const input = { value: "", type: "text", getBoundingClientRect: () => ({ width: 20, height: 20 }), getAttribute: () => "商品 ID", closest: () => null };
  const window = {};
  const context = vm.createContext({ window, document: { querySelectorAll: () => [input, { ...input }] } });
  vm.runInContext(fs.readFileSync(path.join(base, "tiktok_product_filter.js"), "utf8"), context);
  await assert.rejects(window.__TK_REVIEW_PRODUCT_FILTER__("inspect", "1731892023085009910", null), /多个产品搜索框/);
});


test("API Promise<void> never wins over a later callback carrying results", async () => {
  const { api, chrome } = harness();
  chrome.tabs.query = (_, cb) => { setTimeout(() => cb([{id:42}]), 5); return Promise.resolve(undefined); };
  assert.equal((await api.chromeCall("tabs", "query", {}, 100))[0].id, 42);
});

test("MAIN command mailbox works when injected Promise results are unavailable", async () => {
  const { api, chrome } = harness({ globals: { setTimeout: (fn, ms) => setTimeout(fn, ms === 150 ? 1 : ms) } });
  const page = vm.createContext({ window: { __TK_REVIEW_PRODUCT_FILTER__: async command => {
    await new Promise(resolve=>setTimeout(resolve,2));
    if(command === "fail") throw new Error("search control missing");
    return {found:true,descriptor:{placeholder:"搜索订单 ID、商品名称、ID 或用户名"}};
  } }, setTimeout });
  chrome.scripting.executeScript = (options, cb) => {
    page.args = options.args || [];
    const result = vm.runInContext(`(${options.func.toString()})(...args)`, page);
    if(result && typeof result.then === "function") { result.catch(()=>{}); return cb([{result:undefined}]); }
    cb([{result}]);
  };
  assert.equal((await api.productFilterCommand("inspect", "1731892023085009910")).found,true);
  await assert.rejects(api.productFilterCommand("fail", "1731892023085009910"), /search control missing/);
});

test("page-size fallback requires exact request parameters, never the short last-page row count", () => {
  const { api } = harness();
  assert.equal(api.requestPageSize({url:"https://api.test/review?page_size=50",requestBody:"{}"}),50);
  assert.equal(api.requestPageSize({url:"https://api.test/review",requestBody:JSON.stringify({pagination:{page_size:20}})}),20);
  assert.equal(api.requestPageSize({url:"https://api.test/review?page_size=50",requestBody:JSON.stringify({page_size:20})}),0);
  assert.equal(api.requestPageSize({url:"https://api.test/review",requestBody:JSON.stringify({rows:2})}),0);
});
