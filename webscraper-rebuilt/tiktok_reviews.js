(function() {
  const els = {
    startCapture: document.getElementById("startCapture"),
    readCapture: document.getElementById("readCapture"),
    pageCount: document.getElementById("pageCount"),
    fetchReviews: document.getElementById("fetchReviews"),
    downloadCsv: document.getElementById("downloadCsv"),
    clearData: document.getElementById("clearData"),
    progress: document.getElementById("progress"),
    status: document.getElementById("status"),
    pageStatus: document.getElementById("pageStatus"),
    rowCount: document.getElementById("rowCount"),
    nextCursor: document.getElementById("nextCursor"),
    previewBody: document.getElementById("previewBody")
  };

  const captureScriptId = "tk-review-capture-hook";
  const ratingPageMatch = "https://seller.tiktokshopglobalselling.com/product/rating*";
  let activeTabId = 0;
  let rows = [];
  let capturedRequest = null;
  let capturedPayload = null;

  function setStatus(text) {
    els.status.textContent = text;
  }

  function setProgress(done, max) {
    els.progress.max = Math.max(max || 100, 1);
    els.progress.value = Math.max(done || 0, 0);
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
      els.pageStatus.textContent = "No active tab found.";
      return false;
    }
    if (!isTikTokRatingUrl(tab.url)) {
      els.pageStatus.textContent = `Open TikTok rating page first: ${tab.url || ""}`;
      return false;
    }
    els.pageStatus.textContent = `Current page OK: ${tab.url}`;
    return true;
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
    if (!(await refreshActiveTabStatus())) return;
    await ensureCaptureScript();
    setStatus("Capture installed. Refreshing page, then waiting for TikTok requests...");
    await chrome.tabs.reload(activeTabId);
    await waitForTabComplete(activeTabId);
    setStatus("Page refreshed. Wait a few seconds for reviews to load, then click Read Captured Data.");
  }

  async function readCapture() {
    if (!(await refreshActiveTabStatus())) return null;
    const [result] = await chrome.scripting.executeScript({
      target: { tabId: activeTabId },
      world: "MAIN",
      func: () => window.__TK_REVIEW_CAPTURE__ || { requests: [] }
    });
    const capture = result && result.result ? result.result : { requests: [] };
    const request = chooseReviewRequest(capture.requests || []);
    if (!request) {
      setStatus("No captured review API response yet. Click Install Capture & Refresh, wait for page reviews, then retry.");
      return null;
    }
    const payload = findReviewPayload(request.responseJson || parseJson(request.responseText));
    if (!payload || !payload.list.length) {
      setStatus("Captured a response, but no review list was found in it.");
      return null;
    }
    capturedRequest = request;
    capturedPayload = payload;
    rows = payload.list.map(flattenReview);
    renderPreview();
    els.nextCursor.textContent = payload.nextCursor ? `next_cursor: ${payload.nextCursor}` : "";
    setProgress(1, 1);
    setStatus(`Captured page data: ${rows.length} rows${payload.total ? `, total ${payload.total}` : ""}.`);
    return { request, payload };
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
    return {
      star_level: pick(item, ["star_level", "starLevel", "rating"]),
      review_text: pick(item, ["review_text", "reviewText", "content"]),
      reply_text: pick(item, ["reply_text", "replyText"]),
      reply_count: pick(item, ["reply_count", "replyCount"]),
      main_review_id: pick(item, ["main_review_id", "mainReviewId", "review_id", "reviewId"]),
      order_id: pick(item, ["order_id", "orderId"]),
      product_id: pick(item, ["product_id", "productId"]),
      user_name: pick(item, ["user_name", "userName", "buyer_name", "buyerName", "display_name"]),
      create_time: pick(item, ["create_time", "createTime", "ctime", "review_time"])
    };
  }

  async function fetchPages() {
    const current = capturedRequest && capturedPayload ? { request: capturedRequest, payload: capturedPayload } : await readCapture();
    if (!current) return;
    const pageCount = Math.max(1, parseInt(els.pageCount.value, 10) || 1);

    rows = current.payload.list.map(flattenReview);
    let cursor = current.payload.nextCursor || "";
    setProgress(1, pageCount);
    renderPreview();

    for (let page = 2; page <= pageCount; page++) {
      if (!cursor) break;
      setStatus(`Fetching page ${page} / ${pageCount}...`);
      const json = await replayRequest(current.request, cursor);
      const payload = findReviewPayload(json);
      if (!payload || !payload.list.length) break;
      rows.push(...payload.list.map(flattenReview));
      cursor = payload.nextCursor || "";
      els.nextCursor.textContent = cursor ? `next_cursor: ${cursor}` : "";
      setProgress(page, pageCount);
      renderPreview();
    }

    setStatus(`Done. Fetched ${rows.length} rows from up to ${pageCount} page(s).`);
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
    if (!result) throw new Error("No replay result.");
    if (result.error) throw new Error(result.error.message || String(result.error));
    return result.result;
  }

  function renderPreview() {
    els.previewBody.textContent = "";
    for (const row of rows.slice(0, 100)) {
      const tr = document.createElement("tr");
      for (const key of ["star_level", "review_text", "reply_text", "reply_count", "main_review_id", "order_id", "product_id", "user_name", "create_time"]) {
        const td = document.createElement("td");
        td.textContent = row[key] === undefined || row[key] === null ? "" : String(row[key]);
        td.title = td.textContent;
        tr.appendChild(td);
      }
      els.previewBody.appendChild(tr);
    }
    els.rowCount.textContent = `${rows.length} rows`;
    els.downloadCsv.disabled = rows.length === 0;
  }

  function csvEscape(value) {
    const text = value === undefined || value === null ? "" : String(value);
    return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  }

  function downloadCsv() {
    const columns = ["star_level", "review_text", "reply_text", "reply_count", "main_review_id", "order_id", "product_id", "user_name", "create_time"];
    const lines = [columns.join(",")];
    for (const row of rows) lines.push(columns.map(column => csvEscape(row[column])).join(","));
    const blob = new Blob([`\uFEFF${lines.join("\r\n")}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tk-shop-reviews-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function clearData() {
    rows = [];
    capturedRequest = null;
    capturedPayload = null;
    els.nextCursor.textContent = "";
    setProgress(0, 100);
    renderPreview();
    setStatus("Cleared.");
  }

  async function run(action) {
    try {
      await action();
    } catch (error) {
      setStatus(`Error: ${error.message || error}`);
    }
  }

  els.startCapture.addEventListener("click", () => run(startCaptureAndRefresh));
  els.readCapture.addEventListener("click", () => run(readCapture));
  els.fetchReviews.addEventListener("click", () => run(fetchPages));
  els.downloadCsv.addEventListener("click", downloadCsv);
  els.clearData.addEventListener("click", clearData);

  refreshActiveTabStatus();
})();
