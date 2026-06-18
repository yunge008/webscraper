/**
 * UI Component: SelectorSubtype
 * Source module ID: 98536
 * Extracted from: devtools_panel.js (Web Scraper v1.107.22)
 * Framework: React (MUI components)
 */

98536: function(e, t, r) {
  "use strict";
  var n = this && this.__importDefault || function(e) {
    return e && e.__esModule ? e : {
      default: e
    };
  };
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.SelectorSubtype = void 0;
  const o = n(r(96540)),
    i = r(33675),
    a = {
      clickType: {
        label: "Click type",
        options: {
          clickOnce: "Click once (pagination, tabs)",
          clickMore: "Click more (click to load more elements. Stops when no new elements with unique text content are found.)"
        }
      },
      paginationType: {
        label: "Pagination type",
        options: {
          auto: "auto",
          linkFromHref: 'Link (<a href="http://example.com/">)',
          linkFromInlineScript: "Scripted link (<a href=\"javascript:window.location='http://example.com'\">)",
          linkFromAttributes: 'Attribute link (<a data-link="http://example.com">)',
          linkFromInnerText: "Text link (<div>link: http://example.com/</div>)",
          clickMore: "Click multiple times on next/more button ([Next page] [Load More])",
          clickOnce: "Click once on multiple buttons ([1] [2], [3])",
          linkFromRedirect: "Link from any script (window.location=, window.open)"
        }
      },
      clickElementUniquenessType: {
        label: "Click element uniqueness",
        options: {
          uniqueText: "Unique Text",
          uniqueHTMLText: "Unique HTML+Text",
          uniqueHTML: "Unique HTML",
          uniqueCSSSelector: "unique CSS Selector"
        }
      },
      linkType: {
        label: "Link type",
        options: {
          linkFromHref: "Link (read from href attribute)",
          linkFromInnerText: "Text (use text contents as link)",
          linkFromAttributes: "Attribute",
          linkFromInlineScript: "Scripted link in attribute (<a onclick=\"window.location='example.com'\">)",
          linkFromRedirect: "Link from any script (window.location=, window.open)"
        }
      },
      discardInitialElements: {
        label: "Discard initial elements",
        options: {
          "do-not-discard": "Never discard",
          "discard-when-click-element-exists": "Discard when click element exists",
          discard: "Always discard"
        }
      }
    };
  t.SelectorSubtype = ({
    feature: e
  }) => {
    const t = a[e];
    return o.default.createElement(i.SelectDropdown, {
      field: e,
      label: t.label,
      options: t.options
    });
  };
},