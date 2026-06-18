(function() {
  if (window.__TK_REVIEW_CAPTURE_HOOKED__) return;
  window.__TK_REVIEW_CAPTURE_HOOKED__ = true;
  window.__TK_REVIEW_CAPTURE__ = window.__TK_REVIEW_CAPTURE__ || {
    requests: [],
    installedAt: Date.now()
  };

  function safeText(value) {
    if (value === undefined || value === null) return "";
    if (typeof value === "string") return value;
    try {
      return JSON.stringify(value);
    } catch (error) {
      return String(value);
    }
  }

  function hasReviewData(text) {
    return /star_level|review_text|next_cursor|main_review_id/i.test(text || "");
  }

  function store(record) {
    const responseText = safeText(record.responseText);
    if (!hasReviewData(responseText)) return;
    let responseJson = null;
    try {
      responseJson = JSON.parse(responseText);
    } catch (error) {}
    window.__TK_REVIEW_CAPTURE__.requests.push({
      url: record.url || "",
      method: record.method || "GET",
      requestBody: safeText(record.requestBody),
      requestHeaders: record.requestHeaders || {},
      responseText,
      responseJson,
      capturedAt: Date.now()
    });
    if (window.__TK_REVIEW_CAPTURE__.requests.length > 30) {
      window.__TK_REVIEW_CAPTURE__.requests.shift();
    }
  }

  const nativeFetch = window.fetch;
  window.fetch = async function(input, init) {
    const method = (init && init.method) || (input && input.method) || "GET";
    const url = typeof input === "string" ? input : input && input.url;
    const body = init && init.body !== undefined ? init.body : "";
    const response = await nativeFetch.apply(this, arguments);
    try {
      const clone = response.clone();
      clone.text().then(text => store({
        url,
        method,
        requestBody: body,
        responseText: text
      })).catch(() => {});
    } catch (error) {}
    return response;
  };

  const nativeOpen = XMLHttpRequest.prototype.open;
  const nativeSend = XMLHttpRequest.prototype.send;
  const nativeSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;

  XMLHttpRequest.prototype.open = function(method, url) {
    this.__tkReviewRequest = {
      method: method || "GET",
      url: url || "",
      requestHeaders: {}
    };
    return nativeOpen.apply(this, arguments);
  };

  XMLHttpRequest.prototype.setRequestHeader = function(name, value) {
    if (this.__tkReviewRequest) {
      this.__tkReviewRequest.requestHeaders[name] = value;
    }
    return nativeSetRequestHeader.apply(this, arguments);
  };

  XMLHttpRequest.prototype.send = function(body) {
    if (this.__tkReviewRequest) {
      this.__tkReviewRequest.requestBody = body;
      this.addEventListener("load", () => {
        try {
          store(Object.assign({}, this.__tkReviewRequest, {
            responseText: this.responseText
          }));
        } catch (error) {}
      });
    }
    return nativeSend.apply(this, arguments);
  };
})();
