// TK 评论抓取：纯逻辑模块（无 DOM / chrome 依赖，可在 Node 中测试）。
(function(root) {
  "use strict";

  const BIG = "__TKBIG__";

  // 19 位 ID 在 JSON 中若为数字会丢失精度；解析前把 16 位以上的整数转成带标记的字符串。
  function protectBigInts(text) {
    return String(text).replace(/([:\[,]\s*)(-?\d{16,})(?=\s*[,\]}])/g, `$1"${BIG}$2"`);
  }
  function unmarkBig(value) {
    if (typeof value === "string" && value.startsWith(BIG)) return value.slice(BIG.length);
    if (Array.isArray(value)) return value.map(unmarkBig);
    if (value && typeof value === "object") {
      const out = {};
      for (const key of Object.keys(value)) out[key] = unmarkBig(value[key]);
      return out;
    }
    return value;
  }
  // keepMarks=true 时保留标记，用于重新序列化请求体时恢复为原始数字。
  function parseJson(text, keepMarks = false) {
    if (text == null || text === "") return null;
    if (typeof text === "object") return text;
    try {
      const parsed = JSON.parse(protectBigInts(text));
      return keepMarks ? parsed : unmarkBig(parsed);
    } catch (_) { return null; }
  }
  function stringifyJson(value) {
    return JSON.stringify(value).replace(new RegExp(`"${BIG}(-?\\d+)"`, "g"), "$1");
  }

  // ---------- 评论响应解析 ----------
  const LIST_KEYS = ["list", "reviews", "review_list", "reviewList", "review_infos", "reviewInfos", "items", "records"];

  function looksLikeReview(item) {
    return !!item && typeof item === "object" && !Array.isArray(item) && (
      item.star_level !== undefined || item.starLevel !== undefined ||
      item.review_text !== undefined || item.reviewText !== undefined ||
      item.main_review_id !== undefined || item.mainReviewId !== undefined ||
      item.review_id !== undefined || item.reviewId !== undefined ||
      (item.rating !== undefined && (item.content !== undefined || item.comment !== undefined))
    );
  }

  function numberOrNull(value) {
    if (value === undefined || value === null || String(value).trim() === "") return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }

  function findReviewPayload(root) {
    const seen = new Set();
    const queue = [{ value: root, depth: 0 }];
    while (queue.length) {
      const { value, depth } = queue.shift();
      if (!value || depth > 8) continue;
      if (typeof value === "string") {
        if (/^\s*[\[{]/.test(value)) { const parsed = parseJson(value); if (parsed) queue.push({ value: parsed, depth: depth + 1 }); }
        continue;
      }
      if (typeof value !== "object" || seen.has(value)) continue;
      seen.add(value);
      if (!Array.isArray(value)) {
        const key = LIST_KEYS.find(k => Array.isArray(value[k]) && value[k].some(looksLikeReview));
        const total = numberOrNull(value.total ?? value.total_count ?? value.totalCount ?? value.total_num);
        const emptyKey = LIST_KEYS.find(k => Array.isArray(value[k]) && value[k].length === 0);
        if (key || (emptyKey && total !== null && depth <= 3)) {
          const hasMore = value.has_more ?? value.hasMore ?? value.has_next ?? value.hasNext;
          return {
            list: value[key || emptyKey],
            total,
            nextCursor: String(value.next_cursor ?? value.nextCursor ?? value.cursor ?? ""),
            hasMore: hasMore === undefined || hasMore === null ? null : !!hasMore
          };
        }
      }
      const children = Array.isArray(value) ? value : Object.values(value);
      for (const child of children) if (child && (typeof child === "object" || typeof child === "string")) queue.push({ value: child, depth: depth + 1 });
    }
    return null;
  }

  // 响应顶层的业务错误码（例如 code != 0）
  function apiError(json) {
    if (!json || typeof json !== "object") return "";
    const code = json.code ?? json.status_code ?? json.statusCode;
    if (code !== undefined && code !== null && Number(code) !== 0 && !findReviewPayload(json)) {
      return `接口返回错误 code=${code}${json.message || json.msg ? `：${json.message || json.msg}` : ""}`;
    }
    return "";
  }

  // ---------- 评价图 ----------
  const SKIP_KEY = /product|sku|avatar|head_?img|portrait|profile|logo|icon|seller|shop|reply|replies|video|audio|cover/i;
  const IMAGE_KEY = /image|img|photo|pic|picture|media|attach|album/i;
  const THUMB_KEY = /thumb|small|preview|low|tiny/i;
  const ORIGIN_KEY = /origin|original|large|full|raw|hd|big/i;

  function isHttpUrl(value) { return typeof value === "string" && /^https?:\/\/[^\s]+$/i.test(value.trim()); }
  function looksLikeImageUrl(url) {
    return /\.(jpe?g|png|webp|gif|heic|heif|bmp|avif|image)(?:[?~#]|$)/i.test(url) || /~tplv-|\/obj\/|\/img\/|image|photo|tos-/i.test(url);
  }
  function isVideoUrl(url) { return /\.(mp4|webm|mov|m4v|m3u8|mp3|wav|aac)(?:[?#]|$)/i.test(url) || /video/i.test(url.split("?")[0]); }

  // 从一个“图片对象”中挑选一个 URL：url_list 等多个 CDN 镜像只取第一个；有原图字段时优先原图。
  function pickFromImageObject(obj) {
    const entries = Object.entries(obj);
    const urlOf = value => {
      if (isHttpUrl(value)) return value.trim();
      if (Array.isArray(value)) { const hit = value.find(isHttpUrl); return hit ? hit.trim() : ""; }
      if (value && typeof value === "object") {
        for (const k of ["url_list", "urlList", "url", "src", "uri"]) { const u = urlOf(value[k]); if (u) return u; }
      }
      return "";
    };
    let original = "", normal = "", thumb = "";
    for (const [key, value] of entries) {
      if (/video|audio/i.test(key)) continue;
      const u = urlOf(value);
      if (!u || isVideoUrl(u)) continue;
      if (ORIGIN_KEY.test(key) && !original) original = u;
      else if (THUMB_KEY.test(key)) { if (!thumb) thumb = u; }
      else if (!normal) normal = u;
    }
    const url = original || normal || thumb;
    return url ? { url, thumbnail: thumb && thumb !== url ? thumb : "" } : null;
  }

  function extractImages(review) {
    const images = [];
    const seen = new Set();
    const sources = new Set();
    function add(img, path) {
      if (!img || !img.url || seen.has(img.url)) return;
      seen.add(img.url); sources.add(path.replace(/\.\d+/g, "[]"));
      images.push({ url: img.url, thumbnail: img.thumbnail || "", source: path });
    }
    function walk(value, path, inImageField, depth) {
      if (value == null || depth > 7) return;
      if (typeof value === "string") {
        if (isHttpUrl(value) && !isVideoUrl(value) && (inImageField || looksLikeImageUrl(value))) add({ url: value.trim() }, path);
        return;
      }
      if (Array.isArray(value)) {
        value.forEach((item, i) => walk(item, `${path}.${i}`, inImageField, depth + 1));
        return;
      }
      if (typeof value !== "object") return;
      const type = String(value.media_type ?? value.mediaType ?? value.type ?? "").toLowerCase();
      if (/video|audio/.test(type) || value.video_url || value.videoUrl) return;
      // 形如 {url_list:[...]} / {thumb_url:..., origin_url:...} 的图片对象
      const hasUrlChild = Object.entries(value).some(([k, v]) => !SKIP_KEY.test(k) && (isHttpUrl(v) || (Array.isArray(v) && v.some(isHttpUrl))));
      if (hasUrlChild && (inImageField || /^(image|photo|picture|img|pic)$/.test(type))) {
        add(pickFromImageObject(value), path);
        return;
      }
      for (const [key, child] of Object.entries(value)) {
        if (SKIP_KEY.test(key)) continue;
        walk(child, path ? `${path}.${key}` : key, inImageField || IMAGE_KEY.test(key), depth + 1);
      }
    }
    walk(review, "", false, 0);
    return { images, sources: [...sources] };
  }

  // ---------- 评论行 ----------
  function pick(item, keys) {
    if (!item || typeof item !== "object") return "";
    for (const key of keys) if (item[key] !== undefined && item[key] !== null && item[key] !== "") return item[key];
    return "";
  }
  function formatReviewTime(value) {
    if (value === undefined || value === null || value === "") return "";
    const text = String(value).trim();
    if (!/^\d+$/.test(text)) return text;
    const number = Number(text);
    if (!Number.isFinite(number) || number <= 0) return text;
    const date = new Date(number > 100000000000 ? number : number * 1000);
    if (Number.isNaN(date.getTime())) return text;
    const pad = n => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }
  function textOf(value) {
    if (value === undefined || value === null) return "";
    if (typeof value === "object") {
      if (Array.isArray(value)) return value.map(textOf).filter(Boolean).join("\n");
      return textOf(pick(value, ["text", "content", "reply_text", "replyText", "value", "name"]));
    }
    return String(value);
  }

  function flattenReview(item) {
    const pinfo = item && typeof (item.product_info || item.productInfo) === "object" ? (item.product_info || item.productInfo) : {};
    const sinfo = item && typeof (item.sku_info || item.skuInfo) === "object" ? (item.sku_info || item.skuInfo) : {};
    const uinfo = item && typeof (item.user_info || item.userInfo || item.buyer_info || item.buyerInfo) === "object" ? (item.user_info || item.userInfo || item.buyer_info || item.buyerInfo) : {};
    const media = extractImages(item);
    const reply = pick(item, ["reply_text", "replyText", "seller_reply", "sellerReply", "reply"]);
    return {
      star_level: pick(item, ["star_level", "starLevel", "rating", "star"]),
      review_text: textOf(pick(item, ["review_text", "reviewText", "content", "comment", "text"])),
      reply_text: textOf(reply),
      reply_count: pick(item, ["reply_count", "replyCount"]),
      main_review_id: String(pick(item, ["main_review_id", "mainReviewId", "review_id", "reviewId", "id"])),
      order_id: String(pick(item, ["order_id", "orderId", "main_order_id", "mainOrderId"])),
      product_id: String(pick(pinfo, ["product_id", "productId", "id"]) || pick(item, ["product_id", "productId"])),
      product_name: textOf(pick(pinfo, ["product_name", "productName", "name", "title"]) || pick(item, ["product_name", "productName"])),
      sku_id: String(pick(pinfo, ["sku_id", "skuId"]) || pick(sinfo, ["sku_id", "skuId", "id"]) || pick(item, ["sku_id", "skuId"])),
      sku_specification: textOf(pick(pinfo, ["sku_specification", "skuSpecification", "sku_name", "skuName"]) || pick(sinfo, ["sku_specification", "skuSpecification", "sku_name", "skuName", "name"]) || pick(item, ["sku_specification", "skuSpecification", "sku_name", "skuName"])),
      user_name: textOf(pick(item, ["user_name", "userName", "buyer_name", "buyerName", "display_name", "nick_name", "nickname"]) || pick(uinfo, ["user_name", "userName", "nick_name", "nickname", "name", "display_name"])),
      create_time: formatReviewTime(pick(item, ["create_time", "createTime", "review_time", "reviewTime", "ctime"])),
      review_image_count: media.images.length,
      review_image_urls: media.images.map(image => image.url).join("\n"),
      review_images: media.images
    };
  }

  function rowKey(row) {
    if (row.main_review_id) return `r:${row.main_review_id}`;
    return `h:${[row.order_id, row.product_id, row.sku_id, row.user_name, row.create_time, row.review_text].join("|")}`;
  }
  function rowMatchesProduct(row, id) {
    return !id || String(row.product_id) === String(id) || String(row.sku_id) === String(id);
  }
  function payloadSignature(rows) {
    return rows.map(rowKey).join(",");
  }

  // ---------- 请求模板：解析、分页参数、商品参数 ----------
  const PAGE_KEYS = /^(page|pageno|pagenum|pagenumber|pageindex|currentpage|current|pn|pageidx)$/;
  const SIZE_KEYS = /^(pagesize|size|limit|perpage|pagecount|count|ps|pagelimit)$/;
  const CURSOR_KEYS = /^(cursor|nextcursor|pagetoken|searchafter|lastid|scrollid)$/;
  const OFFSET_KEYS = /^(offset|start|startindex|from)$/;
  const SIGN_PARAMS = /^(x-bogus|x-gnarly|_signature|a_bogus|msToken|x-tt-params)$/i;
  const SIGN_HEADERS = /^(x-bogus|x-gnarly|x-ss-stub|x-khronos|x-argus|x-ladon|x-gorgon|x-tt-params|x-ss-req-ticket)$/i;
  const norm = key => String(key).replace(/[_\-\s]/g, "").toLowerCase();

  function parseRequest(req) {
    const url = new URL(req.url, "https://placeholder.invalid/");
    const q = [];
    for (const [k, v] of url.searchParams.entries()) {
      const json = /^\s*[\[{]/.test(v) ? parseJson(v, true) : null;
      q.push({ k, v: json !== null ? json : v, json: json !== null });
    }
    let bodyKind = "none", b = null;
    const raw = req.body == null ? "" : String(req.body);
    if (raw) {
      const json = parseJson(raw, true);
      if (json !== null && typeof json === "object") { bodyKind = "json"; b = json; }
      else if (/^[^=&\s]+=[^&]*(&[^=&\s]+=[^&]*)*$/.test(raw)) {
        bodyKind = "form"; b = [];
        for (const [k, v] of new URLSearchParams(raw).entries()) {
          const inner = /^\s*[\[{]/.test(v) ? parseJson(v, true) : null;
          b.push({ k, v: inner !== null ? inner : v, json: inner !== null });
        }
      } else { bodyKind = "text"; b = raw; }
    }
    return { url, q, bodyKind, b, method: (req.method || "GET").toUpperCase() };
  }

  // 列出所有叶子：path 形如 ["q", 0, "filter", "product_id"] / ["b", "page"]
  function leaves(tree) {
    const out = [];
    function walk(value, path, key, depth) {
      if (depth > 10) return;
      if (value && typeof value === "object") {
        if (Array.isArray(value) && value.every(v => v === null || typeof v !== "object")) { out.push({ path, key, value, array: true }); return; }
        for (const [k, v] of Object.entries(value)) walk(v, path.concat(Array.isArray(value) ? Number(k) : k), Array.isArray(value) ? key : k, depth + 1);
        return;
      }
      out.push({ path, key, value });
    }
    tree.q.forEach((entry, i) => entry.json ? walk(entry.v, ["q", i, "v"], entry.k, 0) : out.push({ path: ["q", i, "v"], key: entry.k, value: entry.v }));
    if (tree.bodyKind === "json") walk(tree.b, ["b"], "", 0);
    if (tree.bodyKind === "form") tree.b.forEach((entry, i) => entry.json ? walk(entry.v, ["b", i, "v"], entry.k, 0) : out.push({ path: ["b", i, "v"], key: entry.k, value: entry.v }));
    return out;
  }
  function leafValue(value) { return typeof value === "string" && value.startsWith(BIG) ? value.slice(BIG.length) : value; }

  function getPath(tree, path) {
    let node = path[0] === "q" ? tree.q : tree.b;
    for (const part of path.slice(1)) { if (node == null) return undefined; node = node[part]; }
    return node;
  }
  function setPath(tree, path, value) {
    if (path.length === 1) { tree.b = value; return; }
    let node = path[0] === "q" ? tree.q : tree.b;
    for (const part of path.slice(1, -1)) node = node[part];
    node[path[path.length - 1]] = value;
  }
  // 保持原值类型写入
  function typed(original, value) {
    const text = String(value);
    if (typeof original === "number") return /^\d{16,}$/.test(text) ? BIG + text : Number(text);
    if (typeof original === "string" && original.startsWith(BIG)) return BIG + text;
    return text;
  }

  function analyzeTemplate(req, context = {}) {
    const tree = parseRequest(req);
    const all = leaves(tree);
    const find = re => all.filter(leaf => !leaf.array && re.test(norm(leaf.key)) && /^-?\d+$/.test(String(leafValue(leaf.value))));
    const pageLeaf = find(PAGE_KEYS)[0] || null;
    const sizeLeaf = find(SIZE_KEYS)[0] || null;
    const offsetLeaf = find(OFFSET_KEYS)[0] || null;
    const cursorLeaf = all.find(leaf => !leaf.array && CURSOR_KEYS.test(norm(leaf.key))) || null;
    const pagination = { kind: "", pagePath: null, pageBase: 1, sizePath: null, pageSize: 0, offsetPath: null, cursorPath: null };
    if (sizeLeaf) { pagination.sizePath = sizeLeaf.path; pagination.pageSize = Number(leafValue(sizeLeaf.value)); }
    if (pageLeaf) {
      pagination.kind = "page"; pagination.pagePath = pageLeaf.path;
      const value = Number(leafValue(pageLeaf.value));
      // 页码为 0 视为从 0 开始；若提供了抓包时页面所在页，用它推断。
      if (value === 0) pagination.pageBase = 0;
      else if (context.activePage && value === context.activePage - 1) pagination.pageBase = 0;
    } else if (offsetLeaf) { pagination.kind = "offset"; pagination.offsetPath = offsetLeaf.path; }
    if (cursorLeaf) { pagination.cursorPath = cursorLeaf.path; if (!pagination.kind) pagination.kind = "cursor"; }
    return { tree, pagination, leaves: all };
  }

  // 在请求中查找值等于某 ID 的参数路径（用于学习“商品搜索”参数）
  function findValuePaths(req, id) {
    const tree = parseRequest(req);
    return leaves(tree).filter(leaf => {
      if (leaf.array) return leaf.value.some(v => String(leafValue(v)).trim() === String(id));
      return String(leafValue(leaf.value)).trim() === String(id);
    }).map(leaf => ({ path: leaf.path, key: leaf.key, array: !!leaf.array }));
  }
  function pathKey(path) { return JSON.stringify(path); }
  function hasPath(req, path) {
    try { return getPath(parseRequest(req), path) !== undefined; } catch (_) { return false; }
  }

  function serialize(tree, base, options = {}) {
    const url = new URL(tree.url.href);
    const params = new URLSearchParams();
    for (const entry of tree.q) {
      if (options.stripSign && SIGN_PARAMS.test(entry.k)) continue;
      params.append(entry.k, entry.json ? stringifyJson(entry.v) : String(leafValue(entry.v)));
    }
    url.search = params.toString();
    let body = null;
    if (tree.bodyKind === "json") body = stringifyJson(tree.b);
    else if (tree.bodyKind === "form") {
      const form = new URLSearchParams();
      for (const entry of tree.b) form.append(entry.k, entry.json ? stringifyJson(entry.v) : String(leafValue(entry.v)));
      body = form.toString();
    } else if (tree.bodyKind === "text") body = tree.b;
    const href = url.href.startsWith("https://placeholder.invalid/") ? url.href.slice("https://placeholder.invalid".length) : url.href;
    return { url: href, body };
  }

  // 生成指定页 / 商品的请求
  function buildRequest(template, pagination, options = {}) {
    const tree = parseRequest(template);
    const page = options.page || 1;
    const size = options.pageSize || pagination.pageSize || 0;
    if (pagination.sizePath && options.pageSize) setPath(tree, pagination.sizePath, typed(getPath(tree, pagination.sizePath), options.pageSize));
    if (pagination.pagePath) setPath(tree, pagination.pagePath, typed(getPath(tree, pagination.pagePath), page - 1 + pagination.pageBase));
    if (pagination.offsetPath) setPath(tree, pagination.offsetPath, typed(getPath(tree, pagination.offsetPath), (page - 1) * size));
    if (pagination.cursorPath && options.cursor !== undefined) setPath(tree, pagination.cursorPath, typed(getPath(tree, pagination.cursorPath), options.cursor));
    if (options.productPath && options.productId) {
      const current = getPath(tree, options.productPath);
      if (Array.isArray(current)) setPath(tree, options.productPath, [typed(current[0] === undefined ? "" : current[0], options.productId)]);
      else setPath(tree, options.productPath, typed(current, options.productId));
    }
    const out = serialize(tree, template.url, { stripSign: options.stripSign });
    const headers = {};
    for (const [name, value] of Object.entries(template.headers || {})) {
      if (options.stripSign && SIGN_HEADERS.test(name)) continue;
      headers[name] = value;
    }
    return { transport: template.transport || "xhr", method: tree.method, url: out.url, body: tree.method === "GET" || tree.method === "HEAD" ? null : out.body, headers };
  }

  function describeTemplate(req, context) {
    const { pagination, leaves: all } = analyzeTemplate(req, context);
    let endpoint = "";
    try { const u = new URL(req.url, "https://placeholder.invalid/"); endpoint = u.pathname; } catch (_) {}
    return {
      endpoint, method: req.method, transport: req.transport,
      params: all.map(leaf => `${leaf.path[0] === "q" ? "query" : "body"}:${leaf.path.filter(p => typeof p === "string" && p !== "q" && p !== "b" && p !== "v").join(".") || leaf.key}`).slice(0, 60),
      pagination: { kind: pagination.kind || "未识别", pageKey: pagination.pagePath ? pagination.pagePath.join(".") : "", pageBase: pagination.pageBase, pageSize: pagination.pageSize, sizeKey: pagination.sizePath ? pagination.sizePath.join(".") : "", cursorKey: pagination.cursorPath ? pagination.cursorPath.join(".") : "", offsetKey: pagination.offsetPath ? pagination.offsetPath.join(".") : "" }
    };
  }

  // 响应结构（只含字段名与类型，不含值），用于诊断
  function shape(value, depth = 0) {
    if (depth > 6) return "…";
    if (Array.isArray(value)) return value.length ? [shape(value[0], depth + 1), `len=${value.length}`] : [];
    if (value && typeof value === "object") return Object.fromEntries(Object.keys(value).slice(0, 40).map(k => [k, shape(value[k], depth + 1)]));
    if (typeof value === "string" && isHttpUrl(value)) { try { const u = new URL(value); return `url(${u.host})`; } catch (_) { return "url"; } }
    return typeof value;
  }

  // ---------- 导出 ----------
  const OUTPUT_COLUMNS = [
    ["target_id", "采集商品 ID"],
    ["star_level", "星级"],
    ["review_text", "评论内容"],
    ["reply_text", "回复内容"],
    ["reply_count", "回复数"],
    ["main_review_id", "评论 ID"],
    ["order_id", "订单 ID"],
    ["product_id", "商品 ID"],
    ["product_name", "商品名称"],
    ["sku_id", "SKU ID"],
    ["sku_specification", "SKU 规格"],
    ["user_name", "用户名"],
    ["create_time", "评论时间"],
    ["review_image_count", "评价图数量"],
    ["review_image_urls", "评价图链接"],
    ["page", "所在页"]
  ];
  const TEXT_COLUMNS = new Set(["target_id", "main_review_id", "order_id", "product_id", "sku_id", "review_text", "reply_text", "product_name", "sku_specification", "user_name", "review_image_urls", "create_time"]);
  function cellValue(key, value) {
    if (value === undefined || value === null) return "";
    if (TEXT_COLUMNS.has(key)) { const text = String(value); return text.length > 32000 ? text.slice(0, 32000) + "…" : text; }
    const n = Number(value);
    return value !== "" && Number.isFinite(n) ? n : String(value);
  }
  function exportAoa(records) {
    const aoa = [OUTPUT_COLUMNS.map(([, label]) => label)];
    for (const record of records) aoa.push(OUTPUT_COLUMNS.map(([key]) => cellValue(key, key === "target_id" ? record.targetId : key === "page" ? record.page : record.row[key])));
    return aoa;
  }

  const api = {
    parseJson, stringifyJson, findReviewPayload, looksLikeReview, apiError, extractImages, flattenReview, formatReviewTime,
    rowKey, rowMatchesProduct, payloadSignature, parseRequest, analyzeTemplate, findValuePaths, hasPath, pathKey, buildRequest,
    describeTemplate, shape, exportAoa, OUTPUT_COLUMNS, TEXT_COLUMNS
  };
  root.TKCore = api;
  if (typeof module === "object" && module.exports) module.exports = api;
})(typeof globalThis === "object" ? globalThis : this);
