(function(root) {
  "use strict";
  const columns = ["star_level", "review_text", "reply_text", "reply_count", "main_review_id", "order_id", "product_id", "product_name", "sku_id", "sku_specification", "user_name", "create_time", "review_image_count", "review_image_urls"];
  const labels = ["星级", "评论内容", "回复内容", "回复数", "评论 ID", "订单 ID", "商品 ID", "商品名称", "SKU ID", "SKU 规格", "用户名", "评论时间", "评价图数量", "评价图链接"];
  const imageLabels = ["任务 ID", "商品 ID", "评论 ID", "图片序号", "原图或可用链接", "缩略图链接", "媒体字段", "已识别原图"];
  function imageRows(record) { return (record.row.review_images || []).map((image, index) => [record.taskId, record.row.product_id, record.reviewId, index + 1, image.url, image.thumbnail, image.source, image.original ? "是" : "否"]); }
  function csvCell(value) {
    let text = value == null ? "" : String(value);
    if (/^[=+\-@\t\r]/.test(text)) text = "'" + text;
    return '"' + text.replace(/"/g, '""') + '"';
  }
  async function csv(store, id, { images = false, batch = 0 } = {}) {
    const parts = ["\uFEFF", (images ? imageLabels : labels).map(csvCell).join(",") + "\r\n"];
    let buffer = "";
    let count = 0;
    await store.visitRows(id, record => {
      const values = images ? imageRows(record) : [columns.map(key => record.row[key])];
      for (const row of values) { buffer += row.map(csvCell).join(",") + "\r\n"; count++; }
      if (buffer.length > 256000) { parts.push(buffer); buffer = ""; }
    }, batch);
    if (buffer) parts.push(buffer);
    return { blob: new Blob(parts, { type: "text/csv;charset=utf-8" }), rows: count };
  }
  const encoder = new TextEncoder();
  function xml(value) { return String(value == null ? "" : value).replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function column(index) { let name = ""; for (let n = index + 1; n; n = Math.floor((n - 1) / 26)) name = String.fromCharCode(65 + (n - 1) % 26) + name; return name; }
  function rowXml(values, index) {
    return `<row r="${index}">${values.map((value, i) => `<c r="${column(i)}${index}" t="inlineStr"><is><t xml:space="preserve">${xml(String(value == null ? "" : value).slice(0, 32767))}</t></is></c>`).join("")}</row>`;
  }
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) { let crc = i; for (let j = 0; j < 8; j++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0); table[i] = crc >>> 0; }
  function crcBytes(crc, bytes) { for (const value of bytes) crc = (crc >>> 8) ^ table[(crc ^ value) & 255]; return crc >>> 0; }
  class Sheet {
    constructor(headers) { this.parts = []; this.buffer = '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" state="frozen"/></sheetView></sheetViews><sheetData>'; this.rows = 0; this.add(headers); }
    add(values) { if (++this.rows > 1048576) throw new Error("图片明细超过 Excel 单表行数，请按批次导出。"); this.buffer += rowXml(values, this.rows); if (this.buffer.length > 256000) this.flush(); }
    flush() { if (this.buffer) this.parts.push(encoder.encode(this.buffer)); this.buffer = ""; }
    finish() { this.buffer += '</sheetData></worksheet>'; this.flush(); return this.parts; }
  }
  function zip(entries) {
    const parts = [];
    const central = [];
    let offset = 0;
    function header(size) { const bytes = new Uint8Array(size); return [bytes, new DataView(bytes.buffer)]; }
    for (const [name, values] of entries) {
      const nameBytes = encoder.encode(name);
      const chunks = values.map(value => typeof value === "string" ? encoder.encode(value) : value);
      const size = chunks.reduce((sum, value) => sum + value.length, 0);
      if (size > 0xffffffff || offset + size > 0xffffffff) throw new Error("文件超过 ZIP 大小限制，请按批次导出。");
      let crc = 0xffffffff; for (const bytes of chunks) crc = crcBytes(crc, bytes); crc = (crc ^ 0xffffffff) >>> 0;
      const [local, l] = header(30); l.setUint32(0, 0x04034b50, true); l.setUint16(4, 20, true); l.setUint16(6, 0x800, true); l.setUint32(14, crc, true); l.setUint32(18, size, true); l.setUint32(22, size, true); l.setUint16(26, nameBytes.length, true);
      const [dir, d] = header(46); d.setUint32(0, 0x02014b50, true); d.setUint16(4, 20, true); d.setUint16(6, 20, true); d.setUint16(8, 0x800, true); d.setUint32(16, crc, true); d.setUint32(20, size, true); d.setUint32(24, size, true); d.setUint16(28, nameBytes.length, true); d.setUint32(42, offset, true);
      parts.push(local, nameBytes, ...chunks); central.push(dir, nameBytes); offset += local.length + nameBytes.length + size;
    }
    const centralSize = central.reduce((sum, value) => sum + value.length, 0);
    const [end, e] = header(22); e.setUint32(0, 0x06054b50, true); e.setUint16(8, entries.length, true); e.setUint16(10, entries.length, true); e.setUint32(12, centralSize, true); e.setUint32(16, offset, true);
    return new Blob([...parts, ...central, end], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  }
  async function xlsx(store, task, batch = 0) {
    const collection = task.kind === "collection";
    const reviews = new Sheet(collection ? [...labels, "采集商品 ID"] : labels);
    const images = new Sheet(imageLabels);
    const summary = new Sheet(["项目", "内容"]);
    const scope = task.config.mode === "current" ? "当前筛选结果" : collection ? "商品 ID 列表" : "固定商品";
    for (const [key, value] of Object.entries({ "任务 ID": task.id, "采集范围": scope, "商品 / SKU ID": task.config.productId, "店铺 ID": (task.context || task.baseContext || {}).shopId, "状态": task.status, "已保存至页": task.lastPage, "唯一评论": task.uniqueCount, "批次": batch || "全部", "筛选条件": JSON.stringify(task.context || task.baseContext || {}), "说明": "链接可能过期；图片未下载。超长正文按 Excel 单元格上限截断，完整正文请导出 CSV。" })) summary.add([key, value]);
    const productSheet = collection ? new Sheet(["商品 ID", "状态", "已保存评论", "评价图数量", "已保存至页", "任务 ID", "提示"]) : null;
    const add = productId => record => { reviews.add([...columns.map(key => record.row[key]), ...(collection ? [productId] : [])]); imageRows(record).forEach(row => images.add(row)); };
    if (collection) {
      for (const item of task.items) {
        const child = item.taskId ? await store.get(item.taskId) : null;
        if (item.taskId && !child) throw new Error("商品子任务数据缺失，无法完整导出。");
        if (child) await store.visitRows(child.id, add(item.productId), batch);
        productSheet.add([item.productId, child ? child.status : item.status, child ? child.uniqueCount : 0, child ? child.imageCount : 0, child ? child.lastPage : "", item.taskId, item.empty ? "当前筛选下无评论" : child ? child.lastError : item.lastError || ""]);
      }
    } else await store.visitRows(task.id, add(task.config.productId), batch);
    const names = ["评论", "评价图", "任务摘要", ...(collection ? ["商品任务"] : [])];
    const contentTypes = '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' + names.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join("") + '</Types>';
    const workbook = '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>' + names.map((name, i) => `<sheet name="${name}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join("") + '</sheets></workbook>';
    const relationships = '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' + names.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join("") + '</Relationships>';
    return zip([["[Content_Types].xml", [contentTypes]], ["_rels/.rels", ['<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>']], ["xl/workbook.xml", [workbook]], ["xl/_rels/workbook.xml.rels", [relationships]], ["xl/worksheets/sheet1.xml", reviews.finish()], ["xl/worksheets/sheet2.xml", images.finish()], ["xl/worksheets/sheet3.xml", summary.finish()], ...(collection ? [["xl/worksheets/sheet4.xml", productSheet.finish()]] : [])]);
  }
  const api = { columns, labels, extractImageRows: imageRows, csv, xlsx, csvCell };
  root.TKReviewExport = api;
  if (typeof module === "object" && module.exports) module.exports = api;
})(typeof globalThis === "object" ? globalThis : this);
