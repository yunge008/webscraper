// TK 评论抓取：页面 MAIN world 监听。
// 通过 manifest 在 document_start 注入；旧页面也可由侧栏用 executeScript 补注入。
(function() {
  if (window.__TKR__ && window.__TKR__.version >= 3) return;
  const MAX = 12;
  const state = {
    version: 3,
    installedAt: Date.now(),
    lateInstall: document.readyState !== "loading",
    seq: 0,
    records: [],   // 评论接口：完整请求 + 响应
    network: [],   // 与 review/rating 有关的请求元数据（诊断用）
    errors: []
  };

  function push(list, item, limit) { list.push(item); while (list.length > limit) list.shift(); }
  function absUrl(url) { try { return new URL(String(url), location.href).href; } catch (_) { return String(url || ""); } }
  function bodyText(body) {
    if (body == null) return null;
    if (typeof body === "string") return body;
    if (body instanceof URLSearchParams) return body.toString();
    if (typeof FormData !== "undefined" && body instanceof FormData) return "[FormData]";
    if (body instanceof Blob || body instanceof ArrayBuffer || ArrayBuffer.isView(body)) return "[binary]";
    try { return JSON.stringify(body); } catch (_) { return String(body); }
  }
  function activePage() {
    const el = document.querySelector("[class*='pagination-item-active'], [class*='pagination'] [aria-current='page']");
    const n = el ? parseInt((el.textContent || "").trim(), 10) : 0;
    return Number.isFinite(n) ? n : 0;
  }
  function looksReviewText(text) {
    return /star_level|starLevel|review_text|reviewText|main_review_id|mainReviewId|review_list|reviewList/.test(text);
  }
  function record(meta, status, text) {
    try {
      const relevant = /review|rating|comment/i.test(meta.url);
      if (!relevant && !looksReviewText(text || "")) return;
      push(state.network, { seq: meta.seq, url: meta.url.split("?")[0], method: meta.method, transport: meta.transport, status, bytes: (text || "").length, replay: !!meta.replay, at: Date.now() }, 60);
      // 扩展自己的重放请求直接返回给侧栏，不在页面内保留响应，避免长任务占用页面内存
      if (meta.replay) return;
      if (!looksReviewText(text || "") && !/"(list|reviews)"\s*:\s*\[\s*\]/.test(text || "")) return;
      push(state.records, {
        seq: meta.seq, transport: meta.transport, method: meta.method, url: meta.url,
        headers: meta.headers, body: meta.body, status, responseText: text,
        replay: !!meta.replay, activePage: meta.activePage, at: Date.now()
      }, MAX);
    } catch (error) { push(state.errors, String(error && error.message || error), 10); }
  }

  // ---- fetch ----
  const nativeFetch = window.fetch;
  if (typeof nativeFetch === "function") {
    window.fetch = function(input, init) {
      const meta = { transport: "fetch", seq: ++state.seq, activePage: activePage(), replay: !!(init && init.__tkReplay), headers: {} };
      try {
        meta.url = absUrl(typeof input === "string" || input instanceof URL ? input : input && input.url);
        meta.method = String((init && init.method) || (input && input.method) || "GET").toUpperCase();
        const headers = new Headers((init && init.headers) || (input && input.headers) || undefined);
        headers.forEach((value, name) => { meta.headers[name] = value; });
        meta.body = init && init.body !== undefined ? bodyText(init.body) : null;
      } catch (_) {}
      const bodyPromise = meta.body == null && input instanceof Request && !/^(GET|HEAD)$/.test(meta.method)
        ? input.clone().text().then(text => { meta.body = text; }, () => {}) : Promise.resolve();
      const promise = nativeFetch.apply(this, arguments);
      promise.then(response => {
        try {
          response.clone().text().then(text => bodyPromise.then(() => record(meta, response.status, text)), () => {});
        } catch (_) {}
      }, () => record(meta, 0, ""));
      return promise;
    };
  }

  // ---- XHR ----
  // 每个监听实例用独立的 Symbol 保存请求信息，避免页面上存在多个监听副本时互相覆盖
  const META = Symbol("tkMeta");
  const XHR = XMLHttpRequest.prototype;
  const nativeOpen = XHR.open, nativeSend = XHR.send, nativeSetHeader = XHR.setRequestHeader;
  XHR.open = function(method, url) {
    this[META] = { transport: "xhr", method: String(method || "GET").toUpperCase(), url: absUrl(url), headers: {}, replay: !!this.__tkReplay };
    return nativeOpen.apply(this, arguments);
  };
  XHR.setRequestHeader = function(name, value) {
    if (this[META]) this[META].headers[name] = value;
    return nativeSetHeader.apply(this, arguments);
  };
  XHR.send = function(body) {
    const meta = this[META];
    if (meta) {
      meta.seq = ++state.seq; meta.activePage = activePage(); meta.body = bodyText(body);
      this.addEventListener("loadend", () => {
        let text = "";
        try { text = this.responseType === "" || this.responseType === "text" ? this.responseText : this.responseType === "json" ? JSON.stringify(this.response) : ""; } catch (_) {}
        record(meta, this.status, text);
      });
    }
    return nativeSend.apply(this, arguments);
  };

  // ---- 重放：通过页面自身的 XHR / fetch 发送（页面安全 SDK 如有包装会自动签名） ----
  function replay(spec) {
    const timeout = spec.timeout || 30000;
    if (spec.transport === "fetch") {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeout);
      const init = { method: spec.method, headers: spec.headers || {}, credentials: "include", signal: controller.signal, __tkReplay: true };
      if (spec.body != null && !/^(GET|HEAD)$/.test(spec.method)) init.body = spec.body;
      return window.fetch(spec.url, init).then(r => r.text().then(text => ({ status: r.status, text })))
        .catch(error => ({ status: 0, text: "", error: String(error && error.message || error) }))
        .finally(() => clearTimeout(timer));
    }
    return new Promise(resolve => {
      const xhr = new XMLHttpRequest();
      xhr.__tkReplay = true;
      xhr.open(spec.method, spec.url, true);
      xhr.withCredentials = true;
      xhr.timeout = timeout;
      for (const [name, value] of Object.entries(spec.headers || {})) { try { xhr.setRequestHeader(name, value); } catch (_) {} }
      xhr.onload = () => resolve({ status: xhr.status, text: xhr.responseText });
      xhr.onerror = () => resolve({ status: 0, text: "", error: "网络错误" });
      xhr.ontimeout = () => resolve({ status: 0, text: "", error: "请求超时" });
      xhr.send(spec.body == null || /^(GET|HEAD)$/.test(spec.method) ? null : spec.body);
    });
  }

  // ---- 页面 UI 操作（用于“页面点击”模式和首次学习商品搜索参数） ----
  function visible(el) {
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== "hidden";
  }
  function searchInputs() {
    return Array.from(document.querySelectorAll("input"))
      .filter(el => visible(el) && !el.disabled && !el.readOnly && /^(text|search|tel|number|)$/.test(el.type || "text"))
      .filter(el => !el.closest("[class*='pagination'], [class*='picker'], [class*='date'], [class*='select-view']"))
      .map(el => {
        const label = [el.placeholder, el.getAttribute("aria-label"), el.name, el.id].join(" ");
        let score = 0;
        if (/商品|产品|product|item/i.test(label)) score += 4;
        if (/\bID\b|编号|id/i.test(label)) score += 2;
        if (/搜索|search|查询|keyword|关键/i.test(label)) score += 2;
        if (el.closest("[class*='search']")) score += 1;
        if (/订单|order|用户|user|buyer/i.test(label) && !/商品|产品|product/i.test(label)) score -= 1;
        return { el, score, label: label.trim() };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score);
  }
  function describeInputs() {
    return searchInputs().slice(0, 10).map(item => ({ score: item.score, placeholder: item.el.placeholder || "", name: item.el.name || "", id: item.el.id || "", valueLength: (item.el.value || "").length }));
  }
  function fireEnter(el) {
    for (const type of ["keydown", "keypress", "keyup"]) {
      el.dispatchEvent(new KeyboardEvent(type, { key: "Enter", code: "Enter", keyCode: 13, which: 13, charCode: type === "keypress" ? 13 : 0, bubbles: true, cancelable: true }));
    }
  }
  function searchButtonNear(el) {
    let node = el.parentElement;
    for (let depth = 0; node && depth < 4; depth++, node = node.parentElement) {
      const buttons = Array.from(node.querySelectorAll("button, [class*='search-btn'], [class*='search-button'], [class*='input-search-icon'], [class*='suffix'] svg, [class*='icon-search']"))
        .filter(b => visible(b) && b !== el && (/search|搜索|查询|query/i.test(`${b.className && b.className.baseVal !== undefined ? b.className.baseVal : b.className} ${b.textContent} ${b.getAttribute("aria-label") || ""}`)));
      if (buttons.length) return buttons[0];
    }
    const global = Array.from(document.querySelectorAll("button")).filter(b => visible(b) && /^(搜索|查询|search|query|apply|筛选)$/i.test((b.textContent || "").trim()));
    return global.length === 1 ? global[0] : null;
  }
  // value === null 表示保留当前输入，只重新提交（用于刷新当前筛选的请求）
  function submitSearch(value) {
    const candidates = searchInputs();
    if (!candidates.length) return { ok: false, error: "页面上没有找到商品搜索输入框", inputs: [] };
    const input = candidates[0].el;
    if (value !== null && value !== undefined) {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
      input.focus();
      setter.call(input, "");
      input.dispatchEvent(new Event("input", { bubbles: true }));
      setter.call(input, String(value));
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
    }
    const button = searchButtonNear(input);
    const seq = state.seq;
    setTimeout(() => {
      fireEnter(input);
      // 若回车没有触发请求，再点击搜索按钮
      setTimeout(() => { if (state.seq === seq && button) button.click(); }, 400);
    }, 60);
    return { ok: true, placeholder: input.placeholder || "", hasButton: !!button, valueKept: value == null || input.value === String(value) };
  }
  function paginationInfo() {
    const items = Array.from(document.querySelectorAll("[class*='pagination-item']")).filter(visible);
    const numbers = items.map(el => parseInt((el.textContent || "").trim(), 10)).filter(n => Number.isFinite(n) && n > 0);
    const next = Array.from(document.querySelectorAll("[class*='pagination-item-next'], [class*='pagination-next'], [class*='pagination'] [aria-label='Next'], [class*='pagination'] [aria-label='next page']")).find(visible);
    const disabled = !next || /disabled/i.test(String(next.className)) || next.getAttribute("aria-disabled") === "true" || next.disabled;
    const sizeEl = Array.from(document.querySelectorAll("[class*='pagination'] [class*='select-view-value'], [class*='pagination'] [class*='select'] [class*='value']")).find(visible);
    const sizeMatch = sizeEl ? (sizeEl.textContent || "").match(/(\d+)/) : null;
    return { activePage: activePage(), maxPage: numbers.length ? Math.max(...numbers) : 0, hasNext: !disabled, pageSize: sizeMatch ? Number(sizeMatch[1]) : 0, items: items.length };
  }
  function clickNext() {
    const info = paginationInfo();
    if (!info.hasNext) return { ok: false, error: "没有可点击的下一页按钮" };
    const next = Array.from(document.querySelectorAll("[class*='pagination-item-next'], [class*='pagination-next'], [class*='pagination'] [aria-label='Next'], [class*='pagination'] [aria-label='next page']")).find(visible);
    next.scrollIntoView({ block: "center" });
    next.click();
    return { ok: true, from: info.activePage };
  }
  // 跳到指定页：可见则直接点；有跳页输入框则输入；否则向目标方向点“…”或最接近的页码，
  // 返回 partial=true 表示只前进了一步，侧栏会等响应后再次调用。
  function clickPage(page) {
    const items = Array.from(document.querySelectorAll("[class*='pagination-item']")).filter(visible);
    const numbered = items.map(el => ({ el, n: parseInt((el.textContent || "").trim(), 10) })).filter(x => Number.isFinite(x.n) && x.n > 0 && String(x.n) === (x.el.textContent || "").trim());
    const exact = numbered.find(x => x.n === page);
    if (exact) { exact.el.click(); return { ok: true, via: "item" }; }
    const jumper = Array.from(document.querySelectorAll("[class*='pagination-jumper'] input, [class*='pagination-options'] [class*='jumper'] input")).find(el => visible(el) && !el.readOnly && !el.disabled);
    if (jumper) {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
      jumper.focus(); setter.call(jumper, String(page));
      jumper.dispatchEvent(new Event("input", { bubbles: true }));
      fireEnter(jumper); jumper.blur();
      return { ok: true, via: "jumper" };
    }
    const current = activePage();
    const activeEl = items.find(el => /pagination-item-active/.test(String(el.className)));
    const forward = page > current;
    // “…”省略号（Arco：点击前进/后退 5 页）
    const ellipses = items.filter(el => /jumper|jump-next|jump-prev|ellipsis|more/i.test(String(el.className)) && !/pagination-item-(next|prev)\b/.test(String(el.className)));
    const ellipsis = ellipses.find(el => !activeEl || Boolean(activeEl.compareDocumentPosition(el) & (forward ? Node.DOCUMENT_POSITION_FOLLOWING : Node.DOCUMENT_POSITION_PRECEDING)));
    // 最接近目标、且在当前页与目标页之间的可见页码
    const between = numbered.filter(x => forward ? x.n > current && x.n < page : x.n < current && x.n > page).sort((a, b) => forward ? b.n - a.n : a.n - b.n)[0];
    if (ellipsis && (!between || Math.abs(page - current) > 5)) { ellipsis.click(); return { ok: true, partial: true, via: "ellipsis", from: current }; }
    if (between) { between.el.click(); return { ok: true, partial: true, via: "item-step", to: between.n }; }
    return { ok: false, error: `分页中找不到第 ${page} 页，也无法向其靠近` };
  }

  // 侧栏读取：返回 seq 之后的新记录（可选择是否包含重放）
  function recordsAfter(seq, includeReplay) {
    return state.records.filter(r => r.seq > seq && (includeReplay || !r.replay));
  }
  function latest(includeReplay) {
    for (let i = state.records.length - 1; i >= 0; i--) if (includeReplay || !state.records[i].replay) return state.records[i];
    return null;
  }
  function status() {
    return {
      version: state.version, installedAt: state.installedAt, lateInstall: state.lateInstall, seq: state.seq,
      records: state.records.length, lastRecordSeq: state.records.length ? state.records[state.records.length - 1].seq : 0,
      network: state.network.slice(-15), errors: state.errors.slice(), pagination: paginationInfo(), inputs: describeInputs(),
      href: location.origin + location.pathname, readyState: document.readyState
    };
  }

  window.__TKR__ = { version: 3, state, replay, submitSearch, clickNext, clickPage, paginationInfo, recordsAfter, latest, status };
})();
