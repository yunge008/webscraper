// TK 评论抓取：评价图打包（ZIP）与 Excel 内嵌缩略图。
// 不依赖第三方库：自带最小 ZIP 读写（中央目录解析、store/deflate、CRC32、UTF-8 文件名）。
(function(root) {
  "use strict";

  // ---------- CRC32 ----------
  const CRC_TABLE = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; }
    return t;
  })();
  function crc32(bytes) {
    let c = 0xFFFFFFFF;
    for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
  }
  const enc = new TextEncoder();
  const dec = new TextDecoder();

  // ---------- ZIP 读取（通过中央目录，兼容数据描述符） ----------
  async function inflateRaw(bytes) {
    if (typeof DecompressionStream === "function") {
      const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
      return new Uint8Array(await new Response(stream).arrayBuffer());
    }
    if (typeof require === "function") return new Uint8Array(require("zlib").inflateRawSync(bytes));
    throw new Error("当前环境不支持解压 ZIP");
  }
  async function readZip(input) {
    const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    let eocd = -1;
    for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--) if (view.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
    if (eocd < 0) throw new Error("不是有效的 ZIP 文件");
    const count = view.getUint16(eocd + 10, true);
    let p = view.getUint32(eocd + 16, true);
    const files = [];
    for (let i = 0; i < count; i++) {
      if (view.getUint32(p, true) !== 0x02014b50) throw new Error("ZIP 中央目录损坏");
      const method = view.getUint16(p + 10, true);
      const size = view.getUint32(p + 20, true);
      const nameLen = view.getUint16(p + 28, true), extraLen = view.getUint16(p + 30, true), commentLen = view.getUint16(p + 32, true);
      const local = view.getUint32(p + 42, true);
      const name = dec.decode(bytes.subarray(p + 46, p + 46 + nameLen));
      const dataStart = local + 30 + view.getUint16(local + 26, true) + view.getUint16(local + 28, true);
      const raw = bytes.subarray(dataStart, dataStart + size);
      files.push({ name, data: method === 0 ? raw.slice() : await inflateRaw(raw) });
      p += 46 + nameLen + extraLen + commentLen;
    }
    return files;
  }

  // ---------- ZIP 写入（store；图片本身已压缩，不再压缩） ----------
  function dosTime(date) {
    return {
      time: (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2),
      date: ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate()
    };
  }
  function writeZip(files) {
    const parts = [];
    const central = [];
    let offset = 0;
    const { time, date } = dosTime(new Date());
    for (const file of files) {
      const name = enc.encode(file.name);
      const data = file.data instanceof Uint8Array ? file.data : enc.encode(String(file.data));
      const crc = crc32(data);
      const header = new DataView(new ArrayBuffer(30));
      header.setUint32(0, 0x04034b50, true); header.setUint16(4, 20, true); header.setUint16(6, 0x0800, true);
      header.setUint16(8, 0, true); header.setUint16(10, time, true); header.setUint16(12, date, true);
      header.setUint32(14, crc, true); header.setUint32(18, data.length, true); header.setUint32(22, data.length, true);
      header.setUint16(26, name.length, true); header.setUint16(28, 0, true);
      parts.push(new Uint8Array(header.buffer), name, data);
      const c = new DataView(new ArrayBuffer(46));
      c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x0800, true);
      c.setUint16(10, 0, true); c.setUint16(12, time, true); c.setUint16(14, date, true);
      c.setUint32(16, crc, true); c.setUint32(20, data.length, true); c.setUint32(24, data.length, true);
      c.setUint16(28, name.length, true); c.setUint32(42, offset, true);
      central.push(new Uint8Array(c.buffer), name);
      offset += 30 + name.length + data.length;
    }
    const centralSize = central.reduce((n, part) => n + part.length, 0);
    const end = new DataView(new ArrayBuffer(22));
    end.setUint32(0, 0x06054b50, true); end.setUint16(8, files.length, true); end.setUint16(10, files.length, true);
    end.setUint32(12, centralSize, true); end.setUint32(16, offset, true);
    return new Blob([...parts, ...central, new Uint8Array(end.buffer)], { type: "application/zip" });
  }

  // ---------- 图片抓取 / 缩略图 ----------
  async function fetchBytes(url, timeout = 30000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(url, { signal: controller.signal, credentials: "omit" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return { bytes: new Uint8Array(await response.arrayBuffer()), type: response.headers.get("content-type") || "" };
    } finally { clearTimeout(timer); }
  }
  function extOf(url, type) {
    const m = String(url).split("?")[0].match(/\.(jpe?g|png|webp|gif|heic|avif)$/i);
    if (m) return m[1].toLowerCase().replace("jpeg", "jpg");
    if (/png/.test(type)) return "png";
    if (/webp/.test(type)) return "webp";
    return "jpg";
  }
  // 缩成最长边 max 像素的 JPEG（Excel/WPS 都能显示；webp/heic 原图会被转成 JPEG）
  async function thumbnail(bytes, max = 160) {
    const bitmap = await createImageBitmap(new Blob([bytes]));
    const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
    const w = Math.max(1, Math.round(bitmap.width * scale)), h = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = new OffscreenCanvas(w, h);
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, w, h);
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close && bitmap.close();
    const blob = await canvas.convertToBlob({ type: "image/jpeg", quality: 0.75 });
    return { bytes: new Uint8Array(await blob.arrayBuffer()), w, h };
  }
  async function pool(items, concurrency, worker, shouldStop = () => false) {
    let index = 0;
    const run = async () => { while (index < items.length && !shouldStop()) { const i = index++; await worker(items[i], i); } };
    await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, run));
  }

  // ---------- 向 xlsx 的第一张工作表嵌入图片 ----------
  const xmlEscape = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  // images: [{ row, col, bytes, w, h, link }]，row/col 从 0 开始（row 0 为表头）
  async function embedImages(xlsxBytes, images) {
    const files = await readZip(xlsxBytes);
    const get = name => files.find(f => f.name === name);
    const sheet = get("xl/worksheets/sheet1.xml");
    if (!sheet) throw new Error("工作簿结构异常：找不到第一张表");
    const EMU = 9525;
    const anchors = [];
    const rels = [];
    images.forEach((img, i) => {
      const n = i + 1;
      files.push({ name: `xl/media/tkimg${n}.jpeg`, data: img.bytes });
      rels.push(`<Relationship Id="rIdImg${n}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/tkimg${n}.jpeg"/>`);
      let link = "";
      if (img.link) {
        rels.push(`<Relationship Id="rIdLnk${n}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="${xmlEscape(img.link)}" TargetMode="External"/>`);
        link = `<a:hlinkClick r:id="rIdLnk${n}"/>`;
      }
      const cx = img.w * EMU, cy = img.h * EMU;
      anchors.push(`<xdr:oneCellAnchor><xdr:from><xdr:col>${img.col}</xdr:col><xdr:colOff>${2 * EMU}</xdr:colOff><xdr:row>${img.row}</xdr:row><xdr:rowOff>${2 * EMU}</xdr:rowOff></xdr:from><xdr:ext cx="${cx}" cy="${cy}"/>` +
        `<xdr:pic><xdr:nvPicPr><xdr:cNvPr id="${n + 1}" name="评价图 ${n}">${link}</xdr:cNvPr><xdr:cNvPicPr><a:picLocks noChangeAspect="1"/></xdr:cNvPicPr></xdr:nvPicPr>` +
        `<xdr:blipFill><a:blip r:embed="rIdImg${n}"/><a:stretch><a:fillRect/></a:stretch></xdr:blipFill>` +
        `<xdr:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></xdr:spPr></xdr:pic><xdr:clientData/></xdr:oneCellAnchor>`);
    });
    files.push({ name: "xl/drawings/drawing1.xml", data: enc.encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">${anchors.join("")}</xdr:wsDr>`) });
    files.push({ name: "xl/drawings/_rels/drawing1.xml.rels", data: enc.encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${rels.join("")}</Relationships>`) });
    // 工作表关联 drawing
    const sheetRelsName = "xl/worksheets/_rels/sheet1.xml.rels";
    const drawingRel = `<Relationship Id="rIdTkDrawing" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing1.xml"/>`;
    const sheetRels = get(sheetRelsName);
    if (sheetRels) sheetRels.data = enc.encode(dec.decode(sheetRels.data).replace("</Relationships>", `${drawingRel}</Relationships>`));
    else files.push({ name: sheetRelsName, data: enc.encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${drawingRel}</Relationships>`) });
    let xml = dec.decode(sheet.data);
    if (!/xmlns:r=/.test(xml.slice(0, 1000))) xml = xml.replace("<worksheet ", '<worksheet xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" ');
    // <drawing> 必须位于 tableParts / extLst 之前
    const tag = '<drawing r:id="rIdTkDrawing"/>';
    const before = xml.search(/<(legacyDrawing|legacyDrawingHF|picture|oleObjects|controls|webPublishItems|tableParts|extLst)[\s>/]/);
    xml = before >= 0 ? xml.slice(0, before) + tag + xml.slice(before) : xml.replace("</worksheet>", `${tag}</worksheet>`);
    sheet.data = enc.encode(xml);
    const types = get("[Content_Types].xml");
    let ct = dec.decode(types.data);
    if (!/Extension="jpeg"/i.test(ct)) ct = ct.replace("<Default ", '<Default Extension="jpeg" ContentType="image/jpeg"/><Default ');
    ct = ct.replace("</Types>", '<Override PartName="/xl/drawings/drawing1.xml" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/></Types>');
    types.data = enc.encode(ct);
    // [Content_Types].xml 放在最前面
    files.sort((a, b) => (b.name === "[Content_Types].xml") - (a.name === "[Content_Types].xml"));
    return writeZip(files);
  }

  const api = { crc32, readZip, writeZip, fetchBytes, thumbnail, extOf, pool, embedImages };
  root.TKMedia = api;
  if (typeof module === "object" && module.exports) module.exports = api;
})(typeof globalThis === "object" ? globalThis : this);
