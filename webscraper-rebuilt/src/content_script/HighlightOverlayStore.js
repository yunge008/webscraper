/**
 * Content Script Module: HighlightOverlayStore
 * Source module ID: 51017
 * Extracted from: content_script.js (Web Scraper v1.107.22)
 * Runs in: page context (injected into target websites)
 */

51017: (e, t, n) => {
    "use strict";
    Object.defineProperty(t, "__esModule", {
      value: !0
    }), t.HighlightOverlayStore = void 0;
    const r = n(27813),
      i = n(10724),
      o = n(32949),
      a = n(74161);
    t.HighlightOverlayStore = class {
      constructor(e, t = !1) {
        this.parentElementHighlights = void 0, this.hoveredElementHighlight = void 0, this.highlightedElements = [],
          this.wizardHighlightedElements = [], this.showSelectedElementCount = !1, this.showToolbar = !1,
          this.selector = "", this.notification = "Click here to enable hotkeys", this.uiHasFocus = !1,
          this.mouseOverToolbar = !1, this.showNoButtonsWizard = !1, this.keysDisabledMessage = "Click here to enable hotkeys",
          (0, r.makeObservable)(this, {
            hoveredElementHighlight: r.observable,
            highlightedElements: r.observable,
            wizardHighlightedElements: r.observable,
            showSelectedElementCount: r.observable,
            showToolbar: r.observable,
            parentElementHighlights: r.observable,
            elementPreview: r.action,
            elementPreviewWizard: r.action,
            rerenderHighlightPosition: r.action,
            removeHoveredElement: r.action,
            traverseDom: r.action,
            selectedElementCount: r.computed,
            selector: r.observable,
            notification: r.observable,
            uiHasFocus: r.observable,
            mouseOverToolbar: r.observable,
            showNoButtonsWizard: r.observable,
            setMouseNotOverToolbar: r.action,
            setMouseOverToolbar: r.action,
            setHoveredElement: r.action,
            selectorSelected: r.action,
            getCSSSelector: r.action,
            setFocused: r.action,
            addClickedElement: r.action
          }), this.selection = e, this.showNoButtonsWizard = t;
      }
      get selectedElementCount() {
        return this.highlightedElements.length;
      }
      reset() {
        this.selection.reset(), this.highlightedElements = [], this.wizardHighlightedElements = [],
          this.selector = "";
      }
      removeHoveredElement() {
        this.hoveredElementHighlight = void 0;
      }
      elementPreview(e) {
        this.showSelectedElementCount = !0, this.selection.setSelector(e);
        const t = this.selection.getSelectedElements();
        if (void 0 === t) throw new Error("No elements matching selector found");
        this.highlightedElements = t.map((e => new i.HighlightElement(e, "clicked")));
      }
      elementPreviewWizard(e, t) {
        this.wizardHighlightedElements = e.map((e => new i.HighlightElement(e, "clicked"))),
          this.hoveredElementHighlight = new i.HighlightElement(t, "clicked");
      }
      getCSSSelector(e) {
        this.showToolbar = !0, this.cssSelectSelectedCallback = e;
      }
      selectorSelected() {
        const e = this.selection.getSelector(),
          t = this.selection.linkType;
        this.cssSelectSelectedCallback({
          CSSSelector: e,
          changeLinkType: t,
          multiple: this.selection.getSelectedElements().length > 1
        });
      }
      rerenderHighlightPosition() {
        this.highlightedElements = [...this.highlightedElements], this.wizardHighlightedElements = [...this.wizardHighlightedElements],
          this.parentElementHighlights && (this.parentElementHighlights = [...this.parentElementHighlights]),
          this.hoveredElementHighlight && this.setHoveredElement(this.hoveredElementHighlight.element);
      }
      setFocused(e) {
        this.uiHasFocus = e, this.notification = e && this.notification === this.keysDisabledMessage ? void 0 : this.notification;
      }
      selectParent() {
        this.traverseDom(1);
      }
      selectChild() {
        this.traverseDom(-1);
      }
      setMouseNotOverToolbar() {
        this.mouseOverToolbar = !1;
      }
      setMouseOverToolbar() {
        this.mouseOverToolbar = !0, this.hoveredElementHighlight = void 0;
      }
      setHoveredElement(e) {
        this.hoveredElementHighlight = void 0 === e ? void 0 : new i.HighlightElement(e, "hovered");
      }
      setParentElement(e) {
        "#document" !== e[0].nodeName && (this.parentElementHighlights = e.map((e => new i.HighlightElement(e, "parent"))));
      }
      addClickedElement(e, t) {
        try {
          this.selection.addClickedElement(e, t);
          const n = this.selection.getSelectedElements();
          this.highlightedElements = n.map((e => new i.HighlightElement(e, "clicked"))), this.selector = this.selection.getSelector(),
            this.notification = void 0;
        } catch (e) {
          e instanceof o.SelectionError ? this.notification = e.message : a.Log.error(e.message);
        }
      }
      traverseDom(e) {
        this.selection.traverseDom(e);
        const t = this.selection.getSelectedElements();
        this.highlightedElements = t.map((e => new i.HighlightElement(e, "clicked"))), this.selector = this.selection.getSelector();
      }
      onElementsSelected(e) {
        this.selection.onElementsSelected(e);
      }
    };
  },
  1375: function(e, t, n) {
    "use strict";
    var r = this && this.__importDefault || function(e) {
      return e && e.__esModule ? e : {
        default: e
      };
    };
    Object.defineProperty(t, "__esModule", {
      value: !0
    }), t.useStores = void 0;
    const i = r(n(96540)),
      o = n(44015);
    t.useStores = () => i.default.useContext(o.MobXProviderContext);
  },
  15967: function(e, t, n) {
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
    }), t.ClickAction = void 0;
    const i = n(3602),
      o = n(74161),
      a = n(83258),
      s = n(94606),
      l = n(91621),
      c = n(36912),
      u = n(82190),
      d = n(94861),
      f = n(87594);
    class h extends i.ExtractorBase {
      constructor() {
        super(...arguments), this.eventClasses = {
            pointerrawupdate: "PointerEvent",
            pointerover: "PointerEvent",
            pointerenter: "PointerEvent",
            mouseover: "MouseEvent",
            mouseenter: "MouseEvent",
            pointermove: "PointerEvent",
            mousemove: "MouseEvent",
            pointerdown: "PointerEvent",
            mousedown: "MouseEvent",
            focus: "FocusEvent",
            selectstart: "Event",
            pointerup: "PointerEvent",
            mouseup: "MouseEvent",
            click: "PointerEvent"
          }, this.realEventsOrder = ["pointerrawupdate", "pointerover", "pointerenter", "mouseover", "mouseenter", "pointermove", "mousemove", "pointerdown", "mousedown", "focus", "selectstart", "pointerup", "mouseup", "click"],
          this.eventGroups = {
            [s.ClickActionTypes.realLikeEvents]: this.realEventsOrder,
            [s.ClickActionTypes.real]: this.realEventsOrder,
            [s.ClickActionTypes.auto]: this.realEventsOrder
          };
      }
      extract(e) {
        return r(this, arguments, void 0, (function*(e, t = s.ClickActionTypes.auto) {
          var n;
          const r = this.getHTMLElement(e);
          if (!r) return void o.Log.warning("couldn't find element for clicking");
          if (r instanceof HTMLAnchorElement && (null === (n = r.href) || void 0 === n ? void 0 : n.startsWith("javascript:"))) {
            const e = r.href.replace("javascript:", "");
            r.removeAttribute("href"), r.setAttribute("onclick", e);
          }
          if ("OPTION" === d.HTMLElementHelper.getTagName(r)) return void this.clickOptionElement(r);
          const i = this.eventGroups[t],
            l = r.isConnected;
          let c = !1;
          for (const e of i) {
            let t;
            switch (this.eventClasses[e]) {
              case "PointerEvent":
                t = this.createPointerEvent(r, e);
                break;

              case "MouseEvent":
                t = this.createMouseEvent(r, e);
                break;

              case "FocusEvent":
                if (c) continue;
                if (this.elementShouldGainFocus(r) ? r.focus() : this.forceFocusOnDocumentBody(),
                  "SELECT" === d.HTMLElementHelper.getTagName(r)) return;
                yield a.Async.sleep(1);
                continue;

              case "Event":
                if ("selectstart" === e && !this.shouldCallSelectstartEvent(r) || c) continue;
                t = new Event(e, {
                  bubbles: !0,
                  cancelable: !0
                });
            }
            if (f.Browser.isFirefox() && "click" === e ? r.click() : r.dispatchEvent(t), "mousedown" === e && t.defaultPrevented && (c = !0),
              "click" === e) return;
            if (yield a.Async.sleep(1), "mousedown" === e && (yield a.Async.sleep(160)), r.isConnected !== l) return;
          }
        }));
      }
      createMouseEvent(e, t) {
        const {
          clientX: n,
          clientY: r,
          screenX: i,
          screenY: o
        } = l.Coordinates.getElementCoordinates(e);
        let a = c.MouseEventOptions[t]();
        return a = Object.assign(Object.assign({}, a), {
          clientX: n,
          clientY: r,
          screenX: i,
          screenY: o
        }), new MouseEvent(t, a);
      }
      createPointerEvent(e, t) {
        const {
          clientX: n,
          clientY: r,
          screenX: i,
          screenY: o
        } = l.Coordinates.getElementCoordinates(e);
        let a = u.PointerEventOptions[t]();
        return a = Object.assign(Object.assign({}, a), {
          clientX: n,
          clientY: r,
          screenX: i,
          screenY: o
        }), new PointerEvent(t, a);
      }
      clickOptionElement(e) {
        e.setAttribute("selected", "selected"), e.selected = !0;
        for (const t of Array.from(e.parentElement.querySelectorAll("option"))) t !== e && t.removeAttribute("selected");
        "SELECT" === d.HTMLElementHelper.getTagName(e.parentElement) ? e.parentElement.dispatchEvent(new Event("change", {
          bubbles: !0
        })) : e.dispatchEvent(new Event("change", {
          bubbles: !0
        }));
      }
      shouldCallSelectstartEvent(e) {
        const t = d.HTMLElementHelper.getTagName(e);
        if (("A" === t || "AREA" === t) && null !== e.getAttribute("href")) return !1;
        return ["BODY", "A", "SPAN", "FORM", "AREA", "LABEL", "DIV", "SVG", "P"].includes(t);
      }
      forceFocusOnDocumentBody() {
        const e = document.body,
          t = e.getAttribute("tabindex");
        e.setAttribute("tabindex", "-1"), e.focus(), t ? e.setAttribute("tabindex", t) : e.removeAttribute("tabindex");
      }
      elementShouldGainFocus(e) {
        const t = d.HTMLElementHelper.getTagName(e);
        if ("AREA" === t) return !1;
        if ("A" === t && null !== e.getAttribute("href") || null !== e.getAttribute("tabindex") || "true" === e.getAttribute("contenteditable") || "" === e.getAttribute("contenteditable")) return !0;
        return !["BODY", "A", "DIV", "SPAN", "FORM", "LABEL", "SVG", "P"].includes(t);
      }
    }
    t.ClickAction = h;
  },
  81614: function(e, t, n) {
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
      },
      i = this && this.__importDefault || function(e) {
        return e && e.__esModule ? e : {
          default: e
        };
      };
    Object.defineProperty(t, "__esModule", {
      value: !0
    }), t.DownloadUrlAction = void 0;
    const o = n(31376),
      a = i(n(51668)),
      s = n(74161),
      l = n(789);
    t.DownloadUrlAction = class {
      constructor() {
        this.decodeErrorMessage = "incorrect header check";
      }
      extract(e) {
        return r(this, void 0, void 0, (function*() {
          const t = yield fetch(e);
          if (t.status >= 300) throw `PAGE_STATUS_CODE_ERROR ${t.status}`;
          if (!t.ok) throw `PAGE_REQUEST_ERROR ${t.statusText}`;
          const n = t.headers.get("Content-Type"),
            r = o.ContentTypeParser.isContentTypeUnknown(n),
            i = o.ContentTypeParser.isContentTypeForCompressedContent(n);
          if (r && (s.Log.notice("DownloadUrlAction unknown content-type", {
              contentType: n
            }), i)) {
            const e = yield t.clone().arrayBuffer();
            try {
              const t = new Uint8Array(e),
                n = a.default.ungzip(t);
              return (new TextDecoder).decode(n);
            } catch (n) {
              if (n === this.decodeErrorMessage && l.Str.isValidUTF8(e)) return t.text();
              throw "PAGE_UNKNOWN_CONTENT_TYPE_ERROR DownloadUrlAction.unzip";
            }
          }
          return t.text();
        }));
      }
    };
  },