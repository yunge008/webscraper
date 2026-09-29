// TK 评论抓取：侧栏控制器（仅面向 Chrome）。
// 采集方式：
//   1. 页面监听（tiktok_capture_hook.js，MAIN world）记录评论接口的请求与响应；
//   2. 接口直连：以捕获的请求为模板，只改页码 / 每页条数 / 商品 ID，通过页面自身的 XHR/fetch 重放；
//   3. 页面点击：接口直连不可用时，在页面上搜索商品、点击下一页并读取捕获的响应（旧版可用的方式）。
// 全程不刷新页面，因此页面上的日期等筛选条件保持不变。
(function() {
  "use strict";
  const C = window.TKCore;
  const store = new window.TKStore();
  const $ = id => document.getElementById(id);
  const els = {};
  for (const id of ["version", "pageStatus", "errorBanner", "idsBox", "productIds", "idFile", "idCount", "startPage", "endPage", "pageSize", "batchSize", "delayMs", "driver", "reloadEachBatch", "createTask", "pauseTask", "resumeTask", "statTotal", "statRows", "statImages", "statDriver", "progress", "status", "taskSelect", "taskInfo", "exportXlsx", "downloadImages", "deleteTask", "rowCount", "previewHead", "previewBody"]) els[id] = $(id);
  const VERSION = chrome.runtime.getManifest().version;
  const FORM_KEY = "tkReviewForm";
  const PREVIEW_COLUMNS = C.OUTPUT_COLUMNS.filter(([key]) => key !== "review_image_urls");

  const events = [];
  let busy = false;          // 有任务在运行或正在执行一个操作
  let pauseRequested = false;
  let running = null;        // 正在运行的任务
  let selectedId = "";
  let tabId = 0;
  let preview = [];
  const sentReplays = new Set();

  // ---------------- 日志 / 状态 ----------------
  function sanitize(text) { return String(text == null ? "" : text).replace(/(https?:\/\/[^\s?#"']+)[^\s"']*/g, "$1"); }
  function logEvent(level, message, extra) {
    events.push({ time: new Date().toISOString(), level, message: sanitize(message), ...(extra ? { extra: sanitize(extra) } : {}) });
    while (events.length > 300) events.shift();
  }
  function setStatus(text) { els.status.textContent = text; logEvent("info", text); }
  function showError(error) {
    const message = error && error.message ? error.message : String(error);
    els.errorBanner.textContent = `错误：${message}\n（可在“诊断”页复制完整报告）`;
    els.errorBanner.hidden = false;
    els.status.textContent = `错误：${message}`;
    logEvent("error", message, error && error.stack);
    console.error("[TK评论抓取]", error);
  }
  function clearError() { els.errorBanner.hidden = true; els.errorBanner.textContent = ""; }
  function kindError(kind, message) { const e = new Error(message); e.kind = kind; return e; }
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  async function pausableSleep(ms) {
    const end = Date.now() + ms;
    while (Date.now() < end) { if (pauseRequested) return; await sleep(Math.min(200, end - Date.now())); }
  }
  function withTimeout(promise, ms, label) {
    let timer;
    return Promise.race([promise, new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(`${label}超时（${Math.round(ms / 1000)} 秒）`)), ms); })]).finally(() => clearTimeout(timer));
  }

  // ---------------- 标签页与页面脚本 ----------------
  function isRatingUrl(url) {
    try {
      const u = new URL(url);
      return u.protocol === "https:" && /(^|\.)(tiktokshop|tiktokshopglobalselling|tiktokglobalshop)\.com$/i.test(u.hostname) && /\/product\/(rating|review)/i.test(u.pathname);
    } catch (_) { return false; }
  }
  async function findRatingTab() {
    const [active] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (active && isRatingUrl(active.url || "")) return active;
    const inWindow = (await chrome.tabs.query({ currentWindow: true })).filter(t => isRatingUrl(t.url || ""));
    if (inWindow.length === 1) return inWindow[0];
    if (inWindow.length > 1) {
      const sorted = inWindow.sort((a, b) => (b.lastAccessed || 0) - (a.lastAccessed || 0));
      return sorted[0];
    }
    const all = (await chrome.tabs.query({})).filter(t => isRatingUrl(t.url || "")).sort((a, b) => (b.lastAccessed || 0) - (a.lastAccessed || 0));
    if (all.length) return all[0];
    throw kindError("fatal", "未找到 TikTok Shop 商品评价页（/product/rating）。请先在当前窗口打开并切换到评价页。");
  }
  async function useTab(lock) {
    if (lock && tabId) {
      let tab;
      try { tab = await chrome.tabs.get(tabId); } catch (_) { throw kindError("fatal", "评价页标签已关闭，任务已暂停。"); }
      if (!isRatingUrl(tab.url || "")) throw kindError("fatal", "评价页已跳转到其他页面，任务已暂停。");
      return tab;
    }
    const tab = await findRatingTab();
    tabId = tab.id;
    els.pageStatus.textContent = `评价页：标签 ${tab.id} · ${sanitize(tab.url)}`;
    return tab;
  }
  async function exec(func, args = [], world = "MAIN", timeout = 20000) {
    const results = await withTimeout(chrome.scripting.executeScript({ target: { tabId }, world, func, args }), timeout, "页面脚本执行");
    const first = results && results[0];
    if (!first) throw new Error("页面脚本没有返回结果（页面可能正在加载）");
    return first.result;
  }
  async function hook(name, ...args) {
    const result = await exec((name, args) => {
      if (!window.__TKR__ || typeof window.__TKR__[name] !== "function") return { __missing: true };
      return window.__TKR__[name](...args);
    }, [name, args], "MAIN", name === "replay" ? 60000 : 20000);
    if (result && result.__missing) throw kindError("fatal", "页面监听未安装。");
    return result;
  }
  async function ensureHook() {
    const ok = await exec(() => !!(window.__TKR__ && window.__TKR__.version >= 3));
    if (!ok) {
      await withTimeout(chrome.scripting.executeScript({ target: { tabId }, world: "MAIN", files: ["tiktok_capture_hook.js"] }), 20000, "注入页面监听");
      logEvent("info", "页面监听为补注入（页面在扩展加载前打开）。");
    }
    return hook("status");
  }

  // ---------------- 捕获记录 ----------------
  function replayKey(url, body) { return `${url}\n${body || ""}`; }
  function parseRecord(record) {
    const json = C.parseJson(record.responseText);
    return { json, payload: json ? C.findReviewPayload(json) : null };
  }
  function templateOf(record) {
    return { transport: record.transport, method: record.method, url: record.url, headers: record.headers || {}, body: record.body, activePage: record.activePage || 0 };
  }
  // 等待 afterSeq 之后出现满足条件的评论响应
  async function waitForRecord(afterSeq, accept, timeout = 20000) {
    const end = Date.now() + timeout;
    let lastReason = "";
    while (Date.now() < end) {
      if (pauseRequested) throw kindError("paused", "已暂停");
      const records = (await hook("recordsAfter", afterSeq, false)) || [];
      for (let i = records.length - 1; i >= 0; i--) {
        const record = records[i];
        if (sentReplays.has(replayKey(record.url, record.body))) continue;
        if (record.status === 401 || record.status === 403) throw kindError("fatal", `评论接口返回 HTTP ${record.status}，请确认店铺登录状态。`);
        if (record.status && (record.status < 200 || record.status >= 300)) { lastReason = `HTTP ${record.status}`; continue; }
        const { payload } = parseRecord(record);
        if (!payload) { lastReason = "响应中没有评论列表"; continue; }
        const verdict = accept(record, payload);
        if (verdict === true) return { record, payload };
        if (typeof verdict === "string") lastReason = verdict;
      }
      await sleep(400);
    }
    return { timeout: true, reason: lastReason };
  }

  // ---------------- 学习到的商品参数路径 ----------------
  function endpointOf(url) { try { return new URL(url).pathname; } catch (_) { return ""; } }
  async function learnedProductPath(template) {
    const key = `tkProductPath:${endpointOf(template.url)}`;
    const saved = (await chrome.storage.local.get(key))[key];
    return saved && C.hasPath(template, saved) ? saved : null;
  }
  async function saveProductPath(template, path) {
    await chrome.storage.local.set({ [`tkProductPath:${endpointOf(template.url)}`]: path });
  }
  function chooseProductPath(record, id) {
    const paths = C.findValuePaths(record, id);
    if (!paths.length) return null;
    paths.sort((a, b) => Number(/product|item|sku|search|keyword|query/i.test(b.key)) - Number(/product|item|sku|search|keyword|query/i.test(a.key)));
    return paths[0].path;
  }

  // ---------------- 接口直连 ----------------
  function setupTemplate(task, template) {
    task.template = template;
    const analysis = C.analyzeTemplate(template, { activePage: template.activePage });
    task.pagination = analysis.pagination;
    const cursorLeaf = task.pagination.cursorPath ? analysis.leaves.find(l => C.pathKey(l.path) === C.pathKey(task.pagination.cursorPath)) : null;
    const pageLeaf = task.pagination.pagePath ? analysis.leaves.find(l => C.pathKey(l.path) === C.pathKey(task.pagination.pagePath)) : null;
    const templateIsFirst = pageLeaf ? Number(String(pageLeaf.value).replace(/\D/g, "")) === task.pagination.pageBase : (template.activePage || 1) <= 1;
    const cursorValue = cursorLeaf ? String(cursorLeaf.value).replace(/^__TKBIG__/, "") : "";
    task.firstCursor = templateIsFirst ? cursorValue : (/^\d+$/.test(cursorValue) ? "0" : "");
    task.sizeUsed = task.pagination.sizePath ? (task.config.pageSize || task.pagination.pageSize) : 0;
    task.timeRange = C.findTimeRange(template);
  }
  async function apiFetchPage(task, item, page, extra = {}) {
    const spec = C.buildRequest(task.template, task.pagination, {
      page, pageSize: task.pagination.sizePath ? (item.sizeOverride || task.sizeUsed) : 0,
      cursor: task.pagination.cursorPath ? (page === 1 ? task.firstCursor : item.cursor || "") : undefined,
      productId: item.targetId, productPath: item.targetId ? task.productPath : null, stripSign: !!task.stripSign,
      timeRange: extra.timeRange
    });
    sentReplays.add(replayKey(spec.url, spec.body));
    if (sentReplays.size > 500) sentReplays.delete(sentReplays.values().next().value);
    const res = task.replayWorld === "MAIN" ? await hook("replay", spec) : await exec(isolatedReplay, [spec], "ISOLATED", 60000);
    if (!res || !res.status) throw kindError("retry", `接口请求失败：${res && res.error || "无响应"}`);
    if (res.status === 401 || res.status === 403) throw kindError("fatal", `评论接口 HTTP ${res.status}：登录失效或无权限，请在页面重新登录后点“继续”。`);
    if (res.status === 429) throw kindError("ratelimit", "评论接口限流（HTTP 429）");
    if (res.status >= 400) throw kindError("retry", `评论接口 HTTP ${res.status}`);
    const json = C.parseJson(res.text);
    if (!json) throw kindError("api", "接口返回的不是 JSON（可能需要页面签名）");
    const err = C.apiError(json);
    if (err) throw kindError(/login|登录|auth|permission|权限/i.test(err) ? "fatal" : "api", err);
    const payload = C.findReviewPayload(json);
    if (!payload) throw kindError("api", "接口响应中没有评论列表");
    return payload;
  }
  // 在内容脚本（ISOLATED world）中直接请求：同源、带登录 Cookie，但不经过页面自身的 JS，
  // 不会让页面的监控 SDK 累积几千个请求的数据。
  function isolatedReplay(spec) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), spec.timeout || 30000);
    const init = { method: spec.method, headers: spec.headers || {}, credentials: "include", signal: controller.signal };
    if (spec.body != null && !/^(GET|HEAD)$/.test(spec.method)) init.body = spec.body;
    return fetch(spec.url, init).then(r => r.text().then(text => ({ status: r.status, text })))
      .catch(error => ({ status: 0, text: "", error: String(error && error.message || error) }))
      .finally(() => clearTimeout(timer));
  }
  async function reloadTab(reason) {
    setStatus(`${reason}：正在刷新评价页释放内存…`);
    await chrome.tabs.reload(tabId);
    const end = Date.now() + 60000;
    await sleep(1000);
    while (Date.now() < end) {
      let tab;
      try { tab = await chrome.tabs.get(tabId); } catch (_) { throw kindError("fatal", "评价页标签已关闭，任务已暂停。"); }
      if (tab.status === "complete") break;
      await sleep(500);
    }
    await pausableSleep(3000);
    await ensureHook();
    if (running) running.pageReloaded = true;
    logEvent("info", `已刷新评价页（${reason}）。`);
  }
  async function withRetry(fn) {
    let lastError;
    for (let attempt = 0; attempt < 4; attempt++) {
      if (pauseRequested) throw kindError("paused", "已暂停");
      try { return await fn(); }
      catch (error) {
        lastError = error;
        if (error.kind === "ratelimit") { setStatus(`接口限流，等待 30 秒后重试（${attempt + 1}/3）…`); await pausableSleep(30000); continue; }
        if (error.kind !== "retry" || attempt === 3) throw error;
        setStatus(`${error.message}，${2 * (attempt + 1)} 秒后重试（${attempt + 1}/3）…`);
        await pausableSleep(2000 * (attempt + 1));
      }
    }
    if (lastError && lastError.kind === "ratelimit") throw kindError("fatal", "评论接口持续限流，任务已暂停。请稍等几分钟后点“继续”，或调大“页间隔”。");
    throw lastError;
  }

  // ---------------- 页面点击 ----------------
  async function uiSearch(targetId) {
    const before = (await hook("status")).seq;
    const result = await hook("submitSearch", targetId ? String(targetId) : null);
    if (!result || !result.ok) throw kindError(targetId ? "item" : "fatal", result && result.error || "无法在页面上提交搜索");
    if (targetId && !result.valueKept) throw kindError("item", "页面搜索框没有保留输入的 ID。");
    let mismatch = "";
    const found = await waitForRecord(before, (record, payload) => {
      const rows = payload.list.map(C.flattenReview);
      if (!targetId) return true;
      if (!rows.length) return payload.total === 0 ? true : "空列表但没有明确总数 0";
      if (rows.every(row => C.rowMatchesProduct(row, targetId))) return true;
      mismatch = "返回的评论不属于该 ID";
      return mismatch;
    }, 20000);
    if (found.timeout) {
      if (targetId) throw kindError("item", mismatch ? `页面搜索 ${targetId} 未生效：${mismatch}。已跳过，未采集全店评论。` : `搜索 ${targetId} 后没有捕获到评论接口响应（${found.reason || "超时"}）。`);
      return null;
    }
    return found;
  }
  async function uiWaitAfter(before, prevSig, label) {
    const found = await waitForRecord(before, (record, payload) => {
      const sig = C.payloadSignature(payload.list.map(C.flattenReview));
      return sig !== prevSig || !payload.list.length ? true : "与上一页相同";
    }, 25000);
    if (found.timeout) throw kindError("retry", `${label}后没有捕获到新的评论响应（${found.reason || "超时"}）`);
    return found;
  }
  // 定位到当前商品/筛选的第 1 页，返回第 1 页响应
  async function uiFirstPage(task, item) {
    if (item.targetId) {
      const found = await uiSearch(item.targetId);
      if (task.config.driver !== "ui") {
        const path = chooseProductPath(found.record, item.targetId);
        if (path) {
          setupTemplate(task, templateOf(found.record));
          task.productPath = path;
          await saveProductPath(task.template, path);
          logEvent("info", `已从页面搜索学习商品参数：${path.join(".")}`);
        } else logEvent("warn", "搜索请求中没有找到商品 ID 参数，后续使用页面点击翻页。");
      }
      return found;
    }
    const info = await hook("paginationInfo");
    if (info.activePage && info.activePage !== 1) {
      const before = (await hook("status")).seq;
      const r = await hook("clickPage", 1);
      if (!r.ok) throw kindError("fatal", r.error);
      return uiWaitAfter(before, "\u0000", "跳转第 1 页");
    }
    const found = await uiSearch(null).catch(error => { if (error.kind === "paused") throw error; logEvent("warn", `重新提交查询失败：${error.message}`); return null; });
    if (found) return found;
    const latest = await hook("latest", false);
    if (latest) { const { payload } = parseRecord(latest); if (payload) return { record: latest, payload }; }
    throw kindError("fatal", "无法获取第 1 页数据：请在页面上点一次“查询”或翻一页后重试。");
  }
  async function uiReadPage(task, item, page, prevSig, ctx) {
    if (!ctx.positioned) {
      const first = await uiFirstPage(task, item);
      ctx.positioned = true;
      ctx.uiPage = 1;
      if (page === 1) return first.payload;
      prevSig = C.payloadSignature(first.payload.list.map(C.flattenReview));
      setStatus(`页面点击：跳转到第 ${page} 页…`);
      let lastPayload = first.payload;
      for (let step = 0; step < 3000; step++) {
        if (pauseRequested) throw kindError("paused", "已暂停");
        const info = await hook("paginationInfo");
        if (info.activePage === page) { ctx.uiPage = page; return lastPayload; }
        const before = (await hook("status")).seq;
        const jump = await hook("clickPage", page);
        if (!jump.ok) break;
        const found = await uiWaitAfter(before, C.payloadSignature(lastPayload.list.map(C.flattenReview)), `跳转第 ${page} 页`);
        lastPayload = found.payload;
        const now = await hook("paginationInfo");
        if (!jump.partial && (!now.activePage || now.activePage === page)) { ctx.uiPage = page; return found.payload; }
        if (step % 5 === 0) setStatus(`页面点击：正在跳转到第 ${page} 页（当前第 ${now.activePage} 页）…`);
      }
      // 逐页点击到目标页（不保存中间页）
      let payload = first.payload;
      for (let p = (await hook("paginationInfo")).activePage || 1; p < page; p++) {
        if (pauseRequested) throw kindError("paused", "已暂停");
        const b = (await hook("status")).seq;
        const next = await hook("clickNext");
        if (!next.ok) return { list: [], total: payload.total, nextCursor: "", hasMore: false };
        payload = (await uiWaitAfter(b, C.payloadSignature(payload.list.map(C.flattenReview)), `翻到第 ${p + 1} 页`)).payload;
      }
      ctx.uiPage = page;
      return payload;
    }
    const before = (await hook("status")).seq;
    const next = await hook("clickNext");
    if (!next.ok) return { list: [], total: null, nextCursor: "", hasMore: false, end: true };
    const found = await uiWaitAfter(before, prevSig, `点击下一页（第 ${page} 页）`);
    ctx.uiPage = page;
    return found.payload;
  }

  // ---------------- 任务执行 ----------------
  function decideDriver(task, item) {
    if (task.config.driver === "ui") return "ui";
    const ready = task.template && task.pagination && task.pagination.kind && (!item.targetId || task.productPath);
    if (!ready) {
      if (task.config.driver === "api" && task.template && !task.pagination.kind) throw kindError("fatal", "接口请求中没有识别到分页参数，无法使用“仅接口直连”，请改为“自动”。");
      return "ui";
    }
    return "api";
  }
  function summarize(task) {
    const rows = task.rowCount || 0;
    const images = task.imageCount || 0;
    els.statRows.textContent = String(rows);
    els.statImages.textContent = String(images);
    els.statDriver.textContent = task.driverUsed === "api" ? "接口直连" : task.driverUsed === "ui" ? "页面点击" : "-";
    const item = task.items[Math.min(task.index || 0, task.items.length - 1)];
    els.statTotal.textContent = item && item.total != null ? String(item.total) : "-";
    const doneItems = task.items.filter(i => i.status === "done" || i.status === "empty").length;
    if (item && item.segments && task.items.length === 1) {
      els.progress.max = Math.max(1, item.total || 1); els.progress.value = Math.min(task.rowCount || 0, item.total || 0);
    } else if (task.items.length > 1) {
      els.progress.max = task.items.length; els.progress.value = doneItems;
    } else if (item) {
      const totalPages = task.config.endPage ? Math.min(task.config.endPage, item.totalPages || task.config.endPage) : item.totalPages;
      els.progress.max = Math.max(1, (totalPages || item.nextPage) - task.config.startPage + 1);
      els.progress.value = Math.max(0, item.nextPage - task.config.startPage);
    }
  }
  function pushPreview(records) {
    preview.push(...records);
    if (preview.length > 50) preview = preview.slice(-50);
    renderPreview();
  }

  async function runItem(task, item, itemIndex) {
    const ctx = { positioned: false, apiOk: 0, apiFailed: false, variant: 0, reloaded: false };
    const sizeOf = () => item.sizeOverride || task.sizeUsed;
    let mode = decideDriver(task, item);
    if (mode === "api" && item.segments) return runSegmented(task, item, itemIndex, ctx);
    let prevSig = item.lastSig || "";
    let pagesThisRun = 0;
    item.status = "running";
    const label = item.targetId ? `商品 ${item.targetId}` : "当前筛选";
    while (true) {
      if (pauseRequested) throw kindError("paused", "已暂停");
      const page = item.nextPage;
      if (task.config.endPage && page > task.config.endPage) break;
      if (page > 20000) break;
      task.driverUsed = mode;
      setStatus(`${label}：正在采集第 ${page} 页${item.totalPages ? ` / ${item.totalPages}` : ""}（${mode === "api" ? "接口直连" : "页面点击"}）…`);
      let payload;
      if (mode === "api") {
        try {
          // 纯光标翻页且从中间开始时，先顺序走到目标页（不保存）
          if (task.pagination.kind === "cursor" && !task.pagination.pagePath && page > 1 && !item.cursor) {
            for (let p = 1; p < page; p++) item.cursor = (await withRetry(() => apiFetchPage(task, item, p))).nextCursor;
          }
          payload = await withRetry(async () => {
            const p = await apiFetchPage(task, item, page);
            // TikTok 接口中途的页可能不足一页（隐藏/删除的评论仍计入总数），这是正常的；
            // 只有“空页”且总数显示后面还有很多页时才视为异常重试。
            const size = sizeOf() || item.firstPageSize || 0;
            const expected = p.total && size ? Math.ceil(p.total / size) : 0;
            if (!p.list.length && expected && page < expected) {
              const error = kindError("retry", `第 ${page} 页返回空列表，但接口总数显示还有约 ${expected - page + 1} 页`);
              error.emptyPayload = p;
              throw error;
            }
            return p;
          });
          const rows = payload.list.map(C.flattenReview);
          if (item.targetId && rows.some(row => !C.rowMatchesProduct(row, item.targetId))) throw kindError("api", "接口返回了其他商品的评论（商品参数未生效）");
          // TikTok 接口按页码最多只能翻到第 1 万条：超过后按时间分段采集
          const winSize = sizeOf() || item.maxRows || rows.length || 50;
          if (payload.total > WINDOW_LIMIT && task.timeRange) { item.total = payload.total; return runSegmented(task, item, itemIndex, ctx); }
          if (payload.total > WINDOW_LIMIT && ((page - 1) * winSize >= WINDOW_LIMIT || (rows.length && C.payloadSignature(rows) === prevSig && page * winSize > WINDOW_LIMIT - 3 * winSize))) {
            throw kindError("fatal", WINDOW_HELP(page - 1));
          }
          if (rows.length && C.payloadSignature(rows) === prevSig) throw kindError("api", "接口翻页参数未生效（与上一页相同）");
          if (!rows.length && page === 1 && payload.total !== 0 && payload.total !== null) throw kindError("api", "接口第 1 页为空但总数不为 0");
          if (ctx.apiOk === 0) rememberReplayMode(task);
          ctx.apiOk++; ctx.reloaded = false;
        } catch (error) {
          if (error.kind === "fatal" || error.kind === "paused") throw error;
          // 已经跑通过的任务中途出错：刷新评价页后重试一次；仍失败则暂停（可“继续”），不改用逐页点击
          if (ctx.apiOk > 0) {
            if (!ctx.reloaded) { ctx.reloaded = true; await reloadTab(`第 ${page} 页请求异常（${error.message}）`); continue; }
            // 刷新后仍是空页：跳过该页继续（最多连续 3 页），而不是整个任务停下
            if (error.emptyPayload && (ctx.emptySkips || 0) < 3) {
              ctx.emptySkips = (ctx.emptySkips || 0) + 1;
              logEvent("warn", `第 ${page} 页多次返回空列表，已跳过继续下一页。`);
              payload = { ...error.emptyPayload, skipped: true };
            } else throw kindError("fatal", `第 ${page} 页多次重试仍失败：${error.message}。已保存前面的页，点“继续”可从第 ${page} 页接着采集。`);
          }
          if (!(payload && payload.skipped)) {
            // 首页失败时依次尝试：去除签名参数 → 页面原每页条数 → 两者同时
            if (ctx.apiOk === 0 && error.kind !== "ratelimit") {
              if (ctx.canResize === undefined) ctx.canResize = !!(task.pagination.pageSize && sizeOf() !== task.pagination.pageSize);
              const base = [{ world: "MAIN", strip: false }, { world: "MAIN", strip: true }];
              const variants = base.concat(ctx.canResize ? [{ world: "ISOLATED", strip: false, resize: true }, ...base.map(v => ({ ...v, resize: true }))] : []);
              if (ctx.variant < variants.length) {
                const v = variants[ctx.variant++];
                task.replayWorld = v.world; task.stripSign = v.strip;
                if (v.resize) { task.sizeUsed = task.pagination.pageSize; item.sizeOverride = 0; }
                logEvent("warn", `接口直连失败（${error.message}），改为${v.world === "MAIN" ? "页面内请求" : "扩展直接请求"}${v.strip ? "（去除签名参数）" : ""}${v.resize ? `、每页 ${task.sizeUsed} 条` : ""}重试。`);
                continue;
              }
            }
            if (task.config.driver === "api") throw error;
            if (task.pageReloaded) throw kindError("fatal", `接口直连失败（${error.message}）。评价页已被刷新过、页面上的筛选已重置，为避免采集条件改变，不改用页面点击。请稍后点“继续”重试。`);
            logEvent("warn", `接口直连不可用（${error.message}），切换为页面点击翻页。`);
            task.stripSign = false; task.replayWorld = "";
            mode = "ui"; ctx.positioned = false; ctx.apiFailed = true;
            if (item.pages && task.pagination.pageSize && sizeOf() && sizeOf() !== task.pagination.pageSize && task.config.startPage === 1) {
              // 接口与页面每页条数不同，页码无法对应：页面点击从第 1 页重新采集（按评论 ID 去重）
              item.nextPage = 1; item.cursor = ""; item.lastSig = prevSig = ""; item.pages = 0;
            }
            if (item.targetId) task.productPath = null; // 商品参数可能有误，由页面搜索重新学习
            continue;
          }
        }
      } else {
        if (item.total > WINDOW_LIMIT && (page - 1) * (item.maxRows || 50) >= WINDOW_LIMIT) throw kindError("fatal", WINDOW_HELP(page - 1));
        let attempt = 0;
        while (true) {
          try { payload = await uiReadPage(task, item, page, prevSig, ctx); break; }
          catch (error) {
            if (error.kind !== "retry" || attempt >= 2) throw error;
            attempt++; ctx.positioned = false;
            setStatus(`${error.message}，重新定位后重试（${attempt}/2）…`);
            await pausableSleep(2000);
          }
        }
        if (item.targetId && payload.list.map(C.flattenReview).some(row => !C.rowMatchesProduct(row, item.targetId))) {
          throw kindError("item", `页面返回了其他商品的评论，已停止采集 ${item.targetId}，避免混入全店评论。`);
        }
      }

      // 保存（评论与进度同一事务；失败则回滚内存中的进度）
      const rows = payload.list.map(C.flattenReview);
      const backup = JSON.stringify({ item, rowCount: task.rowCount, imageCount: task.imageCount });
      if (payload.total !== null && payload.total !== undefined) item.total = payload.total;
      if (!item.firstPageSize && rows.length) item.firstPageSize = rows.length;
      item.maxRows = Math.max(item.maxRows || 0, rows.length); item.pagesSeen = (item.pagesSeen || 0) + (rows.length ? 1 : 0);
      // 服务器若把每页条数限制得比请求小，以观察到的最大条数计算总页数（中途不足一页是正常的）
      const perPage = mode === "api" && sizeOf() ? (item.pagesSeen >= 2 && item.maxRows < sizeOf() ? item.maxRows : sizeOf()) : Math.max(item.firstPageSize || 0, rows.length);
      if (item.total && perPage) item.totalPages = Math.ceil(item.total / perPage);
      item.nextPage = page + 1;
      item.cursor = payload.nextCursor || "";
      if (rows.length) { item.lastSig = prevSig = C.payloadSignature(rows); item.pages = (item.pages || 0) + 1; }
      const records = rows.map((row, i) => ({ key: C.rowKey(row), targetId: item.targetId, page, order: itemIndex * 1e9 + page * 1000 + i, row }));
      try {
        const added = rows.length ? await store.savePage(task, records) : (await store.putTask(task), 0);
        item.rows = (item.rows || 0) + added;
      } catch (error) {
        const saved = JSON.parse(backup);
        Object.assign(item, saved.item); task.rowCount = saved.rowCount; task.imageCount = saved.imageCount;
        throw kindError("fatal", `本地保存失败：${error.message}`);
      }
      pushPreview(records);
      summarize(task);
      pagesThisRun++;

      // 结束判断
      const expectedPages = item.total != null && perPage ? Math.ceil(item.total / perPage) : 0;
      let end = (!rows.length && !payload.skipped) || payload.end || (task.config.endPage && page >= task.config.endPage);
      if (mode === "api") {
        // 已知总数时以总页数为准；不足一页不再视为最后一页
        end = end || (expectedPages ? page >= expectedPages : ((payload.hasMore === false) || (sizeOf() && rows.length < sizeOf()))) ||
          (task.pagination.kind === "cursor" && !task.pagination.pagePath && !payload.nextCursor);
      } else end = end || payload.hasMore === false;
      if (payload.skipped && ctx.emptySkips >= 3) end = false;
      if (rows.length) ctx.emptySkips = 0;
      if (end) break;

      // 页面搜索学到商品参数后，切回接口直连（除非接口刚失败过）
      if (mode === "ui" && task.config.driver === "auto" && !ctx.apiFailed && task.template && task.pagination && task.pagination.kind && (!item.targetId || task.productPath)) {
        mode = "api";
        const uiSize = item.firstPageSize || rows.length;
        if (task.sizeUsed && uiSize && task.sizeUsed !== uiSize) {
          if (task.config.startPage === 1) {
            // 页面每页条数与接口不同，页码不能对应：从第 1 页按接口条数重新采集（按评论 ID 去重，不会重复）
            item.nextPage = 1; item.cursor = ""; item.lastSig = prevSig = ""; item.pages = 0;
            logEvent("info", `已获得接口模板，改用接口直连并按每页 ${task.sizeUsed} 条从第 1 页重新采集（自动去重）。`);
          } else {
            item.sizeOverride = uiSize;
            logEvent("info", `已获得接口模板，后续页改用接口直连（沿用页面每页 ${uiSize} 条以保持页码一致）。`);
          }
        } else logEvent("info", "已获得接口模板，后续页改用接口直连。");
      }

      // 分批：每批结束稍作休息
      if (pagesThisRun % task.config.batchSize === 0) {
        setStatus(`${label}：本轮第 ${pagesThisRun / task.config.batchSize} 批（${task.config.batchSize} 页）已采完，已保存 ${task.rowCount || 0} 条，稍候继续…`);
        await pausableSleep(3000);
        if (mode === "api" && task.config.reloadEachBatch !== false && !pauseRequested) await reloadTab(`第 ${pagesThisRun / task.config.batchSize} 批结束`);
      } else await pausableSleep(task.config.delayMs);
    }
    item.status = item.rows || item.pages ? "done" : "empty";
    item.error = "";
  }

  const WINDOW_LIMIT = 10000;
  const WINDOW_HELP = saved => `TikTok 评论接口按页码最多只能翻到第 1 万条（已保存到约第 ${saved} 页）。要采集全部，请在评价页上选择“评价时间/日期范围”（例如从开店日期到今天）并点查询，然后新建任务：扩展会自动按时间分段，每段不超过 1 万条。`;
  async function rememberReplayMode(task) {
    try { await chrome.storage.local.set({ [`tkReplayMode:${endpointOf(task.template.url)}`]: { world: task.replayWorld || "ISOLATED", strip: !!task.stripSign } }); } catch (_) {}
  }
  function fmtDay(ms) { const d = new Date(ms); const p2 = n => String(n).padStart(2, "0"); return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}${d.getHours() || d.getMinutes() ? ` ${p2(d.getHours())}:${p2(d.getMinutes())}` : ""}`; }
  function splitRange(seg, info) {
    const step = info.unit === "date" ? 86400000 : info.unit === "ms" ? 1 : info.unit === "datetime" && info.seconds === false ? 60000 : 1000;
    const minSpan = info.unit === "date" ? 86400000 : 3600000;
    if (seg.endMs - seg.startMs < minSpan) return null;
    let mid = Math.floor((seg.startMs + seg.endMs) / 2);
    if (info.unit === "date") { const d = new Date(mid); mid = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime(); if (mid < seg.startMs) mid = seg.startMs; }
    if (mid + step > seg.endMs) return null;
    // 较新的时间段排在前面（接口默认按时间倒序）
    return [{ startMs: mid + step, endMs: seg.endMs, status: "pending" }, { startMs: seg.startMs, endMs: mid, status: "pending" }];
  }
  // 按时间分段采集：每段先取第 1 页看总数，超过 1 万条就对半拆分，直到每段都能完整翻页。
  async function runSegmented(task, item, itemIndex, ctx) {
    const range = task.timeRange;
    if (!item.segments) {
      item.segments = [{ startMs: range.startMs, endMs: range.endMs, status: "pending" }];
      item.nextPage = task.config.startPage;
      logEvent("info", `总数 ${item.total} 条超过接口 1 万条翻页上限，改为按时间分段采集（${fmtDay(range.startMs)} ~ ${fmtDay(range.endMs)}，字段 ${range.keys}）。`);
      await store.putTask(task);
    }
    const size = task.sizeUsed || task.pagination.pageSize || 50;
    const limit = WINDOW_LIMIT - 2 * size;
    const label = item.targetId ? `商品 ${item.targetId}` : "当前筛选";
    item.rowSeq = item.rowSeq || 0;
    let pagesThisRun = 0;
    const fetchSeg = async (seg, page) => {
      while (true) {
        try {
          const payload = await withRetry(() => apiFetchPage(task, item, page, { timeRange: { ...range, startMs: seg.startMs, endMs: seg.endMs } }));
          ctx.reloaded = false;
          const rows = payload.list.map(C.flattenReview);
          if (item.targetId && rows.some(row => !C.rowMatchesProduct(row, item.targetId))) throw kindError("fatal", `接口返回了其他商品的评论（商品 ${item.targetId}），已暂停，避免混入其他商品。`);
          return { payload, rows };
        } catch (error) {
          if (error.kind === "fatal" || error.kind === "paused") throw error;
          if (!ctx.reloaded) { ctx.reloaded = true; await reloadTab(`时间段请求异常（${error.message}）`); continue; }
          throw kindError("fatal", `时间段 ${fmtDay(seg.startMs)} ~ ${fmtDay(seg.endMs)} 第 ${page} 页多次重试仍失败：${error.message}。已保存的数据保留，点“继续”接着采集。`);
        }
      }
    };
    while (true) {
      if (pauseRequested) throw kindError("paused", "已暂停");
      const segIndex = item.segments.findIndex(x => x.status !== "done");
      if (segIndex < 0) break;
      const seg = item.segments[segIndex];
      const doneSegs = item.segments.filter(x => x.status === "done").length;
      const segLabel = `${label}｜时间段 ${doneSegs + 1}/${item.segments.length}（${fmtDay(seg.startMs)} ~ ${fmtDay(seg.endMs)}）`;
      if (seg.total == null) {
        setStatus(`${segLabel}：检查该时间段条数…`);
        const { payload, rows } = await fetchSeg(seg, 1);
        const total = payload.total == null ? rows.length : payload.total;
        if (total > limit) {
          const halves = splitRange(seg, range.info);
          if (halves) {
            item.segments.splice(segIndex, 1, ...halves);
            await store.putTask(task);
            await pausableSleep(task.config.delayMs);
            continue;
          }
          logEvent("warn", `时间段 ${fmtDay(seg.startMs)} ~ ${fmtDay(seg.endMs)} 有 ${total} 条且无法再拆分，只能采集前 1 万条。`);
        }
        seg.total = total; seg.pages = Math.ceil(Math.min(total, WINDOW_LIMIT) / size); seg.nextPage = 1; seg.lastSig = "";
        if (!rows.length) { seg.status = "done"; await store.putTask(task); continue; }
        await saveSegPage(task, item, itemIndex, seg, 1, rows);
        pagesThisRun++;
      }
      while (seg.status !== "done") {
        if (pauseRequested) throw kindError("paused", "已暂停");
        const page = seg.nextPage;
        if (page > seg.pages || page * size > WINDOW_LIMIT + size) { seg.status = "done"; await store.putTask(task); break; }
        setStatus(`${segLabel}：第 ${page} / ${seg.pages} 页，共已采集 ${task.rowCount || 0} 条…`);
        const { rows } = await fetchSeg(seg, page);
        const sig = rows.length ? C.payloadSignature(rows) : "";
        if (!rows.length || sig === seg.lastSig) { seg.status = "done"; await store.putTask(task); break; }
        await saveSegPage(task, item, itemIndex, seg, page, rows);
        pagesThisRun++;
        if (pagesThisRun % task.config.batchSize === 0) {
          setStatus(`${segLabel}：本轮第 ${pagesThisRun / task.config.batchSize} 批已采完，已保存 ${task.rowCount || 0} 条，稍候继续…`);
          await pausableSleep(3000);
          if (task.config.reloadEachBatch !== false && !pauseRequested) await reloadTab(`第 ${pagesThisRun / task.config.batchSize} 批结束`);
        } else await pausableSleep(task.config.delayMs);
      }
    }
    item.status = item.rows || item.pages ? "done" : "empty";
    item.error = "";
  }
  async function saveSegPage(task, item, itemIndex, seg, page, rows) {
    const backup = JSON.stringify({ item, rowCount: task.rowCount, imageCount: task.imageCount });
    const records = rows.map(row => ({ key: C.rowKey(row), targetId: item.targetId, page, order: itemIndex * 1e9 + (++item.rowSeq), row }));
    seg.nextPage = page + 1; seg.lastSig = C.payloadSignature(rows);
    item.pages = (item.pages || 0) + 1;
    try { item.rows = (item.rows || 0) + await store.savePage(task, records); }
    catch (error) {
      const saved = JSON.parse(backup); Object.assign(item, saved.item); task.rowCount = saved.rowCount; task.imageCount = saved.imageCount;
      throw kindError("fatal", `本地保存失败：${error.message}`);
    }
    pushPreview(records);
    summarize(task);
  }

  async function runTask(task) {
    running = task; pauseRequested = false; busy = true; controls();
    clearError(); preview = []; renderPreview();
    task.status = "running"; task.lastError = "";
    await store.putTask(task);
    try {
      await useTab(false);
      const status = await ensureHook();
      logEvent("info", `页面监听：v${status.version}，已捕获 ${status.records} 条评论响应${status.lateInstall ? "（补注入）" : ""}`);
      for (let i = task.index || 0; i < task.items.length; i++) {
        task.index = i;
        const item = task.items[i];
        if (item.status === "done" || item.status === "empty") continue;
        try {
          await runItem(task, item, i);
        } catch (error) {
          if (error.kind === "item" && task.items.length > 1) {
            item.status = "error"; item.error = error.message;
            logEvent("warn", error.message);
          } else throw error;
        }
        await store.putTask(task);
        summarize(task);
        if (i < task.items.length - 1) await pausableSleep(task.config.delayMs);
        if (pauseRequested) throw kindError("paused", "已暂停");
      }
      task.status = "done";
      task.index = task.items.length;
      const failed = task.items.filter(i => i.status === "error");
      setStatus(`完成：共 ${task.rowCount || 0} 条评论，${task.imageCount || 0} 张评价图${failed.length ? `；${failed.length} 个 ID 失败（见“导出 Excel”的商品汇总）` : ""}。`);
    } catch (error) {
      if (error.kind === "paused") { task.status = "paused"; setStatus(`已暂停：已保存 ${task.rowCount || 0} 条。点“继续”从断点接着采集。`); }
      else {
        task.status = "error"; task.lastError = error.message;
        const item = task.items[task.index || 0];
        if (item && item.status === "running") item.status = "pending";
        showError(error);
      }
    } finally {
      await store.putTask(task).catch(() => {});
      running = null; busy = false; pauseRequested = false;
      selectedId = task.id;
      await refreshTaskList();
      controls();
    }
  }

  // ---------------- 创建任务 ----------------
  function readForm() {
    const mode = document.querySelector("input[name=mode]:checked").value;
    const num = (el, def, min, max) => { const v = parseInt(el.value, 10); return Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : def; };
    return {
      mode,
      ids: els.productIds.value,
      startPage: num(els.startPage, 1, 1, 100000),
      endPage: els.endPage.value.trim() ? num(els.endPage, 0, 1, 100000) : 0,
      pageSize: num(els.pageSize, 50, 1, 200),
      batchSize: num(els.batchSize, 50, 1, 1000),
      delayMs: num(els.delayMs, 600, 0, 10000),
      driver: els.driver.value,
      reloadEachBatch: els.reloadEachBatch.checked
    };
  }
  async function createTask() {
    clearError();
    const form = readForm();
    let ids = [""];
    if (form.mode === "ids") {
      ids = window.TKProductImport.text(form.ids);
    }
    if (form.endPage && form.endPage < form.startPage) throw new Error("终止页不能小于起始页。");
    setStatus("正在检查评价页与页面监听…");
    await useTab(false);
    const status = await ensureHook();
    let latest = await hook("latest", false);
    if (!latest && form.mode === "current") {
      setStatus("尚未捕获评论接口，正在重新提交当前查询（不刷新、不改筛选）…");
      const found = await uiSearch(null).catch(error => { logEvent("warn", error.message); return null; });
      latest = found ? found.record : await hook("latest", false);
      if (!latest) {
        const info = await hook("paginationInfo");
        if (info.hasNext) {
          const before = (await hook("status")).seq;
          await hook("clickNext");
          const f = await waitForRecord(before, () => true, 15000);
          if (!f.timeout) latest = f.record;
        }
      }
      if (!latest) throw new Error(`页面监听已就绪，但还没有捕获到评论接口响应${status.lateInstall ? "（监听是在页面打开后补注入的）" : ""}。请在评价页上点一次“查询”或翻一页后，再点“创建并开始任务”。`);
    }
    const now = Date.now();
    const task = {
      id: crypto.randomUUID(), createdAt: now, updatedAt: now,
      mode: form.mode,
      name: form.mode === "current" ? "当前筛选" : ids.length === 1 ? `商品 ${ids[0]}` : `商品列表 ${ids.length} 个`,
      config: { startPage: form.startPage, endPage: form.endPage, pageSize: form.pageSize, batchSize: form.batchSize, delayMs: form.delayMs, driver: form.driver, reloadEachBatch: form.reloadEachBatch },
      template: null, pagination: null, productPath: null, stripSign: false, driverUsed: "",
      items: ids.map(id => ({ targetId: id, status: "pending", nextPage: form.startPage, cursor: "", total: null, totalPages: 0, rows: 0, pages: 0, error: "" })),
      index: 0, status: "paused", rowCount: 0, imageCount: 0, lastError: ""
    };
    if (latest) {
      setupTemplate(task, templateOf(latest));
      if (form.mode === "ids") task.productPath = await learnedProductPath(task.template);
      const modeKey = `tkReplayMode:${endpointOf(task.template.url)}`;
      const remembered = (await chrome.storage.local.get(modeKey))[modeKey];
      if (remembered) { task.replayWorld = remembered.world; task.stripSign = !!remembered.strip; }
      logEvent("info", task.timeRange ? `识别到时间筛选字段 ${task.timeRange.keys}（${fmtDay(task.timeRange.startMs)} ~ ${fmtDay(task.timeRange.endMs)}），总数超过 1 万条时将自动按时间分段。` : "请求中没有时间筛选字段：若总数超过 1 万条，需要先在页面上选择日期范围后查询。");
      const d = C.describeTemplate(task.template);
      logEvent("info", `模板：${d.method} ${d.endpoint}，分页=${d.pagination.kind}${d.pagination.pageKey ? `(${d.pagination.pageKey})` : ""}，每页参数=${d.pagination.sizeKey || "无"}，商品参数=${task.productPath ? task.productPath.join(".") : "未学习"}`);
    }
    await store.putTask(task);
    selectedId = task.id;
    await refreshTaskList();
    await runTask(task);
  }

  // ---------------- 导出 ----------------
  function download(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }
  function safeName(text) { return String(text).replace(/[\\/:*?"<>|\s]+/g, "_").slice(0, 60); }
  function stamp(ts) { const d = new Date(ts); const p = n => String(n).padStart(2, "0"); return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`; }
  function textSheet(aoa, widths) {
    const XLSX = window.XLSX;
    const sheet = XLSX.utils.aoa_to_sheet(aoa);
    if (widths) sheet["!cols"] = widths.map(w => ({ wch: w }));
    return sheet;
  }
  async function exportXlsx(task) {
    const XLSX = window.XLSX;
    if (!XLSX) throw new Error("Excel 组件未加载。");
    setStatus("正在生成 Excel…");
    const records = (await store.readRows(task.id)).sort((a, b) => a.order - b.order);
    const book = XLSX.utils.book_new();
    const widths = { target_id: 21, star_level: 6, review_text: 50, reply_text: 30, reply_count: 6, main_review_id: 21, order_id: 21, product_id: 21, product_name: 30, sku_id: 21, sku_specification: 20, user_name: 14, create_time: 19, review_image_count: 8, review_image_urls: 60, page: 6 };
    XLSX.utils.book_append_sheet(book, textSheet(C.exportAoa(records), C.OUTPUT_COLUMNS.map(([k]) => widths[k] || 12)), "评论");
    const images = [["采集商品 ID", "评论 ID", "商品 ID", "图片序号", "图片链接", "缩略图链接"]];
    for (const r of records) (r.row.review_images || []).forEach((img, i) => images.push([r.targetId || "", r.row.main_review_id, r.row.product_id, i + 1, img.url, img.thumbnail || ""]));
    XLSX.utils.book_append_sheet(book, textSheet(images, [21, 21, 21, 8, 80, 80]), "评价图");
    if (task.mode === "ids") {
      const summary = [["采集商品 ID", "状态", "接口总条数", "已采集条数", "已采集页数", "说明"]];
      const names = { done: "完成", empty: "无评论", error: "失败", pending: "未开始", running: "未完成" };
      for (const item of task.items) summary.push([item.targetId, names[item.status] || item.status, item.total == null ? "" : item.total, item.rows || 0, item.pages || 0, item.error || ""]);
      XLSX.utils.book_append_sheet(book, textSheet(summary, [21, 8, 10, 10, 10, 60]), "商品汇总");
    }
    // Judge.me 导入：列顺序按 Judge.me CSV 模板；product_handle 需填 Shopify 商品 handle（第一列辅助列导入前删除）
    const judge = [["TikTok商品ID（导入前删除此列）", "title", "body", "rating", "review_date", "source", "curated", "reviewer_name", "reviewer_email", "product_id", "product_handle", "reply", "reply_date", "picture_urls", "ip_address", "location"]];
    for (const r of records) {
      const row = r.row;
      judge.push([row.product_id || r.targetId || "", "", row.review_text || "", Number(row.star_level) || "", row.create_time || "", "", "ok", row.user_name || "", "", "", "", row.reply_text || "", "", (row.review_images || []).map(img => img.url).join(","), "", ""]);
    }
    XLSX.utils.book_append_sheet(book, textSheet(judge, [21, 10, 50, 6, 19, 8, 6, 14, 20, 10, 24, 30, 12, 80, 8, 8]), "Judge.me导入");
    // 图片链接的签名有效期（x-expires / expires 参数，秒级时间戳）
    let expiry = 0;
    for (const r of records) for (const img of r.row.review_images || []) {
      const m = img.url.match(/[?&](?:x-expires|expires)=(\d{9,10})/i);
      if (m && (!expiry || Number(m[1]) < expiry)) expiry = Number(m[1]);
    }
    const expiryText = expiry ? new Date(expiry * 1000).toLocaleString() : "链接中未发现有效期参数";
    const info = [["项目", "值"], ["评价图链接最早过期时间", expiryText], ["任务", task.name], ["创建时间", new Date(task.createdAt).toLocaleString()], ["状态", task.status], ["评论条数", records.length], ["评价图数量", images.length - 1], ["页码范围", `${task.config.startPage} - ${task.config.endPage || "全部"}`], ["翻页方式", task.driverUsed === "api" ? "接口直连" : "页面点击"], ["接口", task.template ? endpointOf(task.template.url) : ""], ["错误", task.lastError || ""]];
    XLSX.utils.book_append_sheet(book, textSheet(info, [12, 60]), "任务信息");
    const out = XLSX.write(book, { bookType: "xlsx", type: "array", compression: true });
    download(new Blob([out], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), `TK评论_${safeName(task.name)}_${stamp(task.createdAt)}.xlsx`);
    setStatus(`已导出 ${records.length} 条评论、${images.length - 1} 张评价图链接。${expiry ? `图片链接最早 ${expiryText} 过期，导入 Judge.me 等平台请在此之前完成。` : ""}`);
  }
  async function downloadImages(task) {
    if (!chrome.downloads) throw new Error("浏览器未授予下载权限，请在扩展管理中重新加载扩展。");
    const records = (await store.readRows(task.id)).sort((a, b) => a.order - b.order);
    const ascii = text => String(text).replace(/[^A-Za-z0-9._-]+/g, "_").slice(0, 60) || "x";
    const folder = `${task.mode === "current" ? "filtered" : task.items.length === 1 ? ascii(task.items[0].targetId) : `list-${task.items.length}`}_${stamp(task.createdAt)}`;
    const jobs = [];
    for (const r of records) (r.row.review_images || []).forEach((img, i) => {
      const ext = (img.url.split("?")[0].match(/\.(jpe?g|png|webp|gif|heic|avif)$/i) || [, "jpg"])[1].toLowerCase();
      // 下载目录只用 ASCII：部分系统上 chrome.downloads 会拒绝含中文的路径
      jobs.push({ url: img.url, filename: `TK_review_images/${folder}/${ascii(r.targetId || r.row.product_id || "unknown")}/${ascii(r.row.main_review_id || r.key)}_${i + 1}.${ext}` });
    });
    if (!jobs.length) throw new Error("该任务没有评价图。");
    busy = true; pauseRequested = false; controls();
    let done = 0, failed = 0;
    try {
      const worker = async () => {
        while (jobs.length && !pauseRequested) {
          const job = jobs.shift();
          try { await chrome.downloads.download({ url: job.url, filename: job.filename, conflictAction: "uniquify", saveAs: false }); done++; }
          catch (error) { failed++; logEvent("warn", `图片下载失败：${error.message}（${job.filename}）`); }
          setStatus(`正在下载评价图：${done} 成功 / ${failed} 失败，剩余 ${jobs.length}…`);
        }
      };
      await Promise.all([worker(), worker(), worker()]);
      setStatus(`评价图下载已提交：${done} 张${failed ? `，${failed} 张失败（链接可能已过期，可重新采集后再下载）` : ""}。文件在浏览器下载目录的 TK_review_images/${folder} 文件夹，按商品 ID 分目录、以“评论ID_序号”命名。`);
    } finally { busy = false; pauseRequested = false; controls(); }
  }

  // ---------------- 界面 ----------------
  function renderPreview() {
    els.previewBody.textContent = "";
    for (const record of preview.slice().reverse()) {
      const tr = document.createElement("tr");
      for (const [key] of PREVIEW_COLUMNS) {
        const td = document.createElement("td");
        const value = key === "target_id" ? record.targetId : key === "page" ? record.page : record.row[key];
        td.textContent = value == null ? "" : String(value);
        td.title = td.textContent;
        tr.appendChild(td);
      }
      els.previewBody.appendChild(tr);
    }
    els.rowCount.textContent = `预览（最近 ${preview.length} 条）`;
  }
  function controls() {
    const task = selectedTask;
    els.createTask.disabled = busy;
    els.pauseTask.disabled = !busy;
    els.resumeTask.disabled = busy || !task || (task.status === "done" && !hasRemaining(task));
    els.exportXlsx.disabled = busy && !running ? true : !task;
    els.downloadImages.disabled = busy || !task || !task.imageCount;
    els.deleteTask.disabled = busy || !task;
    els.taskSelect.disabled = busy;
    for (const el of document.querySelectorAll("input[name=mode], #productIds, #idFile, #startPage, #endPage, #pageSize, #batchSize, #delayMs, #driver, #reloadEachBatch")) el.disabled = busy;
  }
  let selectedTask = null;
  function itemRemaining(task, item) {
    return !!(item.totalPages && item.nextPage <= item.totalPages && !(task.config.endPage && item.nextPage > task.config.endPage));
  }
  function hasRemaining(task) { return task.items.some(item => item.status !== "empty" && itemRemaining(task, item)); }
  const STATUS = { running: "运行中", paused: "已暂停", done: "已完成", error: "出错暂停" };
  async function refreshTaskList() {
    const tasks = await store.listTasks();
    els.taskSelect.textContent = "";
    const none = document.createElement("option");
    none.value = ""; none.textContent = tasks.length ? "选择已保存任务" : "暂无任务";
    els.taskSelect.appendChild(none);
    for (const task of tasks) {
      const option = document.createElement("option");
      option.value = task.id;
      option.textContent = `${new Date(task.createdAt).toLocaleString()} · ${task.name} · ${STATUS[task.status] || task.status} · ${task.rowCount || 0} 条`;
      els.taskSelect.appendChild(option);
    }
    selectedTask = selectedId ? tasks.find(t => t.id === selectedId) || null : null;
    if (running && selectedTask && running.id === selectedTask.id) selectedTask = running;
    els.taskSelect.value = selectedTask ? selectedTask.id : "";
    if (selectedTask) {
      const t = selectedTask;
      const failed = t.items.filter(i => i.status === "error").length;
      const done = t.items.filter(i => i.status === "done" || i.status === "empty").length;
      els.taskInfo.textContent = `${t.name}｜${STATUS[t.status] || t.status}｜${t.rowCount || 0} 条评论｜${t.imageCount || 0} 张图${t.items.length > 1 ? `｜商品 ${done}/${t.items.length} 完成${failed ? `，${failed} 失败` : ""}` : `｜已到第 ${t.items[0].nextPage - 1} 页${t.items[0].totalPages ? ` / ${t.items[0].totalPages}` : ""}`}${t.lastError ? `｜${t.lastError}` : ""}`;
      summarize(t);
    } else els.taskInfo.textContent = "";
    controls();
  }
  async function showTask(id) {
    selectedId = id;
    await refreshTaskList();
    preview = selectedTask ? (await store.readRows(selectedTask.id)).sort((a, b) => a.order - b.order).slice(-50) : [];
    renderPreview();
  }

  // 表单持久化（ID 列表不会因刷新 / 重开侧栏丢失）
  async function saveForm() {
    try { await chrome.storage.local.set({ [FORM_KEY]: readForm() }); } catch (_) {}
  }
  async function loadForm() {
    const form = (await chrome.storage.local.get(FORM_KEY))[FORM_KEY];
    if (!form) return;
    const radio = document.querySelector(`input[name=mode][value="${form.mode}"]`);
    if (radio) radio.checked = true;
    els.productIds.value = form.ids || "";
    els.startPage.value = form.startPage || 1;
    els.endPage.value = form.endPage || "";
    els.pageSize.value = form.pageSize || 50;
    els.batchSize.value = form.batchSize || 50;
    els.delayMs.value = form.delayMs ?? 600;
    els.driver.value = form.driver || "auto";
    els.reloadEachBatch.checked = form.reloadEachBatch !== false;
  }
  function updateIdsUi() {
    const mode = document.querySelector("input[name=mode]:checked").value;
    els.idsBox.hidden = mode !== "ids";
    try { els.idCount.textContent = `${window.TKProductImport.text(els.productIds.value).length} 个 ID`; }
    catch (error) { els.idCount.textContent = els.productIds.value.trim() ? error.message : "0 个 ID"; }
  }

  function action(fn) {
    return async () => {
      if (busy) { setStatus("正在执行其他操作，请稍候或先暂停。"); return; }
      clearError();
      try { await fn(); } catch (error) { showError(error); busy = false; controls(); }
    };
  }

  els.createTask.addEventListener("click", action(async () => { await saveForm(); await createTask(); }));
  els.pauseTask.addEventListener("click", () => { pauseRequested = true; setStatus("正在暂停，当前页保存后停止…"); });
  els.resumeTask.addEventListener("click", action(async () => {
    const task = await store.getTask(selectedId);
    if (!task) throw new Error("请选择要继续的任务。");
    for (const item of task.items) {
      if (item.status === "error") { item.status = "pending"; item.error = ""; }
      if (item.status === "done" && itemRemaining(task, item)) item.status = "pending"; // 旧版本中途误判结束的任务
    }
    if (task.status === "done" && task.items.every(i => i.status === "done" || i.status === "empty")) throw new Error("任务已完成。");
    task.index = task.items.findIndex(i => i.status !== "done" && i.status !== "empty");
    await runTask(task);
  }));
  els.taskSelect.addEventListener("change", action(() => showTask(els.taskSelect.value)));
  els.exportXlsx.addEventListener("click", async () => {
    clearError();
    try { const task = running && running.id === selectedId ? running : await store.getTask(selectedId); if (!task) throw new Error("请先选择任务。"); await exportXlsx(task); }
    catch (error) { showError(error); }
  });
  els.downloadImages.addEventListener("click", action(async () => { const task = await store.getTask(selectedId); if (!task) throw new Error("请先选择任务。"); await downloadImages(task); }));
  els.deleteTask.addEventListener("click", action(async () => {
    if (!selectedId || !confirm("删除该任务及其已采集数据？")) return;
    await store.deleteTask(selectedId); selectedId = ""; preview = []; renderPreview(); await refreshTaskList(); setStatus("任务已删除。");
  }));
  for (const radio of document.querySelectorAll("input[name=mode]")) radio.addEventListener("change", () => { updateIdsUi(); saveForm(); });
  for (const el of [els.productIds, els.startPage, els.endPage, els.pageSize, els.batchSize, els.delayMs, els.driver, els.reloadEachBatch]) el.addEventListener("change", saveForm);
  els.productIds.addEventListener("input", () => { updateIdsUi(); saveForm(); });
  els.idFile.addEventListener("change", action(async () => {
    const file = els.idFile.files[0];
    if (!file) return;
    try {
      const result = await window.TKProductImport.file(file);
      els.productIds.value = result.ids.join("\n");
      document.querySelector("input[name=mode][value=ids]").checked = true;
      updateIdsUi(); await saveForm();
      setStatus(`已从“${result.sheet}”导入 ${result.ids.length} 个 ID。`);
    } finally { els.idFile.value = ""; }
  }));
  window.addEventListener("error", event => logEvent("uncaught", event.message, event.error && event.error.stack));
  window.addEventListener("unhandledrejection", event => logEvent("unhandled", event.reason && event.reason.message || String(event.reason), event.reason && event.reason.stack));

  // ---------------- 诊断接口（诊断 TAB 调用） ----------------
  async function diagnosticReport() {
    const report = { generatedAt: new Date().toISOString(), version: VERSION, userAgent: navigator.userAgent, tabId, busy, status: els.status.textContent, events: events.slice(-120) };
    if (selectedTask) {
      const t = selectedTask;
      report.task = { id: t.id, name: t.name, mode: t.mode, status: t.status, config: t.config, driverUsed: t.driverUsed, stripSign: t.stripSign, productPath: t.productPath, lastError: t.lastError, rowCount: t.rowCount, imageCount: t.imageCount, items: t.items.slice(0, 20).map(i => ({ targetId: i.targetId, status: i.status, nextPage: i.nextPage, total: i.total, totalPages: i.totalPages, rows: i.rows, error: i.error })), template: t.template ? C.describeTemplate(t.template) : null };
    }
    return JSON.parse(JSON.stringify(report, (_, v) => typeof v === "string" ? sanitize(v) : v));
  }
  async function probe() {
    const out = { at: new Date().toISOString(), checks: {} };
    try {
      const tab = await useTab(false);
      out.tab = { id: tab.id, url: sanitize(tab.url), status: tab.status };
    } catch (error) { out.tabError = error.message; return out; }
    try { out.checks.isolated = await exec(() => ({ readyState: document.readyState, extension: !!(chrome && chrome.runtime && chrome.runtime.id) }), [], "ISOLATED"); } catch (error) { out.checks.isolatedError = error.message; }
    try { out.checks.main = await exec(() => ({ readyState: document.readyState, hook: !!window.__TKR__, oldHook: !!window.__TK_REVIEW_CAPTURE_HOOKED__ })); } catch (error) { out.checks.mainError = error.message; }
    try { out.hook = await ensureHook(); } catch (error) { out.hookError = error.message; }
    try {
      const latest = await hook("latest", false);
      if (latest) {
        const { json, payload } = parseRecord(latest);
        out.latestResponse = {
          status: latest.status, transport: latest.transport, activePage: latest.activePage,
          template: C.describeTemplate(templateOf(latest), { activePage: latest.activePage }),
          reviews: payload ? payload.list.length : 0, total: payload ? payload.total : null, hasMore: payload ? payload.hasMore : null,
          responseShape: C.shape(json),
          firstReviewShape: payload && payload.list[0] ? C.shape(payload.list[0]) : null,
          imageFieldsFound: payload && payload.list.length ? [...new Set(payload.list.flatMap(item => C.extractImages(item).sources))] : []
        };
        const learned = await learnedProductPath(templateOf(latest));
        out.learnedProductPath = learned ? learned.join(".") : null;
      } else out.latestResponse = null;
    } catch (error) { out.latestError = error.message; }
    logEvent("info", "诊断探针已运行。");
    return out;
  }
  async function testApi() {
    const out = { at: new Date().toISOString() };
    await useTab(false);
    await ensureHook();
    const latest = await hook("latest", false);
    if (!latest) throw new Error("还没有捕获到评论接口响应。请在评价页点一次查询或翻页。");
    const form = readForm();
    for (const [replayWorld, stripSign] of [["ISOLATED", false], ["MAIN", false], ["MAIN", true]]) {
      const task = { config: { pageSize: form.pageSize }, stripSign, replayWorld };
      setupTemplate(task, templateOf(latest));
      out.template = C.describeTemplate(task.template, { activePage: latest.activePage });
      const result = { replayWorld, stripSign };
      try {
        const item = { targetId: "", cursor: "" };
        const p1 = await apiFetchPage(task, item, 1);
        result.page1 = { reviews: p1.list.length, total: p1.total, nextCursor: !!p1.nextCursor };
        item.cursor = p1.nextCursor;
        if (task.pagination.kind) {
          const p2 = await apiFetchPage(task, item, 2);
          const s1 = C.payloadSignature(p1.list.map(C.flattenReview)), s2 = C.payloadSignature(p2.list.map(C.flattenReview));
          result.page2 = { reviews: p2.list.length, differentFromPage1: s1 !== s2 };
        }
        result.ok = true;
      } catch (error) { result.error = error.message; }
      (out.attempts = out.attempts || []).push(result);
      if (result.ok) break;
    }
    logEvent("info", `接口直连测试：${JSON.stringify(out.attempts)}`);
    return out;
  }
  window.TKReviewDiagnosticsAPI = { report: diagnosticReport, probe, testApi, clear: () => { events.length = 0; } };

  // ---------------- 启动 ----------------
  (async () => {
    els.version.textContent = `v${VERSION}`;
    try { await loadForm(); } catch (error) { logEvent("warn", `读取已保存的表单失败：${error.message}`); }
    updateIdsUi();
    const heads = PREVIEW_COLUMNS.map(([, label]) => { const th = document.createElement("th"); th.textContent = label; return th; });
    els.previewHead.append(...heads);
    try {
      const tasks = await store.listTasks();
      // 侧栏关闭会中断运行中的任务，标记为暂停以便继续
      for (const t of tasks) if (t.status === "running") { t.status = "paused"; await store.putTask(t); }
      if (tasks.length) await showTask(tasks[0].id); else await refreshTaskList();
    } catch (error) { showError(error); }
    try {
      await useTab(false);
      const status = await ensureHook();
      els.pageStatus.textContent += ` · 监听正常${status.records ? `，已捕获 ${status.records} 个评论响应` : "，尚未捕获评论响应"}`;
    } catch (error) { els.pageStatus.textContent = `未就绪：${error.message}`; }
    controls();
  })();
})();
