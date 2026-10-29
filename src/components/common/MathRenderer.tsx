import React, { useEffect, useRef } from 'react';
import katex from 'katex';

interface MathRendererProps {
  content: string;
  className?: string;
  displayMode?: boolean;
}

/**
 * Robustly pre-processes plain mathematical text containing logarithms, matrices,
 * subscripts, superscripts, integrals, and formatting into KaTeX-compatible LaTeX syntax ($...$ or $$...$$).
 */
export function preprocessMathText(input: string): string {
  if (!input) return '';
  let str = input;

  // 0. Normalize common math notation variants
  str = str.replace(/sqrt\s*\(([^)]+)\)/gi, '\\sqrt{$1}');
  str = str.replace(/√\s*([a-zA-Z0-9]+|\([^)]+\))/g, '\\sqrt{$1}');

  // 1. Matrix determinants: e.g. | 5  -3 |\n| 4   2 | or | 5 -3 | | 4 2 |
  str = str.replace(
    /\|\s*(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s*\|\s*(?:\||\s+)\s*\|\s*(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s*\|/g,
    (_m, a, b, c, d) => `$\\begin{vmatrix} ${a} & ${b} \\\\ ${c} & ${d} \\end{vmatrix}$`
  );

  str = str.replace(
    /\|\s*([a-zA-Z0-9+\-]+)\s+([a-zA-Z0-9+\-]+)\s*\|\s*(?:\||\s+)\s*\|\s*([a-zA-Z0-9+\-]+)\s+([a-zA-Z0-9+\-]+)\s*\|/g,
    (_m, a, b, c, d) => `$\\begin{vmatrix} ${a} & ${b} \\\\ ${c} & ${d} \\end{vmatrix}$`
  );

  // 2. Bracket matrix notation: [[4, -2], [3, 5]]
  str = str.replace(/\[\s*\[\s*([^\]]+?)\s*\]\s*,\s*\[\s*([^\]]+?)\s*\]\s*\]/g, (_m, r1, r2) => {
    const row1 = r1.split(',').map((c: string) => c.trim()).join(' & ');
    const row2 = r2.split(',').map((c: string) => c.trim()).join(' & ');
    return `$\\begin{bmatrix} ${row1} \\\\ ${row2} \\end{bmatrix}$`;
  });

  // 3. Integrals: e.g. ∫₀^3 (4x) dx or ∫_0^2 (42x) dx or \int_0^2 or ∫ (from 0 to 2)
  str = str.replace(/\\int\s*(?:_\{([^}]+)\}|\_([0-9a-zA-Z]+))?\s*(?:\^\{([^}]+)\}|\^([0-9a-zA-Z]+))?\s*(\([^\)]+\)|[^\s]+)\s*d([a-zA-Z])/gi, (_m, b1, b2, t1, t2, f, v) => {
    const lower = b1 || b2 || '';
    const upper = t1 || t2 || '';
    const limits = lower || upper ? `_{${lower}}^{${upper}}` : '';
    return `$\\int${limits} ${f}\\,d${v}$`;
  });

  str = str.replace(/∫\s*\(from\s+([^\s]+)\s+to\s+([^\)]+)\)\s*(\([^\)]+\)|[^\s]+)\s*d([a-zA-Z])/gi, (_m, from, to, f, v) => {
    return `$\\int_{${from}}^{${to}} ${f}\\,d${v}$`;
  });

  str = str.replace(/∫\s*(?:_(\d+)|([₀-₉]+))?\s*(?:\^(\d+)|([⁰-⁹]+))?\s*(\([^\)]+\)|[^\s]+)\s*d([a-zA-Z])/g, (_m, b1, b2, t1, t2, f, v) => {
    const subDigitMap: Record<string, string> = { '₀':'0','₁':'1','₂':'2','₃':'3','₄':'4','₅':'5','₆':'6','₇':'7','₈':'8','₉':'9' };
    const supDigitMap: Record<string, string> = { '⁰':'0','¹':'1','²':'2','³':'3','⁴':'4','⁵':'5','⁶':'6','⁷':'7','⁸':'8','⁹':'9' };
    const lower = b1 || (b2 ? b2.split('').map((c: string) => subDigitMap[c] || c).join('') : '');
    const upper = t1 || (t2 ? t2.split('').map((c: string) => supDigitMap[c] || c).join('') : '');
    const limits = lower || upper ? `_{${lower}}^{${upper}}` : '';
    return `$\\int${limits} ${f}\\,d${v}$`;
  });

  // 4. Exponential equations and formulas: e.g. 3^(x - 3) = 27, 3^(2x - 1) = 81
  str = str.replace(/(\b\d+[a-zA-Z]?)\^\(([^)]+)\)\s*=\s*(\d+)/g, (_m, base, exp, res) => {
    return `$${base}^{${exp}} = ${res}$`;
  });
  str = str.replace(/(\b\d+[a-zA-Z]?)\^\(([^)]+)\)/g, (_m, base, exp) => {
    return `$${base}^{${exp}}$`;
  });

  // 5. Logarithms: handles log₁₀(91), log_1_0(91), log_10(91), log_{10}(91), log_2(8), log10 18, log(91)
  const subMap: Record<string, string> = {
    '₀':'0', '₁':'1', '₂':'2', '₃':'3', '₄':'4',
    '₅':'5', '₆':'6', '₇':'7', '₈':'8', '₉':'9',
  };

  str = str.replace(
    /(?<!\\)\blog(?:_([0-9a-zA-Z_\-]+)|([₁-₉₀]+))?(?:_\{([^}]+)\})?\s*(?:\(([^)]+)\)|([0-9a-zA-Z\.]+))/g,
    (_m, bUnder, bUni, bBrace, argParen, argRaw) => {
      let base = bBrace || bUnder || (bUni ? bUni.split('').map((c: string) => subMap[c] || c).join('') : '10');
      base = (base || '10').replace(/_/g, '').trim();
      if (base === '1_0' || base === '1_00' || base === '1' || !base) {
        base = '10';
      }

      if (argParen) {
        return `$\\log_{${base}}(${argParen})$`;
      }

      const cleanArg = (argRaw || '').replace(/[\.,\?:;]+$/, '');
      const trailingPunct = (argRaw || '').slice(cleanArg.length);
      return `$\\log_{${base}} ${cleanArg}$${trailingPunct}`;
    }
  );

  str = str.replace(/(?<!\\)\blog10\s*\(([^)]+)\)/g, '$\\log_{10}($1)$');
  str = str.replace(/\bln\s*\(([^)]+)\)/g, '$\\ln($1)$');
  str = str.replace(/\blg\s*\(([^)]+)\)/g, '$\\lg($1)$');

  // Merge adjacent inline math separated only by operators (+, -, =, /, *, ÷, ×) into a unified equation
  str = str.replace(/\$\s*([+\-=\/×*÷])\s*\$/g, ' $1 ');

  // 6. Protect all established $...$ math blocks before generic subscript and power replacements
  const mathTokens: string[] = [];
  str = str.replace(/\$\$([\s\S]+?)\$\$|\$([^\$\n]+?)\$/g, (m) => {
    const token = `⟦MATH_TOKEN_${mathTokens.length}⟧`;
    mathTokens.push(m);
    return token;
  });

  // 7. Number base subscripts: e.g. 27_{10}, 1002_3, 222_3
  str = str.replace(/(\b\d+)_(?:\{([0-9a-zA-Z]+)\}|([0-9a-zA-Z]+))/g, (_m, num, b1, b2) => {
    return `$${num}_{${b1 || b2}}$`;
  });

  // 8. General powers: e.g. 2x^2, 3x^2, x^4
  str = str.replace(/\b([a-zA-Z0-9]+)\^([0-9a-zA-Z]+)\b/g, (_m, v, p) => {
    return `$${v}^{${p}}$`;
  });

  // 9. Markdown formatting for emphasis, underlined keywords (e.g. *frugal*, **word**)
  str = str.replace(
    /\*\*([^*]+)\*\*/g,
    '<strong class="font-bold underline decoration-2 underline-offset-2 decoration-emerald-700 text-emerald-950">$1</strong>'
  );
  str = str.replace(
    /__([^_]+)__/g,
    '<u class="underline decoration-2 underline-offset-4 decoration-emerald-700 font-bold">$1</u>'
  );
  str = str.replace(
    /\*([^*\n]+)\*/g,
    '<span class="underline decoration-2 underline-offset-4 decoration-emerald-700 font-bold text-emerald-950">$1</span>'
  );

  // 10. Restore protected math tokens
  mathTokens.forEach((orig, idx) => {
    str = str.replace(`⟦MATH_TOKEN_${idx}⟧`, () => orig);
  });

  return str;
}

export const MathRenderer: React.FC<MathRendererProps> = ({
  content,
  className = '',
  displayMode = false,
}) => {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    if (!content) {
      containerRef.current.innerHTML = '';
      return;
    }

    // Pre-process string to handle standard math syntax (subscripts, superscripts, logarithms, integrals, matrices)
    const preprocessed = preprocessMathText(content);

    // Clear previous contents
    containerRef.current.innerHTML = '';

    // Parse inline ($...$) and block ($$...$$) delimiters
    const segments: Array<{ type: 'text' | 'math' | 'displayMath'; content: string }> = [];
    const mathRegex = /\$\$([\s\S]+?)\$\$|\$([^\$\n]+?)\$/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = mathRegex.exec(preprocessed)) !== null) {
      if (match.index > lastIndex) {
        segments.push({
          type: 'text',
          content: preprocessed.substring(lastIndex, match.index),
        });
      }

      if (match[1] !== undefined) {
        segments.push({ type: 'displayMath', content: match[1] });
      } else if (match[2] !== undefined) {
        segments.push({ type: 'math', content: match[2] });
      }

      lastIndex = mathRegex.lastIndex;
    }

    if (lastIndex < preprocessed.length) {
      segments.push({
        type: 'text',
        content: preprocessed.substring(lastIndex),
      });
    }

    // Render each segment into the ref element using katex.render or innerHTML
    segments.forEach((seg) => {
      if (seg.type === 'math' || seg.type === 'displayMath') {
        const mathSpan = document.createElement('span');
        mathSpan.className =
          seg.type === 'displayMath' || displayMode
            ? 'block my-2 text-center'
            : 'inline-block mx-0.5 align-baseline font-serif';
        try {
          const cleanTeX = seg.content.trim();
          katex.render(cleanTeX, mathSpan, {
            displayMode: seg.type === 'displayMath' || displayMode,
            throwOnError: false,
            output: 'htmlAndMathml',
          });
        } catch {
          mathSpan.textContent = seg.content;
        }
        containerRef.current?.appendChild(mathSpan);
      } else {
        const textSpan = document.createElement('span');
        if (seg.content.includes('<') && seg.content.includes('>')) {
          textSpan.innerHTML = seg.content;
        } else {
          textSpan.textContent = seg.content;
        }
        containerRef.current?.appendChild(textSpan);
      }
    });
  }, [content, displayMode]);

  return <span ref={containerRef} className={`inline-block ${className}`} />;
};
