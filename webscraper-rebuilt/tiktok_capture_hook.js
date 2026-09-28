(function() {
  if (window.__TK_REVIEW_CAPTURE_HOOKED__) return;
  const capture = window.__TK_REVIEW_CAPTURE__ = { requests: [], network: [], schemas: [], storeErrors: [], sequence: 0, installedAt: Date.now() };
  function shape(value, depth = 0) {
    if (depth > 6) return "…";
    if (Array.isArray(value)) return { length: value.length, item: shape(value[0], depth + 1) };
    if (!value || typeof value !== "object") return typeof value;
    return Object.fromEntries(Object.keys(value).slice(0, 35).map(key => [key, shape(value[key], depth + 1)]));
  }
  function safeText(value) {
    if (value == null) return "";
    if (typeof value === "string") return value;
    try { return JSON.stringify(value); } catch (_) { return ""; }
  }
  function append(list, value, limit) { list.push(value); if (list.length > limit) list.shift(); }
  function store(record) {
    try {
      const text = safeText(record.responseText);
      const relevant = /review|rating/i.test(record.url || "");
      if (relevant) {
        let url;
        try { const parsed = new URL(record.url, location.href); url = parsed.origin + parsed.pathname; }
        catch (_) { url = "<无URL>"; }
        append(capture.network, { url, transport: record.transport, status: record.status, error: record.error || "", bytes: text.length, at: Date.now() }, 50);
      }
      if (!/star_level|review_text|main_review_id|starLevel|reviewText|mainReviewId|review_list|reviewList/i.test(text) && !relevant) return;
      let json = null;
      try { json = JSON.parse(text); } catch (_) {}
      if (relevant) {
        let body = null; try { body = JSON.parse(safeText(record.requestBody)); } catch (_) {}
        let url = "<无URL>"; try { const parsed = new URL(record.url, location.href); url = parsed.origin + parsed.pathname; } catch (_) {}
        append(capture.schemas, { url, status: record.status, sequence: record.sequence, at: Date.now(), response: shape(json), requestBody: shape(body) }, 6);
      }
      append(capture.requests, {
        url: String(record.url || ""), method: record.method || "GET",
        requestBody: safeText(record.requestBody), requestHeaders: record.requestHeaders || {},
        status: record.status, responseText: text, responseJson: json, capturedAt: Date.now(),
        sequence: record.sequence, navigationPage: record.navigationPage || 0
      }, 30);
    } catch (error) { append(capture.storeErrors, { at: Date.now(), type: error && error.name || "Error" }, 6); }
  }
  const nativeFetch = window.fetch;
  window.fetch = async function(input, init) {
    const record = { transport: "fetch", method: (init && init.method) || (input && input.method) || "GET" };
    record.sequence = ++capture.sequence;
    record.navigationPage = window.__TK_REVIEW_EXPECT_PAGE__ && window.__TK_REVIEW_EXPECT_PAGE__.page || 0;
    try {
      record.url = typeof input === "string" || input instanceof URL ? String(input) : input && input.url;
      record.requestHeaders = Object.fromEntries(new Headers(init && init.headers !== undefined ? init.headers : input && input.headers));
      if (init && init.body !== undefined) record.requestBody = safeText(init.body);
      else if (input instanceof Request && !/^(GET|HEAD)$/i.test(record.method)) {
        input.clone().text().then(body => { record.requestBody = body; }).catch(() => {});
      }
    } catch (_) {}
    let response;
    try { response = await nativeFetch.apply(this, arguments); }
    catch (error) { store({ ...record, status: 0, error: "fetch 网络失败" }); throw error; }
    try {
      response.clone().text().then(text => store({ ...record, status: response.status, responseText: text }))
        .catch(() => store({ ...record, status: response.status, error: "响应读取失败" }));
    } catch (_) {}
    return response;
  };
  const nativeOpen = XMLHttpRequest.prototype.open;
  const nativeSend = XMLHttpRequest.prototype.send;
  const nativeSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;
  XMLHttpRequest.prototype.open = function(method, url) {
    const result = nativeOpen.apply(this, arguments);
    this.__tkReviewRequest = { transport: "xhr", method: method || "GET", url: String(url || ""), requestHeaders: {} };
    return result;
  };
  XMLHttpRequest.prototype.setRequestHeader = function(name, value) {
    const result = nativeSetRequestHeader.apply(this, arguments);
    if (this.__tkReviewRequest) this.__tkReviewRequest.requestHeaders[name] = value;
    return result;
  };
  XMLHttpRequest.prototype.send = function(body) {
    const record = this.__tkReviewRequest;
    if (record) {
      record.sequence = ++capture.sequence;
      record.navigationPage = window.__TK_REVIEW_EXPECT_PAGE__ && window.__TK_REVIEW_EXPECT_PAGE__.page || 0;
      record.requestBody = safeText(body);
      const completed = () => {
        this.removeEventListener("loadend", completed);
        try {
          store({ ...record, status: this.status,
            responseText: this.responseType === "json" ? safeText(this.response) : this.responseText });
        } catch (_) { store({ ...record, status: this.status, error: "XHR 响应读取失败" }); }
      };
      this.addEventListener("loadend", completed);
    }
    return nativeSend.apply(this, arguments);
  };
  window.__TK_REVIEW_CAPTURE_HOOKED__ = true;
})();
