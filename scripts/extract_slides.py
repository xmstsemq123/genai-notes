"""把 sources/week-NN/slides.pdf 的文字抽成 sources/week-NN/slides.txt

用法：python scripts/extract_slides.py 10
需要：pip install pdfplumber
每一頁前面會加「---- page N」，寫筆記標出處時用這個頁碼。
康熙部首字會自動換回一般的字（見 AGENTS.md 第 12 節）。
"""
import sys
import unicodedata
from pathlib import Path

import pdfplumber

ROOT = Path(__file__).resolve().parent.parent


def fix_radicals(text: str) -> str:
    """PDF 常把字存成康熙部首（例如 ⽅ U+2F45），看起來一樣但搜尋不到。
    只對部首區段做 NFKC，全形標點維持不動。"""
    return "".join(
        unicodedata.normalize("NFKC", ch) if 0x2E80 <= ord(ch) <= 0x2FDF else ch
        for ch in text
    )


def main() -> None:
    if len(sys.argv) != 2 or not sys.argv[1].isdigit():
        sys.exit("用法：python scripts/extract_slides.py <週次>，例如 10")
    week = sys.argv[1].zfill(2)
    folder = ROOT / "sources" / f"week-{week}"
    pdf = folder / "slides.pdf"
    if not pdf.exists():
        sys.exit(f"找不到 {pdf.relative_to(ROOT)}，請先把講義放進去")
    out = folder / "slides.txt"
    with pdfplumber.open(pdf) as doc, out.open("w", encoding="utf-8") as f:
        for i, page in enumerate(doc.pages, start=1):
            f.write(f"---- page {i}\n{fix_radicals(page.extract_text() or '')}\n")
        total = len(doc.pages)
    print(f"完成：{out.relative_to(ROOT)}，共 {total} 頁")


if __name__ == "__main__":
    main()
