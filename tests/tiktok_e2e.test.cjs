// 端到端：在 Chromium 中加载真实扩展，用模拟的 TikTok 评价页验证整条采集链路。
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { chromium } = require("playwright");
const XLSX = require("../webscraper-rebuilt/sheetjs-0.20.3.min.js");

const extensionPath = path.join(__dirname, "../webscraper-rebuilt");
const chromePath = ["/opt/pw-browsers/chromium-1194/chrome-linux/chrome", process.env.CHROME_PATH].find(p => p && fs.existsSync(p));
// TK_SELLER=https://seller-mx.tiktok.com 可验证墨西哥等使用 tiktok.com 域名的站点
const SELLER = process.env.TK_SELLER || "https://seller-us.tiktokshop.com";
const RATING = `${SELLER}/product/rating?shop_region=US`;
const P = { A: "1731892023085009910", B: "1731892023085009911", C: "1731892023085009912", D: "1731892023085009999" };

// ---- 模拟数据：A 130 条，B 0 条，C 45 条，另有其他商品 60 条 ----
function makeReviews() {
  const reviews = [];
  const add = (product, count) => {
    for (let i = 0; i < count; i++) {
      const n = reviews.length;
      reviews.push({ id: (7400000000000000000n + BigInt(n)).toString(), product, sku: (1729000000000000000n + BigInt(n % 3)).toString(), day: 1 + (n % 28), images: n % 4 === 0 ? 2 : 0 });
    }
  };
  add(P.A, 130); add(P.C, 45); add("1731892023085000001", 60);
  return reviews;
}
const REVIEWS = makeReviews();
const LARGE = Number(process.env.TK_LARGE || 0);
const BIG_ID = "1731892023085007777";
if (LARGE) for (let i = 0; i < LARGE; i++) REVIEWS.push({ id: (7500000000000000000n + BigInt(i)).toString(), product: BIG_ID, sku: "1", day: 1 + (i % 28), images: i % 10 === 0 ? 1 : 0 });
const BASE_TS = 1727740800;
const createTime = r => BASE_TS + r.day * 86400 + (Number(BigInt(r.id) % 80000n));
function filterReviews(body) {
  const f = body.filter || {};
  const list = REVIEWS.filter(r => (!body.search_key || r.product === body.search_key || r.sku === body.search_key) &&
    (!f.review_time_start || createTime(r) >= f.review_time_start) && (!f.review_time_end || createTime(r) <= f.review_time_end));
  // 模糊搜索：结果中夹杂一条其他商品的评论
  if (body.search_key && (globalThis.__serverMode || {}).fuzzy && list.length > 30) list.splice(25, 0, REVIEWS.find(r => r.product === "1731892023085000001"));
  return list;
}
function reviewJson(r) {
  const images = Array.from({ length: r.images }, (_, i) => ({ thumb_url_list: [`https://p16-img.example.com/tos/${r.id}-${i}~tplv-thumb.jpeg?x-expires=1`], url_list: [`https://p16-img.example.com/tos/${r.id}-${i}~tplv-origin.jpeg?x-expires=1`, `https://p19-img.example.com/tos/${r.id}-${i}~tplv-origin.jpeg`] }));
  return `{"main_review_id":${r.id},"star_level":${1 + (Number(BigInt(r.id) % 5n))},"review_text":"评价 ${r.id}","create_time":${createTime(r)},"user_name":"buyer","order_id":"${r.id}1","product_info":{"product_id":"${r.product}","product_name":"商品 ${r.product.slice(-2)}","sku_id":"${r.sku}","sku_specification":"Red","main_image":{"url_list":["https://p16-img.example.com/product.jpeg"]}},"review_images":${JSON.stringify(images)},"reply_count":0}`;
}

const PAGE_HTML = `<!doctype html><html><head><meta charset="utf-8"><title>Ratings</title></head><body>
<div class="filters">
  <span class="core-input-search"><input id="kw" class="core-input" placeholder="搜索订单 ID、商品名称、ID 或用户名"><span class="core-input-search-btn" role="button">🔍</span></span>
  <input id="startDay" class="core-picker-input" type="text" value="">
  <input id="endDay" class="core-picker-input" type="text" value="">
  <button id="query" class="core-btn">查询</button>
</div>
<div id="list"></div>
<ul class="core-pagination" id="pager"></ul>
<script>
// 模拟页面安全 SDK：在 XHR open 时追加签名参数（包在监听外层）
(function(){ const open = XMLHttpRequest.prototype.open; let n = 0;
  XMLHttpRequest.prototype.open = function(m, url){ const u = new URL(url, location.href); u.searchParams.append("X-Bogus", "sig" + (++n)); arguments[1] = u.href; return open.apply(this, arguments); }; })();
const state = { page: 1, size: 20, search: "", start: 0, end: 0, nonce: 0 };
function load() {
  const xhr = new XMLHttpRequest();
  xhr.open("POST", "/api/v1/product/rating/list?locale=zh-CN&shop_region=US");
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.onload = () => { const data = JSON.parse(xhr.responseText.replace(/:(\\d{16,})/g, ':"$1"')); render(data.data || { list: [], total: 0 }); };
  const filter = {}; if (state.start) filter.review_time_start = ${BASE_TS} + state.start * 86400; if (state.end) filter.review_time_end = ${BASE_TS} + state.end * 86400 + 86399;
  xhr.send(JSON.stringify({ page: state.page, page_size: state.size, search_key: state.search, filter, nonce: ++state.nonce }));
}
function render(data) {
  document.getElementById("list").textContent = data.list.map(r => r.main_review_id).join(",");
  const pages = Math.max(1, Math.ceil(data.total / state.size));
  const pager = document.getElementById("pager"); pager.innerHTML = "";
  // 仿 Arco：1 … (当前±2) … 末页；省略号点击前进/后退 5 页；没有跳页输入框
  const lo = Math.max(1, Math.min(state.page - 2, pages - 4)), hi = Math.min(pages, Math.max(state.page + 2, 5));
  const add = (text, cls, go) => { const li = document.createElement("li"); li.className = "core-pagination-item " + cls; li.textContent = text; li.onclick = go; pager.appendChild(li); };
  const num = p => add(p, p === state.page ? "core-pagination-item-active" : "", () => { state.page = p; load(); });
  if (lo > 1) { num(1); if (lo > 2) add("•••", "core-pagination-item-jumper", () => { state.page = Math.max(1, state.page - 5); load(); }); }
  for (let p = lo; p <= hi; p++) num(p);
  if (hi < pages) { if (hi < pages - 1) add("•••", "core-pagination-item-jumper", () => { state.page = Math.min(pages, state.page + 5); load(); }); num(pages); }
  const next = document.createElement("li"); next.className = "core-pagination-item core-pagination-item-next" + (state.page >= pages ? " core-pagination-item-disabled" : ""); next.textContent = ">";
  next.onclick = () => { if (state.page < pages) { state.page++; load(); } }; pager.appendChild(next);
  const size = document.createElement("li"); size.innerHTML = '<span class="core-select-view-value">' + state.size + ' / Page</span>'; pager.appendChild(size);
}
function search() { state.search = document.getElementById("kw").value.trim(); state.start = Number(document.getElementById("startDay").value) || 0; state.end = Number(document.getElementById("endDay").value) || 0; state.page = 1; load(); }
document.getElementById("kw").addEventListener("keydown", e => { if (e.key === "Enter") search(); });
document.querySelector(".core-input-search-btn").onclick = search;
document.getElementById("query").onclick = search;
load();
</script></body></html>`;

function serverMode() { return globalThis.__serverMode || {}; }
async function handleApi(route) {
  const request = route.request();
  const url = new URL(request.url());
  let body = {};
  try { body = JSON.parse(request.postData() || "{}"); } catch (_) {}
  const mode = serverMode();
  const signs = url.searchParams.getAll("X-Bogus");
  if (mode.strictSign && signs.length !== 1) return route.fulfill({ status: 200, contentType: "application/json", body: '{"code":40001,"message":"invalid signature"}' });
  globalThis.__nonces = globalThis.__nonces || new Set();
  const replayed = globalThis.__nonces.has(body.nonce);
  globalThis.__nonces.add(body.nonce);
  if (mode.nonceCheck && replayed) return route.fulfill({ status: 200, contentType: "application/json", body: '{"code":40002,"message":"replay rejected"}' });
  const size = Math.min(Number(body.page_size) || 20, mode.maxSize || 100);
  if (mode.emptyOnce && Number(body.page) === mode.emptyOnce && !globalThis.__emptied) {
    globalThis.__emptied = true;
    return route.fulfill({ status: 200, contentType: "application/json", body: `{"code":0,"data":{"list":[],"total":${filterReviews(body).length}}}` });
  }
  const page = Number(body.page) || 1;
  // 模拟接口在某页持续异常若干次（例如页面长时间运行后签名失效），需要刷新页面后才恢复
  if (mode.brokenPage === page && (globalThis.__brokenLeft || 0) > 0) {
    globalThis.__brokenLeft--;
    return route.fulfill({ status: 200, contentType: "application/json", body: '{"code":0,"message":"success","data":{}}' });
  }
  const all = filterReviews(body);
  // 模拟 TikTok：按页码最多只能取到第 10000 条，之后返回与最后一页相同的内容
  const clampedPage = Math.min(page, Math.ceil(10000 / size));
  let list = all.slice((clampedPage - 1) * size, clampedPage * size);
  // 模拟 TikTok：中途某些页不足一页（隐藏的评论仍计入总数）
  if (mode.shortPages && mode.shortPages.includes(page)) list = list.slice(2);
  // 模拟 TikTok：总数含已隐藏的评论，翻过实际数据后的页不再返回 list 字段
  const total = all.length + (mode.hiddenInTotal || 0);
  if (mode.hiddenInTotal && (page - 1) * size >= all.length && page > 1) {
    globalThis.__apiCalls = (globalThis.__apiCalls || 0) + 1;
    return route.fulfill({ status: 200, contentType: "application/json", body: `{"code":0,"message":"success","data":{"total":${total}}}` });
  }
  const text = `{"code":0,"message":"success","data":{"list":[${list.map(reviewJson).join(",")}],"total":${total},"next_cursor":"${page}"}}`;
  globalThis.__apiCalls = (globalThis.__apiCalls || 0) + 1;
  return route.fulfill({ status: 200, contentType: "application/json", body: text });
}

async function setup() {
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "tk-e2e-"));
  const downloads = fs.mkdtempSync(path.join(os.tmpdir(), "tk-dl-"));
  const context = await chromium.launchPersistentContext(userDataDir, {
    executablePath: chromePath, headless: true, acceptDownloads: true, downloadsPath: downloads,
    args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`, "--headless=new"]
  });
  await context.route(`${SELLER}/**`, route => {
    const url = new URL(route.request().url());
    if (url.pathname.startsWith("/api/")) return handleApi(route);
    if (url.pathname.startsWith("/product/rating")) {
      // 模拟刷新后页面打不开（显示错误页）
      if (globalThis.__failPageLoads > 0) { globalThis.__failPageLoads--; return route.abort("failed"); }
      return route.fulfill({ status: 200, contentType: "text/html", body: PAGE_HTML });
    }
    return route.fulfill({ status: 404, body: "" });
  });
  await context.route("https://p16-img.example.com/**", route => route.fulfill({ status: 200, contentType: "image/png", body: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64") }));
  let [worker] = context.serviceWorkers();
  if (!worker) worker = await context.waitForEvent("serviceworker");
  const extensionId = new URL(worker.url()).host;
  const seller = await context.newPage();
  await seller.goto(RATING);
  seller.__loads = 0;
  seller.on("load", () => { seller.__loads++; });
  await seller.waitForFunction(() => document.getElementById("list").textContent.length > 0);
  const panel = await context.newPage();
  await panel.goto(`chrome-extension://${extensionId}/tiktok_reviews.html`);
  await seller.bringToFront();
  await panel.waitForFunction(() => /监听正常/.test(document.getElementById("pageStatus").textContent), null, { timeout: 15000 });
  return { context, seller, panel, extensionId, downloads };
}

async function runAndWait(panel, timeout = 120000) {
  await panel.evaluate(() => { document.getElementById("status").textContent = ""; });
  await panel.click("#createTask");
  await panel.waitForFunction(() => document.getElementById("createTask").disabled === false && /完成|错误|已暂停/.test(document.getElementById("status").textContent), null, { timeout });
  return panel.evaluate(() => ({ status: document.getElementById("status").textContent, error: document.getElementById("errorBanner").hidden ? "" : document.getElementById("errorBanner").textContent, rows: document.getElementById("statRows").textContent, images: document.getElementById("statImages").textContent, driver: document.getElementById("statDriver").textContent }));
}
async function exportWorkbook(panel) {
  const [download] = await Promise.all([panel.waitForEvent("download"), panel.click("#exportXlsx")]);
  const file = await download.path();
  return XLSX.read(fs.readFileSync(file), { type: "buffer" });
}
function sheetRows(book, name) { return XLSX.utils.sheet_to_json(book.Sheets[name], { defval: "" }); }
async function fillForm(panel, values) {
  await panel.check(`input[name=mode][value=${values.mode}]`);
  if (values.ids !== undefined) await panel.fill("#productIds", values.ids);
  await panel.evaluate(() => { document.getElementById("settingsBox").open = true; });
  await panel.fill("#startPage", String(values.startPage || 1));
  await panel.fill("#endPage", values.endPage ? String(values.endPage) : "");
  await panel.fill("#pageSize", String(values.pageSize || 50));
  await panel.fill("#batchSize", String(values.batchSize || 50));
  await panel.fill("#delayMs", "0");
  await panel.selectOption("#driver", values.driver || "auto");
  await panel.setChecked("#reloadEachBatch", !!values.reload);
  await panel.setChecked("#autoResume", values.autoResume !== false);
}

test("e2e: current filter, product list, UI fallback, image & export", { timeout: 600000, skip: !chromePath && "Chromium not found" }, async t => {
  const { context, seller, panel, downloads } = await setup();
  try {
    await t.test("current filter keeps date range; API replay pages through all results", async () => {
      const settings = await panel.evaluate(() => ({ open: document.getElementById("settingsBox").open, summary: document.getElementById("settingsSummary").textContent }));
      assert.equal(settings.open, false, "settings are folded by default");
      assert.match(settings.summary, /每页 50 条/);
      globalThis.__serverMode = {};
      // 用户在页面上设置日期并查询（扩展不刷新页面）
      await seller.fill("#startDay", "5"); await seller.fill("#endDay", "20");
      await seller.click("#query");
      await seller.waitForTimeout(500);
      const expected = REVIEWS.filter(r => r.day >= 5 && r.day <= 20);
      await fillForm(panel, { mode: "current", pageSize: 50 });
      const result = await runAndWait(panel);
      assert.equal(result.error, "", result.error);
      assert.equal(Number(result.rows), expected.length);
      assert.equal(result.driver, "接口直连");
      assert.equal(Number(result.images), expected.reduce((n, r) => n + r.images, 0));
      const book = await exportWorkbook(panel);
      const rows = sheetRows(book, "评论");
      assert.equal(rows.length, expected.length);
      assert.deepEqual(new Set(rows.map(r => r["评论 ID"])), new Set(expected.map(r => r.id)), "19-digit IDs exact");
      assert.ok(rows.every(r => typeof r["评论 ID"] === "string"));
      const withImg = rows.find(r => Number(r["评价图数量"]) === 2);
      assert.match(withImg["评价图链接"], /~tplv-origin\.jpeg/);
      assert.doesNotMatch(withImg["评价图链接"], /product\.jpeg|thumb/);
      assert.equal(sheetRows(book, "评价图").length, expected.reduce((n, r) => n + r.images, 0));
      const judge = sheetRows(book, "Judge.me导入");
      assert.equal(judge.length, expected.length);
      const withPics = judge.find(r => r.picture_urls);
      assert.equal(withPics.picture_urls.split(",").length, 2);
      assert.match(withPics.picture_urls, /~tplv-origin\.jpeg/);
      assert.ok(judge.every(r => r.rating >= 1 && r.rating <= 5 && r.curated === "ok"));
      // 页面筛选没有被改动
      assert.equal(await seller.inputValue("#startDay"), "5");
    });

    await t.test("product ID list (with empty & unknown IDs) merges into one Excel with 采集商品 ID", async () => {
      globalThis.__serverMode = { strictSign: true }; // 重复签名会被拒绝 → 需要去除签名参数重放
      await seller.fill("#startDay", ""); await seller.fill("#endDay", ""); await seller.click("#query"); await seller.waitForTimeout(500);
      await fillForm(panel, { mode: "ids", ids: `${P.A}\n${P.B}\n${P.C}\n${P.D}\n${P.A}`, pageSize: 50 });
      const result = await runAndWait(panel);
      assert.equal(result.error, "", result.error);
      assert.equal(Number(result.rows), 130 + 45);
      // 进度条按 ID 分段（去重后 4 个），全部完成
      const progress = await panel.evaluate(() => ({ segs: [...document.querySelectorAll("#progressBar .tk-progress-seg")].map(d => d.className), text: document.getElementById("progressText").textContent }));
      assert.equal(progress.segs.length, 4);
      assert.ok(progress.segs.every(c => /is-done/.test(c)), progress.segs.join(","));
      assert.match(progress.text, /总进度 100%/);
      const book = await exportWorkbook(panel);
      const rows = sheetRows(book, "评论");
      assert.equal(rows.filter(r => r["采集商品 ID"] === P.A).length, 130);
      assert.equal(rows.filter(r => r["采集商品 ID"] === P.C).length, 45);
      assert.ok(rows.every(r => r["商品 ID"] === r["采集商品 ID"]), "no shop-wide rows mixed in");
      const summary = sheetRows(book, "商品汇总");
      assert.deepEqual(summary.map(r => [r["采集商品 ID"], r["状态"], Number(r["已采集条数"])]), [[P.A, "完成", 130], [P.B, "无评论", 0], [P.C, "完成", 45], [P.D, "无评论", 0]]);
      if (process.env.TK_DEBUG) fs.writeFileSync(process.env.TK_DEBUG, (await panel.evaluate(() => window.TKReviewDiagnosticsAPI.report())).events.map(e => `${e.level} ${e.message}`).join("\n"));
      // ID 列表在重开侧栏后仍然保留
      await panel.reload();
      await panel.waitForFunction(() => /监听正常/.test(document.getElementById("pageStatus").textContent));
      assert.match(await panel.inputValue("#productIds"), new RegExp(P.C));
      assert.equal(await panel.isChecked("input[name=mode][value=ids]"), true);
    });

    await t.test("fixed single product when API replay is rejected falls back to page search + next-page clicks", async () => {
      globalThis.__serverMode = { nonceCheck: true };
      await fillForm(panel, { mode: "ids", ids: P.C, startPage: 1, pageSize: 50 });
      const result = await runAndWait(panel);
      assert.equal(result.error, "", result.error);
      assert.equal(result.driver, "页面点击");
      assert.equal(Number(result.rows), 45);
      const book = await exportWorkbook(panel);
      assert.ok(sheetRows(book, "评论").every(r => r["商品 ID"] === P.C));
    });

    await t.test("page range + small batches: pages 2–3 only, server caps page size", async () => {
      globalThis.__serverMode = { maxSize: 20 };
      await fillForm(panel, { mode: "ids", ids: P.A, startPage: 2, endPage: 3, pageSize: 50, batchSize: 1 });
      const result = await runAndWait(panel);
      assert.equal(result.error, "", result.error);
      assert.equal(Number(result.rows), 40);
      const rows = sheetRows(await exportWorkbook(panel), "评论");
      const aIds = REVIEWS.filter(r => r.product === P.A).map(r => r.id);
      assert.deepEqual(rows.map(r => r["评论 ID"]), aIds.slice(20, 60));
    });

    await t.test("diagnostics probe reports hook, template and response shape", async () => {
      const report = await panel.evaluate(async () => { const api = window.TKReviewDiagnosticsAPI; return { probe: await api.probe(), report: await api.report() }; });
      assert.equal(report.probe.checks.main.hook, true);
      assert.ok(report.probe.latestResponse.template.pagination.kind === "page");
      assert.ok(report.probe.latestResponse.imageFieldsFound.length > 0);
      assert.doesNotMatch(JSON.stringify(report), /评价 7400/, "no review text in report");
    });

    await t.test("pause and resume continue from the checkpoint without duplicates", async () => {
      globalThis.__serverMode = {};
      await fillForm(panel, { mode: "ids", ids: P.A, pageSize: 10, batchSize: 5 });
      await panel.fill("#delayMs", "400");
      await panel.evaluate(() => { document.getElementById("status").textContent = ""; });
      await panel.click("#createTask");
      await panel.waitForFunction(() => Number(document.getElementById("statRows").textContent) >= 30, null, { timeout: 60000 });
      await panel.click("#pauseTask");
      await panel.waitForFunction(() => /已暂停/.test(document.getElementById("status").textContent), null, { timeout: 30000 });
      const pausedAt = Number(await panel.textContent("#statRows"));
      assert.ok(pausedAt < 130 && pausedAt >= 30, `paused at ${pausedAt}`);
      // 重开侧栏后继续
      await panel.reload();
      await panel.waitForFunction(() => /监听正常/.test(document.getElementById("pageStatus").textContent));
      assert.equal(await panel.isEnabled("#resumeTask"), true);
      await panel.evaluate(() => { document.getElementById("status").textContent = ""; });
      await panel.click("#resumeTask");
      await panel.waitForFunction(() => /完成|错误/.test(document.getElementById("status").textContent), null, { timeout: 120000 });
      if (process.env.TK_DEBUG) fs.writeFileSync(process.env.TK_DEBUG + ".pause", (await panel.evaluate(() => window.TKReviewDiagnosticsAPI.report())).events.map(e => `${e.level} ${e.message}`).join("\n"));
      const rows = sheetRows(await exportWorkbook(panel), "评论");
      assert.equal(rows.length, 130);
      assert.equal(new Set(rows.map(r => r["评论 ID"])).size, 130);
      assert.deepEqual(rows.map(r => r["评论 ID"]), REVIEWS.filter(r => r.product === P.A).map(r => r.id), "export in page order");
    });

    await t.test("hook injected late with nothing captured: create task still starts (re-submits query)", async () => {
      globalThis.__serverMode = {};
      await seller.fill("#kw", ""); await seller.fill("#startDay", "1"); await seller.fill("#endDay", "3");
      // 模拟扩展加载前就打开的页面：清掉监听与捕获记录，但页面上的筛选条件已填好
      await seller.evaluate(() => { window.__TKR__ = undefined; });
      await fillForm(panel, { mode: "current", pageSize: 50 });
      const result = await runAndWait(panel);
      assert.equal(result.error, "", result.error);
      assert.equal(Number(result.rows), REVIEWS.filter(r => r.day >= 1 && r.day <= 3).length);
    });

    await t.test(`large volume: ${LARGE} reviews at 50/page`, { skip: !LARGE && "set TK_LARGE=25000 to run" }, async () => {
      globalThis.__serverMode = {};
      await seller.fill("#startDay", ""); await seller.fill("#endDay", ""); await seller.click("#query"); await seller.waitForTimeout(500);
      await fillForm(panel, { mode: "ids", ids: BIG_ID, pageSize: 50, batchSize: 100 });
      const started = Date.now();
      const result = await runAndWait(panel, 1800000);
      const elapsed = (Date.now() - started) / 1000;
      assert.equal(result.error, "", result.error);
      assert.equal(Number(result.rows), LARGE);
      const t0 = Date.now();
      const rows = sheetRows(await exportWorkbook(panel), "评论");
      console.log(`# large: ${LARGE} rows / ${Math.ceil(LARGE / 50)} pages collected in ${elapsed}s, export ${(Date.now() - t0) / 1000}s`);
      assert.equal(rows.length, LARGE);
      assert.equal(rows[LARGE - 1]["评论 ID"], (7500000000000000000n + BigInt(LARGE - 1)).toString());
    });

    await t.test("a transient empty page mid-run is retried, not treated as the end", async () => {
      globalThis.__serverMode = { emptyOnce: 3 }; globalThis.__emptied = false;
      await seller.fill("#kw", ""); await seller.fill("#startDay", ""); await seller.fill("#endDay", ""); await seller.click("#query"); await seller.waitForTimeout(500);
      await fillForm(panel, { mode: "ids", ids: P.A, pageSize: 20 });
      const result = await runAndWait(panel);
      assert.equal(result.error, "", result.error);
      assert.ok(globalThis.__emptied, "server served the empty page");
      assert.equal(Number(result.rows), 130);
    });

    await t.test("short pages mid-list (hidden reviews) do not end the task or change the page size", async () => {
      globalThis.__serverMode = { shortPages: [2, 4] };
      await seller.fill("#kw", ""); await seller.fill("#startDay", ""); await seller.fill("#endDay", ""); await seller.click("#query"); await seller.waitForTimeout(500);
      const all = REVIEWS.filter(r => r.product === P.A).map(r => r.id);
      const expected = all.filter((_, i) => ![20, 21, 60, 61].includes(i));
      await fillForm(panel, { mode: "ids", ids: P.A, pageSize: 20 });
      let result = await runAndWait(panel);
      assert.equal(result.error, "", result.error);
      assert.deepEqual(sheetRows(await exportWorkbook(panel), "评论").map(r => r["评论 ID"]), expected);
      // 从一个不足一页的页开始（断点续跑场景）：不能把条数改成 18
      await fillForm(panel, { mode: "ids", ids: P.A, startPage: 4, pageSize: 20 });
      result = await runAndWait(panel);
      assert.equal(result.error, "", result.error);
      assert.deepEqual(sheetRows(await exportWorkbook(panel), "评论").map(r => r["评论 ID"]), all.slice(62));
    });

    await t.test("page-click mode resumes at a page number that is not visible in the pager", async () => {
      globalThis.__serverMode = {};
      await seller.fill("#kw", ""); await seller.fill("#startDay", ""); await seller.fill("#endDay", ""); await seller.click("#query"); await seller.waitForTimeout(500);
      await fillForm(panel, { mode: "current", startPage: 10, driver: "ui" });
      const result = await runAndWait(panel, 180000);
      assert.equal(result.error, "", result.error);
      if (process.env.TK_DEBUG) fs.writeFileSync(process.env.TK_DEBUG + ".ui", (await panel.evaluate(() => window.TKReviewDiagnosticsAPI.report())).events.map(e => `${e.level} ${e.message}`).join("\n"));
      assert.equal(result.driver, "页面点击");
      const ids = sheetRows(await exportWorkbook(panel), "评论").map(r => r["评论 ID"]);
      assert.deepEqual(ids, REVIEWS.slice(180).map(r => r.id));
    });

    await t.test("over 10,000 results: without a date filter it stops with guidance; with one it splits by time and gets everything", async () => {
      globalThis.__serverMode = {};
      const WIDE = "1731892023085008888";
      if (!REVIEWS.some(r => r.product === WIDE)) for (let i = 0; i < 12000; i++) REVIEWS.push({ id: (7600000000000000000n + BigInt(i)).toString(), product: WIDE, sku: "2", day: 1 + (i % 28), images: 0 });
      // 没有日期筛选：超过 1 万条时给出指引并暂停
      await seller.fill("#kw", ""); await seller.fill("#startDay", ""); await seller.fill("#endDay", ""); await seller.click("#query"); await seller.waitForTimeout(500);
      await fillForm(panel, { mode: "ids", ids: WIDE, pageSize: 50, batchSize: 1000 });
      let result = await runAndWait(panel, 300000);
      assert.match(result.error, /1 万条[\s\S]*日期范围/);
      // 在页面上选择日期范围后新建任务：自动按时间分段
      // 同时模拟总数含已隐藏评论：各时间段最后的页没有 list 字段，应视为该段采完而不是报错
      globalThis.__serverMode = { hiddenInTotal: 60 };
      await seller.fill("#startDay", "1"); await seller.fill("#endDay", "28"); await seller.click("#query"); await seller.waitForTimeout(500);
      await fillForm(panel, { mode: "ids", ids: WIDE, pageSize: 50, batchSize: 1000 });
      result = await runAndWait(panel, 600000);
      assert.equal(result.error, "", result.error);
      assert.equal(Number(result.rows), 12000);
      const ids = sheetRows(await exportWorkbook(panel), "评论").map(r => r["评论 ID"]);
      assert.equal(new Set(ids).size, 12000);
      for (let i = REVIEWS.length - 1; i >= 0; i--) if (REVIEWS[i].product === WIDE) REVIEWS.splice(i, 1);
    });

    await t.test("fuzzy product search mixing in other products: extra rows are dropped, collection continues", async () => {
      globalThis.__serverMode = { fuzzy: true };
      await seller.fill("#kw", ""); await seller.fill("#startDay", ""); await seller.fill("#endDay", ""); await seller.click("#query"); await seller.waitForTimeout(500);
      await fillForm(panel, { mode: "ids", ids: `${P.C}\n${P.A}`, pageSize: 20 });
      const result = await runAndWait(panel);
      assert.equal(result.error, "", result.error);
      const book = await exportWorkbook(panel);
      const rows = sheetRows(book, "评论");
      assert.equal(rows.filter(r => r["采集商品 ID"] === P.A).length, 130);
      assert.ok(rows.every(r => r["商品 ID"] === r["采集商品 ID"]));
      const summary = sheetRows(book, "商品汇总");
      assert.equal(Number(summary.find(r => r["采集商品 ID"] === P.A)["已排除（搜索结果中的其他商品）"]), 1);
    });

    await t.test("the seller page was never reloaded by the extension", async () => {
      assert.equal(seller.__loads, 0);
    });

    await t.test("reload the page after each batch; saved filters still apply", async () => {
      globalThis.__serverMode = {};
      await seller.fill("#kw", ""); await seller.fill("#startDay", "5"); await seller.fill("#endDay", "20"); await seller.click("#query"); await seller.waitForTimeout(500);
      const loadsBefore = seller.__loads;
      await fillForm(panel, { mode: "current", pageSize: 20, batchSize: 2, reload: true });
      globalThis.__failPageLoads = 1; // 第一次刷新后页面打不开，应自动重试
      const result = await runAndWait(panel, 300000);
      assert.equal(globalThis.__failPageLoads, 0, "the failing reload happened");
      assert.equal(result.error, "", result.error);
      const expected = REVIEWS.filter(r => r.day >= 5 && r.day <= 20).length;
      assert.equal(Number(result.rows), expected);
      assert.ok(seller.__loads - loadsBefore >= 2, `page reloaded ${seller.__loads - loadsBefore} times`);
    });

    await t.test("a page that keeps failing: without auto-resume it stops; with it, waits, reloads and finishes", async () => {
      globalThis.__serverMode = { brokenPage: 3 };
      await seller.fill("#kw", ""); await seller.fill("#startDay", "5"); await seller.fill("#endDay", "20"); await seller.click("#query"); await seller.waitForTimeout(500);
      const expected = REVIEWS.filter(r => r.day >= 5 && r.day <= 20).length;
      globalThis.__brokenLeft = 100;
      await fillForm(panel, { mode: "current", pageSize: 20, batchSize: 1000, autoResume: false });
      let result = await runAndWait(panel, 120000);
      assert.match(result.error, /没有评论列表/);
      globalThis.__brokenLeft = 4; // 页内重试 + 刷新后重试都失败，需要自动恢复一次
      // 上一个任务刷新过评价页，页面上的筛选已重置：重新设置后再建任务
      await seller.fill("#kw", ""); await seller.fill("#startDay", "5"); await seller.fill("#endDay", "20"); await seller.click("#query"); await seller.waitForTimeout(500);
      const loadsBefore = seller.__loads;
      await fillForm(panel, { mode: "current", pageSize: 20, batchSize: 1000 });
      const started = Date.now();
      result = await runAndWait(panel, 180000);
      assert.equal(result.error, "", result.error);
      assert.equal(globalThis.__brokenLeft, 0);
      assert.ok(Date.now() - started >= 15000, "waited before auto-resuming");
      assert.equal(Number(result.rows), expected);
      assert.ok(seller.__loads - loadsBefore >= 2, `page reloaded ${seller.__loads - loadsBefore} times`);
      const log = await panel.evaluate(() => document.getElementById("status").textContent);
      assert.match(log, /完成/);
    });

    await t.test("review images: one ZIP archive, and Excel with embedded thumbnails", async () => {
      globalThis.__serverMode = {};
      await seller.fill("#startDay", ""); await seller.fill("#endDay", ""); await seller.click("#query"); await seller.waitForTimeout(500);
      await fillForm(panel, { mode: "ids", ids: P.C, pageSize: 50 });
      await runAndWait(panel);
      const withImages = REVIEWS.filter(r => r.product === P.C && r.images);
      const expected = withImages.length * 2;
      // ZIP：一个压缩包，按商品 ID 分文件夹
      const [zipDl] = await Promise.all([panel.waitForEvent("download"), panel.click("#downloadImages")]);
      await panel.waitForFunction(() => /已打包/.test(document.getElementById("status").textContent), null, { timeout: 60000 });
      const Media = require("../webscraper-rebuilt/tiktok_media.js");
      const zipBytes = fs.readFileSync(await zipDl.path());
      assert.equal(zipBytes.slice(0, 2).toString(), "PK");
      const zipFiles = await Media.readZip(zipBytes);
      assert.equal(zipFiles.length, expected);
      assert.ok(zipFiles.every(f => f.name.startsWith(`${P.C}/`) && /_\d\.(png|jpg)$/.test(f.name)), zipFiles.slice(0, 3).map(f => f.name).join(","));
      // Excel 含图片预览：缩略图嵌入评论表，可被 SheetJS 正常读取
      const [xlsxDl] = await Promise.all([panel.waitForEvent("download", { timeout: 120000 }), panel.click("#exportXlsxImages")]);
      const bytes = fs.readFileSync(await xlsxDl.path());
      const book = XLSX.read(bytes, { type: "buffer" });
      const rows = sheetRows(book, "评论");
      assert.equal(rows.length, 45);
      assert.ok(Object.keys(rows[0]).includes("评价图预览1"));
      const parts = await Media.readZip(bytes);
      const drawing = parts.find(f => f.name === "xl/drawings/drawing1.xml");
      assert.ok(drawing, "drawing part present");
      assert.equal((new TextDecoder().decode(drawing.data).match(/<xdr:pic>/g) || []).length, expected);
      assert.equal(parts.filter(f => f.name.startsWith("xl/media/")).length, expected);
      assert.match(new TextDecoder().decode(parts.find(f => f.name === "xl/worksheets/sheet1.xml").data), /<drawing r:id="rIdTkDrawing"\/>/);
      assert.match(await panel.textContent("#status"), new RegExp(`嵌入 ${expected} 张缩略图`));
    });
    await t.test("side panel shell: tabs and diagnostics copy/probe", async () => {
      const shell = await context.newPage();
      await shell.goto(panel.url().replace("tiktok_reviews.html", "sidepanel.html"));
      await seller.bringToFront();
      await shell.click("#wsTabTkReviews");
      const reviews = shell.frameLocator("#tkReviewsFrame");
      await reviews.locator("#createTask").waitFor();
      await shell.click("#wsTabDiagnostics");
      const diag = shell.frameLocator("#tkDiagnosticsFrame");
      await diag.locator("#probe").click();
      await shell.waitForFunction(() => /探针已完成|错误/.test(document.getElementById("tkDiagnosticsFrame").contentDocument.getElementById("diagnosticStatus").textContent), null, { timeout: 30000 });
      const text = await diag.locator("#report").inputValue();
      const report = JSON.parse(text);
      assert.equal(report.probe.checks.main.hook, true);
      assert.ok(report.version);
      await shell.close();
    });

  } finally {
    await context.close();
    fs.rmSync(downloads, { recursive: true, force: true });
  }
});
