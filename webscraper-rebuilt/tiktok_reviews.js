(function() {
  const els = {
    startCapture: document.getElementById("startCapture"),
    readCapture: document.getElementById("readCapture"),
    pageStart: document.getElementById("pageStart"),
    pageEnd: document.getElementById("pageEnd"),
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
  const ratingPageMatch = "https://seller.tiktokshopglobalselling.com/product/rating*";
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
    "create_time"
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
    create_time: "评论时间"
  };

  function setStatus(text) {
    els.status.textContent = text;
  }

  function setProgress(done, max) {
    els.progress.max = Math.max(max || 100, 1);
    els.progress.value = Math.max(done || 0, 0);
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async function getActiveTab() {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    return tabs && tabs[0] ? tabs[0] : null;
  }

  function isTikTokRatingUrl(url) {
    return /^https:\/\/seller\.tiktokshopglobalselling\.com\/product\/rating(?:[?#/]|$)/i.test(url || "");
  }

  async function refreshActiveTabStatus() {
    const tab = await getActiveTab();
    activeTabId = tab ? tab.id : 0;
    if (!tab) {
      els.pageStatus.textContent = "未找到当前活动标签页。";
      return false;
    }
    if (!isTikTokRatingUrl(tab.url)) {
      els.pageStatus.textContent = `请先打开 TikTok 商品评价页：${tab.url || ""}`;
      return false;
    }
    els.pageStatus.textContent = `当前页面正常：${tab.url}`;
    await detectPageInfo();
    return true;
  }

  async function detectPageInfo() {
    if (!activeTabId) return;
    const [result] = await chrome.scripting.executeScript({
      target: { tabId: activeTabId },
      world: "MAIN",
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
        return {
          totalPages,
          pageSize,
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
      const captured = await readCapture({ silent: true });
      if (captured) {
        setStatus("统计数据已刷新。");
        return;
      }
      const refreshed = await installCaptureRefreshAndRead();
      if (refreshed) {
        setStatus("页面已刷新，统计数据已更新。");
      }
    } finally {
      if (!isFetching) els.refreshStats.disabled = false;
    }
  }

  async function ensureCaptureScript() {
    try {
      await chrome.scripting.unregisterContentScripts({ ids: [captureScriptId] });
    } catch (error) {}
    await chrome.scripting.registerContentScripts([{
      id: captureScriptId,
      matches: [ratingPageMatch],
      js: ["tiktok_capture_hook.js"],
      runAt: "document_start",
      world: "MAIN",
      persistAcrossSessions: false
    }]);
  }

  function waitForTabComplete(tabId) {
    return new Promise(resolve => {
      const timer = setTimeout(done, 30000);
      function done() {
        clearTimeout(timer);
        chrome.tabs.onUpdated.removeListener(listener);
        resolve();
      }
      function listener(updatedTabId, changeInfo) {
        if (updatedTabId === tabId && changeInfo.status === "complete") done();
      }
      chrome.tabs.onUpdated.addListener(listener);
    });
  }

  async function startCaptureAndRefresh() {
    const captured = await installCaptureRefreshAndRead();
    if (captured) {
      setStatus(`监听已安装并读取到当前页：${rows.length} 条。`);
    }
  }

  async function getCaptureSnapshot() {
    const [result] = await chrome.scripting.executeScript({
      target: { tabId: activeTabId },
      world: "MAIN",
      func: () => window.__TK_REVIEW_CAPTURE__ || { requests: [] }
    });
    return result && result.result ? result.result : { requests: [] };
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
    if (!payload || !payload.list.length) {
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
    if (!(await refreshActiveTabStatus())) return null;
    await ensureCaptureScript();
    setStatus("正在安装监听并刷新页面，请等待评论列表重新加载...");
    await chrome.tabs.reload(activeTabId);
    await waitForTabComplete(activeTabId);
    setStatus("页面已刷新，正在等待评论接口返回...");
    return await waitForInitialCapture();
  }

  async function waitForInitialCapture() {
    for (let i = 0; i < 40; i++) {
      const captured = await readCapture({ silent: true });
      if (captured) return captured;
      await sleep(500);
    }
    setStatus("没有等到评论接口响应。请确认当前页已显示评论列表，然后再点一次开始抓取。");
    return null;
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
      .filter(item => item.payload && item.payload.list.length);
    if (!candidates.length) return null;
    candidates.sort((a, b) => {
      const aScore = (a.payload.list.length || 0) + (a.payload.nextCursor ? 1000 : 0);
      const bScore = (b.payload.list.length || 0) + (b.payload.nextCursor ? 1000 : 0);
      return bScore - aScore;
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
      if (Array.isArray(data.list) && data.list.some(looksLikeReview)) {
        return {
          list: data.list,
          total: Number(data.total || value.total || 0),
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
    );
  }

  function pick(item, keys) {
    for (const key of keys) {
      if (item && item[key] !== undefined && item[key] !== null) return item[key];
    }
    return "";
  }

  function flattenReview(item) {
    const productInfo = item && item.product_info && typeof item.product_info === "object" ? item.product_info : {};
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
      create_time: formatReviewTime(pick(item, ["create_time", "createTime", "ctime", "review_time"]))
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
    const current = await installCaptureRefreshAndRead();
    if (!current) return;
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

    rows = activePayload.list.map(flattenReview);
    previewRows = rows.slice();
    setProgress(1, pageCount);
    renderPreview();
    let lastSignature = getPayloadSignature(activePayload);
    let completedPages = 1;

    for (let page = startPage + 1; page <= endPage; page++) {
      const progressPage = page - startPage + 1;
      setStatus(`正在抓取第 ${page} 页（${progressPage} / ${pageCount}）...`);
      let payload = await clickNextAndWaitForPayload(lastSignature);

      // Fallback 1: direct API replay using cursor
      if ((!payload || !payload.list.length) && cursor) {
        try {
          const json = await replayRequest(current.request, cursor);
          payload = findReviewPayload(json);
        } catch (e) {}
      }

      // Fallback 2: refresh + navigate back to this page
      if (!payload || !payload.list.length) {
        setStatus(`第 ${page} 页数据为空，刷新后重新导航到该页...`);
        payload = await refreshAndNavigateToPage(page, current.request, savedCursors);
      }

      if (!payload || !payload.list.length) {
        setStatus(`已停止在第 ${page - 1} 页：重试后仍无数据。`);
        break;
      }
      lastSignature = getPayloadSignature(payload);
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
      } catch (e) {}
    }

    // Strategy 2 & 3: refresh and navigate
    setStatus(`第 ${targetPage} 页重试：刷新页面...`);
    if (!(await refreshActiveTabStatus())) return null;
    await ensureCaptureScript();
    await chrome.tabs.reload(activeTabId);
    await waitForTabComplete(activeTabId);

    // Wait for page 1 data
    let p1Payload = null;
    for (let i = 0; i < 40; i++) {
      const snapshot = await getCaptureSnapshot();
      const req = chooseReviewRequest(snapshot.requests || []);
      if (req) {
        const pl = findReviewPayload(req.responseJson || parseJson(req.responseText));
        if (pl && pl.list.length) { p1Payload = pl; break; }
      }
      await sleep(500);
    }
    if (!p1Payload) return null;
    if (targetPage === 1) return p1Payload;

    // Strategy 2: use "..." jump buttons to reach target page quickly.
    // Clicking "..." just shifts the visible page window (no API call).
    // Only clicking the actual page number triggers an API call.
    setStatus(`第 ${targetPage} 页重试：通过分页按钮快速跳转...`);
    const beforeJump = Date.now();
    const jumped = await jumpToPageViaUI(targetPage);
    if (jumped) {
      for (let i = 0; i < 30; i++) {
        await sleep(500);
        const payloads = await getCapturedPayloadsAfter(beforeJump);
        if (payloads.length) return payloads[payloads.length - 1];
      }
      // Timed out waiting for API response after jump
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
    for (let attempt = 0; attempt < 120; attempt++) {
      const [result] = await chrome.scripting.executeScript({
        target: { tabId: activeTabId },
        world: "MAIN",
        args: [targetPage],
        func: (targetPage) => {
          const items = Array.from(document.querySelectorAll(".core-pagination-item"));

          // If target page number is visible, click it
          const targetEl = items.find(el => {
            const n = parseInt((el.textContent || "").trim(), 10);
            const rect = el.getBoundingClientRect();
            return n === targetPage && rect.width > 0;
          });
          if (targetEl) {
            targetEl.click();
            return "clicked";
          }

          // Determine direction
          const nums = items
            .map(el => parseInt((el.textContent || "").trim(), 10))
            .filter(n => Number.isFinite(n) && n > 0);
          if (!nums.length) return "no-items";

          const maxVisible = Math.max(...nums);
          const minVisible = Math.min(...nums);

          if (targetPage > maxVisible) {
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

          if (targetPage < minVisible) {
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
    const [result] = await chrome.scripting.executeScript({
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
      .map(r => findReviewPayload(r.responseJson || parseJson(r.responseText)))
      .filter(payload => payload && payload.list && payload.list.length);
  }

  async function getCapturedPayloads() {
    const [result] = await chrome.scripting.executeScript({
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
    const [result] = await chrome.scripting.executeScript({
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
    const [result] = await chrome.scripting.executeScript({
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
          if (!changed) url.searchParams.set("cursor", cursor);
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
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${text.slice(0, 300)}`);
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
    if (asFetch) setFetching(true);
    try {
      await action();
    } catch (error) {
      setStatus(`错误：${error.message || error}`);
    } finally {
      if (asFetch) setFetching(false);
    }
  }

  els.startCapture.addEventListener("click", () => run(startCaptureAndRefresh));
  els.readCapture.addEventListener("click", () => run(readCapture));
  els.refreshStats.addEventListener("click", () => run(refreshStats));
  els.fetchReviews.addEventListener("click", () => run(fetchPages, true));
  els.downloadCsv.addEventListener("click", downloadExcel);
  els.clearData.addEventListener("click", () => {
    if (isFetching) {
      stopRequested = true;
      els.clearData.disabled = true;
      setStatus("正在停止，等待当前页完成...");
    } else {
      clearData();
    }
  });

  refreshActiveTabStatus();
})();
