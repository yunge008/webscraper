(function() {
  function visible(input) {
    const rect = input.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && !input.disabled && !input.readOnly;
  }
  function inputs() {
    return Array.from(document.querySelectorAll("input:not([type='hidden']):not([type='checkbox']):not([type='radio'])")).filter(visible);
  }
  function searchWrapper(input) {
    return input.closest("[class*='input-search'], [class*='search-input'], [role='search']");
  }
  function descriptor(input) {
    return { id: input.id || "", name: input.getAttribute("name") || "", placeholder: input.getAttribute("placeholder") || "", ariaLabel: input.getAttribute("aria-label") || "", search: !!searchWrapper(input) };
  }
  function locate(target, saved) {
    const all = inputs();
    if (saved) {
      for (const [key, attribute] of [["id", "id"], ["name", "name"], ["placeholder", "placeholder"], ["ariaLabel", "aria-label"]]) {
        if (!saved[key]) continue;
        const matches = all.filter(input => input.getAttribute(attribute) === saved[key]);
        if (matches.length === 1) return matches[0];
      }
    }
    const exact = all.filter(input => target && input.value.trim() === target);
    if (exact.length === 1) return exact[0];
    if (!target) {
      const numeric = all.filter(input => /^\d{12,}$/.test(input.value.trim()) && /^(text|search|tel|number)$/.test(input.type));
      if (numeric.length === 1) return numeric[0];
    }
    const semantic = all.filter(input => /(?:商品|产品|product|sku)[\s_-]*(?:id|编号)|搜索商品|搜索订单.*商品|search.*(?:product|order)/i.test([input.getAttribute("placeholder"), input.getAttribute("aria-label"), input.getAttribute("name")].join(" ")));
    if (semantic.length === 1) return semantic[0];
    if (semantic.length > 1) throw new Error("找到多个产品搜索框，无法安全恢复筛选。请复制诊断报告。");
    const searches = all.filter(input => searchWrapper(input) || input.type === "search");
    if (searches.length === 1) return searches[0];
    if (searches.length > 1) throw new Error("找到多个搜索框，无法确定商品搜索入口。请复制诊断报告。");
    return null;
  }
  window.__TK_REVIEW_PRODUCT_FILTER__ = async function(command, target, saved) {
    if (command === "inspect") {
      const input = locate(target, saved);
      return input ? { found: true, descriptor: descriptor(input), value: /^\d+$/.test(input.value.trim()) ? input.value.trim() : "" } : { found: false };
    }
    if (command !== "submit-current" && (command !== "apply" || !/^\d+$/.test(target || ""))) throw new Error("产品搜索 ID 必须是完整数字编号。");
    let input = locate(target, saved);
    if (!input) return { ready: false };
    if (command === "apply") {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
      setter.call(input, target);
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
      await new Promise(resolve => setTimeout(resolve, 150));
      input = locate(target, saved);
      if (!input || input.value.trim() !== target) throw new Error("商品搜索框未保留输入值，已停止以避免抓取全店评论。");
    }
    // Drop pre-search captures. Returned product IDs are also checked by the panel.
    if (window.__TK_REVIEW_CAPTURE__) window.__TK_REVIEW_CAPTURE__.requests = [];
    const wrapper = searchWrapper(input) || input.parentElement;
    const buttons = wrapper ? Array.from(wrapper.querySelectorAll("[class*='input-search-button'], [class*='search-button'], [class*='input-search-icon'], [class*='icon-search'], [data-icon='search'], [aria-label='Search'], [aria-label='搜索']")).filter(visible) : [];
    const button = buttons.find(el => !buttons.some(other => other !== el && other.contains(el))) || buttons[0];
    let trigger;
    if (button) {
      if (typeof button.click === "function") button.click();
      else button.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
      trigger = "search-button";
    }
    else {
      input.focus();
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", code: "Enter", keyCode: 13, which: 13, bubbles: true, cancelable: true }));
      input.dispatchEvent(new KeyboardEvent("keyup", { key: "Enter", code: "Enter", keyCode: 13, which: 13, bubbles: true }));
      trigger = "enter";
    }
    return { ready: true, trigger, descriptor: descriptor(input) };
  };
})();
