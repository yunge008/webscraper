/**
 * UI Component: DataPreviewTable
 * Source module ID: 74447
 * Extracted from: devtools_panel.js (Web Scraper v1.107.22)
 * Framework: React (MUI components)
 */

74447: function(e, t, r) {
  "use strict";
  var n = this && this.__importDefault || function(e) {
    return e && e.__esModule ? e : {
      default: e
    };
  };
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.DataPreviewTable = void 0;
  const o = n(r(96540)),
    i = r(24026),
    a = r(24567);
  t.DataPreviewTable = ({
    data: e
  }) => {
    if (!e.length) return o.default.createElement("div", null, "No Data Extracted");
    const t = i.DataPreview.getDataColumns(e);
    return o.default.createElement("table", {
      className: "table table-striped table-bordered"
    }, o.default.createElement("thead", null, o.default.createElement("tr", null, t.map((e => o.default.createElement("th", {
      key: e
    }, e))))), o.default.createElement("tbody", null, e.map(((e, r) => o.default.createElement("tr", {
      key: r
    }, t.map((t => o.default.createElement("td", {
      key: t
    }, a.Obj.stringify(e[t])))))))));
  };
},