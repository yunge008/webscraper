(function(root) {
  "use strict";
  const clone = value => structuredClone(value);
  const now = () => Date.now();
  function canonical(value) {
    if (Array.isArray(value)) return value.map(canonical);
    if (value && typeof value === "object") return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])]));
    return value;
  }
  const sameContext = (a, b) => JSON.stringify(canonical(a)) === JSON.stringify(canonical(b));
  function requestContext(request, href) {
    const url = new URL(request.url, href);
    const filters = {};
    const shops = { shopid: new Set(), sellerid: new Set(), merchantid: new Set() };
    function safeFilter(value) {
      if (Array.isArray(value)) return value.map(safeFilter);
      if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).filter(([key]) => !/token|sign|auth|cookie|csrf|xbogus|device/i.test(key)).map(([key, item]) => [key, safeFilter(item)]));
      return value;
    }
    function visit(value, path = "", depth = 0) {
      if (depth > 8 || !value || typeof value !== "object") return;
      for (const [key, raw] of Object.entries(value)) {
        const normalized = key.replace(/[_-]/g, "").toLowerCase();
        if (/^(shopid|sellerid|merchantid)$/.test(normalized) && raw !== "" && raw != null) {
          if (typeof raw === "number" && !Number.isSafeInteger(raw)) throw new Error("店铺 ID 为不精确数字，无法安全确认身份。");
          shops[normalized].add(String(raw));
        }
        if (/token|sign|auth|cookie|csrf|xbogus|timestamp|device/i.test(key)) continue;
        let parsed = raw;
        if (typeof raw === "string" && /^[\[{]/.test(raw.trim())) { try { parsed = JSON.parse(raw); } catch (_) {} }
        const fieldPath = path ? `${path}.${key}` : key;
        if (/^(page|pageno|pagenum|pagenumber|pageindex|pagesize|pagecount|cursor|nextcursor|pagetoken|offset|limit|count|size|total)$/.test(normalized)) continue;
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) visit(parsed, fieldPath, depth + 1);
        else if (/filter|search|product|sku|star|rating|reply|start.*time|end.*time|date|sort|order|keyword/i.test(key)) filters[fieldPath] = canonical(safeFilter(parsed));
      }
    }
    visit(Object.fromEntries(url.searchParams));
    let body = null;
    try { body = JSON.parse(request.requestBody || "null"); }
    catch (_) { body = Object.fromEntries(new URLSearchParams(request.requestBody || "")); }
    visit(body);
    for (const [name, value] of Object.entries(request.requestHeaders || {})) {
      if (/^(?:x-)?(?:shop|seller|merchant)[_-]?id$/i.test(name) && value) shops[name.replace(/^x-/i, "").replace(/[_-]/g, "").toLowerCase()].add(String(value));
    }
    const shopKind = Object.keys(shops).find(key => shops[key].size);
    if (!shopKind || shops[shopKind].size !== 1) throw new Error(shopKind ? "接口包含冲突的店铺身份，无法创建安全续跑任务。" : "评论请求未提供可确认的店铺 ID，请运行诊断；不能仅凭域名续跑。");
    return { origin: new URL(href).origin, endpoint: url.origin + url.pathname, shopId: [...shops[shopKind]][0], shopKind, filters: canonical(filters) };
  }

  function imageUrl(value) {
    if (typeof value !== "string") return "";
    try { const url = new URL(value); return /^https?:$/.test(url.protocol) && !/\.(?:mp4|webm|mov|m4v|mp3|wav)$/i.test(url.pathname) ? url.href : ""; } catch (_) { return ""; }
  }
  function extractImages(review, customPath = "") {
    const result = [];
    const paths = [];
    const unknown = [];
    const seen = new Set();
    function candidates(value) {
      if (typeof value === "string") return [imageUrl(value)].filter(Boolean);
      if (Array.isArray(value)) return value.flatMap(candidates);
      if (!value || typeof value !== "object") return [];
      for (const key of ["url_list", "urlList", "urls", "url", "src", "uri"]) {
        const list = candidates(value[key]);
        if (list.length) return list;
      }
      return [];
    }
    function add(item, path, imageField) {
      if (!item) return;
      if (Array.isArray(item)) { item.forEach(value => add(value, path, imageField)); return; }
      if (typeof item === "object") {
        const type = String(item.media_type ?? item.mediaType ?? item.type ?? "").toLowerCase();
        if (/video|audio/.test(type) || item.video_url || item.video_info) return;
        const markedImage = /^(image|photo|picture)$/.test(type);
        if (!imageField && !markedImage && !item.image && !item.image_info) { unknown.push(path); return; }
        if (item.image || item.image_info) { add(item.image || item.image_info, path, true); return; }
        const original = candidates(item.original_url ?? item.originalUrl ?? item.origin_url ?? item.originUrl ?? item.original ?? item.origin ?? item.large_image ?? item.largeImage)[0];
        const thumbnail = candidates(item.thumbnail_url ?? item.thumbnailUrl ?? item.thumb_url ?? item.thumbnail ?? item.thumb)[0];
        const fallback = candidates(item)[0];
        const url = original || fallback || thumbnail;
        if (url && !seen.has(url)) { seen.add(url); result.push({ url, thumbnail: thumbnail || "", source: path, original: !!original }); }
        else if (!url) unknown.push(path);
      } else if (imageField) {
        const url = imageUrl(item);
        if (url && !seen.has(url)) { seen.add(url); result.push({ url, thumbnail: "", source: path, original: false }); }
      }
    }
    const fields = ["review_images", "reviewImages", "image_list", "imageList", "images", "photos", "review_photos"];
    for (const key of fields) if (review && review[key] !== undefined) { paths.push(key); add(review[key], key, true); }
    for (const key of ["media", "media_list", "mediaList", "review_media"]) if (review && review[key] !== undefined) { paths.push(key); add(review[key], key, false); }
    if (customPath) {
      const keys = customPath.split(".");
      if (keys.some(key => !/^[a-zA-Z0-9_]+$/.test(key) || /product|sku|reply|seller|avatar|user|__proto__|constructor|prototype/i.test(key))) throw new Error("评价图字段路径只能指向买家评论媒体，不能指向商品、回复或头像字段。");
      const value = keys.reduce((item, key) => item && Object.hasOwn(item, key) ? item[key] : undefined, review);
      if (value !== undefined) { paths.push(customPath); add(value, customPath, true); }
    }
    return { images: result, paths: [...new Set(paths)], unknown: [...new Set(unknown)] };
  }

  class Store {
    constructor(factory = root.indexedDB, name = "tk-review-tasks-v1") { this.factory = factory; this.name = name; this.db = null; }
    async open() {
      if (this.db) return this.db;
      if (!this.factory) throw new Error("当前浏览器不支持本地任务数据库。");
      return this.db = await new Promise((resolve, reject) => {
        const request = this.factory.open(this.name, 1);
        request.onupgradeneeded = () => {
          const db = request.result;
          db.createObjectStore("tasks", { keyPath: "id" });
          db.createObjectStore("meta", { keyPath: "key" });
          const reviews = db.createObjectStore("reviews", { keyPath: ["taskId", "reviewId"] });
          reviews.createIndex("task", "taskId");
          const pages = db.createObjectStore("pages", { keyPath: ["taskId", "scan", "page"] });
          pages.createIndex("task", "taskId");
          pages.createIndex("signature", ["taskId", "scan", "signature"], { unique: true });
        };
        request.onsuccess = () => { request.result.onversionchange = () => { request.result.close(); this.db = null; }; resolve(request.result); };
        request.onerror = () => reject(request.error);
        request.onblocked = () => reject(new Error("数据库升级被其他侧栏阻止，请关闭其他侧栏后重试。"));
      });
    }
    async transaction(names, mode, operation) {
      const db = await this.open();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(names, mode);
        let result;
        let fault;
        const set = value => { result = value; };
        const abort = error => { fault = error; tx.abort(); };
        tx.oncomplete = () => resolve(result);
        tx.onabort = () => reject(fault || tx.error || new Error("本地保存事务已中止；进度未推进。"));
        tx.onerror = () => {};
        try { operation(tx, set, abort); } catch (error) { abort(error); }
      });
    }
    get(id) { return this.transaction(["tasks"], "readonly", (tx, set) => { tx.objectStore("tasks").get(id).onsuccess = event => set(event.target.result); }); }
    list() { return this.transaction(["tasks"], "readonly", (tx, set) => { tx.objectStore("tasks").getAll().onsuccess = event => set(event.target.result.sort((a, b) => b.updatedAt - a.updatedAt)); }); }
    create(config, context) {
      if (!context.shopId || (!config.productId && config.mode !== "current")) throw new Error("分批任务必须确认店铺身份及采集范围。");
      for (const key of ["startPage", "endPage", "batchSize", "pageSize"]) if (!Number.isSafeInteger(config[key]) || config[key] < 1) throw new Error("任务页码、每批页数和每页条数必须为正整数。");
      if (config.endPage < config.startPage || config.endPage > 100000 || config.batchSize > 500 || config.pageSize > 500) throw new Error("任务范围无效；每页和每批最多 500 条 / 页。");
      const task = { id: root.crypto.randomUUID(), config: clone(config), context: clone(context), status: "paused", scan: 1, lastPage: config.startPage - 1, uniqueCount: 0, imageCount: 0, rawCount: 0, batches: {}, failures: [], exports: [], createdAt: now(), updatedAt: now(), lastError: "" };
      return this.transaction(["tasks"], "readwrite", (tx, set) => { tx.objectStore("tasks").add(task); set(task); });
    }
    update(id, patch, owner = "") {
      return this.transaction(owner ? ["meta", "tasks"] : ["tasks"], "readwrite", (tx, set, abort) => {
        const tasks = tx.objectStore("tasks");
        const write = () => { tasks.get(id).onsuccess = event => {
          const task = event.target.result;
          if (!task) return abort(new Error("任务不存在。"));
          Object.assign(task, clone(patch), { updatedAt: now() }); tasks.put(task); set(task);
        }; };
        if (owner) tx.objectStore("meta").get("runner").onsuccess = event => {
          const lease = event.target.result;
          if (!lease || lease.owner !== owner || lease.expires <= now()) return abort(new Error("任务执行权已失效。"));
          write();
        };
        else write();
      });
    }
    collection(id) { return this.transaction(["meta"], "readonly", (tx, set) => { tx.objectStore("meta").get("collection:" + id).onsuccess = event => set(event.target.result); }); }
    collections() { return this.transaction(["meta"], "readonly", (tx, set) => { tx.objectStore("meta").getAll().onsuccess = event => set(event.target.result.filter(item => item.key.startsWith("collection:")).sort((a, b) => b.updatedAt - a.updatedAt)); }); }
    createCollection(productIds, config) {
      const ids = [...new Set(productIds)];
      if (!ids.length || ids.some(id => typeof id !== "string" || !/^\d+$/.test(id))) throw new Error("商品列表必须包含完整数字 ID。");
      const id = root.crypto.randomUUID();
      const group = { key: "collection:" + id, id, kind: "collection", config: clone(config), items: ids.map(productId => ({ productId, taskId: "", status: "pending", uniqueCount: 0, imageCount: 0 })), baseContext: null, status: "paused", failures: [], exports: [], createdAt: now(), updatedAt: now(), lastError: "" };
      return this.transaction(["meta"], "readwrite", (tx, set) => { tx.objectStore("meta").add(group); set(group); });
    }
    updateCollection(id, patch, owner = "") {
      return this.transaction(["meta"], "readwrite", (tx, set, abort) => {
        const meta = tx.objectStore("meta");
        const write = () => { meta.get("collection:" + id).onsuccess = event => {
          const group = event.target.result;
          if (!group) return abort(new Error("商品列表任务不存在。"));
          Object.assign(group, clone(patch), { updatedAt: now() }); meta.put(group); set(group);
        }; };
        if (!owner) return write();
        meta.get("runner").onsuccess = event => {
          const lease = event.target.result;
          if (!lease || lease.owner !== owner || lease.expires <= now()) return abort(new Error("列表任务执行权已失效。"));
          write();
        };
      });
    }
    lease(owner, release = false, exclusiveProof = false) {
      return this.transaction(["meta"], "readwrite", (tx, set) => {
        const meta = tx.objectStore("meta");
        meta.get("runner").onsuccess = event => {
          const current = event.target.result;
          if (release) { if (current && current.owner === owner) meta.delete("runner"); set(true); return; }
          if (!exclusiveProof && current && current.owner !== owner && current.expires > now()) { set(false); return; }
          meta.put({ key: "runner", owner, expires: now() + 120000 }); set(true);
        };
      });
    }
    page(id, scan, page) { return this.transaction(["pages"], "readonly", (tx, set) => { tx.objectStore("pages").get([id, scan, page]).onsuccess = event => set(event.target.result); }); }
    commitPage(id, owner, page, rows, signature, mediaStats = {}) {
      return this.transaction(["meta", "tasks", "reviews", "pages"], "readwrite", (tx, set, abort) => {
        tx.objectStore("meta").get("runner").onsuccess = event => {
          const lease = event.target.result;
          if (!lease || lease.owner !== owner || lease.expires <= now()) return abort(new Error("任务执行权已失效，停止保存以避免多窗口冲突。"));
          const tasks = tx.objectStore("tasks");
          tasks.get(id).onsuccess = event => {
            const task = event.target.result;
            if (!task || task.status !== "running" || page !== task.lastPage + 1 || page > task.config.endPage) return abort(new Error("页码检查点不连续，保存已中止。"));
            if (!rows.length || rows.length > task.config.pageSize) return abort(new Error("页数据为空或超过确认的每页条数，保存已中止。"));
            if (rows.some(row => !row.main_review_id || (typeof row.main_review_id === "number" && !Number.isSafeInteger(row.main_review_id)))) return abort(new Error("评论缺少精确 ID，不能安全去重。"));
            if (new Set(rows.map(row => String(row.main_review_id))).size !== rows.length) return abort(new Error("同一页出现重复评论 ID，请检查接口解析。"));
            const batch = Math.floor((page - task.config.startPage) / task.config.batchSize) + 1;
            const store = tx.objectStore("reviews");
            let added = 0;
            let images = 0;
            let remaining = rows.length;
            const finish = () => {
              task.lastPage = page; task.uniqueCount += added; task.imageCount += images; task.rawCount += rows.length; task.updatedAt = now(); task.lastError = "";
              const b = task.batches[batch] || { batch, startPage: task.config.startPage + (batch - 1) * task.config.batchSize, endPage: Math.min(task.config.endPage, task.config.startPage + batch * task.config.batchSize - 1), rawCount: 0, newCount: 0, status: "running" };
              b.rawCount += rows.length; b.newCount += added; b.lastPage = page; b.status = page === b.endPage ? "complete" : "running"; task.batches[batch] = b;
              task.mediaStats = { paths: [...new Set([...(task.mediaStats && task.mediaStats.paths || []), ...(mediaStats.paths || [])])], unknown: [...new Set([...(task.mediaStats && task.mediaStats.unknown || []), ...(mediaStats.unknown || [])])] };
              tx.objectStore("pages").add({ taskId: id, scan: task.scan, page, signature, reviewIds: rows.map(row => String(row.main_review_id)), rawCount: rows.length, newCount: added, savedAt: now() });
              tasks.put(task); set(task);
            };
            for (const row of rows) {
              const reviewId = String(row.main_review_id);
              store.get([id, reviewId]).onsuccess = event => {
                const old = event.target.result;
                if (!old) {
                  added++; images += (row.review_images || []).length;
                  store.add({ taskId: id, reviewId, firstPage: page, firstBatch: batch, firstScan: task.scan, row: clone(row), savedAt: now() });
                } else {
                  images += (row.review_images || []).length - (old.row.review_images || []).length;
                  store.put({ ...old, row: clone(row), lastSeenAt: now() });
                }
                if (!--remaining) finish();
              };
            }
          };
        };
      });
    }
    async readRows(id, options = {}) {
      return this.transaction(["reviews"], "readonly", (tx, set) => {
        const rows = [];
        const request = tx.objectStore("reviews").index("task").openCursor(id);
        request.onsuccess = event => {
          const cursor = event.target.result;
          if (!cursor || (options.limit && rows.length >= options.limit)) { set(rows); return; }
          if (!options.batch || cursor.value.firstBatch === options.batch) rows.push(cursor.value);
          cursor.continue();
        };
      });
    }
    async visitRows(id, visitor, batch = 0) {
      return this.transaction(["reviews"], "readonly", (tx, set, abort) => {
        let count = 0;
        const request = tx.objectStore("reviews").index("task").openCursor(id);
        request.onsuccess = event => {
          const cursor = event.target.result;
          if (!cursor) { set(count); return; }
          try { if (!batch || cursor.value.firstBatch === batch) { visitor(cursor.value); count++; } cursor.continue(); }
          catch (error) { abort(error); }
        };
      });
    }
    restart(id, owner = "") {
      return this.transaction(["meta", "tasks"], "readwrite", (tx, set, abort) => {
        tx.objectStore("meta").get("runner").onsuccess = event => {
          const lease = event.target.result;
          if (lease && lease.owner !== owner && lease.expires > now()) return abort(new Error("其他任务正在运行，不能重置补扫进度。"));
          const tasks = tx.objectStore("tasks"); tasks.get(id).onsuccess = event => {
            const task = event.target.result;
            if (!task) return abort(new Error("任务不存在。"));
            Object.assign(task, { status: "paused", scan: task.scan + 1, lastPage: task.config.startPage - 1, rawCount: 0, batches: {}, failures: [], mediaStats: {}, lastError: "", updatedAt: now() });
            tasks.put(task); set(task);
          };
        };
      });
    }
  }

  function controlError(message) { const error = new Error(message); error.noRetry = true; return error; }
  class Runner {
    constructor(store, transport, progress = () => {}, wait = ms => new Promise(resolve => setTimeout(resolve, ms))) {
      this.store = store; this.transport = transport; this.progress = progress; this.wait = wait; this.owner = root.crypto.randomUUID(); this.stopped = false; this.active = false;
    }
    pause() { this.stopped = true; if (this.transport.pause) this.transport.pause(); }
    async run(id, options = {}) {
      if (root.navigator && root.navigator.locks) {
        return root.navigator.locks.request("tk-review-task-runner", { mode: "exclusive", ifAvailable: true }, lock => {
          if (!lock) throw new Error("其他侧栏正在执行任务，请先暂停该任务。");
          return this.execute(id, true, options);
        });
      }
      return this.execute(id, false, options);
    }
    async execute(id, exclusiveProof, options) {
      if (this.active) throw new Error("已有任务正在运行。");
      if (!await this.store.lease(this.owner, false, exclusiveProof)) throw new Error("其他侧栏正在执行任务，请先暂停该任务。");
      this.active = true; this.stopped = false;
      let task;
      let heartbeat;
      try {
        task = await this.store.get(id);
        if (task && options.rescan) {
          task = await this.store.restart(id, this.owner);
          if (options.imagePath !== undefined) {
            extractImages({}, options.imagePath);
            task = await this.store.update(id, { config: { ...task.config, imagePath: options.imagePath } }, this.owner);
          }
        }
        if (!task || task.status === "complete") throw controlError("请选择尚未完成的任务，或点击从头补扫。");
        task = await this.store.update(id, { status: "running", lastError: "" }, this.owner);
        heartbeat = setInterval(() => this.store.lease(this.owner).then(ok => { if (!ok) this.pause(); }).catch(() => this.pause()), 20000);
        await this.progress(task);
        const prepared = await this.transport.prepare(task);
        if (!sameContext(task.context, prepared.context)) throw controlError("店铺或筛选条件与保存的任务不一致；请恢复原条件后继续。");
        if (prepared.pageSize !== task.config.pageSize) throw controlError(`页面每页条数与任务不一致，请恢复为 ${task.config.pageSize} 条后继续。`);
        let anchor = null;
        if (task.lastPage >= task.config.startPage) {
          const anchorPage = task.lastPage;
          anchor = await this.transport.read(anchorPage, { positioning: true });
          const saved = await this.store.page(id, task.scan, anchorPage);
          if (!sameContext(task.context, anchor.context) || anchor.page !== anchorPage || anchor.pageSize !== task.config.pageSize) throw controlError("断点页的店铺、筛选条件或位置无法确认。");
          if (!saved || anchor.signature !== saved.signature) throw controlError("断点页评论已变化，无法安全按原页码续跑；请从头去重补扫。");
        }
        const signatures = new Set(anchor ? [anchor.signature] : []);
        for (let page = task.lastPage + 1; page <= task.config.endPage; page++) {
          if (this.stopped) break;
          let data;
          for (let attempt = 0; attempt < 3; attempt++) {
            if (this.stopped) break;
            try {
              data = await this.transport.read(page, { previous: anchor, retry: attempt > 0 });
              if (!sameContext(task.context, data.context)) throw controlError("采集中店铺或筛选条件发生变化，任务已暂停。");
              if (data.pageSize !== task.config.pageSize || data.page !== page) throw controlError("页面位置或每页条数无法确认，任务已暂停。");
              if (!data.rows.length || !data.signature || signatures.has(data.signature)) throw new Error("空响应或重复页，不能作为完成信号。");
              if (task.config.mode !== "current" && data.rows.some(row => String(row.product_id) !== task.config.productId && String(row.sku_id) !== task.config.productId)) throw controlError("响应包含其他商品，任务已暂停。");
              break;
            } catch (error) {
              data = null;
              if (error.noRetry || /HTTP (?:401|403|429)|登录|验证码|权限|限流|身份|筛选条件|断点/.test(error.message) || attempt === 2) throw error;
              await this.progress({ ...task, retryPage: page, retryAttempt: attempt + 1 });
              await this.wait(1000 * 2 ** attempt);
            }
          }
          if (!data || this.stopped) break;
          task = await this.store.commitPage(id, this.owner, page, data.rows, data.signature, data.mediaStats);
          anchor = data; signatures.add(data.signature);
          await this.progress(task);
          if (page !== task.config.endPage) {
            const batchBoundary = (page - task.config.startPage + 1) % task.config.batchSize === 0;
            await this.wait(batchBoundary ? 5000 : 800);
          }
        }
        task = await this.store.update(id, { status: task.lastPage >= task.config.endPage ? "complete" : "paused", lastError: "" }, this.owner);
      } catch (error) {
        if (task) {
          const fresh = await this.store.get(id);
          const failures = fresh.failures.slice(-49);
          if (!this.stopped) failures.push({ page: fresh.lastPage + 1, batch: Math.floor((fresh.lastPage + 1 - fresh.config.startPage) / fresh.config.batchSize) + 1, error: error.message, at: now() });
          task = await this.store.update(id, { status: "paused", lastError: this.stopped ? "" : error.message, failures }, this.owner);
        } else throw error;
      } finally {
        clearInterval(heartbeat);
        if (!options.keepLease) await this.store.lease(this.owner, true);
        this.active = false;
      }
      await this.progress(task);
      return task;
    }
  }
  function baseContext(context, productId) {
    return { ...context, filters: Object.fromEntries(Object.entries(context.filters).filter(([key, value]) => !/product|sku/i.test(key) && String(value) !== productId)) };
  }
  class CollectionRunner {
    constructor(store, runner, prepare, progress = () => {}) { this.store = store; this.runner = runner; this.prepare = prepare; this.progress = progress; this.active = false; this.stopped = false; }
    pause() { this.stopped = true; this.runner.pause(); }
    async run(id) {
      const execute = proof => this.execute(id, proof);
      if (root.navigator && root.navigator.locks) return root.navigator.locks.request("tk-review-task-runner", { mode: "exclusive", ifAvailable: true }, lock => {
        if (!lock) throw new Error("其他侧栏正在执行任务，请先暂停该任务。");
        return execute(true);
      });
      return execute(false);
    }
    async execute(id, proof) {
      if (this.active || this.runner.active) throw new Error("已有任务正在运行。");
      const owner = this.runner.owner;
      if (!await this.store.lease(owner, false, proof)) throw new Error("其他侧栏正在执行任务。");
      this.active = true; this.stopped = false;
      const heartbeat = setInterval(() => this.store.lease(owner).then(ok => { if (!ok) this.pause(); }).catch(() => this.pause()), 20000);
      let group;
      try {
        group = await this.store.collection(id);
        group = await this.store.updateCollection(id, { status: "running", lastError: "" }, owner);
        await this.progress(group);
        for (let index = 0; index < group.items.length; index++) {
          if (this.stopped) break;
          let item = group.items[index];
          if (item.status === "complete") continue;
          let task = item.taskId ? await this.store.get(item.taskId) : null;
          // Recover an interrupted final collection update from the child's durable state.
          if (!task || task.status !== "complete") {
            const data = await this.prepare(task, item.productId);
            if (this.stopped) break;
            const base = baseContext(data.context, item.productId);
            if (group.baseContext && !sameContext(group.baseContext, base)) throw controlError("店铺或日期等筛选条件与商品列表任务不一致，请恢复原条件后继续。");
            if (!group.baseContext) group = await this.store.updateCollection(id, { baseContext: base }, owner);
            if (!data.rows.length) {
              if (data.total !== 0 || task) throw controlError("当前商品为空，但不能确认任务已完成；列表已暂停。");
              item = { ...item, status: "complete", uniqueCount: 0, imageCount: 0, empty: true };
            } else {
              if (!task) {
                const totalPages = Number.isSafeInteger(data.total) && data.total > 0 ? Math.ceil(data.total / data.pageSize) : 0;
                if (group.config.allPages && !totalPages) throw controlError("接口没有明确总条数，无法确认全部页。");
                const config = { ...group.config, mode: "list", collectionId: id, productId: item.productId, pageSize: data.pageSize, endPage: group.config.allPages ? totalPages : group.config.endPage };
                if (totalPages && config.endPage > totalPages) throw controlError("终止页超过当前商品的总页数。");
                task = await this.store.create(config, data.context);
                item = { ...item, taskId: task.id };
                group.items[index] = item;
                group = await this.store.updateCollection(id, { items: group.items }, owner);
              }
              if (this.stopped) break;
              task = await this.runner.execute(task.id, proof, { keepLease: true });
              item = { ...item, status: task.status, uniqueCount: task.uniqueCount, imageCount: task.imageCount, lastError: task.lastError };
            }
          } else item = { ...item, status: "complete", uniqueCount: task.uniqueCount, imageCount: task.imageCount, lastError: "" };
          group.items[index] = item;
          group = await this.store.updateCollection(id, { items: group.items, lastError: item.lastError || "" }, owner);
          await this.progress(group);
          if (item.status !== "complete") break;
          if (index < group.items.length - 1 && !this.stopped) await this.runner.wait(800);
        }
        group = await this.store.updateCollection(id, { status: group.items.every(item => item.status === "complete") ? "complete" : "paused" }, owner);
      } catch (error) {
        if (!group) throw error;
        group = await this.store.updateCollection(id, { status: "paused", lastError: this.stopped ? "" : error.message }, owner);
      } finally {
        clearInterval(heartbeat); await this.store.lease(owner, true); this.active = false;
      }
      await this.progress(group); return group;
    }
  }
  const api = { Store, Runner, CollectionRunner, baseContext, extractImages, requestContext, sameContext, canonical, controlError };
  root.TKReviewTasks = api;
  if (typeof module === "object" && module.exports) module.exports = api;
})(typeof globalThis === "object" ? globalThis : this);
