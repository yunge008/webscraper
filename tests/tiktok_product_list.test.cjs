const test = require('node:test');
const assert = require('node:assert/strict');
const { indexedDB } = require('fake-indexeddb');
const { Store, Runner, CollectionRunner, sameContext } = require('../webscraper-rebuilt/tiktok_review_tasks.js');
const Import = require('../webscraper-rebuilt/tiktok_product_import.js');
const XLSX = require('../webscraper-rebuilt/sheetjs-0.20.3.min.js');
const Export = require('../webscraper-rebuilt/tiktok_review_export.js');
const fs = require('node:fs'), path = require('node:path');
const ids = ['1731892023085009910','1731892023085009911','1731892023085009912'];
const config = { startPage:1, endPage:3, batchSize:2, pageSize:50, allPages:true, imagePath:'' };
const context = p => ({ origin:'https://seller.tiktokshop.com', endpoint:'https://seller.tiktokshop.com/api/review', shopId:'shop-list', filters:{product_id:p,start_time:'2026-09-01',end_time:'2026-09-20'},domFilters:[{name:'date',value:'September'}] });
const db = () => new Store(indexedDB, 'list-'+crypto.randomUUID());
function response(p,page,total=102){
 const rows = Array.from({length:total===0?0:page===3?2:50},(_,i)=>({main_review_id:p+'-'+page+'-'+i,product_id:p,review_images:[],review_text:'comment'}));
 return { rows,total,page,pageSize:50,context:context(p), signature:JSON.stringify(rows.map(r=>r.main_review_id)),mediaStats:{paths:[],unknown:[]} };
}
test('ID import: text dedup, XLSX and XLS text cells, precision and ambiguous headers', async()=>{
 assert.deepEqual(Import.text(ids[0]+'\n\n'+ids[1]+'\n'+ids[0]),ids.slice(0,2));
 assert.throws(()=>Import.text('1.731892023085E18'),/完整数字/);
 assert.throws(()=>Import.normalize([Number(ids[0])]),/精度/);
 const book=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(book,XLSX.utils.aoa_to_sheet([['id','name'],[ids[0],'first'],[ids[1],'second'],[ids[0],'duplicate']]),'商品');
 for(const type of ['xlsx','xls']) {
  const bytes=XLSX.write(book,{type:'buffer',bookType:type});
  const parsed=await Import.file({name:'ids.'+type,size:bytes.length,arrayBuffer:async()=>bytes},XLSX);
  assert.deepEqual(parsed.ids,ids.slice(0,2));
 }
 const unsafe=XLSX.utils.book_new();XLSX.utils.book_append_sheet(unsafe,XLSX.utils.aoa_to_sheet([['id'],[Number(ids[0])]]),'bad');
 assert.throws(()=>Import.workbook(unsafe,XLSX),/精确文本/);
 const ambiguous=XLSX.utils.book_new();XLSX.utils.book_append_sheet(ambiguous,XLSX.utils.aoa_to_sheet([['id','product_id'],[ids[0],ids[1]]]),'bad');
 assert.throws(()=>Import.workbook(ambiguous,XLSX),/多个 ID 列/);
 const formula=XLSX.utils.book_new();const sheet=XLSX.utils.aoa_to_sheet([['id'],[ids[0]]]);sheet.A2.f='1+1';XLSX.utils.book_append_sheet(formula,sheet,'bad');
 assert.throws(()=>Import.workbook(formula,XLSX),/精确文本/);
});
test('current filter task accepts multiple products and preserves actual page size',async()=>{
 const store=db(), ctx={...context(''),searchFilters:[]};
 const task=await store.create({...config,mode:'current',productId:'',endPage:1,pageSize:20},ctx);
 const runner=new Runner(store,{prepare:async()=>({context:ctx,pageSize:20}),read:async()=>({ ...response(ids[0],1,20),rows:[{main_review_id:'a',product_id:ids[0],review_images:[]},{main_review_id:'b',product_id:ids[1],review_images:[]}],context:ctx,pageSize:20,signature:'a-b'})},()=>{},async()=>{});
 const done=await runner.run(task.id);assert.equal(done.status,'complete');assert.equal(done.uniqueCount,2);
});
function setup(store, prepareOverride, progress=()=>{}) {
 let active='';
 const prepare=async(task,p)=>{active=p;return prepareOverride?prepareOverride(task,p):response(p,1,p===ids[2]?0:102);};
 const runner=new Runner(store,{prepare:async task=>response(task.config.productId,1),read:async page=>response(active,page)},()=>{},async()=>{});
 const collection=new CollectionRunner(store,runner,prepare,progress);
 return {runner,collection};
}
test('product collection sequentially saves, includes empty product, one precise XLSX export',async()=>{
 const store=db(),group=await store.createCollection([...ids,ids[0]],config);
 const {collection}=setup(store);const done=await collection.run(group.id);
 assert.equal(done.status,'complete');assert.equal(done.items.length,3);assert.deepEqual(done.items.map(i=>i.uniqueCount),[102,102,0]);assert.ok(done.items[2].empty);
 const blob=await Export.xlsx(store,done);const book=XLSX.read(await blob.arrayBuffer(),{type:'array'});
 assert.deepEqual(book.SheetNames,['评论','评价图','任务摘要','商品任务']);
 const rows=XLSX.utils.sheet_to_json(book.Sheets['评论']);assert.equal(rows.length,204);assert.deepEqual([...new Set(rows.map(r=>r['商品 ID']))],ids.slice(0,2));
 assert.ok(rows.every(r=>r['采集商品 ID']===r['商品 ID']));
 const products=XLSX.utils.sheet_to_json(book.Sheets['商品任务']);assert.equal(products.length,3);assert.equal(products[2]['商品 ID'],ids[2]);assert.equal(products[2]['提示'],'当前筛选下无评论');
 fs.mkdirSync(path.join(__dirname,'artifacts'),{recursive:true});fs.writeFileSync(path.join(__dirname,'artifacts','list-export.xlsx'),Buffer.from(await blob.arrayBuffer()));
});
test('collection pause resumes child checkpoint, never re-crawls finished products',async()=>{
 const store=db(),group=await store.createCollection(ids.slice(0,2),config);let calls=[];
 const env=setup(store,async(task,p)=>{calls.push(p);return response(p,1);});
 env.runner.progress=task=>{if(task.lastPage===1)env.collection.pause();};
 const paused=await env.collection.run(group.id);assert.equal(paused.status,'paused');assert.equal(paused.items[0].uniqueCount,50);assert.equal(paused.items[1].taskId,'');
 const reopened=setup(store,async(task,p)=>{calls.push(p);return response(p,1);});const done=await reopened.collection.run(group.id);
 assert.equal(done.status,'complete');assert.deepEqual(done.items.map(i=>i.uniqueCount),[102,102]);assert.deepEqual(calls,[ids[0],ids[0],ids[1]]);
 const tasks=await store.list();assert.equal(tasks.length,2);
});
test('collection filter drift, unconfirmed emptiness, and foreign lease all stop safely',async()=>{
 const store=db(),group=await store.createCollection(ids.slice(0,2),config);
 const env=setup(store,async(task,p)=>{const d=response(p,1);if(p===ids[1])d.context.filters.start_time='2026-01-01';return d;});
 const paused=await env.collection.run(group.id);assert.equal(paused.status,'paused');assert.match(paused.lastError,/筛选条件/);assert.equal(paused.items[0].status,'complete');assert.equal(paused.items[1].taskId,'');
 const empty=await store.createCollection([ids[2]],config);const unknown=setup(store,async()=>({...response(ids[2],1,0),total:undefined}));const failed=await unknown.collection.run(empty.id);assert.equal(failed.status,'paused');assert.match(failed.lastError,/不能确认/);
 await store.lease('foreign');
 if(globalThis.navigator?.locks){
  let release, acquired;const ready=new Promise(resolve=>acquired=resolve);
  const hold=navigator.locks.request('tk-review-task-runner',()=>{acquired();return new Promise(resolve=>release=resolve);});
  await ready;await assert.rejects(setup(store).collection.run(empty.id),/其他侧栏/);release();await hold;
 }else await assert.rejects(setup(store).collection.run(empty.id),/其他侧栏/);
 assert.equal((await store.collection(empty.id)).status,'paused');
});
