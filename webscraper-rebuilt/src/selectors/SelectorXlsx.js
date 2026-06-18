/**
 * Module: SelectorXlsx
 * Source module ID: 44623
 * Category: selectors
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

44623: function(e, t, r) {
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
    },
    i = this && this.__importDefault || function(e) {
      return e && e.__esModule ? e : {
        default: e
      };
    };
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.Xlsx = void 0;
  const o = i(r(71710)),
    s = r(78979);
  class a {
    static getXlsxBlob(e, t) {
      return n(this, void 0, void 0, (function*() {
        return this.generateZip(e, t).generateAsync({
          type: "blob",
          mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        });
      }));
    }
    static generateZip(e, t) {
      const r = new o.default,
        n = r.folder("docProps");
      n.file("app.xml", a.getAppData()), n.file("core.xml", a.getCoreData());
      r.folder("_rels").file(".rels", a.getRelsData()), r.file("[Content_Types].xml", a.getContentTypesData());
      const i = r.folder("xl");
      i.folder("_rels").file("workbook.xml.rels", a.getWorkbookXmlRelsData()), i.file("sharedStrings.xml", a.getSharedStringsData()),
        i.file("styles.xml", a.getStylesData()), i.file("workbook.xml", a.getWorkbookData());
      return i.folder("worksheets").file("sheet1.xml", a.generateSheetData(e, t)), r;
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
      return `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheetData>${a.getSheetData(e, t)}</sheetData></worksheet>`;
    }
    static getSheetData(e, t) {
      let r = "",
        n = "";
      const i = [...t];
      "web-scraper-order" === i[0] && (i[0] = "web_scraper_order", i[1] = "web_scraper_start_url");
      const o = a.generateColumnLetters(t.length);
      r = `${r}<row r="1" spans="1:${i.length}">`, i.forEach(((e, t) => {
        const n = s.Escape.charactersForXml(e);
        r = `${r}<c r="${o[t]}1" s="1" t="inlineStr"><is><t>${n}</t></is></c>`;
      })), r = `${r}</row>`;
      for (let i = 0; i < e.length; i++) {
        const a = e[i];
        delete a._id;
        const l = Object.keys(a).length;
        n = `<row r="${i + 2}" spans="1:${l}">`, t.forEach(((e, t) => {
          const r = a[e] ? `<t>${s.Escape.charactersForXml(a[e])}</t>` : "<t></t>";
          n += `<c r="${o[t]}${i + 2}" s="1" t="inlineStr"><is>${r}</is></c>`;
        })), r = r + n + "</row>";
      }
      return r;
    }
    static generateColumnLetters(e) {
      const t = e => e.replace(/([^Z]?)(Z*)$/, ((e, t, r) => {
          return ((n = t) ? String.fromCharCode(n.charCodeAt(0) + 1) : "A") + r.replace(/Z/g, "A");
          var n;
        })),
        r = [];
      for (let n = 0, i = ""; n < e; n++) i = t(i), r.push(i);
      return r;
    }
  }
  t.Xlsx = a;
},