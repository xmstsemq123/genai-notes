# AGENTS.md：生成式AI 課後筆記站

這份是這個專案的員工手冊。不管是 Claude Code、Codex 還是其他 AI，開始動手前請先讀完這份。規則沒寫到的情況，照「不確定時怎麼辦」處理，不要自己猜。

## 1. 專案目的

- 這是我修「生成式AI」這門課的課後筆記站，每上一週課就多一頁筆記，部署在 GitHub Pages。
- 讀者是「一個月後忘記上課內容的我自己」，其次是同學跟老師。所以筆記要能讓我快速想起這週在講什麼、我做了什麼作業、我當時哪裡不懂。
- 用純 HTML + CSS，不用框架也不用建置工具。GitHub Pages 直接就能跑，AI 改起來也比較不會出錯。
- 最重要的一件事：之後我只要把講義跟我自己的筆記丟進 `sources/week-NN/`，說一句「幫我做第 NN 週的筆記」，AI 就能照這份文件做出一頁風格一樣的筆記。

## 2. 資料夾結構

```
genai-notes/
├── AGENTS.md                 這份規則（所有 AI 都讀這份）
├── CLAUDE.md                 只有一行，叫 Claude 讀 AGENTS.md
├── README.md                 給人看的專案介紹
├── index.html                首頁，列出每一週的筆記
├── glossary.html             名詞索引，所有週的名詞都在這裡
├── about.html                這個站怎麼做的（給老師跟同學看）
├── .nojekyll                 空檔案，叫 GitHub Pages 不要用 Jekyll
├── assets/
│   ├── css/site.css          唯一的樣式檔
│   ├── js/site.js            唯一的 JS 檔
│   ├── favicon.svg
│   └── img/week-NN/          每週的圖片（有才建）
├── notes/
│   └── week-NN.html          每週一頁筆記
├── templates/
│   ├── note-template.html    新筆記一律從這裡複製
│   └── my-notes-template.md  我寫 my-notes.md 用的範本
├── sources/
│   └── week-NN/
│       ├── slides.pdf        講義（不上傳 GitHub）
│       ├── slides.txt        從講義抽出的文字（不上傳 GitHub）
│       └── my-notes.md       我自己寫的筆記（會上傳）
├── docs/
│   └── ai-discussion.md      跟 AI 討論這份規則的紀錄
└── scripts/
    ├── check.mjs             完成標準的自動檢查
    └── extract_slides.py     把講義 PDF 轉成 slides.txt
```

### 哪些可以動、哪些不能動

| 檔案 | AI 可以做的事 |
|---|---|
| `notes/week-NN.html` | 新增、修改 |
| `index.html`、`glossary.html` | 照第 5、6 節的格式新增條目 |
| 上一週的 `notes/week-NN.html` | 只能改最下面 `.pager` 的「下一週」連結 |
| `sources/week-NN/slides.txt` | 用 `extract_slides.py` 產生 |
| `sources/*/my-notes.md` | **不能改**，這是我寫的 |
| `assets/css/site.css`、`assets/js/site.js` | **不能改**，要改先問我 |
| `templates/note-template.html` | **不能改**，要改先問我 |
| `scripts/check.mjs` | **不能改**，見第 9 節 |
| `AGENTS.md` | 不能自己改。覺得規則有問題，寫在回報裡由我決定 |

### 檔名規則

- 筆記檔名只放週次：`notes/week-06.html`、`notes/week-10.html`。週次一律兩位數補零。
- 不放主題、不用中文、不用空格。主題寫在頁面標題裡就好。
- 圖片放 `assets/img/week-NN/`，檔名用英文小寫加連字號，例如 `harness-diagram.png`。
- 所有連結都用相對路徑（`../assets/css/site.css`），不能用 `/` 開頭。GitHub Pages 的網址是 `帳號.github.io/repo名稱/`，用 `/` 開頭會指錯地方。

## 3. 最常用的指令：「幫我做第 NN 週的筆記」

收到這句話時，照下面的步驟做。這就是一份已經講清楚的交辦。

### 要交出什麼（成品）

1. 新的 `notes/week-NN.html`
2. `index.html` 的週次列表多一列
3. 上一週筆記的 `.pager` 接上「下一週」
4. `glossary.html` 加上這週的新名詞
5. 一份照第 9 節格式寫的回報

### 步驟

1. **確認材料**：看 `sources/week-NN/` 裡有沒有 `slides.pdf` 或 `slides.txt`，還有 `my-notes.md`。my-notes.md 的格式見第 4 節最後。
   - 沒有講義：停下來問我，什麼都不要做。
   - 只有 PDF 沒有 txt：先跑 `python scripts/extract_slides.py NN`。腳本會把 PDF 常見的康熙部首字（例如 `⽅`）換回一般的字。
   - 沒有 `my-notes.md`：照樣做，但「我的理解」「這週的作業」「還沒搞懂的」三個區塊只能放 TODO（見第 4 節）。
2. **讀材料**：讀完 `slides.txt` 跟 `my-notes.md`。
3. **讀範例**：讀 `notes/week-06.html`，這是標準範例。區塊長度、語氣、標記方式都照它。再讀上一週的筆記，寫「跟前幾週的關係」會用到。
4. **建檔**：把 `templates/note-template.html` 複製成 `notes/week-NN.html`，把所有 `{{...}}` 換掉，HTML 註解裡的說明可以刪掉。
5. **名詞**：照第 6 節把這週的名詞加進 `glossary.html`。
6. **首頁跟導覽**：照第 5 節在 `index.html` 加一列，再把上一週的 `.pager` 接到這週。
7. **檢查**：跑 `node scripts/check.mjs --week NN`，有 error 就改頁面，改到 0 個 error 為止。
8. **回報**：照第 9 節格式回報。

### 有什麼限制

- 講義整理的內容只能根據 `slides.txt`。講義沒寫的事不要補，就算你很確定也不要。
- 「我的理解」「這週的作業」「還沒搞懂的」只能根據 `my-notes.md` 改寫成通順的句子，不能加入 my-notes.md 沒有的想法。數字照抄。
- 不准幫我回答「還沒搞懂的」裡面的問題。
- 不新增 CSS class、不寫 `style=""`、不加 `<style>`、不加 `<script>`。
- 外部網址只允許 `fonts.googleapis.com`、`fonts.gstatic.com`、`github.com`（只用來連到這個專案的 repo），還有講義上出現過的網址（只能放在「出處」）。

## 4. 每頁筆記的結構

區塊順序固定，id 也固定，`check.mjs` 會檢查。

| 順序 | id | 標題 | 內容 | 來源 |
|---|---|---|---|---|
| 01 | `summary` | 一句話重點 | `.oneliner`，50 字以內 | 講義 |
| 02 | `why` | 這週在解決什麼 | 1 到 2 段，沒有這週的東西之前會遇到什麼麻煩 | 講義 |
| 03 | `concepts` | 核心概念 | 3 到 5 個 `.concept`，每個都要有白話解釋和一個例子。後面可以再加補充，規定見下面「核心概念的補充」 | 講義 |
| 04 | `links` | 跟前幾週的關係 | 至少連到一篇前面的筆記，講這週補上了前面哪個缺口 | 講義 + 舊筆記 |
| 05 | `mine` | 我的理解 | 1 到 3 個 `.mine` 區塊 | **只能來自 my-notes.md** |
| 06 | `homework` | 這週的作業 | 一個 `.homework` | **只能來自 my-notes.md** |
| 07 | `questions` | 還沒搞懂的 | `ol.questions` | **只能來自 my-notes.md** |
| 08 | `terms` | 本週名詞 | `ul.term-list`，每個都連到 `glossary.html#term-xxx` | glossary |
| 09 | `sources` | 出處 | 講義名稱 + 頁碼 | 講義 |

缺 my-notes.md 時，05 到 07 各放一行 `TODO：等我補 my-notes.md`，不准自己寫內容。

### 核心概念的補充

`.concept` 後面可以加這些，每一種最多一個，全部都是選用：

- `.formula`：講義上有公式或等式的時候用（例如第 06 週的 VRAM 估算）
- `ol.flow`：講義上有 3 到 6 步的流程（例如第 07 週的 RAG 流程）
- `.table-wrap > table`：講義上有兩欄以上的對照
- `h3` 補充小節：最多 2 個，放講義上有、但不夠格當核心概念的內容（例如程式碼、延伸話題）

公式或流程裡的小字說明也要出自講義。講義沒解釋的地方，小字就省略，不要自己推。

### 頁首資訊

- `<title>` 固定格式：`第 NN 週 主題｜生成式AI 課後筆記`，主題用 my-notes.md 開頭的「主題」。
- `<h1>` 用講義第一頁的標題。第一頁沒有字的話，用 my-notes.md 開頭的「主題」。
- `.note-meta` 放講義原始檔名（my-notes.md 開頭的「講義」）、總頁數、作業名稱（my-notes.md 開頭的「作業」）。

### my-notes.md 的格式

這是我寫的檔案，範本在 `templates/my-notes-template.md`。開頭三行固定，AI 頁首資訊就照這三行填，不要用猜的：

```markdown
# 第 NN 週 我的筆記

- 主題：讓 AI 看懂你的世界
- 講義：07讓AI看懂你的世界
- 作業：HW07 八戒說西遊

## 上課時的想法        → 改寫成 #mine
## 作業做了什麼        → 改寫成 #homework
## 還不懂的            → 照列在 #questions
```

開頭三行缺了哪一行，就在回報的「需要你確認」寫出來。

### 每週主色

每週有一個自己的主色，像書的每一章用一種燙金色。寫在 `<body data-accent="...">`，首頁那一列也用同一個。照週次輪流：

| 週次 | 06 | 07 | 08 | 09 | 10 | 11 | 12 | 13 |
|---|---|---|---|---|---|---|---|---|
| data-accent | teal | sienna | olive | plum | indigo | ochre | brick | slate |

第 14 週之後從 teal 重新開始（週次減 6 再除以 8 取餘數）。

## 5. 首頁的格式

`index.html` 的 `ol.week-list` 裡每週一列，照週次由小到大排：

```html
<li class="week-row" data-accent="plum">
  <a href="notes/week-09.html">
    <span class="week-num">09</span>
    <div>
      <h3>換你當老闆</h3>
      <p>一句話重點，跟筆記頁的 .oneliner 一樣</p>
    </div>
    <div class="week-tags"><span class="tag">AGENTS.md</span><span class="tag">Harness</span></div>
  </a>
</li>
```

- `h3` 用簡短主題，不用講義的完整標題。
- `.week-tags` 放 2 到 3 個這週的名詞。
- 首頁上方的統計數字（幾週、幾個名詞）也要跟著更新。

## 6. 名詞索引的規則

名詞索引是讓這個站越做越像一本書的地方，所以規則比較嚴。

- **收錄門檻**：只收這週「核心概念」裡出現的名詞，一週最多新增 6 個。連到已經存在的名詞不算名額。名額不夠時，優先收 `.concept` 的 `dt` 本身，其他的列在回報裡讓我決定。
- **唯一 id**：id 用 `term-` 加英文小寫和連字號，例如 `term-rag`、`term-harness`。中文名詞也要給英文 id，例如幻覺是 `term-hallucination`。
- **先搜尋再新增**：新增前先用名稱和別名在 `glossary.html` 裡搜尋。已經有了就不要再新增，筆記頁直接連過去。
- **定義凍結**：定義一句話、40 字以內，寫進去就不改。之後的週次有新的理解，在下面加一行 `<p class="more">第 NN 週補充：...</p>`。真的覺得定義錯了，寫在回報裡由我決定。
- **排序**：照 id 的英文字母排序。
- **雙向連結**：條目的「首次出現」連回那一週的 `#concepts`，那一週的「本週名詞」連到條目。

格式：

```html
<div class="glossary-item" id="term-rag">
  <dt>RAG<small>檢索增強生成 · Retrieval-Augmented Generation</small></dt>
  <dd>
    <p>先從外部資料找出相關的段落，再跟問題一起交給模型回答。</p>
  </dd>
  <dd class="from"><a href="notes/week-07.html#concepts">第 07 週</a></dd>
</div>
```

### 譯名表

每週翻譯不一樣是定義亂掉最常見的原因，所以固定下來：

| 保留英文 | 一律用中文 |
|---|---|
| AI Agent、Harness、RAG、Embedding、Prompt、System Prompt | 幻覺（hallucination） |
| Reflection、Tool Use、Planning、Multiagent Collaboration | 量化（quantization） |
| MCP、A2A、CoT、MoE、KV-Cache、CAG | 向量資料庫（vector database） |
| Vibe Coding、LLM Wiki、Skills、AGENTS.md、CLAUDE.md | 文字塊（chunk）、重排序（reranking） |
| VRAM、API | 對比學習、短期記憶、長期記憶、設計模式 |
|  | 代理式 AI（Agentic AI）、沙盒（sandbox）、專案資料夾 |

表上沒有的新名詞，第一次出現時寫「中文（English）」，並在回報裡列出來讓我決定要不要加進表。

## 7. 設計規則

- 顏色、字體、間距只能用 `site.css` 裡的 CSS 變數和現有的 class。頁面裡不准出現色碼。
- 全站只有一支 `assets/js/site.js`，負責深色模式切換和筆記頁目錄的段落標示。每頁只能用 template 裡那一行 `<script>` 引入它。
- 深色模式是 CSS 跟著系統設定做的，JS 只負責手動切換。所以頁面在 JS 沒載入時也要能正常看。
- 字型的 `<link>` 固定在 template，只載入 Noto Serif TC 的 700 和 900。內文用系統字。
- 不用 emoji，不用 icon 圖庫。
- 只能用 `site.css` 裡已經有的 class，不要自己發明新的。各個 class 的用法可以參考 `notes/week-06.html`（標準範例）和第 4 節。

## 8. 寫作規則

讀者是一個月後的我。寫的時候想像在跟忘記上課內容的自己講話。

### 硬性規定（check.mjs 會擋）

- 不用破折號（`—`、`──`）和分號（`；`、`;`）。
- 不用 emoji。
- 這些詞不要用：賦能、至關重要、無縫、革命性、深入探討、扮演關鍵角色、旨在、全面提升、值得注意的是、總而言之、綜上所述、一言以蔽之、讓我們一起。

### 寫作習慣

- 不用「不是 A，而是 B」這種先否定再翻轉的句子，直接講 B。
- 不硬湊三個一組的排比。段落結尾不加一句金句總結。
- 每個說法盡量配一個具體例子，例子優先用講義上的。
- 粗體一段最多一處。要解釋因果的地方寫成段落，不要拆成條列。
- 講義整理的區塊用中性的陳述句，「我」只出現在「我的理解」「這週的作業」「還沒搞懂的」。
- 中文用全形標點和「」引號，中英文之間加一個半形空格。
- 不誇大，不寫「完美解決」「徹底改變」。

### 好壞對照

要寫成第二種：

> ✗ 在當今 AI 快速發展的時代，RAG 扮演著至關重要的角色。它不僅能提升回答的準確性，更能無縫整合外部知識，為使用者帶來全新的體驗。
>
> ✓ RAG 就是先幫模型把資料找好，再跟問題一起放進 prompt。老師的例子是問「圖書館星期日幾點關門」，系統先找到「本館週日開放至下午五點」這段，模型就不用靠記憶亂猜。

## 9. 怎麼算做完

### check.mjs 會檢查的（跑過才算做完）

```
node scripts/check.mjs            # 檢查全站
node scripts/check.mjs --week 10  # 只檢查第 10 週相關的檔案
```

- 檔名、`<title>` 格式、`data-week`、`data-accent` 對不對
- 九個區塊的 id 都在而且順序對
- 一句話重點 50 字以內，核心概念 3 到 5 個
- 沒有 `style=""`、`<style>`、多餘的 `<script>`，外部網址在白名單內，沒有 `/` 開頭的路徑
- 所有站內連結和 `#錨點` 都找得到，圖片有 `alt`
- 首頁每一週都有一列，前後週的 `.pager` 有接上
- 名詞索引 id 不重複、有照字母排序、「首次出現」的週次存在
- 沒有 my-notes.md 的週，05 到 07 區塊只有 TODO
- 第 8 節的禁用字元和禁用詞（`<code>`、`<pre>` 裡面不算）

error 會讓腳本用非 0 的 exit code 結束，warning 只會列出來。

**不准為了讓檢查通過去改 check.mjs。** 檢查沒過就改頁面。如果覺得是檢查本身寫錯，在回報裡說明，由我決定。

### 只能我自己看的

- 內容有沒有忠於講義、有沒有講錯
- 「我的理解」有沒有被加油添醋
- 例子好不好、「跟前幾週的關係」講不講得通
- 深色模式看起來舒不舒服

所以回報裡要把這些需要我看的地方列出來。

### 回報格式

做完用這個格式回報，不要寫成長篇大論：

```
## 第 NN 週筆記完成

新增：notes/week-NN.html
修改：index.html、glossary.html、notes/week-(NN-1).html

新增名詞：term-xxx、term-yyy
沒新增（已存在）：term-zzz
不在譯名表的新名詞：...

TODO：（沒有就寫「無」）
需要你確認：（講義看不清楚、不確定有沒有理解對的地方，附頁碼）

check.mjs 輸出：
（貼上最後一次的完整輸出）
```

## 10. 不確定時怎麼辦

- 講義某頁看不懂或抽出來的文字是亂碼：那一段先跳過，在回報的「需要你確認」寫頁碼。不要猜。
- 不知道某個名詞要不要收進索引：先不收，在回報裡列出來。
- 規則之間互相衝突，或規則沒寫到：選比較保守的做法（少做、不刪東西），在回報裡說明。
- 任何要刪檔、改 `site.css`、改 template、改這份 AGENTS.md 的事：先問我。

## 11. 其他常見的交辦

- **「第 NN 週的我的理解更新了」**：我改了 my-notes.md，只重寫那一週的 05 到 07 區塊，其他不動。
- **「加一個名詞 XXX」**：照第 6 節加進 `glossary.html`，再加到首次出現那一週的「本週名詞」。
- **「改一下首頁 / 樣式」**：先說你打算怎麼改、會動到哪些檔案，等我說好再動手。

## 12. 規則修改紀錄

規則是一邊用一邊改的。每次發現 AI 做錯或卡住，代表規則沒寫清楚，就補在這裡。

| 日期 | 發現的問題 | 改了什麼 |
|---|---|---|
| 2026-11-12 | 開新對話測試做第 08 週。AGENTS.md 說核心概念「可以再加一個 .formula、ol.flow 或比較表」，template 註解卻寫「最多各一個」，h3 小節也沒規定 | 新增「核心概念的補充」，每種最多一個，h3 最多 2 個，小字說明也要出自講義 |
| 2026-11-12 | 同一次測試。講義放進 sources 後改名成 slides.pdf，AI 只能從前幾週猜原始檔名和作業名稱 | my-notes.md 開頭固定寫主題、講義、作業三行，加了 `templates/my-notes-template.md` |
| 2026-11-12 | 同一次測試。PDF 抽出來的字有康熙部首字（`⽅`），AI 要自己一個一個換 | `extract_slides.py` 自動把康熙部首字換回一般的字 |
| 2026-11-12 | 同一次測試。AI 不確定連到已存在的名詞算不算名額，名額不夠時也不知道該留哪幾個 | 收錄門檻寫清楚：連到舊名詞不算名額，優先收 `.concept` 的標題 |
| 2026-11-12 | 規則改完後再開新對話做第 09 週。第 6 節要用 `<p class="more">` 寫週次補充，但 `site.css` 沒有這個 class，AI 只好不寫 | `site.css` 加上 `.more`，名詞索引的 LLM Wiki 和 MCP 各放一則補充當範例 |
| 2026-11-12 | 同一次測試。第 7 節說「week-06 沒用過的 class 不要用」，跟第 4 節允許比較表互相衝突 | 第 7 節改成「只能用 site.css 裡已經有的 class」 |
| 2026-11-12 | 同一次測試。MCP 在第 08、09 週都出現，AI 不知道首次出現算哪一週，所以沒收 | 我決定算第 08 週並補上條目。譯名表加了代理式 AI、沙盒、專案資料夾 |
