/**
 * UI Component: ScrollCheckbox
 * Source module ID: 59531
 * Extracted from: devtools_panel.js (Web Scraper v1.107.22)
 * Framework: React (MUI components)
 */

59531: function(e, t, r) {
  "use strict";
  var n = this && this.__importDefault || function(e) {
    return e && e.__esModule ? e : {
      default: e
    };
  };
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.ScrollCheckbox = void 0;
  const o = n(r(96540)),
    i = r(90330),
    a = r(50869);
  t.ScrollCheckbox = () => {
    const e = (0, i.useFormContext)(),
      t = e.watch("scroll");
    return o.default.createElement(o.default.Fragment, null, o.default.createElement("div", {
      className: "form-group"
    }, o.default.createElement("div", {
      className: "col-lg-offset-1 col-lg-10"
    }, o.default.createElement("div", {
      className: "checkbox"
    }, o.default.createElement("label", null, o.default.createElement("input", Object.assign({
      id: "scroll",
      type: "checkbox"
    }, e.register("scroll", {
      onChange: t => {
        t.checked || e.resetField("elementLimit");
      }
    }))), "Scroll")))), t ? o.default.createElement(a.ItemLimit, {
      feature: "elementLimit"
    }) : void 0);
  };
},