const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { indexedDB } = require("fake-indexeddb");
const { Store, Runner, extractImages, requestContext, sameContext, controlError } = require("../webscraper-rebuilt/tiktok_review_tasks.js");
const Export = require("../webscraper-rebuilt/tiktok_review_export.js");
const product = "1731892023085009910";
const context = { origin: "https://seller-mx.tiktokshop.com", endpoint: "https://seller-mx.tiktokshop.com/api/review", shopId: "shop-a", filters: { product_id: product }, domFilters: [] };
const config = endPage => ({ productId: product, startPage: 1, endPage, batchSize: 2, pageSize: 50, imagePath: "" });
const db = () => new Store(indexedDB, "test-" + crypto.randomUUID());
function data(page, count = 2) {
  const rows = Array.from({ length: count }, (_, i) => ({ main_review_id: `${page}-${i}`, product_id: product, order_id: "585229989066605746", review_text: i ? "normal" : '=HYPERLINK("evil")', review_images: i ? [] : [{ url: "https://images.example/original.jpg?sign=valid", thumbnail: "https://images.example/thumb.jpg", source: "review_images", original: true }], review_image_count: i ? 0 : 1, review_image_urls: i ? "" : "https://images.example/original.jpg?sign=valid" }));
  return { rows, page, pageSize: 50, context, signature: JSON.stringify(rows.map(row => row.main_review_id)), mediaStats: { paths: ["review_images"], unknown: [] } };
}
const transport = (overrides = {}) => ({ prepare: async () => ({ context, pageSize: 50 }), read: async page => data(page), ...overrides });

test("review media preserves original URLs and excludes products/replies/avatars/videos", () => {
  const media = extractImages({
    review_images: [{ original_url: "https://img.test/original?token=keep", thumbnail: { url_list: ["https://img.test/thumb"] } }],
    images: ["https://img.test/original?token=keep", { url_list: ["https://img.test/another"] }],
    media: [{ type: "video", url: "https://img.test/video.mp4" }, { type: 2, url: "https://img.test/unknown" }, { type: "image", original: { url_list: ["https://img.test/third"] } }],
    product_info: { images: ["https://img.test/product"] }, reply: { images: ["https://img.test/reply"] }, avatar: "https://img.test/avatar"
  });
  assert.equal(media.images.length, 3);
  assert.equal(media.images[0].original, true);
  assert.equal(media.images[0].thumbnail, "https://img.test/thumb");
  assert.deepEqual(media.unknown, ["media"]);
  assert.throws(() => extractImages({}, "product_info.images"), /不能指向商品/);
  assert.equal(extractImages({ attachment: { buyerPhotos: ["https://img.test/custom"] } }, "attachment.buyerPhotos").images.length, 1);
});

test("shop/filter fingerprint excludes authentication and volatile pagination", () => {
  const req = { url: context.origin + "/api/review?shop_id=shop-a&page=1&token=SECRET&star_level=5", requestBody: JSON.stringify({ product_id: product, cursor: "old", page_size: 50, filters: { reply_status: 0, csrf_token: "SECRET" } }), requestHeaders: { Authorization: "SECRET" } };
  const first = requestContext(req, context.origin + "/product/rating");
  const second = requestContext({ ...req, url: req.url.replace("page=1", "page=9").replace("SECRET", "OTHER"), requestBody: req.requestBody.replace("old", "new") }, context.origin + "/product/rating");
  assert.ok(sameContext(first, second));
  assert.ok(!JSON.stringify(first).includes("SECRET"));
  assert.ok(!sameContext(first, requestContext({ ...req, url: req.url.replace("star_level=5", "star_level=1") }, context.origin)));
  assert.throws(() => requestContext({ url: context.origin + "/api/review" }, context.origin), /未提供/);
});

test("page rows and checkpoint roll back together on IndexedDB constraint failure", async () => {
  const store = db(); const task = await store.create(config(3), context);
  await store.lease("owner"); await store.update(task.id, { status: "running" });
  await store.commitPage(task.id, "owner", 1, data(1).rows, "same-signature");
  await assert.rejects(store.commitPage(task.id, "owner", 2, data(2).rows, "same-signature"));
  const after = await store.get(task.id);
  assert.equal(after.lastPage, 1); assert.equal(after.uniqueCount, 2);
  assert.equal((await store.readRows(task.id)).length, 2);
  assert.equal(await store.page(task.id, 1, 2), undefined);
});

test("cross-page review dedup keeps exact IDs and updates counts only after commit", async () => {
  const store = db(); const task = await store.create(config(2), context);
  await store.lease("owner"); await store.update(task.id, { status: "running" });
  await store.commitPage(task.id, "owner", 1, data(1).rows, "first");
  const second = [data(1).rows[1], data(2).rows[0]];
  const result = await store.commitPage(task.id, "owner", 2, second, "second");
  assert.equal(result.uniqueCount, 3); assert.equal(result.rawCount, 4); assert.equal(result.imageCount, 2);
  assert.equal(result.batches[1].status, "complete");
  const missing = [{ product_id: product }];
  await assert.rejects(store.commitPage(task.id, "owner", 3, missing, "third"));
  assert.equal((await store.get(task.id)).lastPage, 2);
});

test("global lease blocks another sidebar and stale owner cannot commit", async () => {
  const store = db(); const task = await store.create(config(2), context);
  assert.equal(await store.lease("a"), true); assert.equal(await store.lease("b"), false);
  await store.update(task.id, { status: "running" });
  await assert.rejects(store.commitPage(task.id, "b", 1, data(1).rows, "wrong"), /执行权/);
  await store.lease("a", true); assert.equal(await store.lease("b"), true);
  await assert.rejects(store.commitPage(task.id, "a", 1, data(1).rows, "stale"), /执行权/);
  assert.equal((await store.get(task.id)).lastPage, 0);
});

test("pause and fresh runner resume validate saved anchor without duplicating rows", async () => {
  const store = db(); const task = await store.create(config(5), context);
  let first;
  first = new Runner(store, transport(), task => { if (task.lastPage === 2) first.pause(); }, async () => {});
  const paused = await first.run(task.id);
  assert.equal(paused.status, "paused"); assert.equal(paused.lastPage, 2);
  // New Store instance simulates a newly opened extension panel.
  const reopened = new Store(indexedDB, store.name);
  const reads = [];
  const resumed = await new Runner(reopened, transport({ read: async page => { reads.push(page); return data(page); } }), () => {}, async () => {}).run(task.id);
  assert.equal(resumed.status, "complete"); assert.equal(resumed.uniqueCount, 10);
  assert.deepEqual(reads, [2, 3, 4, 5]);
});

test("wrong shop, wrong filters and shifted anchor pause before any new page saves", async () => {
  const store = db(); const task = await store.create(config(4), context);
  await store.lease("seed"); await store.update(task.id, { status: "running" }); await store.commitPage(task.id, "seed", 1, data(1).rows, data(1).signature); await store.lease("seed", true);
  const wrongShop = await new Runner(store, transport({ prepare: async () => ({ context: { ...context, shopId: "shop-b" }, pageSize: 50 }) }), () => {}, async () => {}).run(task.id);
  assert.match(wrongShop.lastError, /店铺或筛选条件/); assert.equal(wrongShop.lastPage, 1);
  const drift = await new Runner(store, transport({ read: async page => ({ ...data(99), page }) }), () => {}, async () => {}).run(task.id);
  assert.match(drift.lastError, /断点页评论已变化/); assert.equal(drift.lastPage, 1);
});

test("limited retries preserve failed batch, 429 pauses immediately, empty is not completion", async () => {
  const store = db(); const task = await store.create(config(4), context);
  let attempts = 0;
  const runner = new Runner(store, transport({ read: async page => { if (page === 3) { attempts++; throw new Error("temporary network failure"); } return data(page); } }), () => {}, async () => {});
  let result = await runner.run(task.id);
  assert.equal(attempts, 3); assert.equal(result.status, "paused"); assert.equal(result.lastPage, 2); assert.equal(result.failures[0].batch, 2);
  attempts = 0;
  result = await new Runner(store, transport({ read: async (page, options) => { if (options.positioning) return data(page); attempts++; throw new Error("HTTP 429"); } }), () => {}, async () => {}).run(task.id);
  assert.equal(attempts, 1); assert.equal(result.lastPage, 2);
  const emptyTask = await store.create(config(1), context);
  result = await new Runner(store, transport({ read: async () => ({ ...data(1), rows: [] }) }), () => {}, async () => {}).run(emptyTask.id);
  assert.equal(result.status, "paused"); assert.equal(result.lastPage, 0);
});

test("from-head rescan keeps rows and dedup, even with changed page placement", async () => {
  const store = db(); const task = await store.create(config(2), context);
  await new Runner(store, transport(), () => {}, async () => {}).run(task.id);
  const restarted = await store.restart(task.id); assert.equal(restarted.scan, 2); assert.equal(restarted.lastPage, 0);
  const result = await new Runner(store, transport(), () => {}, async () => {}).run(task.id);
  assert.equal(result.uniqueCount, 4); assert.equal(result.rawCount, 4);
  assert.equal((await store.readRows(task.id)).length, 4);
});

test("rescan updates stored image URLs and image counts without duplicating comments", async () => {
  const store = db(); const task = await store.create(config(2), context);
  await new Runner(store, transport(), () => {}, async () => {}).run(task.id);
  const fresh = await new Runner(store, transport({ read: async page => {
    const value = data(page);
    for (const row of value.rows) row.review_images = [{ url: "https://img.test/refreshed-" + row.main_review_id }, { url: "https://img.test/extra-" + row.main_review_id }];
    return value;
  } }), () => {}, async () => {}).run(task.id, { rescan: true, imagePath: "attachment.buyerPhotos" });
  assert.equal(fresh.uniqueCount, 4); assert.equal(fresh.imageCount, 8); assert.equal(fresh.scan, 2);
  assert.equal(fresh.config.imagePath, "attachment.buyerPhotos");
  assert.match((await store.readRows(task.id))[0].row.review_images[0].url, /refreshed/);
});

test("requested start page and batch boundaries are preserved, unsafe numeric review ID is rejected", async () => {
  const store = db(); const task = await store.create({ ...config(151), startPage: 51, batchSize: 50 }, context);
  const reads = [];
  const done = await new Runner(store, transport({ read: async page => { reads.push(page); return data(page); } }), () => {}, async () => {}).run(task.id);
  assert.equal(reads[0], 51); assert.equal(reads.at(-1), 151); assert.equal(reads.length, 101);
  assert.equal(done.batches[1].startPage, 51); assert.equal(done.batches[2].startPage, 101); assert.equal(done.batches[3].endPage, 151);
  const invalid = await store.create(config(1), context); await store.lease("owner"); await store.update(invalid.id, { status: "running" });
  await assert.rejects(store.commitPage(invalid.id, "owner", 1, [{ ...data(1).rows[0], main_review_id: 9007199254740992 }], "unsafe"), /精确 ID/);
  assert.equal((await store.get(invalid.id)).lastPage, 0);
});

test("1000 pages of 50 rows save in 20 batches without keeping all rows in runner", async () => {
  const store = db(); const task = await store.create({ ...config(1000), batchSize: 50 }, context);
  const result = await new Runner(store, transport({ read: async page => data(page, 50) }), () => {}, async () => {}).run(task.id);
  assert.equal(result.status, "complete"); assert.equal(result.lastPage, 1000); assert.equal(result.uniqueCount, 50000); assert.equal(result.rawCount, 50000);
  assert.equal(Object.values(result.batches).filter(item => item.status === "complete").length, 20);
  assert.equal((await store.readRows(task.id, { limit: 100 })).length, 100);
});

test("CSV batch/image exports, formula-safe cells, real XLSX fixture", async () => {
  const store = db(); const task = await store.create(config(3), context);
  const completed = await new Runner(store, transport(), () => {}, async () => {}).run(task.id);
  const csv = await Export.csv(store, task.id, { batch: 2 });
  assert.equal(csv.rows, 2); const text = await csv.blob.text(); assert.match(text, /3-0/); assert.ok(!text.includes("1-0")); assert.ok(text.includes("'=HYPERLINK"));
  const images = await Export.csv(store, task.id, { images: true }); assert.equal(images.rows, 3); assert.ok((await images.blob.text()).includes("sign=valid"));
  const workbook = await Export.xlsx(store, completed);
  const buffer = Buffer.from(await workbook.arrayBuffer()); assert.equal(buffer.readUInt32LE(0), 0x04034b50);
  const artifacts = path.join(__dirname, "artifacts"); fs.mkdirSync(artifacts, { recursive: true }); fs.writeFileSync(path.join(artifacts, "task-export.xlsx"), buffer);
});
