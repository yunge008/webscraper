(function() {
  "use strict";
  const bridge = window.TKReviewTaskBridge;
  const store = new window.TKReviewTasks.Store();
  const ids = ["taskCreate", "taskPause", "taskResume", "taskRetry", "taskSelect", "taskStatus", "taskExportXlsx", "taskExportCsv", "taskExportImages", "taskExportManifest", "taskRescan", "taskBatchSize", "taskAllPages", "taskImagePath", "taskBatchSelect", "taskMode", "taskIds", "taskIdFile", "taskProductList", "taskImportStatus"];
  const els = Object.fromEntries(ids.map(id => [id, document.getElementById(id)]));
  const statuses = { paused: "已暂停", running: "运行中", complete: "已完成" };
  let selected = "";
  let busy = false;
  let currentTask = null;
  const runner = new window.TKReviewTasks.Runner(store, { prepare: bridge.prepare, read: bridge.read, pause: bridge.pause }, progress);
  let runningGroup = null;
  const collectionRunner = new window.TKReviewTasks.CollectionRunner(store, runner, (task, productId) => {
    bridge.reset(); return bridge.prepareLive(task, "list", productId);
  }, groupProgress);

  function controls() {
    const blocked = busy || bridge.isBusy();
    for (const key of ["taskCreate", "taskSelect", "taskBatchSize", "taskAllPages", "taskImagePath", "taskBatchSelect", "taskMode", "taskIds", "taskIdFile"]) els[key].disabled = blocked;
    els.taskPause.disabled = !(runner.active || collectionRunner.active);
    els.taskResume.disabled = blocked || !currentTask || currentTask.status === "complete";
    els.taskRetry.disabled = blocked || !currentTask || !(currentTask.lastError || currentTask.failures.length) || currentTask.status === "complete";
    els.taskRescan.disabled = blocked || !currentTask || currentTask.kind === "collection";
    for (const key of ["taskExportXlsx", "taskExportCsv", "taskExportImages", "taskExportManifest"]) els[key].disabled = blocked || !currentTask;
    els.taskProductList.hidden = els.taskMode.value !== "list";
    // The upper controls are single-product shortcuts. Current-filter and list
    // modes use the explicit task entry below.
    for (const id of ["fetchReviews", "startCapture", "refreshStats", "readCapture"]) document.getElementById(id).disabled = blocked || els.taskMode.value !== "fixed";
    document.getElementById("downloadCsv").disabled = blocked || !currentTask;
  }
  async function list() {
    const tasks = [...(await store.list()).filter(task => !task.config.collectionId), ...await store.collections()].sort((a, b) => b.createdAt - a.createdAt);
    els.taskSelect.textContent = "";
    const empty = document.createElement("option"); empty.value = ""; empty.textContent = "选择已保存任务"; els.taskSelect.appendChild(empty);
    for (const task of tasks) {
      const option = document.createElement("option"); option.value = task.kind === "collection" ? task.key : task.id;
      const scope = task.kind === "collection" ? `商品列表 ${task.items.length} 个` : task.config.mode === "current" ? "当前筛选结果" : `产品 ${task.config.productId}`;
      const count = task.kind === "collection" ? task.items.reduce((n, item) => n + item.uniqueCount, 0) : task.uniqueCount;
      option.textContent = `${new Date(task.createdAt).toLocaleString()} · ${scope} · ${statuses[task.status]} · ${count} 条`;
      els.taskSelect.appendChild(option);
    }
    els.taskSelect.value = selected;
    return tasks;
  }
  async function progress(task) {
    if (!task) return;
    if (runningGroup) { runningGroup = await store.collection(runningGroup.id); return groupProgress(runningGroup, task); }
    currentTask = task; selected = task.id;
    const count = Math.max(0, task.lastPage - task.config.startPage + 1);
    const max = task.config.endPage - task.config.startPage + 1;
    const failed = new Set(task.failures.map(item => item.page)).size;
    const completeBatches = Object.values(task.batches).filter(batch => batch.status === "complete").length;
    const info = `${statuses[task.status]}｜${count}/${max} 页｜${task.uniqueCount} 条唯一评论｜${task.imageCount} 张图｜${completeBatches}/${Math.ceil(max / task.config.batchSize)} 批｜记录失败页 ${failed}`;
    const mediaWarning = task.mediaStats && task.mediaStats.unknown && task.mediaStats.unknown.length ? "｜部分图片字段待确认，请查看诊断" : task.uniqueCount && !task.imageCount && (!task.mediaStats || !task.mediaStats.paths || !task.mediaStats.paths.length) ? "｜尚未识别评价图字段" : "";
    els.taskStatus.textContent = info + mediaWarning + (task.retryPage ? `｜正在重试第 ${task.retryPage} 页（${task.retryAttempt}/2）` : task.lastError ? `｜${task.lastError}` : task.empty ? "｜当前筛选下无评论" : "");
    bridge.status(els.taskStatus.textContent);
    const preview = await store.readRows(task.id, { limit: 100 });
    bridge.show(task, preview);
    const oldBatch = els.taskBatchSelect.value;
    els.taskBatchSelect.textContent = "";
    const all = document.createElement("option"); all.value = "0"; all.textContent = "全部已保存评论"; els.taskBatchSelect.appendChild(all);
    for (const batch of Object.values(task.batches)) {
      const option = document.createElement("option"); option.value = String(batch.batch); option.textContent = `第 ${batch.batch} 批 · ${batch.startPage}–${batch.endPage} 页 · ${batch.status === "complete" ? "已完成" : "部分保存"}`; els.taskBatchSelect.appendChild(option);
    }
    if ([...els.taskBatchSelect.options].some(option => option.value === oldBatch)) els.taskBatchSelect.value = oldBatch;
    controls();
  }
  async function groupProgress(group, child = null) {
    currentTask = group; selected = group.key;
    localStorage.setItem("tkReviewSelectedTask", selected);
    const items = group.items.map(item => child && item.taskId === child.id ? { ...item, uniqueCount: child.uniqueCount, imageCount: child.imageCount } : item);
    const done = items.filter(item => item.status === "complete").length;
    const count = items.reduce((n, item) => n + item.uniqueCount, 0), images = items.reduce((n, item) => n + item.imageCount, 0);
    els.taskStatus.textContent = `${statuses[group.status]}｜商品 ${done}/${items.length}｜${count} 条已保存评论｜${images} 张图` + (child ? `｜当前商品 ${child.config.productId} · ${child.lastPage}/${child.config.endPage} 页` : "") + (group.lastError || child && child.lastError ? `｜${group.lastError || child.lastError}` : "");
    bridge.status(els.taskStatus.textContent);
    const last = items.findLast(item => item.taskId);
    const preview = child || (last && await store.get(last.taskId));
    if (preview) bridge.show({ ...preview, uniqueCount: count, imageCount: images }, await store.readRows(preview.id, { limit: 100 }));
    else bridge.show({ ...group, lastPage: 0, uniqueCount: 0, imageCount: 0 }, []);
    document.getElementById("rowCount").textContent = `${count} 条已保存，${images} 张评价图（仅预览最近商品前 100 条）`;
    els.taskBatchSelect.innerHTML = '<option value="0">全部商品已保存评论</option>';
    controls();
  }
  function applySettings(task) {
    const group = task.kind === "collection";
    els.taskMode.value = group ? "list" : task.config.mode || "fixed";
    els.taskBatchSize.value = task.config.batchSize; els.taskImagePath.value = task.config.imagePath || "";
    els.taskAllPages.checked = group ? task.config.allPages : true;
    if (group) els.taskIds.value = task.items.map(item => item.productId).join("\n");
    bridge.applySettings({ config: { ...task.config, productId: group ? "" : task.config.productId || "" } }); controls();
  }
  async function operation(action) {
    if (busy) return;
    busy = true; controls();
    try { await action(); }
    catch (error) { els.taskStatus.textContent = `错误：${error.message || error}`; bridge.status(els.taskStatus.textContent); }
    finally { busy = false; controls(); }
  }
  async function executeTask(task, options = {}) {
    selected = task.kind === "collection" ? task.key : task.id; currentTask = task;
    localStorage.setItem("tkReviewSelectedTask", selected);
    window.TKReviewTaskImagePath = task.config.imagePath || "";
    await list();
    try {
      if (task.kind === "collection") { runningGroup = task; await collectionRunner.run(task.id); }
      else await runner.run(task.id, options);
    } finally { runningGroup = null; await list(); }
  }
  async function selectedTask() {
    const task = selected && (selected.startsWith("collection:") ? await store.collection(selected.slice(11)) : await store.get(selected));
    if (!task) throw new Error("请先选择已保存任务。");
    return task;
  }
  async function resume(rescan = false) {
    let task = await selectedTask();
    const imagePath = els.taskImagePath.value.trim();
    applySettings(task);
    els.taskBatchSize.value = task.config.batchSize;
    if (!rescan) els.taskImagePath.value = task.config.imagePath || "";
    await bridge.run(() => executeTask(task, rescan ? { rescan: true, imagePath } : {}));
  }
  function download(blob, filename) {
    const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = filename;
    document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 10000);
  }
  async function exportTask(kind) {
    const task = await selectedTask();
    const group = task.kind === "collection";
    const batch = group ? 0 : Number(els.taskBatchSelect.value || 0);
    const prefix = `tk-${group ? "product-list" : task.config.productId || "filtered"}-${task.id.slice(0, 8)}${batch ? `-batch-${batch}` : "-all"}`;
    if (kind === "manifest") {
      const manifest = group ? { ...task, tasks: await Promise.all(task.items.filter(item => item.taskId).map(item => store.get(item.taskId))) } : task;
      download(new Blob([JSON.stringify(manifest, null, 2)], { type: "application/json;charset=utf-8" }), `${prefix}-manifest.json`);
    } else if (kind === "xlsx") download(await window.TKReviewExport.xlsx(store, task, batch), `${prefix}.xlsx`);
    else {
      const source = group ? { visitRows: async (_, visitor) => { for (const item of task.items) if (item.taskId) await store.visitRows(item.taskId, visitor); } } : store;
      const result = await window.TKReviewExport.csv(source, task.id, { batch, images: kind === "images" });
      download(result.blob, `${prefix}-${kind === "images" ? "images" : "reviews"}.csv`);
    }
    const patch = { exports: [...task.exports.slice(-99), { kind, batch, at: Date.now(), state: "download-requested" }] };
    currentTask = group ? await store.updateCollection(task.id, patch) : await store.update(task.id, patch);
    els.taskStatus.textContent = "已发起下载。任务原始数据仍保留，可重新导出。CSV 中长编号请按文本导入；Excel 文件保留文本编号。";
  }

  els.taskCreate.addEventListener("click", () => operation(async () => {
    window.TKReviewTaskImagePath = els.taskImagePath.value.trim();
    window.TKReviewTasks.extractImages({}, window.TKReviewTaskImagePath);
    const mode = els.taskMode.value;
    const productIds = mode === "list" ? window.TKProductImport.text(els.taskIds.value) : null;
    selected = ""; currentTask = null; els.taskSelect.value = "";
    localStorage.removeItem("tkReviewSelectedTask");
    bridge.reset();
    els.taskStatus.textContent = "正在启动任务，检查当前页面、搜索条件和监听…";
    bridge.status(els.taskStatus.textContent);
    await bridge.run(async () => {
      try {
        const settings = bridge.settings();
        const options = { ...settings, mode, batchSize: Number(els.taskBatchSize.value), imagePath: window.TKReviewTaskImagePath, allPages: els.taskAllPages.checked };
        if (!Number.isSafeInteger(options.batchSize) || options.batchSize < 1 || options.batchSize > 500 || options.endPage < options.startPage) throw new Error("每批页数或页码范围无效。");
        if (mode === "list") { const group = await store.createCollection(productIds, { ...options, productId: "" }); await executeTask(group); return; }
        const data = mode === "current" ? await bridge.prepareLive(null, "current") : await bridge.prepare(null);
        if (!data.rows.length && data.total !== 0) throw new Error("没有可确认的评论数据，未创建任务。");
        const totalPages = Number.isSafeInteger(data.total) && data.total > 0 ? Math.ceil(data.total / data.pageSize) : 0;
        if (data.rows.length && els.taskAllPages.checked && !totalPages) throw new Error("接口没有明确总条数，无法确认全部页；请取消“全部页”并手动设置终止页。");
        const config = { ...options, productId: mode === "current" ? "" : bridge.settings().productId, endPage: !data.rows.length ? settings.startPage : els.taskAllPages.checked ? totalPages : settings.endPage, pageSize: data.pageSize };
        if (totalPages && config.endPage > totalPages) throw new Error("终止页超过当前固定产品的总页数。");
        const task = await store.create(config, data.context);
        if (!data.rows.length) { await progress(await store.update(task.id, { status: "complete", empty: true })); await list(); }
        else await executeTask(task);
      } catch (error) { els.taskStatus.textContent = `错误：${error.message}`; throw error; }
    });
  }));
  els.taskPause.addEventListener("click", () => { if (collectionRunner.active) collectionRunner.pause(); else runner.pause(); els.taskStatus.textContent = "正在暂停，保留已成功保存的页面…"; });
  els.taskResume.addEventListener("click", () => operation(() => resume()));
  els.taskRetry.addEventListener("click", () => operation(() => resume()));
  els.taskRescan.addEventListener("click", () => operation(() => resume(true)));
  els.taskSelect.addEventListener("change", () => operation(async () => {
    selected = els.taskSelect.value;
    if (!selected) { currentTask = null; return; }
    const task = await selectedTask(); applySettings(task);
    localStorage.setItem("tkReviewSelectedTask", selected); if (task.kind === "collection") await groupProgress(task); else await progress(task);
  }));
  els.taskMode.addEventListener("change", controls);
  els.taskIds.addEventListener("input", () => {
    localStorage.setItem("tkReviewProductList", els.taskIds.value);
    try { els.taskImportStatus.textContent = `已识别 ${window.TKProductImport.text(els.taskIds.value).length} 个唯一商品 ID。`; }
    catch (error) { els.taskImportStatus.textContent = error.message; }
  });
  els.taskIdFile.addEventListener("change", () => operation(async () => {
    try {
      const result = await window.TKProductImport.file(els.taskIdFile.files[0]);
      els.taskIds.value = result.ids.join("\n"); localStorage.setItem("tkReviewProductList", els.taskIds.value);
      els.taskImportStatus.textContent = `${result.sheet}：已导入 ${result.ids.length} 个唯一商品 ID。`;
    } catch (error) { els.taskImportStatus.textContent = `导入失败：${error.message}`; throw error; }
    finally { els.taskIdFile.value = ""; }
  }));
  for (const [id, kind] of [["taskExportXlsx", "xlsx"], ["taskExportCsv", "csv"], ["taskExportImages", "images"], ["taskExportManifest", "manifest"]]) els[id].addEventListener("click", () => operation(() => exportTask(kind)));
  window.addEventListener("pagehide", () => collectionRunner.pause());
  window.addEventListener("tk-review-busy", controls);
  window.TKReviewTaskUI = { store, runner, collectionRunner, progress, selected: () => selected, create: () => els.taskCreate.click(), exportXlsx: () => els.taskExportXlsx.click() };
  operation(async () => {
    els.taskIds.value = localStorage.getItem("tkReviewProductList") || "";
    selected = localStorage.getItem("tkReviewSelectedTask") || "";
    const tasks = await list();
    const task = tasks.find(item => (item.kind === "collection" ? item.key : item.id) === selected);
    if (task) { applySettings(task); if (task.kind === "collection") await groupProgress(task); else await progress(task); }
    else selected = "";
  });
})();
