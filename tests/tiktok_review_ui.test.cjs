const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const http = require("node:http");
const { chromium } = require("playwright");
const base = path.join(__dirname, "../webscraper-rebuilt");
const chromePath = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const id = "1731892023085009910";
const sellerUrl = "https://seller-mx.tiktokshop.com/product/rating";
const fixture = `<!doctype html><html><head><meta charset="UTF-8"></head><body>
<div class="core-input-search"><input id="product-search" placeholder="搜索订单 ID、商品名称、ID 或用户名"><button class="core-input-search-button">搜索</button></div>
<input id="start-date" name="start_date" type="date" value="2026-09-01"><input id="end-date" name="end_date" type="date" value="2026-09-20">
<span class="core-select-view-value">50 / Page</span><div id="pagination"></div><div id="review-list"></div>
<script>
const state = window.fixtureState = {page:1,product:"",pageSize:50};
window.fixtureTotal = () => state.product === "1731892023085009912" ? 0 : state.pageSize*2+2;
window.fixtureRows = () => Array.from({length:window.fixtureTotal()===0?0:state.page === 3 ? 2 : state.pageSize}, (_,i) => ({
  main_review_id: String(8000000000000000000n + BigInt((state.page-1)*state.pageSize+i)),
  product_info:{product_id:state.product || (i%2 ? "1731892023085009911" : "1731892023085009910"),product_name:"测试商品",sku_id:"sku-test"},
  review_text: i ? "模拟买家评价 " + state.page + "-" + i : "=formula-like text",
  star_level:5,create_time:1700000000,
  review_images: i ? [] : [{original_url:"https://images.example/review-"+state.page+".jpg?sign=fixture",thumbnail_url:"https://images.example/thumb-"+state.page+".jpg"}]
}));
function paint(){
  document.querySelector('.core-select-view-value').textContent=state.pageSize+' 条';
  document.getElementById("pagination").innerHTML = [1,2,3].map(p=>'<button class="core-pagination-item '+(p===state.page?'core-pagination-item-active':'')+'" data-page="'+p+'">'+p+'</button>').join('')+'<button class="core-pagination-item-next" aria-disabled="'+(state.page===3)+'">Next</button>';
  document.querySelectorAll('[data-page]').forEach(el=>el.onclick=()=>{state.page=Number(el.dataset.page);load();});
  document.querySelector('.core-pagination-item-next').onclick=()=>{if(state.page<3){state.page++;load();}};
  document.getElementById("review-list").textContent='当前第 '+state.page+' 页';
}
async function load(){paint();await fetch('/api/review?shop_id=shop-fixture&page_size='+state.pageSize+'&page='+state.page,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({product_id:state.product,star_level:0,start_time:document.getElementById('start-date').value,end_time:document.getElementById('end-date').value})});}
document.querySelector('.core-input-search-button').onclick=()=>{state.product=window.fixtureIgnoreSearch?'':document.getElementById('product-search').value;state.page=1;load();};
document.getElementById('product-search').onkeydown=e=>{if(e.key==='Enter')document.querySelector('.core-input-search-button').click();};
load();
</script></body></html>`;

test("Chromium shell regression: no injected Promise results, all modes without reloads, failed product search stops", { timeout: 90000, skip: !fs.existsSync(chromePath) }, async () => {
  const server = http.createServer((request, response) => {
    const name = path.basename(new URL(request.url, "http://localhost").pathname);
    const file = path.join(base, name);
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) { response.writeHead(404); response.end(); return; }
    response.setHeader("Content-Type", name.endsWith(".js") ? "text/javascript" : name.endsWith(".css") ? "text/css" : "text/html");
    response.setHeader("Content-Security-Policy", "script-src 'self'; object-src 'self'");
    response.end(fs.readFileSync(file));
  });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({ executablePath: chromePath, headless: true });
  try {
    const sellerContext = await browser.newContext();
    await sellerContext.route("**/*", route => route.fulfill({ status: 200, contentType: "text/html", body: fixture }));
    const hook = fs.readFileSync(path.join(base, "tiktok_capture_hook.js"), "utf8");
    await sellerContext.addInitScript({ content: `window.fetch=async()=>new Response(JSON.stringify({data:{list:window.fixtureRows?window.fixtureRows():[],total:window.fixtureTotal?window.fixtureTotal():0,next_cursor:""}}),{status:200,headers:{"Content-Type":"application/json"}});${hook}` });
    const seller = await sellerContext.newPage(); await seller.goto(sellerUrl);
    const uiContext = await browser.newContext({ viewport: { width: 1100, height: 950 }, acceptDownloads: true });
    let registered = [];
    let reloads = 0;
    async function newPanel() {
      const ui = await uiContext.newPage();
      await ui.exposeBinding("__mockChrome", async (_, namespace, method, arg) => {
        if (namespace === "tabs") {
          if (method === "query") return [{ id: 1, active: true, url: sellerUrl }];
          if (method === "get") return { id: 1, active: true, url: sellerUrl };
          if (method === "reload") { reloads++; await seller.reload(); return null; }
        }
        if (namespace === "scripting") {
          if (method === "getRegisteredContentScripts") return registered;
          if (method === "unregisterContentScripts") { registered = []; return null; }
          if (method === "registerContentScripts") { registered = arg; return null; }
          if (method === "executeScript") {
            const sources = arg.files ? arg.files.map(file => fs.readFileSync(path.join(base, file), "utf8")) : [`(${arg.source})(...window.__fixtureArgs)`];
            const result = await seller.evaluate(async ({ sources, args, world }) => {
              window.__fixtureArgs = args || [];
              const previous = window.chrome.runtime;
              if (world === "ISOLATED") window.chrome.runtime = { id: "isolated-fixture" };
              else delete window.chrome.runtime;
              try {
                let result;
                for (const source of sources) {
                  const returned = (0, eval)(source);
                  if (returned && typeof returned.then === "function") { returned.catch(() => {}); result = undefined; }
                  else result = returned;
                }
                return result;
              }
              finally { if (previous) window.chrome.runtime = previous; else delete window.chrome.runtime; }
            }, { sources, args: arg.args, world: arg.world });
            return [{ result }];
          }
        }
        throw new Error(`unexpected mock ${namespace}.${method}`);
      });
      await ui.addInitScript(() => {
        const listeners = new Set(); const removed = new Set();
        const chrome = { runtime: { getManifest: () => ({ version: "1.107.28" }) }, tabs: { onUpdated: { addListener: f => listeners.add(f), removeListener: f => listeners.delete(f) }, onRemoved: { addListener: f => removed.add(f), removeListener: f => removed.delete(f) } }, scripting: {} };
        for (const [namespace, methods] of Object.entries({ tabs: ["query", "get", "reload"], scripting: ["executeScript", "getRegisteredContentScripts", "registerContentScripts", "unregisterContentScripts"] })) {
          for (const method of methods) chrome[namespace][method] = (arg, callback) => {
            const serialized = method === "executeScript" ? { ...arg, func: undefined, source: arg.func && arg.func.toString() } : arg;
            window.__mockChrome(namespace, method, serialized).then(value => {
              if (namespace === "tabs" && method === "reload") for (const fn of listeners) fn(arg, { status: "complete" });
              callback(value);
            }, error => { chrome.runtime.lastError = { message: error.message }; callback(); delete chrome.runtime.lastError; });
          };
        }
        Object.defineProperty(window, "chrome", { value: chrome, configurable: true });
        const nativeTimer = window.setTimeout.bind(window);
        window.setTimeout = (fn, ms, ...args) => nativeTimer(fn, [150, 250, 500, 800, 5000].includes(ms) ? 5 : ms, ...args);
      });
      await ui.goto(origin + "/tiktok_reviews.html");
      await ui.waitForFunction(() => window.TKReviewTaskUI && window.TKReviewDiagnosticsAPI && !window.TKReviewDiagnosticsAPI.report().busy);
      return ui;
    }
    let ui = await newPanel();
    // Reproduce the report: plain-object injections work, Promise results disappear.
    const probePromise=await ui.evaluate(()=>new Promise(resolve=>chrome.scripting.executeScript({target:{tabId:1},world:'MAIN',func:()=>Promise.resolve({ok:true})},resolve)));
    assert.equal(probePromise[0].result,undefined);
    const errors = []; ui.on("pageerror", error => errors.push(error.message));
    await ui.locator("#productSearchId").fill(id);
    await ui.locator("#taskBatchSize").fill("2");
    await ui.locator("#fetchReviews").click();
    await ui.waitForFunction(() => document.getElementById("taskStatus").textContent.includes("已完成") && document.getElementById("taskStatus").textContent.includes("102 条"), null, { timeout: 30000 }).catch(async error => { throw new Error(error.message + "\n" + JSON.stringify(await ui.evaluate(()=>({status:document.getElementById("taskStatus").textContent,report:window.TKReviewDiagnosticsAPI.report()})))); });
    const result = await ui.evaluate(async () => {
      const task = await window.TKReviewTaskUI.store.get(window.TKReviewTaskUI.selected());
      return { lastPage: task.lastPage, uniqueCount: task.uniqueCount, imageCount: task.imageCount, batches: Object.keys(task.batches).length };
    });
    assert.deepEqual(result, { lastPage: 3, uniqueCount: 102, imageCount: 3, batches: 2 });
    const artifacts = path.join(__dirname, "artifacts"); fs.mkdirSync(artifacts, { recursive: true });
    await ui.screenshot({ path: path.join(artifacts, "task-ui-wide.png"), fullPage: true });
    const downloaded = ui.waitForEvent("download"); await ui.locator("#taskExportXlsx").click();
    await (await downloaded).saveAs(path.join(artifacts, "browser-task.xlsx"));

    // Close a panel while it is waiting after the first committed page.
    await ui.evaluate(() => { window.TKReviewTaskUI.runner.wait = () => new Promise(() => {}); });
    await ui.locator("#taskCreate").click();
    await ui.waitForFunction(() => window.TKReviewTaskUI.runner.active && document.getElementById("taskStatus").textContent.includes("1/3 页"));
    const interruptedId = await ui.evaluate(() => window.TKReviewTaskUI.selected());
    assert.equal((await ui.evaluate(async () => await window.TKReviewTaskUI.store.get(window.TKReviewTaskUI.selected()))).lastPage, 1);
    await ui.close();
    ui = await newPanel(); ui.on("pageerror", error => errors.push(error.message));
    assert.equal(await ui.evaluate(() => window.TKReviewTaskUI.selected()), interruptedId);
    await ui.locator("#taskResume").click();
    await ui.waitForFunction(() => document.getElementById("taskStatus").textContent.includes("已完成") && document.getElementById("taskStatus").textContent.includes("102 条"), null, { timeout: 30000 });
    const resumed = await ui.evaluate(async () => await window.TKReviewTaskUI.store.get(window.TKReviewTaskUI.selected()));
    assert.equal(resumed.uniqueCount, 102); assert.equal(resumed.lastPage, 3); assert.equal(resumed.imageCount, 3);
    // Current filters: keep a custom date range and existing 20-per-page selection.
    await seller.locator('#product-search').fill('');
    await seller.locator('#start-date').fill('2026-09-03');
    await seller.locator('#end-date').fill('2026-09-18');
    await seller.evaluate(() => { window.fixtureState.pageSize=20; document.querySelector('.core-input-search-button').click(); });
    const beforeLiveReloads = reloads;
    await ui.locator('#taskMode').selectOption('current');
    await ui.locator('#productSearchId').fill('9999999999999999999'); // Must be ignored.
    await ui.locator('#taskCreate').click();
    await ui.waitForFunction(() => document.getElementById('taskStatus').textContent.includes('已完成') && document.getElementById('taskStatus').textContent.includes('42 条'), null, {timeout:30000});
    let filtered = await ui.evaluate(async()=>await window.TKReviewTaskUI.store.get(window.TKReviewTaskUI.selected()));
    assert.equal(filtered.config.mode,'current');assert.equal(filtered.config.pageSize,20);assert.equal(filtered.uniqueCount,42);
    assert.equal(filtered.context.filters.start_time,'2026-09-03');assert.equal(filtered.context.filters.end_time,'2026-09-18');
    assert.equal(reloads,beforeLiveReloads);assert.equal(await seller.locator('#product-search').inputValue(),'');
    assert.equal(await seller.locator('#start-date').inputValue(),'2026-09-03');assert.equal(await seller.locator('#end-date').inputValue(),'2026-09-18');
    const actualProducts=await ui.evaluate(async()=>[...new Set((await window.TKReviewTaskUI.store.readRows(window.TKReviewTaskUI.selected())).map(r=>r.row.product_id))]);
    assert.deepEqual(actualProducts.sort(),[id,'1731892023085009911']);

    // A saved task must reject a different date range before re-submitting queries.
    await seller.locator('#start-date').fill('2026-09-04');
    await ui.locator('#taskRescan').click();
    await ui.waitForFunction(() => document.getElementById('taskStatus').textContent.includes('当前筛选条件与保存的任务不一致'));
    assert.equal(await seller.locator('#start-date').inputValue(),'2026-09-04');assert.equal(reloads,beforeLiveReloads);
    await seller.locator('#start-date').fill('2026-09-03');

    // Upload an Excel list, include a duplicate and a product with zero reviews.
    await seller.evaluate(()=>{window.fixtureState.pageSize=50; document.querySelector('.core-input-search-button').click();});
    await ui.locator('#taskMode').selectOption('list');
    const XLSX=require('../webscraper-rebuilt/sheetjs-0.20.3.min.js');
    const book=XLSX.utils.book_new();XLSX.utils.book_append_sheet(book,XLSX.utils.aoa_to_sheet([['id'],[id],['1731892023085009911'],['1731892023085009912'],[id]]),'商品列表');
    await ui.locator('#taskIdFile').setInputFiles({name:'products.xlsx',mimeType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',buffer:Buffer.from(XLSX.write(book,{type:'buffer',bookType:'xlsx'}))});
    await ui.waitForFunction(()=>document.getElementById('taskImportStatus').textContent.includes('已导入 3 个'));
    assert.equal(await ui.locator('#taskIds').inputValue(),id+'\n1731892023085009911\n1731892023085009912');
    await ui.locator('#taskCreate').click();
    await ui.waitForFunction(()=>document.getElementById('taskStatus').textContent.includes('已完成')&&document.getElementById('taskStatus').textContent.includes('商品 3/3'),null,{timeout:30000});
    const group=await ui.evaluate(async()=>await window.TKReviewTaskUI.store.collection(window.TKReviewTaskUI.selected().slice(11)));
    assert.deepEqual(group.items.map(i=>i.uniqueCount),[102,102,0]);assert.ok(group.items[2].empty);assert.equal(reloads,beforeLiveReloads);
    assert.equal(await seller.locator('#start-date').inputValue(),'2026-09-03');assert.equal(await seller.locator('#end-date').inputValue(),'2026-09-18');
    const combinedDownload=ui.waitForEvent('download');await ui.locator('#taskExportXlsx').click();
    const combinedPath=path.join(artifacts,'browser-product-list.xlsx');await(await combinedDownload).saveAs(combinedPath);
    const combined=XLSX.read(fs.readFileSync(combinedPath),{type:'buffer'}),comments=XLSX.utils.sheet_to_json(combined.Sheets['评论']);
    assert.equal(comments.length,204);assert.deepEqual([...new Set(comments.map(r=>r['采集商品 ID']))],[id,'1731892023085009911']);
    assert.equal(XLSX.utils.sheet_to_json(combined.Sheets['商品任务']).length,3);

    // A closed panel resumes the second product, leaving the completed first one intact.
    await ui.evaluate(()=>{window.TKReviewTaskUI.runner.wait=()=>document.getElementById('taskStatus').textContent.includes('当前商品 1731892023085009911') ? new Promise(()=>{}) : Promise.resolve();});
    await ui.locator('#taskIds').fill(id+'\n1731892023085009911');
    await ui.locator('#taskCreate').click();
    await ui.waitForFunction(()=>window.TKReviewTaskUI.runner.active&&document.getElementById('taskStatus').textContent.includes('当前商品 1731892023085009911')&&document.getElementById('taskStatus').textContent.includes('1/3 页'));
    const interruptedGroupId=await ui.evaluate(()=>window.TKReviewTaskUI.selected());await ui.close();
    ui=await newPanel();ui.on('pageerror',error=>errors.push(error.message));
    assert.equal(await ui.evaluate(()=>window.TKReviewTaskUI.selected()),interruptedGroupId);
    await ui.locator('#taskResume').click();
    await ui.waitForFunction(()=>document.getElementById('taskStatus').textContent.includes('已完成')&&document.getElementById('taskStatus').textContent.includes('商品 2/2'),null,{timeout:30000});
    const resumedGroup=await ui.evaluate(async()=>await window.TKReviewTaskUI.store.collection(window.TKReviewTaskUI.selected().slice(11)));
    assert.deepEqual(resumedGroup.items.map(i=>i.uniqueCount),[102,102]);assert.equal(reloads,beforeLiveReloads);
    // A failed product search must stop before creating a task or storing shop-wide rows.
    await ui.locator('#taskMode').selectOption('fixed');
    await ui.locator('#productSearchId').fill(id);
    const tasksBefore=await ui.evaluate(async()=>(await window.TKReviewTaskUI.store.list()).length);
    await seller.evaluate(()=>{window.fixtureIgnoreSearch=true;});
    await ui.locator('#fetchReviews').click();
    await ui.waitForFunction(()=>document.getElementById('taskNotice').textContent.includes('商品搜索未生效'));
    assert.equal(await ui.evaluate(async()=>(await window.TKReviewTaskUI.store.list()).length),tasksBefore);
    assert.equal(await ui.evaluate(()=>window.TKReviewTaskUI.selected()),'');
    assert.equal(await ui.locator('#previewBody tr').count(),0);
    assert.equal(await ui.locator('#taskExportXlsx').isDisabled(),true);
    assert.equal(reloads,0);assert.equal(await ui.locator('#taskNotice').isVisible(),true);
    assert.equal(await seller.locator('#start-date').inputValue(),'2026-09-03');
    const probe=await ui.evaluate(()=>window.TKReviewDiagnosticsAPI.probe());
    assert.equal(probe.probe.checks.find(check=>check.world==='MAIN'&&check.method==='func-promise').result.promiseAwaited,false);
    assert.ok(probe.probe.checks.find(check=>check.world==='MAIN'&&check.method==='files').result.filterScriptPresent);
    assert.equal(reloads,0);
    await ui.locator('#taskSelect').selectOption(interruptedGroupId);
    await ui.waitForFunction(()=>document.getElementById('taskExportCsv').disabled===false);
    assert.deepEqual(errors, []);
    await ui.setViewportSize({ width: 380, height: 850 });
    await ui.screenshot({ path: path.join(artifacts, "task-ui-narrow.png"), fullPage: true });
    assert.equal(await ui.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), false);
    assert.ok(await ui.locator("#taskExportCsv").isEnabled());
  } finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
});
