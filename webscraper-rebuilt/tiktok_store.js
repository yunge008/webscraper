// TK 评论抓取：任务与评论的本地存储（IndexedDB，扩展私有）。
(function(root) {
  "use strict";
  const DB_NAME = "tk-reviews-v2";

  class Store {
    constructor(factory = root.indexedDB) { this.factory = factory; this.db = null; }
    open() {
      if (this.db) return Promise.resolve(this.db);
      return new Promise((resolve, reject) => {
        const request = this.factory.open(DB_NAME, 1);
        request.onupgradeneeded = () => {
          const db = request.result;
          db.createObjectStore("tasks", { keyPath: "id" });
          const rows = db.createObjectStore("rows", { keyPath: ["taskId", "key"] });
          rows.createIndex("task", "taskId");
        };
        request.onsuccess = () => {
          this.db = request.result;
          this.db.onversionchange = () => { this.db.close(); this.db = null; };
          resolve(this.db);
        };
        request.onerror = () => reject(request.error || new Error("无法打开本地数据库"));
        request.onblocked = () => reject(new Error("本地数据库被其他窗口占用，请关闭其他侧栏后重试"));
      });
    }
    async tx(stores, mode, work) {
      const db = await this.open();
      return new Promise((resolve, reject) => {
        const t = db.transaction(stores, mode);
        let result;
        t.oncomplete = () => resolve(result);
        t.onerror = () => {};
        t.onabort = () => reject(t.error || new Error("本地保存失败"));
        try { result = work(t); } catch (error) { try { t.abort(); } catch (_) {} reject(error); }
      });
    }
    getTask(id) {
      return this.tx(["tasks"], "readonly", t => { const box = {}; t.objectStore("tasks").get(id).onsuccess = e => { box.v = e.target.result; }; return box; }).then(box => box.v || null);
    }
    listTasks() {
      return this.tx(["tasks"], "readonly", t => { const box = { v: [] }; t.objectStore("tasks").getAll().onsuccess = e => { box.v = e.target.result; }; return box; })
        .then(box => box.v.sort((a, b) => b.createdAt - a.createdAt));
    }
    putTask(task) {
      task.updatedAt = Date.now();
      return this.tx(["tasks"], "readwrite", t => { t.objectStore("tasks").put(task); return task; });
    }
    // 一页评论与任务进度在同一事务内提交：保存成功才推进进度。
    savePage(task, records) {
      task.updatedAt = Date.now();
      return this.tx(["tasks", "rows"], "readwrite", t => {
        const rows = t.objectStore("rows");
        const box = { added: 0, images: 0 };
        let pending = records.length;
        const done = () => {
          task.rowCount = (task.rowCount || 0) + box.added;
          task.imageCount = (task.imageCount || 0) + box.images;
          t.objectStore("tasks").put(task);
        };
        if (!pending) done();
        for (const record of records) {
          const value = { taskId: task.id, ...record };
          const images = (record.row.review_images || []).length;
          rows.get([task.id, record.key]).onsuccess = e => {
            const old = e.target.result;
            if (!old) { box.added++; box.images += images; rows.add(value); }
            else { box.images += images - (old.row.review_images || []).length; rows.put({ ...old, row: record.row, page: record.page }); }
            if (!--pending) done();
          };
        }
        return box;
      }).then(box => box.added);
    }
    readRows(taskId, limit = 0) {
      return this.tx(["rows"], "readonly", t => {
        const box = { v: [] };
        t.objectStore("rows").index("task").openCursor(IDBKeyRange.only(taskId)).onsuccess = e => {
          const cursor = e.target.result;
          if (!cursor || (limit && box.v.length >= limit)) return;
          box.v.push(cursor.value); cursor.continue();
        };
        return box;
      }).then(box => box.v);
    }
    deleteTask(taskId) {
      return this.tx(["tasks", "rows"], "readwrite", t => {
        t.objectStore("tasks").delete(taskId);
        t.objectStore("rows").index("task").openKeyCursor(IDBKeyRange.only(taskId)).onsuccess = e => {
          const cursor = e.target.result;
          if (!cursor) return;
          t.objectStore("rows").delete(cursor.primaryKey); cursor.continue();
        };
      });
    }
  }

  root.TKStore = Store;
  if (typeof module === "object" && module.exports) module.exports = Store;
})(typeof globalThis === "object" ? globalThis : this);
