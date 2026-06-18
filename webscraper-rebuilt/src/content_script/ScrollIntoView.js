/**
 * Content Script Module: ScrollIntoView
 * Source module ID: 49797
 * Extracted from: content_script.js (Web Scraper v1.107.22)
 * Runs in: page context (injected into target websites)
 */

49797: (e, t, n) => {
  "use strict";
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.ScrollIntoView = void 0;
  const r = n(7294);
  t.ScrollIntoView = class {
    static scrollElementIntoView(e) {
      return this.isElementInView(e) ? Promise.resolve() : new Promise((t => {
        let n = !1;
        const r = () => {
          n || (n = !0, t());
        };
        window.addEventListener("scrollend", r, {
          once: !0
        }), setTimeout(r, 1e3), e.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "center"
        });
      }));
    }
    static getVisibleElements(e, t) {
      const n = [];
      for (const i of t) {
        const t = r.ElementQuery.find(e, i);
        if (0 === t.length) continue;
        let o = t[0];
        for (; o;) {
          if (this.isVisible(o)) {
            n.push(o);
            break;
          }
          if (o = o.parentElement, !i.contains(o)) break;
        }
      }
      return n;
    }
    static isVisible(e) {
      if (e instanceof HTMLElement) return !!(e.offsetWidth || e.offsetHeight || e.getClientRects().length);
      const t = e.getBoundingClientRect();
      return !(!t.width && !t.height);
    }
    static isElementInView(e) {
      const t = e.getBoundingClientRect(),
        n = window.innerHeight || document.documentElement.clientHeight,
        r = window.innerWidth || document.documentElement.clientWidth;
      return t.top >= 0 && t.left >= 0 && t.bottom <= n && t.right <= r;
    }
  };
},