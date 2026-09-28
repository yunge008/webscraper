(function() {
  const els = {
    startCapture: document.getElementById("startCapture"),
    readCapture: document.getElementById("readCapture"),
    pageStart: document.getElementById("pageStart"),
    pageEnd: document.getElementById("pageEnd"),
    productSearchId: document.getElementById("productSearchId"),
    refreshStats: document.getElementById("refreshStats"),
    fetchReviews: document.getElementById("fetchReviews"),
    downloadCsv: document.getElementById("downloadCsv"),
    clearData: document.getElementById("clearData"),
    progress: document.getElementById("progress"),
    status: document.getElementById("status"),
    pageStatus: document.getElementById("pageStatus"),
    pageHint: document.getElementById("pageHint"),
    estimatedTotal: document.getElementById("estimatedTotal"),
    detectedTotalPages: document.getElementById("detectedTotalPages"),
    detectedPageSize: document.getElementById("detectedPageSize"),
    rowCount: document.getElementById("rowCount"),
    nextCursor: document.getElementById("nextCursor"),
    previewBody: document.getElementById("previewBody")
  };

  const captureScriptId = "tk-review-capture-hook";
  // TikTok Shop uses different seller domains by region. The path is stable.
  const ratingPageMatches = ["https://*.tiktokshop.com/product/rating*", "https://*.tiktokshopglobalselling.com/product/rating*"];
  const diagnosticEvents = [];
  let probeResults = null;
  let actionBusy = false;
  let lockedTabId = 0;
  let lockedProductId = "";
  let productInputDescriptor = null;
  let filterProbe = null;
  let taskPageCache = null;
  let taskDiagnostic = null;
  let activeTabId = 0;
  let rows = [];
  let previewRows = [];
  let capturedRequest = null;
  let capturedPayload = null;
  let isFetching = false;
  let stopRequested = false;
  let pageInfo = {
    totalPages: 0,
    pageSize: 0,
    estimatedTotal: 0
  };
  const outputColumns = [
    "star_level",
    "review_text",
    "reply_text",
    "reply_count",
    "main_review_id",
    "order_id",
    "product_id",
    "product_name",
    "sku_id",
    "sku_specification",
    "user_name",
    "create_time", "review_image_count", "review_image_urls"
  ];
  const outputColumnLabels = {
    star_level: "星级",
    review_text: "评论内容",
    reply_text: "回复内容",
    reply_count: "回复数",
    main_review_id: "评论 ID",
    order_id: "订单 ID",
    product_id: "商品 ID",
    product_name: "商品名称",
    sku_id: "SKU ID",
    sku_specification: "SKU 规格",
    user_name: "用户名",
    create_time: "评论时间", review_image_count: "评价图数量", review_image_urls: "评价图链接"
  };

  function setStatus(text) {
    els.status.textContent = text;
    const notice = document.getElementById("taskNotice");
    if (notice) { notice.textContent = text; notice.hidden = false; }
    logDiagnostic("status", text);
  }

  function safeUrl(value) {
    try { const url = new URL(value); return url.origin + url.pathname; }
    catch (_) { return "<无URL>"; }
  }

  function logDiagnostic(type, message) {
    const safeMessage = String(message).replace(/https?:\/\/[^\s｜；]+/g, safeUrl);
    diagnosticEvents.push({ time: new Date().toISOString(), type, message: safeMessage });
    if (diagnosticEvents.length > 150) diagnosticEvents.shift();
  }

  // Some Chromium shells implement callbacks but do not return Promises.
  function chromeCall(namespace, method, argument, timeout = 15000) {
    return new Promise((resolve, reject) => {
      let settled = false;
      const timer = setTimeout(() => finish(new Error(`${namespace}.${method} 超时（${timeout / 1000} 秒）`)), timeout);
      function finish(error, value) {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        if (error) reject(error); else resolve(value);
      }
      try {
        const api = chrome[namespace];
        if (!api || typeof api[method] !== "function") throw new Error(`浏览器不支持 ${namespace}.${method}`);
        const promise = api[method](argument, value => {
          const error = chrome.runtime && chrome.runtime.lastError;
          finish(error ? new Error(error.message || String(error)) : null, value);
        });
        if (promise && typeof promise.then === "function") promise.then(value => {
          const expectsValue = (namespace === "tabs" && /^(query|get)$/.test(method)) || (namespace === "scripting" && /^(executeScript|getRegisteredContentScripts)$/.test(method));
          if (value !== undefined || !expectsValue) finish(null, value);
        }, error => finish(error));
      } catch (error) { finish(error); }
    });
  }

  async function executeScript(options) {
    const results = await chromeCall("scripting", "executeScript", options);
    if (!Array.isArray(results) || !results.length) throw new Error("脚本注入未返回结果，请运行诊断探针。");
    for (const result of results) if (result.error) throw new Error(result.error.message || String(result.error));
    return results;
  }

  function errorText(error) {
    if (!error) return "未知错误";
    return error.message || String(error);
  }

  function stageError(stage, error) {
    const wrapped = new Error(`${stage}失败：${errorText(error)}`);
    wrapped.cause = error;
    return wrapped;
  }

  function setProgress(done, max) {
    els.progress.max = Math.max(max || 100, 1);
    els.progress.value = Math.max(done || 0, 0);
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function queryTabs(queryInfo) {
    return chromeCall("tabs", "query", queryInfo).then(tabs => Array.isArray(tabs) ? tabs : []);
  }

  function tabUrl(tab) {
    return (tab && (tab.url || tab.pendingUrl)) || "";
  }

  function describeTabs(tabs) {
    if (!tabs || !tabs.length) return "0 个标签页";
    return tabs.map(tab => `id=${tab.id}, active=${!!tab.active}, url=${safeUrl(tabUrl(tab))}`).join(" | ");
  }

  async function getActiveTab() {
    if (lockedTabId) {
      const tab = await chromeCall("tabs", "get", lockedTabId);
      if (!tab || !isTikTokRatingUrl(tabUrl(tab))) throw new Error("抓取目标已关闭或离开评价页，请停止后重新开始。");
      return tab;
    }
    let currentTabs;
    try {
      currentTabs = await queryTabs({ active: true, currentWindow: true });
    } catch (error) {
      throw stageError("查询当前标签页（chrome.tabs.query callback）", error);
    }
    const activeTab = currentTabs[0] || null;
    if (activeTab && isTikTokRatingUrl(tabUrl(activeTab))) return activeTab;

    let allTabs;
    try {
      allTabs = await queryTabs({ currentWindow: true });
    } catch (error) {
      throw stageError("查询当前窗口标签页", error);
    }
    const ratingTabs = allTabs.filter(tab => isTikTokRatingUrl(tabUrl(tab)));
    if (ratingTabs.length === 1) return ratingTabs[0];
    if (ratingTabs.length > 1) throw new Error("当前窗口有多个评价页，请先切换到要抓取的店铺评价页。");

    const diagnostic = `活动页：${describeTabs(currentTabs)}；当前窗口：${describeTabs(allTabs)}`;
    throw new Error(`未找到 /product/rating 页面。${diagnostic}`);
  }
  function isTikTokRatingUrl(url) {
    try {
      const parsed = new URL(url);
      return parsed.protocol === "https:" && /^seller(?:-[a-z0-9-]+)?\.(?:tiktokshop\.com|tiktokshopglobalselling\.com)$/i.test(parsed.hostname) && /^\/product\/rating\/?$/i.test(parsed.pathname);
    } catch (error) {
      return false;
    }
  }

  async function refreshActiveTabStatus() {
    let tab;
    try {
      tab = await getActiveTab();
    } catch (error) {
      activeTabId = 0;
      els.pageStatus.textContent = `修复诊断版 ${chrome.runtime.getManifest().version}｜标签页识别失败：${errorText(error)}`;
      throw stageError("步骤 1/6 标签页识别", error);
    }
    activeTabId = tab.id || 0;
    if (actionBusy && !lockedTabId) lockedTabId = activeTabId;
    const url = tabUrl(tab);
    if (!activeTabId || !isTikTokRatingUrl(url)) {
      const message = `标签页不符合要求：id=${activeTabId || "无"}, url=${url || "<无URL>"}`;
      els.pageStatus.textContent = `修复诊断版 ${chrome.runtime.getManifest().version}｜${message}`;
      throw new Error(message);
    }
    els.pageStatus.textContent = `修复诊断版 ${chrome.runtime.getManifest().version}｜已锁定标签页 ${activeTabId}：${url}`;
    try { await detectPageInfo(); }
    catch (error) { logDiagnostic("pagination", errorText(error)); }
    return true;
  }

  async function detectPageInfo() {
    if (!activeTabId) return;
    const [result] = await executeScript({
      target: { tabId: activeTabId },
      world: "ISOLATED",
      func: () => {
        const pageNumbers = Array.from(document.querySelectorAll(".core-pagination-item"))
          .map(el => (el.textContent || "").trim())
          .map(text => parseInt(text.replace(/[^\d]/g, ""), 10))
          .filter(number => Number.isFinite(number) && number > 0);
        const totalPages = pageNumbers.length ? Math.max(...pageNumbers) : 0;
        const pageSizeText = Array.from(document.querySelectorAll(".core-select-view-value, [aria-label='Page size'], [class*='select-view-value']"))
          .map(el => (el.textContent || "").trim())
          .find(text => /\d+\s*\/\s*Page/i.test(text)) || "";
        const pageSizeMatch = pageSizeText.match(/(\d+)\s*\/\s*Page/i);
        const pageSize = pageSizeMatch ? parseInt(pageSizeMatch[1], 10) : 0;
        const activePage = document.querySelector(".core-pagination-item-active, .core-pagination-item[aria-current='page']");
        return {
          totalPages,
          pageSize,
          currentPage: activePage ? parseInt(activePage.textContent, 10) || 0 : 0,
          pageSizeText,
          estimatedTotal: totalPages && pageSize ? totalPages * pageSize : 0
        };
      }
    });
    pageInfo = result && result.result ? result.result : pageInfo;
    renderPageInfo();
  }

  function renderPageInfo(totalFromApi) {
    const totalPages = Number(pageInfo.totalPages || 0);
    const pageSize = Number(pageInfo.pageSize || 0);
    const estimated = Number(totalFromApi || pageInfo.estimatedTotal || 0);
    els.detectedTotalPages.textContent = totalPages ? String(totalPages) : "-";
    els.detectedPageSize.textContent = pageSize ? String(pageSize) : "-";
    els.estimatedTotal.textContent = estimated ? String(estimated) : "-";
    els.pageStart.max = totalPages ? String(totalPages) : "";
    els.pageEnd.max = totalPages ? String(totalPages) : "";
    els.pageHint.textContent = totalPages && pageSize
      ? `已识别 ${totalPages} 页，每页 ${pageSize} 条。默认抓取 1-30 页，可按需修改起止页。`
      : "暂未识别分页信息。点击刷新可自动刷新页面并重新读取统计。";
  }

  async function refreshStats() {
    els.refreshStats.disabled = true;
    try {
      setStatus("正在刷新统计数据...");
      if (!(await refreshActiveTabStatus())) return;
      await prepareProductFilter();
      const captured = await readCapture({ silent: true });
      if (captured) {
        setStatus("统计数据已刷新。");
        return;
      }
      setStatus("已读取当前分页信息；尚未捕获评论响应。请点击创建并开始任务，不会刷新页面。");
    } finally {
      if (!isFetching) els.refreshStats.disabled = false;
    }
  }

  async function ensureCaptureScript() {
    setStatus("步骤 2/6：正在检查动态脚本注册 API...");
    if (!chrome.scripting || typeof chrome.scripting.registerContentScripts !== "function") {
      throw new Error("步骤 2/6 失败：当前浏览器不支持 chrome.scripting.registerContentScripts");
    }
    try {
      const scripts = await chromeCall("scripting", "getRegisteredContentScripts", { ids: [captureScriptId] });
      if (scripts && scripts.length) await chromeCall("scripting", "unregisterContentScripts", { ids: [captureScriptId] });
    } catch (error) { throw stageError("步骤 2/6 检查旧监听", error); }
    setStatus("步骤 2/6：正在注册 MAIN world 监听...");
    try {
      await chromeCall("scripting", "registerContentScripts", [{
        id: captureScriptId,
        matches: ratingPageMatches,
        js: ["tiktok_capture_hook.js"],
        runAt: "document_start",
        world: "MAIN",
        persistAcrossSessions: false
      }]);
    } catch (error) {
      throw stageError("步骤 2/6 注册 MAIN world 监听（registerContentScripts）", error);
    }
    try {
      const scripts = await chromeCall("scripting", "getRegisteredContentScripts", { ids: [captureScriptId] });
      if (!scripts || !scripts.length) throw new Error("API 没有报错，但注册后查不到监听脚本");
    } catch (error) {
      throw stageError("步骤 2/6 验证监听注册结果（getRegisteredContentScripts）", error);
    }
  }
  function waitForTabComplete(tabId) {
    let cancel;
    const promise = new Promise((resolve, reject) => {
      let settled = false;
      const timer = setTimeout(() => done(new Error("等待页面加载完成超过 30 秒")), 30000);
      function done(error) {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        chrome.tabs.onUpdated.removeListener(listener);
        chrome.tabs.onRemoved.removeListener(removedListener);
        if (error) reject(error); else resolve();
      }
      function listener(updatedTabId, changeInfo) {
        if (updatedTabId === tabId && changeInfo.status === "complete") done();
      }
      function removedListener(removedTabId) {
        if (removedTabId === tabId) done(new Error("刷新过程中标签页被关闭"));
      }
      chrome.tabs.onUpdated.addListener(listener);
      chrome.tabs.onRemoved.addListener(removedListener);
      cancel = () => done(new Error("页面刷新已取消"));
    });
    promise.cancel = () => { if (cancel) cancel(); };
    return promise;
  }

  async function verifyCaptureHook() {
    let result;
    try {
      [result] = await executeScript({
        target: { tabId: activeTabId },
        world: "MAIN",
        func: () => ({
          hooked: window.__TK_REVIEW_CAPTURE_HOOKED__ === true,
          mainWorld: !(typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.id),
          requestCount: window.__TK_REVIEW_CAPTURE__ && Array.isArray(window.__TK_REVIEW_CAPTURE__.requests)
            ? window.__TK_REVIEW_CAPTURE__.requests.length : 0,
          href: location.href,
          userAgent: navigator.userAgent
        })
      });
    } catch (error) {
      throw stageError("步骤 5/6 MAIN world 健康检查（executeScript）", error);
    }
    const health = result && result.result;
    if (!health || !health.hooked || !health.mainWorld) {
      throw new Error(`步骤 5/6 失败：页面已刷新，但监听 hook 未进入 MAIN world。紫鸟可能未执行动态 MAIN world content script。页面：${health && health.href ? health.href : "未知"}`);
    }
    return health;
  }
  async function startCaptureAndRefresh() {
    const captured = await installCaptureRefreshAndRead();
    if (captured) {
      setStatus(`监听已安装并读取到当前页：${rows.length} 条。`);
    }
  }

  async function getCaptureSnapshot() {
    const [result] = await executeScript({
      target: { tabId: activeTabId },
      world: "MAIN",
      func: () => {
        const capture = window.__TK_REVIEW_CAPTURE__ || { requests: [] };
        return { ...capture, network: (capture.network || []).slice(-10), requests: (capture.requests || []).slice(-5).map(request => ({ ...request, responseText: request.responseJson ? "" : request.responseText })) };
      }
    });
    return result && result.result ? result.result : { requests: [] };
  }

  async function productFilterCommand(command, target = lockedProductId) {
    filterProbe = { ...filterProbe, command, commandTransport: "synchronous-poll", commandCompleted: false };
    const jobId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const [started] = await executeScript({
      target: { tabId: activeTabId }, world: "MAIN", args: [jobId, command, target, productInputDescriptor],
      func: (id, command, target, saved) => {
        if (typeof window.__TK_REVIEW_PRODUCT_FILTER__ !== "function") return { started: false, error: "商品搜索脚本未安装" };
        const job = window.__TK_REVIEW_FILTER_JOB__ = { id, command, done: false, result: null, error: "" };
        // Some Chromium shells serialize Promise objects without awaiting them.
        // Keep the Promise in MAIN and return only synchronous plain objects.
        Promise.resolve().then(() => window.__TK_REVIEW_PRODUCT_FILTER__(command, target, saved))
          .then(result => { job.result = result; job.done = true; }, error => { job.error = error.message || String(error); job.done = true; });
        return { started: true };
      }
    });
    if (!started.result || !started.result.started) throw new Error(started.result && started.result.error || "商品搜索命令未启动，请运行诊断。");
    for (let poll = 0; poll < 80; poll++) {
      if (stopRequested) throw new Error("已停止商品搜索。");
      const [snapshot] = await executeScript({ target: { tabId: activeTabId }, world: "MAIN", args: [jobId], func: id => {
        const job = window.__TK_REVIEW_FILTER_JOB__;
        return job && job.id === id ? { done: job.done, result: job.done ? job.result : null, error: job.error } : { error: "商品搜索状态已失效，页面可能已跳转" };
      } });
      const state = snapshot.result;
      if (!state) throw new Error("商品搜索状态未返回，请运行诊断。");
      if (state.error) throw new Error(state.error);
      if (state.done) {
        if (!state.result) throw new Error("商品搜索执行完成但没有有效结果，请运行诊断。");
        filterProbe = { ...filterProbe, command, commandTransport: "synchronous-poll", commandCompleted: true };
        return state.result;
      }
      await sleep(150);
    }
    throw new Error("商品搜索命令执行超时，已停止；不会刷新页面或改抓全店评论。");
  }

  async function loadProductFilter() {
    await executeScript({ target: { tabId: activeTabId }, world: "MAIN", files: ["tiktok_product_filter.js"] });
  }

  async function prepareProductFilter() {
    const entered = els.productSearchId.value.trim();
    if (entered && !/^\d+$/.test(entered)) throw new Error("商品 / SKU ID 必须是完整数字编号；请勿使用科学计数法。");
    lockedProductId = entered;
    productInputDescriptor = null;
    await loadProductFilter();
    const inspected = await productFilterCommand("inspect", entered);
    if (inspected.found) {
      productInputDescriptor = inspected.descriptor;
      if (!entered && inspected.value) {
        lockedProductId = inspected.value;
        els.productSearchId.value = inspected.value;
      }
    }
    filterProbe = { fixed: !!lockedProductId, inputFound: !!inspected.found, descriptor: inspected.descriptor };
  }

  async function restoreProductFilter() {
    if (!lockedProductId) return;
    setStatus("正在恢复固定产品搜索条件，等待指定产品评论...");
    await loadProductFilter();
    for (let attempt = 0; attempt < 40; attempt++) {
      if (stopRequested) throw new Error("已停止抓取。");
      const applied = await productFilterCommand("apply");
      if (applied.ready) {
        productInputDescriptor = applied.descriptor;
        filterProbe = { fixed: true, inputFound: true, trigger: applied.trigger, descriptor: applied.descriptor };
        logDiagnostic("product-filter", `搜索条件已恢复，触发方式：${applied.trigger}`);
        return;
      }
      await sleep(250);
    }
    throw new Error("刷新后无法找到商品搜索框，已停止以避免抓取全店评论。请运行诊断探针。");
  }

  function payloadMatchesProduct(payload, request) {
    if (!lockedProductId) return true;
    if (payload.list.length) {
      return payload.list.every(item => {
        const row = flattenReview(item);
        return String(row.product_id) === lockedProductId || String(row.sku_id) === lockedProductId;
      });
    }
    const text = `${request && request.url || ""} ${request && request.requestBody || ""}`;
    return new RegExp(`(^|[^0-9])${lockedProductId}([^0-9]|$)`).test(text);
  }

  function requireProductPayload(payload) {
    if (lockedProductId && !payloadMatchesProduct(payload)) throw new Error("返回评论不属于固定产品或缺少产品 ID，已停止以避免混入其他商品。请复制诊断报告。");
    return payload;
  }

  async function readCapture(options = {}) {
    if (!(await refreshActiveTabStatus())) return null;
    const capture = await getCaptureSnapshot();
    const request = chooseReviewRequest(capture.requests || []);
    if (!request) {
      if (!options.silent) {
        setStatus("还没有捕获到评论接口响应。点击“开始抓取评论”会自动安装监听并刷新。");
      }
      return null;
    }
    const payload = findReviewPayload(request.responseJson || parseJson(request.responseText));
    if (!payload) {
      if (!options.silent) setStatus("已捕获响应，但没有解析到评论列表。");
      return null;
    }
    capturedRequest = request;
    capturedPayload = payload;
    rows = payload.list.map(flattenReview);
    previewRows = rows.slice();
    renderPageInfo(payload.total);
    renderPreview();
    els.nextCursor.textContent = payload.nextCursor ? `下一页游标：${payload.nextCursor}` : "";
    setProgress(1, 1);
    setStatus(`已读取当前页数据：${rows.length} 条${payload.total ? `，总数 ${payload.total}` : ""}。`);
    return { request, payload };
  }

  async function installCaptureRefreshAndRead() {
    setStatus("步骤 1/6：正在查找 /product/rating 商品评价页...");
    if (!(await refreshActiveTabStatus())) throw new Error("步骤 1/6 失败：未找到路径为 /product/rating 的商品评价标签页");
    lockedTabId = activeTabId;
    await prepareProductFilter();
    await ensureCaptureScript();
    setStatus(`步骤 3/6：监听注册成功，准备刷新标签页 ${activeTabId}...`);
    const completePromise = waitForTabComplete(activeTabId);
    completePromise.catch(() => {});
    try {
      await chromeCall("tabs", "reload", activeTabId);
    } catch (error) {
      completePromise.cancel();
      throw stageError("步骤 3/6 刷新标签页（chrome.tabs.reload）", error);
    }
    setStatus("步骤 4/6：刷新命令已发送，正在等待页面加载完成...");
    await completePromise;
    setStatus("步骤 5/6：页面加载完成，正在检查 MAIN world 监听...");
    const health = await verifyCaptureHook();
    await restoreProductFilter();
    setStatus(`步骤 6/6：监听正常，已暂存 ${health.requestCount} 个响应，正在等待评论接口...`);
    return await waitForInitialCapture();
  }
  async function waitForInitialCapture() {
    for (let i = 0; i < 40; i++) {
      if (stopRequested) throw new Error("已停止抓取。");
      const captured = await readCapture({ silent: true });
      if (captured) return captured;
      await sleep(500);
    }
    throw new Error(lockedProductId
      ? "步骤 6/6 超时：未收到能确认属于固定产品的评论响应。可能是搜索未生效或响应缺少产品 ID；已阻止抓取全店数据，请复制诊断报告。"
      : "步骤 6/6 超时：监听已进入 MAIN world，但 20 秒内没有捕获到评论接口响应。可能是接口字段变化，或紫鸟限制了 fetch/XHR hook。");
  }

  function parseJson(text) {
    try {
      return JSON.parse(text);
    } catch (error) {
      return null;
    }
  }

  function chooseReviewRequest(requests) {
    const candidates = requests
      .map(request => ({ request, payload: findReviewPayload(request.responseJson || parseJson(request.responseText)) }))
      .filter(item => item.payload && (!item.request.status || (item.request.status >= 200 && item.request.status < 300)) && (item.payload.list.length || /review|rating/i.test(item.request.url || "")) && payloadMatchesProduct(item.payload, item.request));
    if (!candidates.length) return null;
    candidates.sort((a, b) => {
      return Number(b.request.sequence || 0) - Number(a.request.sequence || 0) || Number(b.request.capturedAt || 0) - Number(a.request.capturedAt || 0);
    });
    return candidates[0].request;
  }

  function findReviewPayload(root) {
    const seen = new Set();
    const queue = [root];
    while (queue.length) {
      const value = queue.shift();
      if (!value) continue;
      if (typeof value === "string") {
        const parsed = parseJson(value);
        if (parsed) queue.push(parsed);
        continue;
      }
      if (typeof value !== "object") continue;
      if (seen.has(value)) continue;
      seen.add(value);

      const data = value.data && typeof value.data === "object" ? value.data : value;
      const listKey = ["list", "reviews", "review_list", "reviewList"].find(key => Array.isArray(data[key]) && data[key].some(looksLikeReview));
      const explicitTotal = data.total ?? data.total_count ?? value.total;
      const emptyKey = ["list", "reviews", "review_list", "reviewList"].find(key => Array.isArray(data[key]) && data[key].length === 0 && explicitTotal !== null && explicitTotal !== undefined && String(explicitTotal).trim() !== "" && Number(explicitTotal) === 0);
      if (listKey || emptyKey) {
        return {
          list: data[listKey || emptyKey],
          total: Number(data.total ?? data.total_count ?? value.total ?? 0),
          nextCursor: data.next_cursor || data.nextCursor || data.cursor || value.next_cursor || ""
        };
      }

      if (Array.isArray(value)) {
        queue.push(...value);
      } else {
        for (const key of Object.keys(value)) queue.push(value[key]);
      }
    }
    return null;
  }

  function looksLikeReview(item) {
    return !!item && typeof item === "object" && (
      item.star_level !== undefined ||
      item.review_text !== undefined ||
      item.main_review_id !== undefined
      || item.starLevel !== undefined || item.reviewText !== undefined || item.mainReviewId !== undefined
      || (item.rating !== undefined && (item.review_id !== undefined || item.reviewId !== undefined || item.content !== undefined))
    );
  }

  function pick(item, keys) {
    for (const key of keys) {
      if (item && item[key] !== undefined && item[key] !== null) return item[key];
    }
    return "";
  }

  function flattenReview(item) {
    const info = item && (item.product_info || item.productInfo);
    const productInfo = info && typeof info === "object" ? info : {};
    const media = window.TKReviewTasks ? window.TKReviewTasks.extractImages(item) : { images: [] };
    return {
      star_level: pick(item, ["star_level", "starLevel", "rating"]),
      review_text: pick(item, ["review_text", "reviewText", "content"]),
      reply_text: pick(item, ["reply_text", "replyText"]),
      reply_count: pick(item, ["reply_count", "replyCount"]),
      main_review_id: pick(item, ["main_review_id", "mainReviewId", "review_id", "reviewId"]),
      order_id: pick(item, ["order_id", "orderId"]),
      product_id: pick(productInfo, ["product_id", "productId"]) || pick(item, ["product_id", "productId"]),
      product_name: pick(productInfo, ["product_name", "productName"]) || pick(item, ["product_name", "productName"]),
      sku_id: pick(productInfo, ["sku_id", "skuId"]) || pick(item, ["sku_id", "skuId"]),
      sku_specification: pick(productInfo, ["sku_specification", "skuSpecification"]) || pick(item, ["sku_specification", "skuSpecification"]),
      user_name: pick(item, ["user_name", "userName", "buyer_name", "buyerName", "display_name"]),
      create_time: formatReviewTime(pick(item, ["create_time", "createTime", "ctime", "review_time"])),
      review_image_count: media.images.length, review_image_urls: media.images.map(image => image.url).join("\n"), review_images: media.images
    };
  }

  function formatReviewTime(value) {
    if (value === undefined || value === null || value === "") return "";
    const text = String(value).trim();
    if (!/^\d+$/.test(text)) return text;
    const number = Number(text);
    if (!Number.isFinite(number) || number <= 0) return text;
    const ms = number > 100000000000 ? number : number * 1000;
    const date = new Date(ms);
    if (Number.isNaN(date.getTime())) return text;
    const pad = part => String(part).padStart(2, "0");
    return [
      date.getFullYear(),
      pad(date.getMonth() + 1),
      pad(date.getDate())
    ].join("-") + " " + [
      pad(date.getHours()),
      pad(date.getMinutes()),
      pad(date.getSeconds())
    ].join(":");
  }

  function parseOptionalPositiveInteger(input) {
    const text = (input.value || "").trim();
    if (!text) return 0;
    const value = parseInt(text, 10);
    return Number.isFinite(value) && value > 0 ? value : 0;
  }

  function getPagePlan() {
    const maxPages = Number(pageInfo.totalPages || 0);
    const rawStart = parseOptionalPositiveInteger(els.pageStart);
    const rawEnd = parseOptionalPositiveInteger(els.pageEnd);
    let startPage = rawStart || 1;
    let endPage = rawEnd || startPage;

    if (maxPages) {
      startPage = Math.min(startPage, maxPages);
      endPage = Math.min(endPage, maxPages);
    }

    if (endPage < startPage) {
      throw new Error("终止页不能小于起始页。");
    }

    const pageCount = endPage - startPage + 1;
    return { startPage, endPage, pageCount };
  }

  async function fetchPages() {
    clearData();
    const current = await installCaptureRefreshAndRead();
    if (!current) return;
    if (!current.payload.list.length) { setStatus("当前筛选条件下没有评论。"); return; }
    if (pageInfo.currentPage > 1) throw new Error(`刷新后页面仍在第 ${pageInfo.currentPage} 页，请手动切到第 1 页后重新开始，避免页码错位。`);
    const plan = getPagePlan();
    const { startPage, endPage, pageCount } = plan;

    rows = [];
    previewRows = [];
    let cursor = current.payload.nextCursor || "";
    // savedCursors[i] = cursor that leads to page i+2, used for replay-based retry
    const savedCursors = [];
    savedCursors[0] = cursor;
    let activePayload = current.payload;
    if (startPage > 1) {
      setStatus(`正在跳转到起始页 ${startPage}...`);
      activePayload = await refreshAndNavigateToPage(startPage, current.request, savedCursors);
      if (!activePayload || !activePayload.list.length) {
        setStatus(`未能获取起始页 ${startPage} 的数据。`);
        return;
      }
      cursor = activePayload.nextCursor || "";
      savedCursors[startPage - 1] = cursor;
    }

    requireProductPayload(activePayload);
    rows = activePayload.list.map(flattenReview);
    previewRows = rows.slice();
    setProgress(1, pageCount);
    renderPreview();
    let lastSignature = getPayloadSignature(activePayload);
    const seenSignatures = new Set([lastSignature]);
    let completedPages = 1;

    for (let page = startPage + 1; page <= endPage; page++) {
      if (stopRequested) { setStatus(`已停止。共抓取 ${rows.length} 条，${completedPages} 页。`); break; }
      const progressPage = page - startPage + 1;
      setStatus(`正在抓取第 ${page} 页（${progressPage} / ${pageCount}）...`);
      let payload = await clickNextAndWaitForPayload(lastSignature);
      if (payload && seenSignatures.has(getPayloadSignature(payload))) payload = null;
      if (stopRequested) { setStatus(`已停止。共抓取 ${rows.length} 条，${completedPages} 页。`); break; }

      // Fallback 1: direct API replay using cursor
      if ((!payload || !payload.list.length) && cursor) {
        try {
          const json = await replayRequest(current.request, cursor);
          payload = findReviewPayload(json);
        } catch (e) { logDiagnostic("replay-error", errorText(e)); }
      }

      // Fallback 2: refresh + navigate back to this page
      if (stopRequested) { setStatus(`已停止。共抓取 ${rows.length} 条，${completedPages} 页。`); break; }
      if (!payload || !payload.list.length || seenSignatures.has(getPayloadSignature(payload))) {
        setStatus(`第 ${page} 页数据为空，刷新后重新导航到该页...`);
        payload = await refreshAndNavigateToPage(page, current.request, savedCursors);
      }

      if (!payload || !payload.list.length || seenSignatures.has(getPayloadSignature(payload))) {
        setStatus(`已停止在第 ${page - 1} 页：重试后仍无数据。`);
        break;
      }
      requireProductPayload(payload);
      lastSignature = getPayloadSignature(payload);
      seenSignatures.add(lastSignature);
      rows.push(...payload.list.map(flattenReview));
      cursor = payload.nextCursor || "";
      savedCursors[page - 1] = cursor;
      els.nextCursor.textContent = cursor ? `下一页游标：${cursor}` : "";
      completedPages = progressPage;
      setProgress(progressPage, pageCount);
      updateResultMeta();
      setStatus(`正在抓取第 ${page} 页（${progressPage} / ${pageCount}），已抓取 ${rows.length} 条...`);

      if (stopRequested) {
        setStatus(`已停止。共抓取 ${rows.length} 条，${completedPages} 页。`);
        break;
      }
    }

    if (!stopRequested && completedPages >= pageCount) {
      setStatus(`完成。已抓取 ${rows.length} 条，页码 ${startPage}-${endPage}，共 ${completedPages} 页。`);
    }
  }

  // When a page returns empty, try strategies in order:
  // 1. Direct API replay with saved cursor (instant)
  // 2. Refresh + jump via pagination "..." buttons (fast, one API call)
  // 3. Refresh + click Next one at a time (slow fallback)
  async function refreshAndNavigateToPage(targetPage, originalRequest, savedCursors) {
    // Strategy 1: replay the API call directly using the saved cursor
    const prevCursor = savedCursors[targetPage - 2];
    if (prevCursor && originalRequest) {
      try {
        setStatus(`第 ${targetPage} 页重试：直接请求接口...`);
        const json = await replayRequest(originalRequest, prevCursor);
        const payload = findReviewPayload(json);
        if (payload && payload.list.length) return payload;
      } catch (e) { logDiagnostic("replay-error", errorText(e)); }
    }

    // Strategy 2 & 3: refresh and navigate
    setStatus(`第 ${targetPage} 页重试：刷新页面...`);
    if (!(await refreshActiveTabStatus())) return null;
    await ensureCaptureScript();
    const completePromise = waitForTabComplete(activeTabId);
    completePromise.catch(() => {});
    try { await chromeCall("tabs", "reload", activeTabId); }
    catch (error) { completePromise.cancel(); throw error; }
    await completePromise;
    await verifyCaptureHook();
    await restoreProductFilter();
    await detectPageInfo();
    if (!lockedProductId && pageInfo.currentPage > 1) {
      logDiagnostic("pagination-error", `刷新后仍在第 ${pageInfo.currentPage} 页，停止以避免错页。`);
      return null;
    }

    // Wait for page 1 data
    let p1Payload = null;
    for (let i = 0; i < 40; i++) {
      if (stopRequested) return null;
      const snapshot = await getCaptureSnapshot();
      const req = chooseReviewRequest(snapshot.requests || []);
      if (req) {
        const pl = findReviewPayload(req.responseJson || parseJson(req.responseText));
        if (pl && pl.list.length) { p1Payload = pl; break; }
      }
      await sleep(500);
    }
    if (!p1Payload) return null;
    await detectPageInfo();
    if (pageInfo.currentPage > 1) throw new Error("恢复产品筛选后未回到第 1 页，已停止以避免错页。");
    if (targetPage === 1) return p1Payload;

    // Strategy 2: use "..." jump buttons to reach target page quickly.
    // Clicking "..." just shifts the visible page window (no API call).
    // Only clicking the actual page number triggers an API call.
    setStatus(`第 ${targetPage} 页重试：通过分页按钮快速跳转...`);
    const beforeJump = Date.now();
    const jumped = await jumpToPageViaUI(targetPage);
    if (jumped) {
      for (let i = 0; i < 30; i++) {
        if (stopRequested) return null;
        await sleep(500);
        const payloads = await getCapturedPayloadsAfter(beforeJump);
        if (payloads.length) return payloads[payloads.length - 1];
      }
      // The UI may already be on targetPage. Do not advance from an unknown page.
      logDiagnostic("pagination-error", "页码跳转后未捕获响应，停止导航以避免错页。");
      return null;
    }

    // Strategy 3: click Next one at a time (reliable but slow)
    setStatus(`第 ${targetPage} 页重试：逐页前进（第 2 → ${targetPage} 页）...`);
    let lastSig = getPayloadSignature(p1Payload);
    let payload = null;
    for (let p = 2; p <= targetPage; p++) {
      setStatus(`重试导航：第 ${p} / ${targetPage} 页...`);
      payload = await clickNextAndWaitForPayload(lastSig);
      if (!payload) return null;
      lastSig = getPayloadSignature(payload);
    }
    return payload;
  }

  // Click the "..." ellipsis buttons repeatedly to shift the visible page window,
  // then click the target page number. No API calls until the final click.
  async function jumpToPageViaUI(targetPage) {
    for (let attempt = 0; attempt < Math.min(2500, Math.ceil(targetPage / 4) + 50); attempt++) {
      if (stopRequested) return false;
      const [result] = await executeScript({
        target: { tabId: activeTabId },
        world: "MAIN",
        args: [targetPage],
        func: (targetPage) => {
          window.__TK_REVIEW_EXPECT_PAGE__ = null;
          const jumper = document.querySelector(".core-pagination-jumper input, .core-pagination-simple input, input[aria-label='Go to page']");
          if (jumper && jumper.getBoundingClientRect().width > 0) {
            window.__TK_REVIEW_EXPECT_PAGE__ = { page: targetPage };
            Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(jumper, String(targetPage));
            jumper.dispatchEvent(new Event("input", { bubbles: true }));
            jumper.dispatchEvent(new Event("change", { bubbles: true }));
            jumper.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", code: "Enter", keyCode: 13, which: 13, bubbles: true }));
            return "clicked";
          }
          const items = Array.from(document.querySelectorAll(".core-pagination-item"));

          // If target page number is visible, click it
          const targetEl = items.find(el => {
            const n = parseInt((el.textContent || "").trim(), 10);
            const rect = el.getBoundingClientRect();
            return n === targetPage && rect.width > 0;
          });
          if (targetEl) {
            window.__TK_REVIEW_EXPECT_PAGE__ = { page: targetPage };
            targetEl.click();
            return "clicked";
          }

          // Determine direction
          const nums = items
            .map(el => parseInt((el.textContent || "").trim(), 10))
            .filter(n => Number.isFinite(n) && n > 0);
          if (!nums.length) return "no-items";

          const current = document.querySelector(".core-pagination-item-active, [aria-current='page']");
          const currentPage = current ? parseInt(current.textContent, 10) : nums[Math.floor(nums.length / 2)];

          if (targetPage > currentPage) {
            // Find the forward "..." jump button
            const jumpNext =
              document.querySelector(".core-pagination-item-jump-next") ||
              items.find(el => /jump.?next/i.test(String(el.className || "")));
            if (jumpNext) {
              jumpNext.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
              jumpNext.click();
              return "jump-next";
            }
            return "no-jump-next";
          }

          if (targetPage < currentPage) {
            const jumpPrev =
              document.querySelector(".core-pagination-item-jump-prev") ||
              items.find(el => /jump.?prev/i.test(String(el.className || "")));
            if (jumpPrev) {
              jumpPrev.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
              jumpPrev.click();
              return "jump-prev";
            }
            return "no-jump-prev";
          }

          return "unknown";
        }
      });

      const action = result && result.result;
      if (action === "clicked") return true;
      if (!action || action === "no-items" || action === "no-jump-next" || action === "no-jump-prev") return false;
      // "jump-next" / "jump-prev" just re-renders the DOM — no API call, so minimal delay
      await sleep(150);
    }
    return false;
  }

  function getPayloadSignature(payload) {
    if (!payload || !payload.list || !payload.list.length) return "";
    const first = flattenReview(payload.list[0]);
    const last = flattenReview(payload.list[payload.list.length - 1]);
    return [
      payload.nextCursor || "",
      first.main_review_id || "",
      last.main_review_id || "",
      payload.list.length
    ].join("|");
  }

  async function clickNextAndWaitForPayload(lastSignature) {
    const beforeTime = Date.now();
    const clicked = await clickNextPage();
    if (!clicked) return null;

    for (let i = 0; i < 30; i++) {
      if (stopRequested) return null;
      await sleep(500);
      const payloads = await getCapturedPayloadsAfter(beforeTime);
      for (let index = payloads.length - 1; index >= 0; index--) {
        const payload = payloads[index];
        const signature = getPayloadSignature(payload);
        if (signature && signature !== lastSignature) {
          return payload;
        }
      }
    }
    return null;
  }

  // Only transfer and parse requests captured after a given timestamp.
  // Avoids re-serializing all historical requests (~20+ by page 20) on every poll tick.
  async function getCapturedPayloadsAfter(afterTime) {
    const [result] = await executeScript({
      target: { tabId: activeTabId },
      world: "MAIN",
      args: [afterTime],
      func: (afterTime) => {
        const cap = window.__TK_REVIEW_CAPTURE__ || { requests: [] };
        return (cap.requests || []).filter(r => r.capturedAt > afterTime);
      }
    });
    const newRequests = result && result.result ? result.result : [];
    return newRequests
      .filter(r => !r.status || (r.status >= 200 && r.status < 300))
      .map(r => ({ request: r, payload: findReviewPayload(r.responseJson || parseJson(r.responseText)) }))
      .filter(item => item.payload && payloadMatchesProduct(item.payload, item.request))
      .map(item => item.payload)
      .filter(payload => payload && payload.list && payload.list.length);
  }

  async function getCapturedPayloads() {
    const [result] = await executeScript({
      target: { tabId: activeTabId },
      world: "MAIN",
      func: () => window.__TK_REVIEW_CAPTURE__ || { requests: [] }
    });
    const capture = result && result.result ? result.result : { requests: [] };
    return (capture.requests || [])
      .map(request => findReviewPayload(request.responseJson || parseJson(request.responseText)))
      .filter(payload => payload && payload.list && payload.list.length);
  }

  async function clickNextPage() {
    const [result] = await executeScript({
      target: { tabId: activeTabId },
      world: "MAIN",
      func: () => {
        const candidates = Array.from(document.querySelectorAll(".core-pagination-item-next, li[aria-label='Next'], [aria-label='Next']"));
        const next = candidates.find(el => {
          const className = el.className ? String(el.className) : "";
          const rect = el.getBoundingClientRect();
          const visible = rect.width > 0 && rect.height > 0;
          return visible && !/disabled/i.test(className) && el.getAttribute("aria-disabled") !== "true";
        });
        if (!next) return false;
        const active = document.querySelector(".core-pagination-item-active, [aria-current='page']");
        window.__TK_REVIEW_EXPECT_PAGE__ = { page: active ? (parseInt(active.textContent, 10) || 0) + 1 : 0 };
        next.scrollIntoView({ block: "center", inline: "center" });
        next.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true, view: window }));
        next.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, cancelable: true, view: window }));
        next.click();
        return true;
      }
    });
    return !!(result && result.result);
  }

  async function replayRequest(request, cursor) {
    const [result] = await executeScript({
      target: { tabId: activeTabId },
      world: "MAIN",
      args: [request, cursor],
      func: async (request, cursor) => {
        function replaceCursorInUrl(rawUrl) {
          const url = new URL(rawUrl, location.href);
          const keys = ["cursor", "next_cursor", "page_token", "offset"];
          let changed = false;
          for (const key of keys) {
            if (url.searchParams.has(key)) {
              url.searchParams.set(key, cursor);
              changed = true;
            }
          }
          // Preserve signed URLs; do not invent pagination parameters.
          return url.toString();
        }

        function replaceCursorInObject(value) {
          if (!value || typeof value !== "object") return value;
          if (Array.isArray(value)) {
            for (const item of value) replaceCursorInObject(item);
            return value;
          }
          for (const key of Object.keys(value)) {
            if (/^(cursor|next_cursor|page_token|offset)$/i.test(key)) {
              value[key] = cursor;
            } else if (typeof value[key] === "string") {
              value[key] = replaceCursorInString(value[key]);
            } else {
              replaceCursorInObject(value[key]);
            }
          }
          return value;
        }

        function replaceCursorInString(text) {
          try {
            const parsed = JSON.parse(text);
            return JSON.stringify(replaceCursorInObject(parsed));
          } catch (error) {}
          if (/[?&](cursor|next_cursor|page_token|offset)=/i.test(text)) {
            return text.replace(/([?&](?:cursor|next_cursor|page_token|offset)=)[^&]*/ig, `$1${encodeURIComponent(cursor)}`);
          }
          return text;
        }

        let body = request.requestBody || undefined;
        if (body) body = replaceCursorInString(body);
        const response = await fetch(replaceCursorInUrl(request.url), {
          method: request.method || "GET",
          credentials: "include",
          headers: request.requestHeaders || {},
          body: /^(GET|HEAD)$/i.test(request.method || "GET") ? undefined : body
        });
        const text = await response.text();
        if (!response.ok) throw new Error(`翻页接口 HTTP ${response.status}`);
        return JSON.parse(text);
      }
    });
    if (!result) throw new Error("未获得翻页请求结果。");
    if (result.error) throw new Error(result.error.message || String(result.error));
    return result.result;
  }

  function renderPreview() {
    els.previewBody.textContent = "";
    for (const row of previewRows.slice(0, 100)) {
      const tr = document.createElement("tr");
      for (const key of outputColumns) {
        const td = document.createElement("td");
        td.textContent = row[key] === undefined || row[key] === null ? "" : String(row[key]);
        td.title = td.textContent;
        tr.appendChild(td);
      }
      els.previewBody.appendChild(tr);
    }
    updateResultMeta();
  }

  function updateResultMeta() {
    els.rowCount.textContent = `${rows.length} 条`;
    els.downloadCsv.disabled = rows.length === 0;
  }

  function htmlEscape(value) {
    const text = value === undefined || value === null ? "" : String(value);
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function downloadExcel() {
    const header = outputColumns
      .map(column => `<th>${htmlEscape(outputColumnLabels[column] || column)}</th>`)
      .join("");
    const body = rows
      .map(row => `<tr>${outputColumns.map(column => `<td>${htmlEscape(row[column])}</td>`).join("")}</tr>`)
      .join("");
    const workbook = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
table { border-collapse: collapse; }
th, td { border: 1px solid #d9d9d9; padding: 4px 6px; mso-number-format:"\\@"; }
th { background: #e9fbfd; }
</style>
</head>
<body>
<table>
<thead><tr>${header}</tr></thead>
<tbody>${body}</tbody>
</table>
</body>
</html>`;
    const blob = new Blob([`\uFEFF${workbook}`], { type: "application/vnd.ms-excel;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tk-shop-reviews-${new Date().toISOString().slice(0, 10)}.xls`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function setFetching(active) {
    isFetching = active;
    stopRequested = false;
    els.clearData.textContent = active ? "停止" : "清空";
    els.clearData.disabled = false;
    els.fetchReviews.disabled = active;
    els.startCapture.disabled = active;
    els.readCapture.disabled = active;
    els.refreshStats.disabled = active;
    els.pageStart.disabled = active;
    els.pageEnd.disabled = active;
    els.productSearchId.disabled = active;
  }

  function clearData() {
    rows = [];
    previewRows = [];
    capturedRequest = null;
    capturedPayload = null;
    els.nextCursor.textContent = "";
    setProgress(0, 100);
    renderPreview();
    setStatus("已清空。");
  }

  async function run(action, asFetch) {
    if (actionBusy) return;
    actionBusy = true;
    if (window.dispatchEvent) window.dispatchEvent(new Event("tk-review-busy"));
    if (asFetch) setFetching(true);
    else for (const el of [els.startCapture, els.readCapture, els.refreshStats, els.fetchReviews, els.clearData]) el.disabled = true;
    els.productSearchId.disabled = true;
    try {
      await action();
    } catch (error) {
      const message = errorText(error);
      setStatus(`错误：${message}`);
      console.error("[TK评论抓取]", error);
    } finally {
      if (asFetch) setFetching(false);
      else for (const el of [els.startCapture, els.readCapture, els.refreshStats, els.fetchReviews, els.clearData]) el.disabled = false;
      lockedTabId = 0;
      lockedProductId = "";
      els.productSearchId.disabled = false;
      actionBusy = false;
      if (window.dispatchEvent) window.dispatchEvent(new Event("tk-review-busy"));
    }
  }

  function responseShape(value, depth = 0) {
    if (depth > 6) return "…";
    if (Array.isArray(value)) return { length: value.length, item: responseShape(value[0], depth + 1) };
    if (!value || typeof value !== "object") return typeof value;
    return Object.fromEntries(Object.keys(value).slice(0, 35).map(key => [key, responseShape(value[key], depth + 1)]));
  }

  function diagnosticReport() {
    const report = {
      generatedAt: new Date().toISOString(), version: chrome.runtime.getManifest().version,
      userAgent: navigator.userAgent, status: els.status.textContent.replace(/https?:\/\/[^\s｜；]+/g, safeUrl),
      activeTabId, busy: actionBusy, pageInfo, rows: rows.length, productFilter: filterProbe,
      task: taskDiagnostic,
      probe: probeResults, events: diagnosticEvents.slice()
    };
    // Also sanitize browser-provided errors, which may contain a full page URL.
    return JSON.parse(JSON.stringify(report, (_, value) => typeof value === "string" ? value.replace(/https?:\/\/[^\s｜；]+/g, safeUrl) : value));
  }

  async function runProbes() {
    if (actionBusy) throw new Error("抓取正在运行，请停止后运行探针。");
    actionBusy = true;
    probeResults = { api: {}, checks: [] };
    try {
      for (const [namespace, methods] of Object.entries({ tabs: ["query", "get", "reload"], scripting: ["executeScript", "registerContentScripts", "getRegisteredContentScripts"] })) {
        for (const method of methods) probeResults.api[`${namespace}.${method}`] = typeof (chrome[namespace] || {})[method] === "function";
      }
      const tabs = await queryTabs({ currentWindow: true });
      probeResults.tabs = tabs.map(tab => ({ id: tab.id, active: !!tab.active, url: safeUrl(tabUrl(tab)), ratingPage: isTikTokRatingUrl(tabUrl(tab)) }));
      const tab = await getActiveTab();
      activeTabId = tab.id;
      for (const world of ["ISOLATED", "MAIN"]) {
        try {
          const [fileResult] = await executeScript({ target: { tabId: tab.id }, world, files: ["tiktok_probe.js"] });
          probeResults.checks.push({ world, method: "files", result: fileResult.result });
        } catch (error) { probeResults.checks.push({ world, method: "files", error: errorText(error) }); }
        try {
          const [funcResult] = await executeScript({ target: { tabId: tab.id }, world, func: () => ({ readyState: document.readyState, isolated: !!(typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.id) }) });
          probeResults.checks.push({ world, method: "func", result: funcResult.result });
        } catch (error) { probeResults.checks.push({ world, method: "func", error: errorText(error) }); }
        try {
          const [promiseResult] = await executeScript({ target: { tabId: tab.id }, world, func: () => Promise.resolve({ promiseAwaited: true }) });
          probeResults.checks.push({ world, method: "func-promise", result: { promiseAwaited: !!(promiseResult.result && promiseResult.result.promiseAwaited) } });
        } catch (error) { probeResults.checks.push({ world, method: "func-promise", error: errorText(error) }); }
      }
      try {
        const snapshot = await getCaptureSnapshot();
        probeResults.capture = {
          installedAt: snapshot.installedAt, network: snapshot.network || [],
          requests: (snapshot.requests || []).map(request => ({
            url: safeUrl(request.url), method: request.method, status: request.status,
            capturedAt: request.capturedAt, headerNames: Object.keys(request.requestHeaders || {}),
            navigationPage: request.navigationPage, sequence: request.sequence,
            parsedReviews: (findReviewPayload(request.responseJson) || { list: [] }).list.length,
            shape: responseShape(request.responseJson)
          }))
        };
      } catch (error) { probeResults.captureError = errorText(error); }
      try { probeResults.registeredScripts = await chromeCall("scripting", "getRegisteredContentScripts", { ids: [captureScriptId] }); }
      catch (error) { probeResults.registrationError = errorText(error); }
      logDiagnostic("probe", "探针完成；files / func / world 的结果已记录。");
      return diagnosticReport();
    } catch (error) {
      logDiagnostic("probe-error", errorText(error));
      throw error;
    } finally { actionBusy = false; lockedTabId = 0; }
  }

  async function taskPageState() {
    const [injection] = await executeScript({ target: { tabId: activeTabId }, world: "ISOLATED", func: () => {
      const active = document.querySelector(".core-pagination-item-active, .core-pagination-item[aria-current='page']");
      const texts = Array.from(document.querySelectorAll(".core-select-view-value, [class*='select-view-value'], [aria-label='Page size']")).map(el => (el.textContent || "").trim());
      const sizeText = texts.find(text => /\d+\s*(?:\/\s*(?:page|页)|条\s*\/\s*页|条\s*每页)/i.test(text)) || "";
      const match = sizeText.match(/\d+/);
      const domFilters = Array.from(document.querySelectorAll("input, select, .core-select-view-value, .core-radio-checked, .core-checkbox-checked, [role='radio'][aria-checked='true']"))
        .filter(el => { const rect = el.getBoundingClientRect(); return rect.width > 0 && rect.height > 0 && !el.closest("[class*='pagination'], [class*='input-search'], [class*='search-input'], [role='search']") && !/hidden|password/.test(el.type || ""); })
        .filter(el => !texts.includes((el.textContent || "").trim()) || !/\d+\s*(?:\/\s*(?:page|页)|条\s*\/\s*页|条\s*每页)/i.test((el.textContent || "").trim()))
        .filter(el => (el.tagName !== "INPUT" || (el.value && !/^\d{12,}$/.test(el.value) && (!/checkbox|radio/.test(el.type) || el.checked))))
        .map(el => ({ name: el.name || el.getAttribute("aria-label") || el.getAttribute("placeholder") || "", value: el.value || (el.textContent || "").trim() }));
      const searchFilters = Array.from(document.querySelectorAll("input"))
        .filter(el => { const rect = el.getBoundingClientRect(); return rect.width > 0 && rect.height > 0 && !el.closest("[class*='pagination']") && !/hidden|password|checkbox|radio/.test(el.type || ""); })
        .map(el => ({ name: el.id || el.name || el.getAttribute("placeholder") || "", value: el.value }));
      return { href: location.href, page: active ? parseInt(active.textContent, 10) || 0 : 0, pageSize: match ? Number(match[0]) : 0, domFilters, searchFilters };
    } });
    return injection.result;
  }

  function taskSignature(payload) { return JSON.stringify(payload.list.map(item => String(flattenReview(item).main_review_id))); }
  function taskRows(payload, path) {
    const stats = { paths: new Set(), unknown: new Set() };
    const result = payload.list.map(item => {
      const row = flattenReview(item);
      if (typeof row.product_id === "number" && !Number.isSafeInteger(row.product_id)) throw window.TKReviewTasks.controlError("接口商品 ID 为不精确数字，无法保证导出编号准确；请运行诊断。");
      const media = window.TKReviewTasks.extractImages(item, path);
      media.paths.forEach(key => stats.paths.add(key)); media.unknown.forEach(key => stats.unknown.add(key));
      return { ...row, review_images: media.images, review_image_count: media.images.length, review_image_urls: media.images.map(image => image.url).join("\n") };
    });
    return { rows: result, mediaStats: { paths: [...stats.paths], unknown: [...stats.unknown] } };
  }

  async function taskData(request, payload, imagePath = "") {
    if (payload.list.length) requireProductPayload(payload);
    const state = await taskPageState();
    const context = window.TKReviewTasks.requestContext(request, state.href);
    context.domFilters = state.domFilters;
    if (window.TKReviewTaskMode === "current") context.searchFilters = state.searchFilters;
    const requestSize = requestPageSize(request, state.href);
    if (state.pageSize && requestSize && state.pageSize !== requestSize) throw window.TKReviewTasks.controlError("页面与接口每页条数不一致，已暂停；请运行诊断。");
    const pageSize = state.pageSize || requestSize;
    return { ...taskRows(payload, imagePath), request, payload, context, page: state.page || (payload.total === 0 ? 1 : 0), pageSize, signature: taskSignature(payload), total: payload.total };
  }

  function requestPageSize(request, href = "https://request.invalid") {
    const values = [];
    function visit(value, depth = 0) {
      if (!value || typeof value !== "object" || depth > 5) return;
      for (const [key, item] of Object.entries(value)) {
        if (/^(pagesize|perpage|limit)$/i.test(key.replace(/[_-]/g, ""))) {
          const size = Number(item); if (Number.isSafeInteger(size) && size > 0 && size <= 500) values.push(size);
        } else if (item && typeof item === "object") visit(item, depth + 1);
        else if (typeof item === "string" && /^[\[{]/.test(item.trim())) { try { visit(JSON.parse(item), depth + 1); } catch (_) {} }
      }
    }
    try { visit(Object.fromEntries(new URL(request.url, href).searchParams)); } catch (_) {}
    try { visit(JSON.parse(request.requestBody || "null")); } catch (_) { visit(Object.fromEntries(new URLSearchParams(request.requestBody || ""))); }
    return new Set(values).size === 1 ? values[0] : 0;
  }

  async function prepareLiveTask(task, mode = "current", productId = "") {
    window.TKReviewTaskMode = mode;
    stopRequested = false;
    if (!(await refreshActiveTabStatus())) throw new Error("请打开商品评价页面。");
    lockedTabId = activeTabId;
    lockedProductId = mode === "current" ? "" : productId;
    if (lockedProductId && !/^\d+$/.test(lockedProductId)) throw new Error("商品 ID 必须为完整数字编号。");
    window.TKReviewTaskImagePath = task ? task.config.imagePath || "" : window.TKReviewTaskImagePath || "";
    const before = await taskPageState();
    if (task && (!window.TKReviewTasks.sameContext(before.domFilters, task.context.domFilters) || (mode === "current" && !window.TKReviewTasks.sameContext(before.searchFilters, task.context.searchFilters)))) {
      throw window.TKReviewTasks.controlError("当前筛选条件与保存的任务不一致，请恢复原日期、评分和搜索条件后继续。");
    }
    if (taskPageCache && task && window.TKReviewTasks.sameContext(taskPageCache.context, task.context) && before.page === taskPageCache.page) {
      taskPageCache = { ...taskPageCache, ...taskRows(taskPageCache.payload, window.TKReviewTaskImagePath) }; return taskPageCache;
    }
    // Attach to the loaded document. Reloading would discard the seller's filters.
    await ensureCaptureScript();
    await executeScript({ target: { tabId: activeTabId }, world: "MAIN", files: ["tiktok_capture_hook.js"] });
    await verifyCaptureHook();
    await loadProductFilter();
    productInputDescriptor = null;
    setStatus("正在识别当前页面的商品搜索框，不刷新页面…");
    const inspected = await productFilterCommand("inspect", lockedProductId);
    filterProbe = { ...filterProbe, fixed: !!lockedProductId, mode, inputFound: !!inspected.found, descriptor: inspected.descriptor };
    if (!inspected.found) throw new Error("未找到唯一商品查询入口；请运行诊断，任务未改变筛选条件。");
    productInputDescriptor = inspected.descriptor;
    const started = Date.now();
    const [baseline] = await executeScript({ target: { tabId: activeTabId }, world: "MAIN", func: () => {
      window.__TK_REVIEW_CAPTURE__.requests = []; window.__TK_REVIEW_EXPECT_PAGE__ = { page: 1 };
      return { sequence: window.__TK_REVIEW_CAPTURE__.sequence || 0 };
    } });
    const baselineSequence = baseline.result && baseline.result.sequence || 0;
    setStatus(mode === "current" ? "正在提交原有筛选查询，保留当前搜索值和日期范围…" : "正在搜索指定商品并校验评论归属…");
    const applied = await productFilterCommand(mode === "current" ? "submit-current" : "apply", lockedProductId);
    if (!applied.ready) throw new Error("无法重新提交当前商品查询。");
    setStatus("查询已提交，等待可确认的评论接口响应…");
    for (let poll = 0; poll < 40; poll++) {
      if (stopRequested) throw window.TKReviewTasks.controlError("已暂停任务。");
      const state = await taskPageState();
      if (!window.TKReviewTasks.sameContext(before.domFilters, state.domFilters) || (mode === "current" && !window.TKReviewTasks.sameContext(before.searchFilters, state.searchFilters))) throw window.TKReviewTasks.controlError("提交查询后筛选条件发生变化，已暂停，请恢复原条件。");
      const snapshot = await getCaptureSnapshot();
      const fault = (snapshot.network || []).find(item => item.at >= started && /review|rating/i.test(item.url) && [401, 403, 429].includes(item.status));
      if (fault) throw window.TKReviewTasks.controlError(`评论接口 HTTP ${fault.status}；请处理登录、权限或限流后继续。`);
      const fresh = (snapshot.requests || []).filter(item => item.capturedAt >= started && item.sequence > baselineSequence && item.navigationPage === 1);
      const request = chooseReviewRequest(fresh);
      if (!request && lockedProductId && fresh.some(item => item.status >= 200 && item.status < 300 && (findReviewPayload(item.responseJson) || { list: [] }).list.length)) {
        throw window.TKReviewTasks.controlError("商品搜索未生效：返回评论不属于指定 ID，已停止；不会改抓全店评论。请运行诊断。");
      }
      if (request) {
        const data = await taskData(request, findReviewPayload(request.responseJson || parseJson(request.responseText)), window.TKReviewTaskImagePath);
        if (data.page !== 1) throw window.TKReviewTasks.controlError("无法确认查询返回第 1 页。");
        if (!data.pageSize) throw window.TKReviewTasks.controlError("无法识别当前每页条数，请运行诊断；任务不会自动更改每页条数。");
        if (!data.rows.length && data.total !== 0) throw new Error("空列表没有明确总数 0，不能确认商品无评论。");
        pageInfo.pageSize = data.pageSize;
        if (Number.isSafeInteger(data.total) && data.total >= 0) {
          pageInfo.totalPages = Math.ceil(data.total / data.pageSize);
          pageInfo.estimatedTotal = data.total;
        }
        renderPageInfo(data.total);
        els.estimatedTotal.textContent = String(data.total);
        taskPageCache = data; return data;
      }
      await sleep(500);
    }
    throw new Error("重新提交查询后没有捕获到可确认的评论响应，请运行诊断。");
  }

  async function prepareTask(task) {
    const mode = task ? task.config.mode || "fixed" : "fixed";
    let productId = task ? task.config.productId || "" : els.productSearchId.value.trim();
    if (mode === "fixed" && !productId) {
      await refreshActiveTabStatus(); await prepareProductFilter(); productId = lockedProductId;
    }
    if (mode !== "current" && !productId) throw window.TKReviewTasks.controlError("请填写固定商品 / SKU ID，或选择当前页面筛选结果。");
    return prepareLiveTask(task, mode, productId);
  }

  async function taskReadPage(page, options = {}) {
    if (stopRequested) throw window.TKReviewTasks.controlError("已暂停任务。");
    let current = await taskPageState();
    const live = ["fixed", "current", "list"].includes(window.TKReviewTaskMode);
    if (live && taskPageCache && (!window.TKReviewTasks.sameContext(current.domFilters, taskPageCache.context.domFilters) || (window.TKReviewTaskMode === "current" && !window.TKReviewTasks.sameContext(current.searchFilters, taskPageCache.context.searchFilters)))) throw window.TKReviewTasks.controlError("采集中筛选条件发生变化，已暂停。");
    if (page === 1 && current.page === 1 && taskPageCache) return taskPageCache;
    let beforeTime = Date.now();
    if (options.retry && !live) {
      await refreshAndNavigateToPage(page, taskPageCache.request, []);
      current = await taskPageState();
    } else {
      await executeScript({ target: { tabId: activeTabId }, world: "MAIN", func: () => { if (window.__TK_REVIEW_CAPTURE__) window.__TK_REVIEW_CAPTURE__.requests = []; } });
      // Re-enter the requested page without reloading or clearing any filters.
      if (current.page === page) {
        const neighbor = page > 1 ? page - 1 : page + 1;
        if (!await jumpToPageViaUI(neighbor)) throw new Error("无法重新进入断点页，请手动切到相邻页后继续。");
        current = await taskPageState();
      }
      const moved = current.page === page - 1 ? await clickNextPage() : await jumpToPageViaUI(page);
      if (!moved) throw new Error(`无法导航到第 ${page} 页。`);
    }
    for (let poll = 0; poll < 40; poll++) {
      if (stopRequested) throw window.TKReviewTasks.controlError("已暂停任务。");
      const snapshot = await getCaptureSnapshot();
      const error = (snapshot.network || []).find(item => item.at >= beforeTime && /review|rating/i.test(item.url) && [401, 403, 429].includes(item.status));
      if (error) throw window.TKReviewTasks.controlError(`评论接口 HTTP ${error.status}；请处理登录、权限或限流后继续。`);
      const request = chooseReviewRequest((snapshot.requests || []).filter(item => item.capturedAt >= beforeTime && item.navigationPage === page));
      if (request) {
        const payload = findReviewPayload(request.responseJson || parseJson(request.responseText));
        const data = await taskData(request, payload, window.TKReviewTaskImagePath || "");
        if (data.page === page && data.rows.length && (!options.previous || data.signature !== options.previous.signature)) { taskPageCache = data; return data; }
      }
      await sleep(500);
    }
    throw new Error(`第 ${page} 页未获得可确认的评论响应；没有推进保存进度。`);
  }

  window.TKReviewTaskBridge = {
    isBusy: () => actionBusy,
    run: action => { if (actionBusy) throw new Error("评论面板正在执行其他操作，请稍后重试。"); return run(action, true); }, prepare: prepareTask, prepareLive: prepareLiveTask, read: taskReadPage,
    pause: () => { stopRequested = true; }, status: setStatus,
    settings: () => ({ productId: lockedProductId || els.productSearchId.value.trim(), startPage: parseOptionalPositiveInteger(els.pageStart) || 1, endPage: parseOptionalPositiveInteger(els.pageEnd) || 30 }),
    applySettings: task => { els.productSearchId.value = task.config.productId; els.pageStart.value = task.config.startPage; els.pageEnd.value = task.config.endPage; window.TKReviewTaskImagePath = task.config.imagePath || ""; taskPageCache = null; },
    show: (task, records) => {
      taskDiagnostic = { status: task.status, lastPage: task.lastPage, uniqueCount: task.uniqueCount, imageCount: task.imageCount, scan: task.scan, lastError: task.lastError, mediaStats: task.mediaStats };
      rows = records.map(record => record.row); previewRows = rows.slice(0, 100); renderPreview();
      els.rowCount.textContent = `${task.uniqueCount} 条已保存，${task.imageCount} 张评价图（仅预览前 100 条）`;
      els.downloadCsv.disabled = true;
      setProgress(Math.max(0, task.lastPage - task.config.startPage + 1), task.config.endPage - task.config.startPage + 1);
    },
    reset: () => {
      taskPageCache = null; taskDiagnostic = null; rows = []; previewRows = []; renderPreview();
      els.rowCount.textContent = "待采集；已保存任务数据仍保留";
    }
  };
  window.addEventListener("pagehide", () => { stopRequested = true; });
  window.TKReviewDiagnosticsAPI = { report: diagnosticReport, probe: runProbes, clear: () => { diagnosticEvents.length = 0; probeResults = null; } };
  window.addEventListener("error", event => logDiagnostic("uncaught-error", event.message));
  window.addEventListener("unhandledrejection", event => logDiagnostic("unhandled-rejection", errorText(event.reason)));

  els.startCapture.addEventListener("click", () => run(async () => {
    await refreshActiveTabStatus(); await ensureCaptureScript();
    await executeScript({ target: { tabId: activeTabId }, world: "MAIN", files: ["tiktok_capture_hook.js"] });
    await verifyCaptureHook(); setStatus("监听已安装到当前页面；请创建任务开始采集，不会刷新页面。");
  }));
  els.readCapture.addEventListener("click", () => run(async () => {
    await refreshActiveTabStatus();
    await prepareProductFilter();
    await readCapture();
  }));
  els.refreshStats.addEventListener("click", () => run(refreshStats));
  els.fetchReviews.addEventListener("click", () => {
    if (window.TKReviewTaskUI) window.TKReviewTaskUI.create();
    else setStatus("任务面板尚未初始化，请重新打开侧栏并检查诊断。");
  });
  els.downloadCsv.addEventListener("click", () => {
    if (window.TKReviewTaskUI) window.TKReviewTaskUI.exportXlsx();
  });
  els.clearData.addEventListener("click", () => {
    if (isFetching) {
      if (window.TKReviewTaskUI && window.TKReviewTaskUI.collectionRunner && window.TKReviewTaskUI.collectionRunner.active) window.TKReviewTaskUI.collectionRunner.pause();
      else if (window.TKReviewTaskUI && window.TKReviewTaskUI.runner.active) window.TKReviewTaskUI.runner.pause();
      stopRequested = true;
      els.clearData.disabled = true;
      setStatus("正在停止，等待当前页完成...");
    } else {
      clearData();
    }
  });

  run(refreshActiveTabStatus);
})();
