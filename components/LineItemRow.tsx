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
    <div className="flex items-center gap-2 bg-slate-50 rounded-md px-3 py-2">
      {/* Description */}
      <input
        type="text"
        value={item.description}
        onChange={(e) => handleDescriptionChange(e.target.value)}
        placeholder="Item description"
        className="flex-1 min-w-0 bg-white border border-slate-200 rounded-md px-2 py-1.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-black transition"
      />

      {/* Quantity */}
      <input
        type="number"
        min={1}
        value={item.quantity}
        onChange={(e) => handleQuantityChange(e.target.value)}
        className="w-16 bg-white border border-slate-200 rounded-md px-2 py-1.5 text-sm text-slate-900 text-center focus:outline-none focus:ring-2 focus:ring-black transition"
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
          className="w-full bg-white border border-slate-200 rounded-md pl-5 pr-2 py-1.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-black transition"
        />
      </div>

      {/* Row total */}
      <span className="w-20 text-right text-sm text-slate-500 font-medium shrink-0">
        {rowTotal.toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
        })}
      </span>

      {/* Remove */}
      <button
        onClick={() => onRemove(index)}
        className="text-red-400 hover:text-red-600 font-bold text-base leading-none px-1 transition shrink-0"
        aria-label="Remove item"
      >
        ×
      </button>
    </div>
  );
}