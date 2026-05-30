// components/LineItemRow
"use client";

import type { LineItem } from "@/types";

interface LineItemRowProps {
  item: LineItem;
  index: number;
  onChange: (index: number, updated: LineItem) => void;
  onRemove: (index: number) => void;
}

export default function LineItemRow({
  item,
  index,
  onChange,
  onRemove,
}: LineItemRowProps) {
  const rowTotal = item.quantity * item.rate;

  function handleDescriptionChange(value: string) {
    onChange(index, { ...item, description: value });
  }

  function handleQuantityChange(value: string) {
    const parsed = parseInt(value, 10);
    onChange(index, { ...item, quantity: isNaN(parsed) ? 1 : Math.max(1, parsed) });
  }

  function handleRateChange(value: string) {
    const parsed = parseFloat(value);
    onChange(index, { ...item, rate: isNaN(parsed) ? 0 : Math.max(0, parsed) });
  }

  return (
    <div className="flex items-center gap-2 border border-slate-200 bg-white rounded-lg px-3 py-2.5">
      {/* Description */}
      <input
        type="text"
        value={item.description}
        onChange={(e) => handleDescriptionChange(e.target.value)}
        placeholder="Item description"
        className="flex-1 min-w-0 bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
      />

      {/* Quantity */}
      <input
        type="number"
        min={1}
        value={item.quantity}
        onChange={(e) => handleQuantityChange(e.target.value)}
        className="w-14 border border-slate-200 rounded-md px-2 py-1 text-sm text-slate-700 text-center bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
      />

      {/* Rate */}
      <div className="relative w-24">
        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">
          $
        </span>
        <input
          type="number"
          min={0}
          step={0.01}
          value={item.rate}
          onChange={(e) => handleRateChange(e.target.value)}
          className="w-full border border-slate-200 rounded-md pl-5 pr-2 py-1 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
        />
      </div>

      {/* Row total */}
      <span className="w-20 text-right text-sm text-slate-400 font-medium shrink-0 tabular-nums">
        {rowTotal.toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
        })}
      </span>

      {/* Remove */}
      <button
        onClick={() => onRemove(index)}
        className="text-slate-300 hover:text-red-500 font-bold text-lg leading-none px-1 transition-colors shrink-0"
        aria-label="Remove item"
      >
        ×
      </button>
    </div>
  );
}