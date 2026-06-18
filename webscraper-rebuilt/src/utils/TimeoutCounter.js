/**
 * Module: TimeoutCounter
 * Source module ID: 67849
 * Category: utils
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

67849: function(e, t, r) {
  "use strict";
  var n = this && this.__awaiter || function(e, t, r, n) {
    return new(r || (r = Promise))((function(i, o) {
      function s(e) {
        try {
          l(n.next(e));
        } catch (e) {
          o(e);
        }
      }

      function a(e) {
        try {
          l(n.throw(e));
        } catch (e) {
          o(e);
        }
      }

      function l(e) {
        var t;
        e.done ? i(e.value) : (t = e.value, t instanceof r ? t : new r((function(e) {
          e(t);
        }))).then(s, a);
      }
      l((n = n.apply(e, t || [])).next());
    }));
  };
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.TimeoutCounter = void 0;
  const i = r(83258);
  t.TimeoutCounter = class {
    constructor(e, t) {
      this.duration = e, this.startTimestamp = void 0 === t ? Date.now() : t;
    }
    static isTimedOut(e, t) {
      return Date.now() >= t + e;
    }
    isTimedOut() {
      return Date.now() >= this.startTimestamp + this.duration;
    }
    timeLeft() {
      return this.isTimedOut() ? 0 : this.startTimestamp + this.duration - Date.now();
    }
    sleep() {
      return n(this, void 0, void 0, (function*() {
        yield i.Async.sleep(this.timeLeft());
      }));
    }
  };
},