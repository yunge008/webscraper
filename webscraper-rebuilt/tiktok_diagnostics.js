(function() {
  const report = document.getElementById("report");
  const status = document.getElementById("diagnosticStatus");
  const buttons = Array.from(document.querySelectorAll("button"));
  function api() {
    const frame = parent.document.getElementById("tkReviewsFrame");
    const controller = frame && frame.contentWindow.TKReviewDiagnosticsAPI;
    if (!controller) throw new Error("评论面板未初始化。请重新打开侧栏；若仍失败，请检查扩展是否完整加载。");
    return controller;
  }
  function refresh() { report.value = JSON.stringify(api().report(), null, 2); return report.value; }
  async function run(action) {
    buttons.forEach(button => { button.disabled = true; });
    try { await action(); } catch (error) { status.textContent = `错误：${error.message || error}`; }
    finally { buttons.forEach(button => { button.disabled = false; }); }
  }
  document.getElementById("probe").addEventListener("click", () => run(async () => {
    status.textContent = "正在运行探针，每项最多等待 15 秒…";
    try { await api().probe(); status.textContent = "探针已完成。请复制诊断报告。"; }
    finally { refresh(); }
  }));
  document.getElementById("refresh").addEventListener("click", () => run(() => { refresh(); status.textContent = "报告已刷新。"; }));
  document.getElementById("copy").addEventListener("click", () => run(async () => {
    refresh();
    try { await navigator.clipboard.writeText(report.value); status.textContent = "诊断报告已复制。"; }
    catch (_) { report.focus(); report.select(); status.textContent = "自动复制不可用，已选中报告，请按 Ctrl+C。"; }
  }));
  document.getElementById("download").addEventListener("click", () => run(() => {
    const url = URL.createObjectURL(new Blob([refresh()], { type: "application/json;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url; anchor.download = `tk-diagnostics-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(anchor); anchor.click(); anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    status.textContent = "诊断报告已下载。";
  }));
  document.getElementById("clear").addEventListener("click", () => run(() => { api().clear(); refresh(); status.textContent = "诊断日志已清空。"; }));
  window.addEventListener("message", event => {
    if (event.source === parent && event.origin === location.origin && event.data === "tk-diagnostics-visible") run(() => { refresh(); });
  });
  run(() => { refresh(); status.textContent = "报告已就绪。运行探针可检查页面和监听。"; });
})();
