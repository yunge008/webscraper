(function() {
  "use strict";
  const report = document.getElementById("report");
  const status = document.getElementById("diagnosticStatus");
  const buttons = Array.from(document.querySelectorAll("button"));
  let lastProbe = null;
  let lastApiTest = null;
  function api() {
    const frame = parent.document.getElementById("tkReviewsFrame");
    const controller = frame && frame.contentWindow && frame.contentWindow.TKReviewDiagnosticsAPI;
    if (!controller) throw new Error("评论面板未初始化。请切换到“TK评论抓取”页签确认已加载，或关闭并重新打开侧栏。");
    return controller;
  }
  async function refresh() {
    const base = await api().report();
    report.value = JSON.stringify({ ...base, probe: lastProbe, apiTest: lastApiTest }, null, 2);
    return report.value;
  }
  async function run(label, action) {
    buttons.forEach(button => { button.disabled = true; });
    status.textContent = `${label}…`;
    try { await action(); }
    catch (error) {
      status.textContent = `错误：${error.message || error}`;
      try { await refresh(); } catch (_) {}
    } finally { buttons.forEach(button => { button.disabled = false; }); }
  }
  document.getElementById("probe").addEventListener("click", () => run("正在运行探针", async () => {
    lastProbe = await api().probe();
    await refresh();
    status.textContent = "探针已完成。可点“复制诊断”发送给开发者。";
  }));
  document.getElementById("testApi").addEventListener("click", () => run("正在测试接口直连（请求第 1、2 页）", async () => {
    try { lastApiTest = await api().testApi(); }
    catch (error) { lastApiTest = { error: error.message }; }
    await refresh();
    const ok = lastApiTest.attempts && lastApiTest.attempts.some(a => a.ok);
    status.textContent = ok ? "接口直连可用。" : `接口直连不可用：${lastApiTest.error || (lastApiTest.attempts || []).map(a => a.error).join("；")}。任务会自动改用页面点击翻页。`;
  }));
  document.getElementById("copy").addEventListener("click", () => run("正在复制", async () => {
    await refresh();
    try { await navigator.clipboard.writeText(report.value); status.textContent = "诊断报告已复制。"; }
    catch (_) { report.focus(); report.select(); document.execCommand("copy"); status.textContent = "已选中报告；如未复制成功请按 Ctrl+C。"; }
  }));
  document.getElementById("download").addEventListener("click", () => run("正在下载", async () => {
    const url = URL.createObjectURL(new Blob([await refresh()], { type: "application/json;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url; anchor.download = `tk-diagnostics-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.json`;
    document.body.appendChild(anchor); anchor.click(); anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    status.textContent = "诊断报告已下载。";
  }));
  document.getElementById("clear").addEventListener("click", () => run("正在清空", async () => {
    api().clear(); lastProbe = null; lastApiTest = null; await refresh(); status.textContent = "诊断日志已清空。";
  }));
  window.addEventListener("message", event => {
    if (event.source === parent && event.data === "tk-diagnostics-visible") run("正在刷新", async () => { await refresh(); status.textContent = "报告已刷新。"; });
  });
  run("正在读取", async () => { await refresh(); status.textContent = "报告已就绪。建议先点“运行探针”。"; });
})();
