#!/usr/bin/env node
// 生成式AI 課後筆記 · 完成標準檢查
// 用法：
//   node scripts/check.mjs            檢查全站
//   node scripts/check.mjs --week 10  只看第 10 週相關的檔案（該週、上一週、index、glossary）
// 規則來源是 AGENTS.md 第 4 到 9 節。不准為了讓檢查通過而修改這支腳本。
// 只用 Node 內建模組，不需要 npm install。

import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname, resolve, relative, posix } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const weekArg = args.includes("--week") ? args[args.indexOf("--week") + 1] : null;
const onlyWeek = weekArg ? String(weekArg).padStart(2, "0") : null;

const ACCENTS = ["teal", "sienna", "olive", "plum", "indigo", "ochre", "brick", "slate"];
const SECTIONS = ["summary", "why", "concepts", "links", "mine", "homework", "questions", "terms", "sources"];
const EXTERNAL_OK = ["fonts.googleapis.com", "fonts.gstatic.com", "github.com"];
const BANNED_CHARS = [
  ["—", "破折號 —"], ["──", "破折號 ──"], ["–", "連接號 –"], ["；", "全形分號"], [";", "半形分號"],
];
const BANNED_WORDS = [
  "賦能", "至關重要", "無縫", "革命性", "深入探討", "扮演關鍵角色", "扮演著關鍵", "旨在", "全面提升",
  "值得注意的是", "總而言之", "綜上所述", "一言以蔽之", "讓我們一起",
];
const TODO_LINE = "TODO：等我補 my-notes.md";

const messages = [];
const report = (level, rule, file, msg) => messages.push({ level, rule, file, msg });
const err = (rule, file, msg) => report("error", rule, file, msg);
const warn = (rule, file, msg) => report("warning", rule, file, msg);

const read = (p) => readFileSync(join(ROOT, p), "utf8");
const rel = (abs) => relative(ROOT, abs).split("\\").join("/");

// ---------- 小工具 ----------
function stripForText(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<pre[\s\S]*?<\/pre>/gi, " ")
    .replace(/<code[\s\S]*?<\/code>/gi, " ");
}
function textOf(html) {
  return stripForText(html)
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}
function charLen(s) {
  return [...s.replace(/\s/g, "")].length;
}
function section(html, id) {
  const m = html.match(new RegExp(`<section id="${id}">([\\s\\S]*?)</section>`));
  return m ? m[1] : null;
}
function ids(html) {
  return new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
}
function lineOf(html, index) {
  return html.slice(0, index).split("\n").length;
}
function accentFor(nn) {
  const n = Number(nn);
  return ACCENTS[(((n - 6) % 8) + 8) % 8];
}

// ---------- 收集檔案 ----------
const noteFiles = existsSync(join(ROOT, "notes"))
  ? readdirSync(join(ROOT, "notes")).filter((f) => f.endsWith(".html")).sort()
  : [];
for (const f of noteFiles) {
  if (!/^week-\d{2}\.html$/.test(f)) err("檔名", `notes/${f}`, "筆記檔名要是 week-NN.html（兩位數補零）");
}
const weeks = noteFiles.map((f) => f.match(/^week-(\d{2})\.html$/)?.[1]).filter(Boolean);
const pages = ["index.html", "glossary.html", "about.html", ...weeks.map((w) => `notes/week-${w}.html`)].filter((p) =>
  existsSync(join(ROOT, p))
);
for (const p of ["index.html", "glossary.html", "about.html", ".nojekyll", "templates/note-template.html"]) {
  if (!existsSync(join(ROOT, p))) err("必要檔案", p, "檔案不存在");
}

const html = Object.fromEntries(pages.map((p) => [p, read(p)]));
const idCache = new Map();
function idsOfFile(p) {
  if (!idCache.has(p)) idCache.set(p, existsSync(join(ROOT, p)) ? ids(read(p)) : new Set());
  return idCache.get(p);
}

// ---------- 全站共通規則 ----------
for (const p of pages) {
  const h = html[p];

  if (!/<html lang="zh-Hant">/.test(h)) err("語言", p, '<html> 要有 lang="zh-Hant"');

  for (const m of h.matchAll(/\sstyle="/g)) err("inline style", p, `第 ${lineOf(h, m.index)} 行有 style=""，請改用現有的 class`);
  if (/<style[\s>]/i.test(h)) err("inline style", p, "不能有 <style> 區塊");

  const scripts = [...h.matchAll(/<script\b[^>]*>/gi)];
  const okScript = scripts.filter((m) => /src="(\.\.\/)?assets\/js\/site\.js"/.test(m[0]));
  if (okScript.length !== 1) err("script", p, `site.js 要剛好引入一次，現在是 ${okScript.length} 次`);
  if (scripts.length !== okScript.length) err("script", p, "除了 site.js 不能有其他 <script>");

  // 連結與路徑
  const sourcesHtml = section(h, "sources") || "";
  for (const m of h.matchAll(/\s(href|src)="([^"]*)"/g)) {
    const url = m[2];
    const line = lineOf(h, m.index);
    if (url.startsWith("//") || /^https?:/i.test(url)) {
      let host = "";
      try { host = new URL(url.startsWith("//") ? "https:" + url : url).host; } catch { err("外部網址", p, `第 ${line} 行網址格式錯誤：${url}`); continue; }
      const inSources = sourcesHtml.includes(url);
      if (!EXTERNAL_OK.includes(host) && !inSources) err("外部網址", p, `第 ${line} 行的 ${host} 不在白名單（講義網址只能放在「出處」）`);
      continue;
    }
    if (/^(mailto:|tel:)/.test(url)) continue;
    if (url.startsWith("/")) { err("絕對路徑", p, `第 ${line} 行用了 / 開頭的路徑：${url}，請改相對路徑`); continue; }
    if (url === "" ) { err("連結", p, `第 ${line} 行有空的連結`); continue; }
    const [pathPart, anchor] = url.split("#");
    const target = pathPart ? posix.normalize(posix.join(posix.dirname(p), pathPart)) : p;
    if (pathPart && !existsSync(join(ROOT, target))) { err("連結", p, `第 ${line} 行連到不存在的檔案：${url}`); continue; }
    if (anchor && target.endsWith(".html") && !idsOfFile(target).has(anchor)) {
      err("錨點", p, `第 ${line} 行的 #${anchor} 在 ${target} 找不到`);
    }
  }

  for (const m of h.matchAll(/<img\b[^>]*>/gi)) {
    if (!/\salt="[^"]+"/.test(m[0])) err("圖片 alt", p, `第 ${lineOf(h, m.index)} 行的圖片沒有 alt`);
  }

  // 寫作規則
  const desc = h.match(/<meta name="description" content="([^"]*)"/)?.[1] || "";
  const text = textOf(h) + " " + desc;
  for (const [c, name] of BANNED_CHARS) {
    const n = text.split(c).length - 1;
    if (n) err("寫作規則", p, `出現 ${n} 次${name}`);
  }
  const emoji = text.match(/\p{Extended_Pictographic}/gu);
  if (emoji) err("寫作規則", p, `出現 emoji：${[...new Set(emoji)].join(" ")}`);
  for (const w of BANNED_WORDS) if (text.includes(w)) err("寫作規則", p, `用了禁用詞「${w}」`);
  for (const m of text.matchAll(/不是[^。，！？]{1,24}[，,]?\s?而是/g)) warn("寫作習慣", p, `「不是…而是」句型：${m[0]}`);
  const todos = (text.match(/TODO/g) || []).length;
  if (todos) warn("TODO", p, `還有 ${todos} 個 TODO`);
}

// ---------- 筆記頁 ----------
for (const w of weeks) {
  const p = `notes/week-${w}.html`;
  const h = html[p];
  const idx = weeks.indexOf(w);
  const prev = weeks[idx - 1];
  const next = weeks[idx + 1];

  const title = h.match(/<title>([^<]*)<\/title>/)?.[1] || "";
  const tm = title.match(/^第 (\d{2}) 週 (.+)｜生成式AI 課後筆記$/);
  if (!tm) err("title", p, `<title> 要是「第 NN 週 主題｜生成式AI 課後筆記」，現在是「${title}」`);
  else if (tm[1] !== w) err("title", p, `<title> 的週次 ${tm[1]} 跟檔名 ${w} 不一樣`);

  const body = h.match(/<body\b[^>]*>/)?.[0] || "";
  const dw = body.match(/data-week="(\d+)"/)?.[1];
  const da = body.match(/data-accent="([a-z]+)"/)?.[1];
  if (dw !== w) err("data-week", p, `<body data-week> 要是 ${w}，現在是 ${dw ?? "沒寫"}`);
  if (da !== accentFor(w)) err("主色", p, `第 ${w} 週的 data-accent 要是 ${accentFor(w)}，現在是 ${da ?? "沒寫"}`);

  if (/\{\{[^}]*\}\}/.test(h)) err("範本", p, "還有沒換掉的 {{...}}");

  const order = [...h.matchAll(/<section id="([^"]+)">/g)].map((m) => m[1]);
  if (order.join(",") !== SECTIONS.join(",")) {
    err("區塊", p, `區塊順序要是 ${SECTIONS.join(" → ")}，現在是 ${order.join(" → ") || "沒有區塊"}`);
  }

  const one = h.match(/<p class="oneliner">([\s\S]*?)<\/p>/)?.[1];
  if (!one) err("一句話重點", p, "找不到 .oneliner");
  else if (charLen(textOf(one)) > 50) err("一句話重點", p, `一句話重點有 ${charLen(textOf(one))} 字，上限 50 字`);

  const concepts = (section(h, "concepts") || "").match(/class="concept"/g)?.length || 0;
  if (concepts < 3 || concepts > 5) err("核心概念", p, `核心概念要 3 到 5 個，現在是 ${concepts} 個`);

  const links = section(h, "links") || "";
  const earlier = weeks.slice(0, idx);
  if (earlier.length && !earlier.some((e) => links.includes(`week-${e}.html`))) {
    err("跟前幾週的關係", p, "至少要連到一篇前面的筆記");
  }

  const hasNotes = existsSync(join(ROOT, `sources/week-${w}/my-notes.md`));
  if (!hasNotes) {
    for (const id of ["mine", "homework", "questions"]) {
      const t = textOf((section(h, id) || "").replace(/<h2[\s\S]*?<\/h2>/, ""));
      if (t !== TODO_LINE) err("my-notes", p, `沒有 sources/week-${w}/my-notes.md，#${id} 只能放「${TODO_LINE}」`);
    }
  }

  const terms = [...(section(h, "terms") || "").matchAll(/href="\.\.\/glossary\.html#(term-[a-z0-9-]+)"/g)].map((m) => m[1]);
  if (!terms.length) err("本週名詞", p, "本週名詞要至少一個，並連到 glossary.html#term-xxx");

  const pager = h.match(/<nav class="pager"[\s\S]*?<\/nav>/)?.[0] || "";
  const prevLink = pager.match(/class="prev" href="([^"]+)"/)?.[1];
  const nextLink = pager.match(/class="next" href="([^"]+)"/)?.[1];
  if (prev && prevLink !== `week-${prev}.html`) err("前後週", p, `上一週要連到 week-${prev}.html`);
  if (!prev && prevLink) err("前後週", p, "這是第一篇，不能有上一週");
  if (next && nextLink !== `week-${next}.html`) err("前後週", p, `下一週要連到 week-${next}.html`);
  if (!next && nextLink) err("前後週", p, "這是最新一篇，不能有下一週");
}

// ---------- 首頁 ----------
if (html["index.html"]) {
  const p = "index.html";
  const h = html[p];
  const rows = [...h.matchAll(/<li class="week-row" data-accent="([a-z]+)">\s*<a href="notes\/week-(\d{2})\.html">/g)].map((m) => ({ accent: m[1], w: m[2] }));
  const rowWeeks = rows.map((r) => r.w);
  for (const w of weeks) if (!rowWeeks.includes(w)) err("首頁", p, `少了第 ${w} 週那一列`);
  if (rowWeeks.join() !== [...rowWeeks].sort().join()) err("首頁", p, "週次列表要由小到大排");
  for (const r of rows) if (r.accent !== accentFor(r.w)) err("主色", p, `第 ${r.w} 週那一列的 data-accent 要是 ${accentFor(r.w)}`);

  const statWeeks = h.match(/data-stat="weeks">(\d+)</)?.[1];
  const statTerms = h.match(/data-stat="terms">(\d+)</)?.[1];
  if (statWeeks !== String(weeks.length)) err("首頁統計", p, `週數要是 ${weeks.length}，現在寫 ${statWeeks ?? "沒寫"}`);
  const termCount = html["glossary.html"] ? (html["glossary.html"].match(/class="glossary-item"/g) || []).length : 0;
  if (statTerms !== String(termCount)) err("首頁統計", p, `名詞數要是 ${termCount}，現在寫 ${statTerms ?? "沒寫"}`);
}

// ---------- 名詞索引 ----------
if (html["glossary.html"]) {
  const p = "glossary.html";
  const h = html[p];
  const items = [...h.matchAll(/<div class="glossary-item" id="([^"]+)">([\s\S]*?)<\/div>/g)].map((m) => ({ id: m[1], body: m[2] }));
  const seen = new Set();
  const perWeek = {};
  for (const it of items) {
    if (!/^term-[a-z0-9-]+$/.test(it.id)) err("名詞 id", p, `${it.id} 要是 term- 加英文小寫和連字號`);
    if (seen.has(it.id)) err("名詞 id", p, `${it.id} 重複了`);
    seen.add(it.id);
    const def = it.body.match(/<dd>\s*<p>([\s\S]*?)<\/p>/)?.[1];
    if (!def) err("名詞定義", p, `${it.id} 找不到定義`);
    else if (charLen(textOf(def)) > 40) err("名詞定義", p, `${it.id} 的定義有 ${charLen(textOf(def))} 字，上限 40 字`);
    const from = it.body.match(/class="from"><a href="notes\/week-(\d{2})\.html#concepts">/)?.[1];
    if (!from) err("首次出現", p, `${it.id} 要連到 notes/week-NN.html#concepts`);
    else {
      if (!weeks.includes(from)) err("首次出現", p, `${it.id} 的首次出現是第 ${from} 週，但那一週的筆記不存在`);
      perWeek[from] = (perWeek[from] || 0) + 1;
      const used = html[`notes/week-${from}.html`] && (section(html[`notes/week-${from}.html`], "terms") || "").includes(`#${it.id}"`);
      if (weeks.includes(from) && !used) err("雙向連結", p, `${it.id} 首次出現在第 ${from} 週，但那一週的「本週名詞」沒有連到它`);
    }
  }
  const sorted = [...items.map((i) => i.id)].sort();
  if (items.map((i) => i.id).join() !== sorted.join()) err("名詞排序", p, "條目要照 id 的英文字母排序");
  for (const [w, n] of Object.entries(perWeek)) if (n > 6) err("收錄門檻", p, `第 ${w} 週收了 ${n} 個名詞，一週最多 6 個`);
}

// ---------- 輸出 ----------
let shown = messages;
if (onlyWeek) {
  const idx = weeks.indexOf(onlyWeek);
  if (idx === -1) {
    console.log(`找不到 notes/week-${onlyWeek}.html`);
    process.exit(1);
  }
  const scope = new Set([`notes/week-${onlyWeek}.html`, "index.html", "glossary.html"]);
  if (weeks[idx - 1]) scope.add(`notes/week-${weeks[idx - 1]}.html`);
  shown = messages.filter((m) => scope.has(m.file));
}

const errors = shown.filter((m) => m.level === "error");
const warnings = shown.filter((m) => m.level === "warning");
for (const m of [...errors, ...warnings]) {
  console.log(`${m.level === "error" ? "✗ error  " : "! warning"} [${m.rule}] ${m.file}  ${m.msg}`);
}
console.log(
  `\n檢查範圍：${onlyWeek ? `第 ${onlyWeek} 週相關檔案` : `全站 ${pages.length} 頁`}　` +
    `筆記 ${weeks.length} 週　error ${errors.length} 個　warning ${warnings.length} 個`
);
console.log(errors.length ? "還沒做完，請修正上面的 error。" : "通過。");
process.exit(errors.length ? 1 : 0);
