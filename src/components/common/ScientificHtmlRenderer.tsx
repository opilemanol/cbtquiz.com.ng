import React, { useMemo } from 'react';
import katex from 'katex';

interface ScientificHtmlRendererProps {
  content: string;
  className?: string;
}

/**
 * High-performance scientific & educational HTML/Markdown renderer.
 * Allows rich HTML formatting, scientific symbols (Greek letters, sub/superscripts, chemical equations,
 * math formulas via KaTeX or standard HTML, scientific tables, matrices, and callout boxes)
 * styled strictly in dominant white with green text and components.
 */
export const ScientificHtmlRenderer: React.FC<ScientificHtmlRendererProps> = ({
  content,
  className = '',
}) => {
  const processedHtml = useMemo(() => {
    if (!content) return '';

    let html = content;

    // Pre-process matrix bracket notation e.g. [ [3, 4], [2, 5] ] or [[1, 0], [0, 1]]
    html = html.replace(/\[\s*\[\s*([^\]]+?)\s*\]\s*,\s*\[\s*([^\]]+?)\s*\]\s*,\s*\[\s*([^\]]+?)\s*\]\s*\]/g, (_m, r1, r2, r3) => {
      const row1 = r1.split(',').map((c: string) => c.trim()).join(' & ');
      const row2 = r2.split(',').map((c: string) => c.trim()).join(' & ');
      const row3 = r3.split(',').map((c: string) => c.trim()).join(' & ');
      return `$\\begin{bmatrix} ${row1} \\\\ ${row2} \\\\ ${row3} \\end{bmatrix}$`;
    });
    html = html.replace(/\[\s*\[\s*([^\]]+?)\s*\]\s*,\s*\[\s*([^\]]+?)\s*\]\s*\]/g, (_m, r1, r2) => {
      const row1 = r1.split(',').map((c: string) => c.trim()).join(' & ');
      const row2 = r2.split(',').map((c: string) => c.trim()).join(' & ');
      return `$\\begin{bmatrix} ${row1} \\\\ ${row2} \\end{bmatrix}$`;
    });

    // Pre-process subscripts e.g. 27_{10}, 1002_3, T_9, a_n
    html = html.replace(/\b([a-zA-Z0-9]+)_\{([a-zA-Z0-9\-+]+)\}/g, '$$$1_{$2}$$');
    html = html.replace(/\b(\d+)_([0-9a-zA-Z]+)\b/g, '$$$1_{$2}$$');

    // 1. Process Display Math ($$...$$) first so inner characters aren't mangled
    html = html.replace(/\$\$([\s\S]+?)\$\$/g, (_match, mathExpr) => {
      try {
        const rendered = katex.renderToString(mathExpr.trim(), {
          displayMode: true,
          throwOnError: false,
          output: 'htmlAndMathml',
        });
        return `<div class="scientific-math-block my-5 p-4 bg-emerald-50/50 border border-emerald-200/80 rounded-2xl flex justify-center overflow-x-auto text-emerald-950 font-serif shadow-xs">${rendered}</div>`;
      } catch {
        return `<pre class="p-3 bg-emerald-50 rounded-lg text-emerald-900 font-mono text-xs overflow-x-auto">${mathExpr}</pre>`;
      }
    });

    // 2. Process Inline Math ($...$)
    html = html.replace(/\$([^\$\n\r]+?)\$/g, (_match, mathExpr) => {
      try {
        const rendered = katex.renderToString(mathExpr.trim(), {
          displayMode: false,
          throwOnError: false,
          output: 'htmlAndMathml',
        });
        return `<span class="scientific-math-inline mx-0.5 inline-block align-baseline font-serif text-emerald-950">${rendered}</span>`;
      } catch {
        return `<code class="px-1 py-0.5 bg-emerald-50 text-emerald-800 rounded font-mono text-xs">${mathExpr}</code>`;
      }
    });

    // 3. Process Markdown Tables if present
    html = html.replace(/((\|[^\n]+\|\r?\n)((?:\|[^\n]+\|\r?\n?)+))/g, (match) => {
      const rows = match.trim().split(/\r?\n/).filter(Boolean);
      if (rows.length < 2) return match;

      const headerRow = rows[0];
      const separatorRow = rows[1];

      // Check if second row is a table divider e.g. | :--- | :--- |
      if (!separatorRow.includes('---')) return match;

      const parseCells = (row: string) =>
        row
          .replace(/^\|/, '')
          .replace(/\|$/, '')
          .split('|')
          .map((c) => c.trim());

      const headers = parseCells(headerRow);
      const dataRows = rows.slice(2);

      let tableHtml = `<div class="overflow-x-auto my-6 rounded-2xl border border-emerald-200/80 shadow-xs">
        <table class="w-full text-left text-sm border-collapse bg-white">
          <thead class="bg-emerald-50/80 text-emerald-900 font-bold border-b-2 border-emerald-200">
            <tr>${headers.map((h) => `<th class="px-4 py-3 text-xs uppercase tracking-wider">${h}</th>`).join('')}</tr>
          </thead>
          <tbody class="divide-y divide-emerald-100">`;

      dataRows.forEach((r, idx) => {
        const cells = parseCells(r);
        const bg = idx % 2 === 0 ? 'bg-white' : 'bg-emerald-50/20';
        tableHtml += `<tr class="${bg} hover:bg-emerald-50/60 transition-colors">
          ${cells.map((c) => `<td class="px-4 py-3 text-slate-700 leading-relaxed">${c}</td>`).join('')}
        </tr>`;
      });

      tableHtml += `</tbody></table></div>`;
      return tableHtml;
    });

    // 4. Process Markdown Headers (#, ##, ###, ####) if they appear at line start
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-2xl sm:text-3xl font-extrabold text-emerald-950 mt-8 mb-4 tracking-tight border-b border-emerald-100 pb-2">$1</h1>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-xl sm:text-2xl font-bold text-emerald-900 mt-6 mb-3 tracking-tight flex items-center gap-2">$1</h2>');
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-lg sm:text-xl font-bold text-emerald-800 mt-5 mb-2">$1</h3>');
    html = html.replace(/^#### (.*$)/gim, '<h4 class="text-base font-semibold text-emerald-800 mt-4 mb-2">$1</h4>');

    // 5. Blockquotes (> ...)
    html = html.replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-emerald-600 pl-4 py-2 my-4 italic text-emerald-900 bg-emerald-50/60 rounded-r-xl">$1</blockquote>');

    // 6. Horizontal Rules (---)
    html = html.replace(/^---$/gim, '<hr class="my-6 border-emerald-100" />');

    // 7. Bold & Italic markdown
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-emerald-950">$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em class="italic text-slate-800">$1</em>');

    // 8. Convert bullet points (- item or * item)
    html = html.replace(/(?:^|\n)[-*]\s+(.*)(?=(?:\n[-*]\s+.*)*)/g, (match) => {
      const items = match
        .trim()
        .split(/\n[-*]\s+/)
        .map((s) => s.replace(/^[-*]\s+/, '').trim())
        .filter(Boolean);
      return `<ul class="list-none space-y-2 my-3 pl-1">${items
        .map(
          (it) => `<li class="flex items-start gap-2.5 text-sm text-slate-700 leading-relaxed">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0"></span>
            <div>${it}</div>
          </li>`
        )
        .join('')}</ul>`;
    });

    // 9. Standard paragraphs for remaining plain lines (separated by empty lines), but leave existing HTML block tags intact
    const blocks = html.split(/\n\s*\n/);
    const finalizedBlocks = blocks.map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return '';
      // If it already starts with an HTML block element, return as is
      if (
        /^<(div|table|ul|ol|h1|h2|h3|h4|h5|h6|blockquote|hr|pre|details|section|article|p)/i.test(
          trimmed
        )
      ) {
        return trimmed;
      }
      return `<p class="text-sm sm:text-base text-slate-700 leading-relaxed my-3">${trimmed}</p>`;
    });

    return finalizedBlocks.filter(Boolean).join('\n');
  }, [content]);

  return (
    <div
      className={`scientific-content prose max-w-none text-slate-700 leading-relaxed ${className}`}
      dangerouslySetInnerHTML={{ __html: processedHtml }}
    />
  );
};
