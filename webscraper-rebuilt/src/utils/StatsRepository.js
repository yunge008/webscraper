/**
 * Module: StatsRepository
 * Source module ID: 66100
 * Category: utils
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

66100: (e, t, r) => {
  "use strict";
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.StatsRepository = void 0;
  const n = r(6134),
    i = r(78202);
  class o extends n.BaseRepository {
    constructor() {
      super({
        dbName: "stats",
        storageName: i.LocalForageDb.defaultStorageName
      });
    }
  }
  t.StatsRepository = o;
},