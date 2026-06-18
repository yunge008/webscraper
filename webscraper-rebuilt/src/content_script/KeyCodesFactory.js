/**
 * Content Script Module: KeyCodesFactory
 * Source module ID: 88042
 * Extracted from: content_script.js (Web Scraper v1.107.22)
 * Runs in: page context (injected into target websites)
 */

88042: (e, t, n) => {
    "use strict";
    Object.defineProperty(t, "__esModule", {
      value: !0
    }), t.KeyCodesFactory = void 0;
    const r = n(8379),
      i = n(55372),
      o = n(70272),
      a = n(6525),
      s = n(24567);
    t.KeyCodesFactory = (e, t) => {
      const n = s.Obj.clone(Object.assign(Object.assign(Object.assign(Object.assign({}, o.DigitsCodes), r.LettersCodes), i.PunctuationCodes), a.NumpadCodes)[e.toLowerCase()]);
      return n && t && (n.charCode = 0, "keypress" === t && (n.windowsVirtualKeyCode = e.charCodeAt(0),
          n.charCode = e.charCodeAt(0)), n.code.includes("Numpad") && (n.location = "keyup" === t ? 1 : 3)),
        n;
    };
  },
  26015: function(e, t, n) {
    "use strict";
    var r = this && this.__awaiter || function(e, t, n, r) {
      return new(n || (n = Promise))((function(i, o) {
        function a(e) {
          try {
            l(r.next(e));
          } catch (e) {
            o(e);
          }
        }

        function s(e) {
          try {
            l(r.throw(e));
          } catch (e) {
            o(e);
          }
        }

        function l(e) {
          var t;
          e.done ? i(e.value) : (t = e.value, t instanceof n ? t : new n((function(e) {
            e(t);
          }))).then(a, s);
        }
        l((r = r.apply(e, t || [])).next());
      }));
    };
    Object.defineProperty(t, "__esModule", {
      value: !0
    }), t.TypeAction = void 0;
    const i = n(3602),
      o = n(74161),
      a = n(83258),
      s = n(88042);
    class l extends i.ExtractorBase {
      constructor() {
        super(...arguments), this.typeActionEvents = {
          keydown: {
            sleepAfter: 0,
            eventClass: "KeyboardEvent"
          },
          keypress: {
            sleepAfter: 20,
            eventClass: "KeyboardEvent"
          },
          beforeinput: {
            sleepAfter: 10,
            eventClass: "InputEvent"
          },
          input: {
            sleepAfter: 80,
            eventClass: "InputEvent"
          },
          keyup: {
            sleepAfter: 10,
            eventClass: "KeyboardEvent"
          }
        };
      }
      extract(e, t) {
        return r(this, void 0, void 0, (function*() {
          const n = this.elementReferences.getElementByReference(e);
          if (!n || n instanceof Document) o.Log.warning("couldn't find element for typing");
          else {
            for (const e of t)
              for (const t in this.typeActionEvents) {
                const r = this.typeActionEvents[t];
                let i;
                if ("KeyboardEvent" === r.eventClass) {
                  const n = (0, s.KeyCodesFactory)(e, t);
                  if (!n) continue;
                  i = this.createKeyboardEvent(t, e, n);
                } else "InputEvent" === r.eventClass && (i = this.createInputEvent(t, e));
                "input" === t && (n.value += e), n.dispatchEvent(i), yield a.Async.sleep(r.sleepAfter);
              }
            n.dispatchEvent(new Event("change", {
              bubbles: !0
            }));
          }
        }));
      }
      createKeyboardEvent(e, t, n) {
        const {
          code: r,
          windowsVirtualKeyCode: i,
          charCode: o,
          location: a
        } = n;
        return new KeyboardEvent(e, {
          composed: !0,
          bubbles: !0,
          cancelable: !0,
          code: r,
          key: t,
          keyCode: i,
          charCode: o,
          location: a
        });
      }
      createInputEvent(e, t) {
        return new InputEvent(e, {
          composed: !0,
          data: t,
          bubbles: !0,
          cancelable: "beforeinput" === e,
          inputType: "insertText"
        });
      }
    }
    t.TypeAction = l;
  },
  54392: function(e, t, n) {
    "use strict";
    var r = this && this.__awaiter || function(e, t, n, r) {
      return new(n || (n = Promise))((function(i, o) {
        function a(e) {
          try {
            l(r.next(e));
          } catch (e) {
            o(e);
          }
        }

        function s(e) {
          try {
            l(r.throw(e));
          } catch (e) {
            o(e);
          }
        }

        function l(e) {
          var t;
          e.done ? i(e.value) : (t = e.value, t instanceof n ? t : new n((function(e) {
            e(t);
          }))).then(a, s);
        }
        l((r = r.apply(e, t || [])).next());
      }));
    };
    Object.defineProperty(t, "__esModule", {
      value: !0
    }), t.WaitForPageLoadAction = void 0;
    const i = n(3602),
      o = n(83258),
      a = n(70259);
    class s extends i.ExtractorBase {
      extract() {
        return r(this, void 0, void 0, (function*() {
          if ("complete" === document.readyState) return;
          const e = new Promise((e => {
            document.addEventListener("DOMContentLoaded", (() => {
              e(!0);
            }));
          }));
          yield o.Async.timeoutPromiseWithoutTimeoutError(e, 5 * a.TIME.ONE_SECOND_MS, "wait for page load timeout");
        }));
      }
    }
    t.WaitForPageLoadAction = s;
  },