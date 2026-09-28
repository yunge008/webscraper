(function(root) {
  "use strict";
  function normalize(values) {
    const result = []; const seen = new Set();
    for (const [index, value] of values.entries()) {
      if (value == null || String(value).trim() === "") continue;
      if (typeof value === "number" && !Number.isSafeInteger(value)) throw new Error(`第 ${index + 1} 个 ID 已丢失数字精度，请在 Excel 中以文本保存完整 ID 后重新上传。`);
      const id = String(value).trim();
      if (!/^\d+$/.test(id)) throw new Error(`第 ${index + 1} 个 ID 不是完整数字编号，请勿使用科学计数法。`);
      if (id.length > 32) throw new Error(`第 ${index + 1} 个 ID 长度异常。`);
      if (!seen.has(id)) { seen.add(id); result.push(id); }
    }
    if (!result.length) throw new Error("商品 ID 列表为空。");
    if (result.length > 10000) throw new Error("单个商品列表最多 10000 个 ID，请拆分上传。");
    return result;
  }
  function text(value) { return normalize(String(value).split(/\r?\n/)); }
  function workbook(book, XLSX) {
    const candidates = [];
    for (const name of book.SheetNames) {
      const sheet = book.Sheets[name];
      if (!sheet["!ref"]) continue;
      const range = XLSX.utils.decode_range(sheet["!ref"]);
      if (range.e.r - range.s.r > 100000 || range.e.c - range.s.c > 1000) throw new Error("文件范围过大，请上传只包含商品 ID 列表的文件。");
      for (let r = range.s.r; r <= Math.min(range.e.r, range.s.r + 19); r++) {
        for (let c = range.s.c; c <= range.e.c; c++) {
          const cell = sheet[XLSX.utils.encode_cell({ r, c })];
          const header = String(cell && cell.v || "").trim().replace(/[\s_-]/g, "").toLowerCase();
          if (["id", "productid", "商品id", "产品id", "商品编号", "产品编号"].includes(header)) candidates.push({ name, sheet, r, c, end: range.e.r });
        }
      }
    }
    if (candidates.length !== 1) throw new Error(candidates.length ? "找到多个 ID 列，请只保留一个要采集的商品 ID 列。" : "未找到 ID 列，请将表头命名为 id 或 商品ID。");
    const selected = candidates[0]; const values = [];
    for (let r = selected.r + 1; r <= selected.end; r++) {
      const cell = selected.sheet[XLSX.utils.encode_cell({ r, c: selected.c })];
      if (!cell || cell.v == null || cell.v === "") continue;
      if (cell.f || !["s", "n"].includes(cell.t) || (cell.t === "n" && !Number.isSafeInteger(cell.v))) throw new Error(`${selected.name} 第 ${r + 1} 行 ID 不是精确文本编号，请将原始完整 ID 以文本保存，不能仅修改已舍入的数字格式。`);
      values.push(cell.v);
    }
    return { ids: normalize(values), sheet: selected.name };
  }
  async function file(file, XLSX = root.XLSX) {
    if (!file || !/\.(xlsx|xls)$/i.test(file.name)) throw new Error("请上传 .xlsx 或 .xls 文件。");
    if (file.size > 20 * 1024 * 1024) throw new Error("文件超过 20 MB，请只保留商品 ID 列表后上传。");
    if (!XLSX) throw new Error("Excel 读取组件未加载。");
    return workbook(XLSX.read(await file.arrayBuffer(), { type: "array", cellFormula: true }), XLSX);
  }
  const api = { normalize, text, workbook, file };
  root.TKProductImport = api;
  if (typeof module === "object" && module.exports) module.exports = api;
})(typeof globalThis === "object" ? globalThis : this);
