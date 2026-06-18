/**
 * UI Component: SelectorTypeDropdown
 * Source module ID: 26815
 * Extracted from: devtools_panel.js (Web Scraper v1.107.22)
 * Framework: React (MUI components)
 */

26815: function(e, t, r) {
  "use strict";
  var n = this && this.__importDefault || function(e) {
    return e && e.__esModule ? e : {
      default: e
    };
  };
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.SelectorTypeDropdown = void 0;
  const o = n(r(96540)),
    i = r(90330),
    a = r(13758),
    s = r(82226),
    l = r(44015);
  t.SelectorTypeDropdown = (0, l.observer)((() => {
    const e = (0, i.useFormContext)(),
      {
        experimentalFeaturesEnabled: t
      } = s.appState,
      r = e.watch("type");
    return o.default.createElement("div", {
      className: "form-group"
    }, o.default.createElement("label", {
      className: "col-lg-1 control-label"
    }, "Type"), o.default.createElement("div", {
      className: "col-lg-10"
    }, o.default.createElement("select", Object.assign({
      className: "form-control"
    }, e.register("type")), a.selectorTypes.map((e => {
      if (!(r !== e.type && (e.experimental && !t || e.deprecated))) return o.default.createElement("option", {
        key: e.type,
        value: e.type
      }, e.title);
    })))));
  }));
},