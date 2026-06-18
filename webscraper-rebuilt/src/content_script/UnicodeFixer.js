/**
 * Content Script Module: UnicodeFixer
 * Source module ID: 6469
 * Extracted from: content_script.js (Web Scraper v1.107.22)
 * Runs in: page context (injected into target websites)
 */

6469: (e, t) => {
    "use strict";
    Object.defineProperty(t, "__esModule", {
      value: !0
    }), t.UnicodeFixer = void 0;
    class n {
      static fix(e) {
        if ("string" == typeof e) {
          const t = (new TextEncoder).encode(e),
            r = (new TextDecoder).decode(t);
          return n.replaceNonCharacters(r);
        }
        return e;
      }
      static replaceNonCharacters(e) {
        return e.replace(/[\uFFFE-\uFFFF]/g, "\ufffd");
      }
    }
    t.UnicodeFixer = n;
  },
  90195: function(e, t, n) {
    "use strict";
    var r = this && this.__importDefault || function(e) {
      return e && e.__esModule ? e : {
        default: e
      };
    };
    Object.defineProperty(t, "__esModule", {
      value: !0
    }), t.Url = void 0;
    const i = r(n(61160));
    class o {
      static combine(e, t) {
        return new URL(t, e).toString();
      }
      static isValidUrlOrUrlPart(e) {
        try {
          return o.combine("http://example.com/", e), !0;
        } catch (e) {
          return !1;
        }
      }
      static escapeWhiteSpace(e) {
        return null == e ? e : e = (e = (e = (e = (e = (e = e.trim()).replace(/ /g, "%20")).replace(/\xa0/g, "%C2%A0")).replace(/\n/g, "%0A")).replace(/\r/g, "%0D")).replace(/\t/g, "%09");
      }
      static isExtensionUrl(e) {
        return !!e && e.startsWith("chrome-extension://");
      }
      static isHashTagChange(e, t) {
        if (!e || !t) return !1;
        const n = e.match(/^[^#]+#/),
          r = t.match(/^[^#]+#/);
        if (n && r) {
          const e = n[0];
          if (r[0] === e) return !0;
        } else if (r) {
          if (r[0] === `${e}#`) return !0;
        }
        return !1;
      }
      static getDomain(e) {
        let t = (0, i.default)(e).hostname;
        return t.startsWith("www.") && (t = t.substr(4)), t;
      }
      static getTopLevelDomain(e) {
        const t = (0, i.default)(e).hostname.split(".");
        return t.slice(t.length - 2).join(".");
      }
      static isRecognizedProtocol(e) {
        const t = (0, i.default)(e);
        return e && (!t.protocol || "http:" === t.protocol || "https:" === t.protocol);
      }
      static fixStartUrls(e) {
        "string" == typeof e && (e = [e]);
        const t = [];
        for (const n of e) t.push(n.replace(/[^\x00-\x7F]/g, (e => {
          try {
            return encodeURIComponent(e);
          } catch (t) {
            return e;
          }
        })));
        return t;
      }
      static getParameterByName(e, t) {
        const n = (0, i.default)(e);
        n.query;
        const r = n.query.split(/[?&#]/);
        for (const e of r) {
          const n = e.match(/^([^=]+)=?(.*)$/);
          if (n && n[1] === t) return n[2] ? decodeURIComponent(n[2]) : "";
        }
        return "";
      }
      static parseStartUrlList(e) {
        const t = [];
        for (const n of e) {
          const e = (e, t) => {
              for (; e.length < t;) e = `0${e}`;
              return e;
            },
            r = /^(.*?)\[(\d+)\-(\d+)(:(\d+))?\](.*)$/,
            i = n.match(r);
          if (i) {
            const n = i[2],
              r = i[3],
              o = parseInt(n, 10),
              a = parseInt(r, 10);
            let s = 1;
            void 0 !== i[5] && (s = parseInt(i[5], 10));
            for (let l = o; l <= a; l += s) n.length === r.length ? t.push(i[1] + e(l.toString(), n.length) + i[6]) : t.push(i[1] + l + i[6]);
          } else t.push(n);
        }
        return t;
      }
      static makeStartUrlObjectList(e) {
        const t = [];
        for (const n of e) t.push({
          startUrl: n
        });
        return t;
      }
      static stripProtocolAndQuery(e) {
        const t = (0, i.default)(e);
        return `${t.hostname}${t.pathname}`;
      }
      static getImageExtension(e) {
        var t;
        const n = e.match(/^.+?\.(.{3,4})($|\?.+|#.+)/);
        return null !== (t = n && n[1]) && void 0 !== t ? t : void 0;
      }
      static getQueryParameters(e) {
        const t = new URLSearchParams(new URL(e, "http://baseurl/").search),
          n = {};
        for (const [e, r] of t.entries()) n[e] = r;
        return n;
      }
      static isDataUrl(e) {
        return "data:" === new URL(e).protocol;
      }
      static canParse(e) {
        return URL.canParse(e);
      }
      static isLocalHostUrl(e) {
        const t = o.getHost(e);
        return "localhost" === t || "127.0.0.1" === t;
      }
      static getHost(e) {
        return new URL(e).host.replace(/:\d+$/, "");
      }
    }
    t.Url = o;
  },
  44623: function(e, t, n) {
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
    }), t.Xlsx = void 0;
    const o = i(n(71710)),
      a = n(78979);
    class s {
      static getXlsxBlob(e, t) {
        return r(this, void 0, void 0, (function*() {
          return this.generateZip(e, t).generateAsync({
            type: "blob",
            mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          });
        }));
      }
      static generateZip(e, t) {
        const n = new o.default,
          r = n.folder("docProps");
        r.file("app.xml", s.getAppData()), r.file("core.xml", s.getCoreData());
        n.folder("_rels").file(".rels", s.getRelsData()), n.file("[Content_Types].xml", s.getContentTypesData());
        const i = n.folder("xl");
        i.folder("_rels").file("workbook.xml.rels", s.getWorkbookXmlRelsData()), i.file("sharedStrings.xml", s.getSharedStringsData()),
          i.file("styles.xml", s.getStylesData()), i.file("workbook.xml", s.getWorkbookData());
        return i.folder("worksheets").file("sheet1.xml", s.generateSheetData(e, t)), n;
      }
      static getAppData() {
        return '<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>Spout</Application><TotalTime>0</TotalTime></Properties>';
      }
      static getCoreData() {
        const e = new Date;
        return `<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dcterms:created xsi:type="dcterms:W3CDTF">${e.toISOString()}</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">${e.toISOString()}</dcterms:modified><cp:revision>0</cp:revision></cp:coreProperties>`;
      }
      static getRelsData() {
        return '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rIdWorkbook" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/><Relationship Id="rIdCore" Type="http://schemas.openxmlformats.org/officedocument/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rIdApp" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>';
      }
      static getContentTypesData() {
        return '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default ContentType="application/xml" Extension="xml"/><Default ContentType="application/vnd.openxmlformats-package.relationships+xml" Extension="rels"/><Override ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml" PartName="/xl/workbook.xml"/><Override ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml" PartName="/xl/worksheets/sheet1.xml"/><Override ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml" PartName="/xl/styles.xml"/><Override ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml" PartName="/xl/sharedStrings.xml"/><Override ContentType="application/vnd.openxmlformats-package.core-properties+xml" PartName="/docProps/core.xml"/><Override ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml" PartName="/docProps/app.xml"/></Types>';
      }
      static getWorkbookXmlRelsData() {
        return '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rIdStyles" Target="styles.xml" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles"/><Relationship Id="rIdSharedStrings" Target="sharedStrings.xml" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings"/><Relationship Id="rIdSheet1" Target="worksheets/sheet1.xml" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet"/></Relationships>';
      }
      static getSharedStringsData() {
        return '<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="0" uniqueCount="0"/>';
      }
      static getStylesData() {
        return '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><numFmts count="1"><numFmt numFmtId="164" formatCode="@"/></numFmts><fonts count="1"><font><sz val="12"/><color theme="1"/><name val="Calibri"/><family val="2"/><scheme val="minor"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles><dxfs count="0"/><tableStyles count="0" defaultTableStyle="TableStyleMedium9" defaultPivotStyle="PivotStyleLight16"/></styleSheet>';
      }
      static getWorkbookData() {
        return '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Sheet1" sheetId="1" r:id="rIdSheet1"/></sheets></workbook>';
      }
      static generateSheetData(e, t) {
        return `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheetData>${s.getSheetData(e, t)}</sheetData></worksheet>`;
      }
      static getSheetData(e, t) {
        let n = "",
          r = "";
        const i = [...t];
        "web-scraper-order" === i[0] && (i[0] = "web_scraper_order", i[1] = "web_scraper_start_url");
        const o = s.generateColumnLetters(t.length);
        n = `${n}<row r="1" spans="1:${i.length}">`, i.forEach(((e, t) => {
          const r = a.Escape.charactersForXml(e);
          n = `${n}<c r="${o[t]}1" s="1" t="inlineStr"><is><t>${r}</t></is></c>`;
        })), n = `${n}</row>`;
        for (let i = 0; i < e.length; i++) {
          const s = e[i];
          delete s._id;
          const l = Object.keys(s).length;
          r = `<row r="${i + 2}" spans="1:${l}">`, t.forEach(((e, t) => {
            const n = s[e] ? `<t>${a.Escape.charactersForXml(s[e])}</t>` : "<t></t>";
            r += `<c r="${o[t]}${i + 2}" s="1" t="inlineStr"><is>${n}</is></c>`;
          })), n = n + r + "</row>";
        }
        return n;
      }
      static generateColumnLetters(e) {
        const t = e => e.replace(/([^Z]?)(Z*)$/, ((e, t, n) => {
            return ((r = t) ? String.fromCharCode(r.charCodeAt(0) + 1) : "A") + n.replace(/Z/g, "A");
            var r;
          })),
          n = [];
        for (let r = 0, i = ""; r < e; r++) i = t(i), n.push(i);
        return n;
      }
    }
    t.Xlsx = s;
  },