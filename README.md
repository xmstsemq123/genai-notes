# 生成式AI 課後筆記

每上完一週「生成式AI」，我把講義和自己的想法整理成一頁筆記。這是第 09 週「換你當老闆」的作業：寫一份 AGENTS.md，讓 AI 讀完就能照同一套規則繼續做新的一週。

- 網站：https://xmstsemq123.github.io/genai-notes/
- 規則：[AGENTS.md](AGENTS.md)
- 跟 AI 討論規則的紀錄：[docs/ai-discussion.md](docs/ai-discussion.md)

## 新增一週

1. 把講義放到 `sources/week-NN/slides.pdf`，自己的筆記寫在 `sources/week-NN/my-notes.md`。
2. 開一個 AI 對話（Claude Code、Codex 都可以），說：

   ```
   請先讀 AGENTS.md，瞭解這個專案的內容。然後幫我做第 NN 週的筆記。
   ```

3. AI 會照 AGENTS.md 的步驟做完，最後跑檢查並回報。我再讀過內容。

## 檢查

```
node scripts/check.mjs            # 全站
node scripts/check.mjs --week 10  # 只看第 10 週
```

不需要安裝任何套件，只要 Node 18 以上。抽講義文字要 Python 和 `pip install pdfplumber`。

## 本機預覽

直接用瀏覽器打開 `index.html` 就可以看。

## 關於講義

講義是老師的著作，`sources/*/slides.pdf` 和 `slides.txt` 都在 `.gitignore` 裡，不會上傳。上傳的只有我自己寫的 `my-notes.md`。
