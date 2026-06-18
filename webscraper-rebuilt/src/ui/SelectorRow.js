/**
 * UI Component: SelectorRow
 * Source module ID: 24765
 * Extracted from: devtools_panel.js (Web Scraper v1.107.22)
 * Framework: React (MUI components)
 */

24765: function(e, t, r) {
  "use strict";
  var n = this && this.__awaiter || function(e, t, r, n) {
      return new(r || (r = Promise))((function(o, i) {
        function a(e) {
          try {
            l(n.next(e));
          } catch (e) {
            i(e);
          }
        }

        function s(e) {
          try {
            l(n.throw(e));
          } catch (e) {
            i(e);
          }
        }

        function l(e) {
          var t;
          e.done ? o(e.value) : (t = e.value, t instanceof r ? t : new r((function(e) {
            e(t);
          }))).then(a, s);
        }
        l((n = n.apply(e, t || [])).next());
      }));
    },
    o = this && this.__importDefault || function(e) {
      return e && e.__esModule ? e : {
        default: e
      };
    };
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.SelectorRow = void 0;
  const i = r(44015),
    a = o(r(96540)),
    s = r(9648),
    l = r(55390),
    c = r(1757),
    u = r(57205),
    d = r(789),
    p = r(82226);
  t.SelectorRow = (0, i.observer)((({
    selector: e,
    index: t,
    handleDeleteSelector: r
  }) => {
    const o = (0, c.useNavigate)(),
      i = (0, u.useSelectorBreadcrumb)(),
      f = (0, c.useParams)(),
      h = () => {
        p.appState.updateSitemap(p.appState.getSitemap());
      },
      m = (e, r) => {
        if (r.isOver()) return;
        const n = e.index,
          o = t,
          a = i[i.length - 1];
        n !== o && (p.appState.changeSelectorOrder(n, o, a), r.getItem().index = o);
      },
      [{
        isDragging: g,
        rowDragging: v
      }, y, b] = (0, s.useDrag)((() => ({
        type: "selector",
        collect: e => ({
          isDragging: !!e.isDragging(),
          rowDragging: e.getItem()
        }),
        item: {
          index: t
        }
      })), [t]),
      [{}, w] = (0, s.useDrop)((() => ({
        accept: "selector",
        drop: h,
        hover: m
      })), [t]),
      S = g ? .2 : 1,
      x = v ? "#fff" : void 0,
      A = p.appState.activeElementPreview === e.id;
    return a.default.createElement("tr", {
      ref: e => {
        b(e), w(e);
      },
      className: "selector-row",
      onClick: t => {
        if (!t.target.classList.contains("btn") && e.canHaveChildSelectors()) {
          const t = `/sitemap/${f.sitemapId}/selectors`,
            r = [...i, e.id];
          o(`${t}/${d.Str.serialize(r)}`);
        }
      },
      style: {
        opacity: S,
        backgroundColor: x,
        cursor: "default"
      }
    }, a.default.createElement("td", {
      ref: y,
      className: "selector-drag"
    }, l.DragIcon), a.default.createElement("td", {
      className: "selector-id"
    }, e.id), a.default.createElement("td", null, e.selector), a.default.createElement("td", null, e.type), a.default.createElement("td", {
      className: "multiple"
    }, e.willReturnMultipleRecords() ? "yes" : "no"), a.default.createElement("td", null, e.parentSelectors.join(", ")), a.default.createElement("td", {
      className: "action-buttons"
    }, a.default.createElement("button", {
      type: "button",
      onClick: () => n(void 0, void 0, void 0, (function*() {
        const t = p.appState.getSitemap(),
          r = e.selector;
        yield p.appState.elementPreview(t, e.id, r, i);
      })),
      className: "btn btn-primary btn-xs element-preview"
    }, A ? "Close preview" : "Element preview"), !e.type.startsWith("Action") && a.default.createElement("button", {
      type: "button",
      onClick: () => {
        const t = p.appState.getSitemap();
        p.appState.dataPreview(e.id, t, i);
      },
      className: "btn btn-primary btn-xs data-preview"
    }, "Data preview"), e.type.startsWith("Action") && a.default.createElement("button", {
      type: "button",
      onClick: () => n(void 0, void 0, void 0, (function*() {
        const t = p.appState.getSitemap();
        yield p.appState.performSelectorAction(e.id, t, i);
      })),
      className: "btn btn-primary btn-xs perform-action"
    }, "Perform Action"), a.default.createElement("button", {
      type: "button",
      onClick: () => {
        const t = d.Str.toHex(e.id);
        o(`/sitemap/${f.sitemapId}/edit-selector/${t}/${d.Str.serialize(i)}`);
      },
      className: "btn btn-primary btn-xs edit-selector"
    }, "Edit"), a.default.createElement("button", {
      type: "button",
      onClick: () => {
        r(e);
      },
      className: "btn btn-danger btn-xs delete-selector"
    }, "Delete")));
  }));
},