import React, { useState } from 'react';
import { X, Delete } from 'lucide-react';

interface CalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CalculatorModal: React.FC<CalculatorModalProps> = ({ isOpen, onClose }) => {
  const [display, setDisplay] = useState('0');
  const [prevVal, setPrevVal] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [clearOnNext, setClearOnNext] = useState(false);

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    if (display === '0' || clearOnNext) {
      setDisplay(digit);
      setClearOnNext(false);
    } else {
      if (display.length < 14) {
        setDisplay(display + digit);
      }
    }
  };

  const handleDecimal = () => {
    if (clearOnNext) {
      setDisplay('0.');
      setClearOnNext(false);
      return;
    }
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handleOperator = (op: string) => {
    const current = parseFloat(display);
    if (prevVal === null) {
      setPrevVal(current);
    } else if (operation) {
      const res = calculate(prevVal, current, operation);
      setPrevVal(res);
      setDisplay(String(res));
    }
    setOperation(op);
    setClearOnNext(true);
  };

  const calculate = (a: number, b: number, op: string): number => {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '×': return a * b;
      case '÷': return b !== 0 ? a / b : 0;
      default: return b;
    }
  };

  const handleEquals = () => {
    if (prevVal !== null && operation) {
      const current = parseFloat(display);
      const res = calculate(prevVal, current, operation);
      setDisplay(String(Number(res.toFixed(8))));
      setPrevVal(null);
      setOperation(null);
      setClearOnNext(true);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setPrevVal(null);
    setOperation(null);
    setClearOnNext(false);
  };

  const handleDelete = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const handleSqrt = () => {
    const current = parseFloat(display);
    if (current >= 0) {
      const res = Math.sqrt(current);
      setDisplay(String(Number(res.toFixed(8))));
      setClearOnNext(true);
    }
  };

  const handleToggleSign = () => {
    const current = parseFloat(display);
    setDisplay(String(-current));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-72 bg-white rounded-lg shadow-2xl border border-gray-400 overflow-hidden font-mono select-none">
        {/* Header */}
        <div className="bg-[#1e5622] text-white px-3 py-2 flex items-center justify-between text-xs font-sans font-bold tracking-wide">
          <span>JAMB CBT CALCULATOR</span>
          <button
            onClick={onClose}
            className="p-1 hover:bg-red-600 rounded text-white transition-colors"
            title="Close calculator"
          >
            <X size={16} />
          </button>
        </div>

        {/* Display */}
        <div className="p-3 bg-gray-100 border-b border-gray-300">
          <div className="text-[10px] text-gray-500 h-4 text-right overflow-hidden">
            {prevVal !== null && operation ? `${prevVal} ${operation}` : ''}
          </div>
          <div className="bg-white border border-gray-400 rounded px-2 py-2 text-right text-2xl font-bold text-gray-900 tracking-wider overflow-x-auto whitespace-nowrap shadow-inner">
            {display}
          </div>
        </div>

        {/* Keypad */}
        <div className="p-2 grid grid-cols-4 gap-1.5 bg-gray-200 text-sm font-semibold">
          <button
            onClick={handleClear}
            className="col-span-2 bg-red-600 text-white hover:bg-red-700 py-2.5 rounded active:scale-95 transition-all text-xs"
          >
            CLEAR (AC)
          </button>
          <button
            onClick={handleDelete}
            className="bg-amber-600 text-white hover:bg-amber-700 py-2.5 rounded flex items-center justify-center active:scale-95 transition-all text-xs"
          >
            <Delete size={14} className="mr-1" /> DEL
          </button>
          <button
            onClick={() => handleOperator('÷')}
            className="bg-blue-700 text-white hover:bg-blue-800 py-2.5 rounded active:scale-95 text-base"
          >
            ÷
          </button>

          <button
            onClick={handleSqrt}
            className="bg-gray-300 text-gray-800 hover:bg-gray-400 py-2.5 rounded active:scale-95"
          >
            √
          </button>
          <button
            onClick={handleToggleSign}
            className="bg-gray-300 text-gray-800 hover:bg-gray-400 py-2.5 rounded active:scale-95"
          >
            ±
          </button>
          <button
            onClick={() => {
              const current = parseFloat(display);
              setDisplay(String(current / 100));
            }}
            className="bg-gray-300 text-gray-800 hover:bg-gray-400 py-2.5 rounded active:scale-95"
          >
            %
          </button>
          <button
            onClick={() => handleOperator('×')}
            className="bg-blue-700 text-white hover:bg-blue-800 py-2.5 rounded active:scale-95 text-base"
          >
            ×
          </button>

          {['7', '8', '9'].map((digit) => (
            <button
              key={digit}
              onClick={() => handleDigit(digit)}
              className="bg-white text-gray-800 hover:bg-gray-50 py-2.5 rounded shadow-sm border border-gray-300 active:scale-95 font-bold"
            >
              {digit}
            </button>
          ))}
          <button
            onClick={() => handleOperator('-')}
            className="bg-blue-700 text-white hover:bg-blue-800 py-2.5 rounded active:scale-95 text-lg"
          >
            -
          </button>

          {['4', '5', '6'].map((digit) => (
            <button
              key={digit}
              onClick={() => handleDigit(digit)}
              className="bg-white text-gray-800 hover:bg-gray-50 py-2.5 rounded shadow-sm border border-gray-300 active:scale-95 font-bold"
            >
              {digit}
            </button>
          ))}
          <button
            onClick={() => handleOperator('+')}
            className="bg-blue-700 text-white hover:bg-blue-800 py-2.5 rounded active:scale-95 text-base"
          >
            +
          </button>

          {['1', '2', '3'].map((digit) => (
            <button
              key={digit}
              onClick={() => handleDigit(digit)}
              className="bg-white text-gray-800 hover:bg-gray-50 py-2.5 rounded shadow-sm border border-gray-300 active:scale-95 font-bold"
            >
              {digit}
            </button>
          ))}
          <button
            onClick={handleEquals}
            className="row-span-2 bg-[#2e7d32] text-white hover:bg-[#1e5622] rounded flex items-center justify-center text-xl font-bold shadow active:scale-95"
          >
            =
          </button>

          <button
            onClick={() => handleDigit('0')}
            className="col-span-2 bg-white text-gray-800 hover:bg-gray-50 py-2.5 rounded shadow-sm border border-gray-300 active:scale-95 font-bold"
          >
            0
          </button>
          <button
            onClick={handleDecimal}
            className="bg-white text-gray-800 hover:bg-gray-50 py-2.5 rounded shadow-sm border border-gray-300 active:scale-95 font-bold text-lg"
          >
            .
          </button>
        </div>
      </div>
    </div>
  );
};
