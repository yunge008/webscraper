/**
 * Module: selectorFactory
 * Source module ID: 1969
 * Category: selectors
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

1969: (e, t, r) => {
  "use strict";
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.selectorFactory = function(e, t = !1) {
    switch (e.type) {
      case "SelectorLink":
        return new u.SelectorLink(e, t);

      case "SelectorElement":
        return new n.SelectorElement(e);

      case "SelectorText":
        return new m.SelectorText(e, t);

      case "SelectorHTML":
        return new l.SelectorHTML(e);

      case "SelectorTable":
        return new p.SelectorTable(e);

      case "SelectorElementAttribute":
        return new i.SelectorElementAttribute(e, t);

      case "SelectorPopupLink":
        return new d.SelectorPopupLink(e);

      case "SelectorGroup":
        return new a.SelectorGroup(e);

      case "SelectorImage":
        return new c.SelectorImage(e, t);

      case "SelectorElementScroll":
        return new s.SelectorElementScroll(e, t);

      case "SelectorElementClick":
        return new o.SelectorElementClick(e, t);

      case "SelectorSitemapXmlLink":
        return new f.SelectorSitemapXmlLink(e, t);

      case "SelectorScriptData":
        return new h.SelectorScriptData(e);

      case "ActionScrollDown":
        return new g.ActionScrollDown(e);

      case "ActionClick":
        return new v.ActionClick(e);

      case "SelectorPagination":
        return new y.SelectorPagination(e);

      default:
        throw `missing selector type ${e.type}`;
    }
  };
  const n = r(10726),
    i = r(10732),
    o = r(14120),
    s = r(81351),
    a = r(46357),
    l = r(1817),
    c = r(53947),
    u = r(41112),
    d = r(94592),
    h = r(69979),
    f = r(97956),
    p = r(3358),
    m = r(90319),
    g = r(18382),
    v = r(16395),
    y = r(46568);
},