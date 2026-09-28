const test = require("node:test");
const assert = require("node:assert/strict");
const C = require("../webscraper-rebuilt/tiktok_core.js");
const Import = require("../webscraper-rebuilt/tiktok_product_import.js");

test("parseJson keeps 19-digit numeric IDs exact", () => {
  const json = C.parseJson('{"data":{"list":[{"main_review_id":7412345678901234567,"product_info":{"product_id":1731892023085009910}}],"total":3}}');
  assert.equal(json.data.list[0].main_review_id, "7412345678901234567");
  assert.equal(json.data.list[0].product_info.product_id, "1731892023085009910");
  assert.equal(json.data.total, 3);
});

test("findReviewPayload finds list, total, cursor and explicit empty results", () => {
  const p = C.findReviewPayload({ code: 0, data: { list: [{ star_level: 5, review_text: "ok" }], total: 120, next_cursor: "abc", has_more: true } });
  assert.equal(p.list.length, 1); assert.equal(p.total, 120); assert.equal(p.nextCursor, "abc"); assert.equal(p.hasMore, true);
  const empty = C.findReviewPayload({ code: 0, data: { list: [], total: 0 } });
  assert.equal(empty.list.length, 0); assert.equal(empty.total, 0);
  assert.equal(C.findReviewPayload({ data: { list: [{ name: "not a review" }] } }), null);
  assert.match(C.apiError({ code: 10001, message: "need login" }), /need login/);
});

test("extractImages takes buyer images, prefers originals, skips product/avatar/video", () => {
  const review = {
    review_text: "nice",
    product_info: { product_id: "1", main_image: { url_list: ["https://p16.example.com/product.jpeg"] } },
    user_info: { avatar: { url_list: ["https://p16.example.com/avatar.jpeg"] } },
    review_images: [
      { thumb_url_list: ["https://p16.example.com/a~tplv-thumb.jpeg"], url_list: ["https://p16.example.com/a~tplv-origin.jpeg", "https://p19.example.com/a~tplv-origin.jpeg"] },
      { thumbnail_url: "https://cdn.example.com/b-small.png", original_url: "https://cdn.example.com/b.png" }
    ],
    media_list: [{ media_type: "video", url: "https://cdn.example.com/v.mp4" }],
    reply: { images: ["https://cdn.example.com/reply.jpg"] }
  };
  const { images } = C.extractImages(review);
  assert.deepEqual(images.map(i => i.url), ["https://p16.example.com/a~tplv-origin.jpeg", "https://cdn.example.com/b.png"]);
  assert.equal(images[0].thumbnail, "https://p16.example.com/a~tplv-thumb.jpeg");
  const row = C.flattenReview(review);
  assert.equal(row.review_image_count, 2);
});

test("flattenReview maps fields and formats time", () => {
  const row = C.flattenReview({ star_level: 4, review_text: "t", main_review_id: "9", product_info: { product_id: "5", product_name: "P", sku_id: "7", sku_specification: "Red" }, user_name: "u", create_time: 1700000000 });
  assert.equal(row.product_id, "5"); assert.equal(row.sku_id, "7"); assert.equal(row.main_review_id, "9");
  assert.match(row.create_time, /^2023-11-1\d \d\d:\d\d:\d\d$/);
  assert.ok(C.rowMatchesProduct(row, "5")); assert.ok(C.rowMatchesProduct(row, "7")); assert.ok(!C.rowMatchesProduct(row, "6"));
});

test("analyzeTemplate + buildRequest: JSON body page/size and product swap keep other filters", () => {
  const template = { transport: "xhr", method: "POST", url: "https://seller.example.com/api/v1/review/list?locale=zh&X-Bogus=abc&msToken=t", headers: { "content-type": "application/json", "X-Bogus": "h" },
    body: '{"page":3,"page_size":20,"filter":{"product_id":1731892023085009910,"star_levels":[1,2],"start_time":1690000000,"end_time":1700000000}}' };
  const { pagination } = C.analyzeTemplate(template);
  assert.equal(pagination.kind, "page"); assert.equal(pagination.pageSize, 20); assert.equal(pagination.pageBase, 1);
  const paths = C.findValuePaths(template, "1731892023085009910");
  assert.equal(paths.length, 1);
  const req = C.buildRequest(template, pagination, { page: 7, pageSize: 50, productId: "1731892023085009911", productPath: paths[0].path });
  const body = req.body;
  assert.match(body, /"page":7/); assert.match(body, /"page_size":50/);
  assert.match(body, /"product_id":1731892023085009911[,}]/, "19-digit number written back unquoted and exact");
  assert.match(body, /"star_levels":\[1,2\]/); assert.match(body, /"start_time":1690000000/);
  assert.match(req.url, /X-Bogus=abc/);
  const stripped = C.buildRequest(template, pagination, { page: 2, stripSign: true });
  assert.doesNotMatch(stripped.url, /X-Bogus|msToken/); assert.ok(!("X-Bogus" in stripped.headers)); assert.match(stripped.url, /locale=zh/);
});

test("query-string pagination, zero-based pages, cursor and string product IDs", () => {
  const t = { method: "GET", url: "https://s.example.com/api/rating/list?page_num=0&size=10&cursor=0&search_key=1731892023085009910&start=2024-01-01", headers: {} };
  const { pagination } = C.analyzeTemplate(t);
  assert.equal(pagination.kind, "page"); assert.equal(pagination.pageBase, 0);
  const path = C.findValuePaths(t, "1731892023085009910")[0].path;
  const req = C.buildRequest(t, pagination, { page: 3, pageSize: 50, cursor: "XYZ", productId: "999", productPath: path });
  const u = new URL(req.url);
  assert.equal(u.searchParams.get("page_num"), "2"); assert.equal(u.searchParams.get("size"), "50");
  assert.equal(u.searchParams.get("cursor"), "XYZ"); assert.equal(u.searchParams.get("search_key"), "999"); assert.equal(u.searchParams.get("start"), "2024-01-01");
  assert.equal(req.body, null);
  const c = C.analyzeTemplate({ method: "POST", url: "https://s.example.com/api/x", body: '{"cursor":"","count":50}' }).pagination;
  assert.equal(c.kind, "cursor"); assert.equal(c.pageSize, 50);
});

test("exportAoa writes the collected product ID column first and keeps IDs as text", () => {
  const row = C.flattenReview({ star_level: 5, review_text: "=1+1", main_review_id: "7412345678901234567", product_info: { product_id: "1731892023085009910" } });
  const aoa = C.exportAoa([{ targetId: "1731892023085009910", page: 2, row }]);
  assert.equal(aoa[0][0], "采集商品 ID");
  assert.equal(aoa[1][0], "1731892023085009910");
  assert.equal(typeof aoa[1][aoa[0].indexOf("评论 ID")], "string");
  assert.equal(aoa[1][aoa[0].indexOf("星级")], 5);
});

test("product ID import: text, CSV with ID column, precision guard", () => {
  assert.deepEqual(Import.text("1731892023085009910\n\n 1731892023085009911 \n1731892023085009910"), ["1731892023085009910", "1731892023085009911"]);
  assert.deepEqual(Import.csv("name,id\nA,1731892023085009910\nB,=\"1731892023085009911\""), ["1731892023085009910", "1731892023085009911"]);
  assert.deepEqual(Import.csv("1731892023085009910\n1731892023085009912"), ["1731892023085009910", "1731892023085009912"]);
  assert.throws(() => Import.text("1.73189E+18"), /科学计数法|完整数字/);
  assert.throws(() => Import.normalize([1731892023085009910]), /精度/);
});

test("xlsx import through SheetJS finds the id column", () => {
  const XLSX = require("../webscraper-rebuilt/sheetjs-0.20.3.min.js");
  const sheet = XLSX.utils.aoa_to_sheet([["名称", "id"], ["a", "1731892023085009910"], ["b", "1731892023085009911"], ["c", 12345]]);
  const book = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(book, sheet, "Sheet1");
  const read = XLSX.read(XLSX.write(book, { type: "array", bookType: "xlsx" }), { type: "array", cellFormula: true });
  assert.deepEqual(Import.workbook(read, XLSX).ids, ["1731892023085009910", "1731892023085009911", "12345"]);
});
