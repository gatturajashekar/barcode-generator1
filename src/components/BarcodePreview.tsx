import { Printer, Download, Barcode, Tag, IndianRupee, Shirt } from 'lucide-react';
import type { BarcodeItem, ProductEntry } from '../types';

type BarcodePreviewProps = {
  product: ProductEntry | null;
  items: BarcodeItem[];
  totalCount: number;
};

function formatINR(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(value);
}

export default function BarcodePreview({
  product,
  items,
  totalCount,
}: BarcodePreviewProps) {
  if (!product) {
    return <EmptyState />;
  }

  return (
    <section className="animate-fade-in-up rounded-2xl border border-slate-200/80 bg-white shadow-card">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-4 sm:px-7">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-black ring-1 ring-slate-200">
          <Barcode size={18} />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="font-serif text-base text-slate-900 sm:text-lg md:text-xl">
            Barcode Preview
          </h2>

          <p className="truncate text-xs text-slate-500 sm:text-sm">
            Showing {items.length} of {totalCount} generated label
            {totalCount !== 1 ? 's' : ''} — Code 128.
          </p>
        </div>

        <span className="hidden shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-black ring-1 ring-slate-200 sm:inline">
          Scannable
        </span>
      </div>

      {/* Preview canvas */}
      <div className="bg-grid overflow-x-auto px-4 py-6 sm:px-7 sm:py-7">
        <div className="print-area mx-auto w-full">
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
            {items.map((item) => (
              <LabelCard key={item.id} product={product} item={item} />
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="no-print flex flex-col gap-3 border-t border-slate-100 px-4 py-4 sm:flex-row sm:px-7 sm:py-5">
        <button
          onClick={() => window.print()}
          className="group flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl bg-black px-5 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-slate-800 active:scale-[0.98] sm:px-6"
        >
          <Printer size={18} className="transition-transform group-hover:scale-110" />
          Print Labels
        </button>

        <button
          onClick={() => downloadPrintable(product, product.items)}
          className="group flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-semibold text-black transition-all duration-200 hover:bg-slate-100 active:scale-[0.98] sm:px-6"
        >
          <Download size={18} className="transition-transform group-hover:translate-y-0.5" />
          Download PDF
        </button>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------
   50mm × 30mm LABEL PREVIEW
--------------------------------------------------------- */

function LabelCard({
  product,
  item,
}: {
  product: ProductEntry;
  item: BarcodeItem;
}) {
  const showSize = product.category === 'Other' && item.size;

  return (
    <div
      className="print-label flex shrink-0 flex-col overflow-hidden border border-black bg-white shadow-none"
      style={{
        width: '50mm',
        height: '30mm',
        borderRadius: 0,
        boxSizing: 'border-box',
      }}
    >
      {/* Shop name */}
      <div className="flex h-[4.5mm] shrink-0 items-center justify-between border-b border-black bg-white px-[1.5mm]">
        <span className="truncate text-[7px] font-bold tracking-tight text-black">
          Bhagya Lakshmi Textiles
        </span>

        <span className="ml-1 shrink-0 text-[6px] font-bold uppercase text-black">
          {product.category}
        </span>
      </div>

      {/* Product details */}
      <div className="flex min-h-0 flex-1 flex-col justify-between px-[1.5mm] py-[0.5mm]">
        <div className="flex items-center justify-between gap-1">
          <p className="truncate text-[8px] font-bold leading-tight text-black">
            {product.productName}
          </p>

          {showSize && (
            <span className="flex shrink-0 items-center gap-0.5 text-[7px] font-bold text-black">
              <Shirt size={8} />
              {item.size}
            </span>
          )}
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <span className="text-[6px] font-medium uppercase tracking-wide text-black">
            Price
          </span>

          <p className="flex items-center text-[10px] font-bold leading-none text-black">
            <IndianRupee size={9} className="mr-0.5 shrink-0" />
            {formatINR(item.sellingPrice ?? product.sellingPrice)}
          </p>
        </div>

        {/* Barcode */}
        <div
          className="flex h-[12mm] w-full items-center justify-center overflow-hidden bg-white"
          style={{ backgroundColor: '#ffffff' }}
        >
          <div
            className="barcode-svg block h-full w-full"
            style={{
              width: '100%',
              height: '12mm',
              backgroundColor: '#ffffff',
              overflow: 'hidden',
            }}
            dangerouslySetInnerHTML={{ __html: item.svg }}
          />
        </div>

        {/* Human-readable barcode ID */}
        <p className="text-center font-mono text-[7px] font-bold leading-none tracking-[0.5px] text-black">
          {item.barcodeId}
        </p>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   EMPTY STATE
--------------------------------------------------------- */

function EmptyState() {
  return (
    <section className="animate-fade-in-up rounded-2xl border border-dashed border-slate-300 bg-white/60 p-6 text-center shadow-card sm:p-10 md:p-16">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-black ring-1 ring-slate-200">
        <Barcode size={30} />
      </div>

      <h2 className="font-serif text-lg text-slate-900 sm:text-xl">
        No Barcode Yet
      </h2>

      <p className="mx-auto mt-2 max-w-xs text-sm text-slate-500">
        Fill in the product details on the left and tap{' '}
        <span className="font-medium text-black">Generate Barcode</span> to see
        the label preview here.
      </p>

      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
        <Tag size={13} />
        <span>Saree &amp; Other categories supported</span>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------
   PRINT / PDF EXPORT
   Each label is exactly 50mm × 30mm.
--------------------------------------------------------- */

function downloadPrintable(product: ProductEntry, items: BarcodeItem[]) {
  const labelsHtml = items
    .map((item) => {
      const price = formatINR(item.sellingPrice ?? product.sellingPrice);

      const sizeTag =
        product.category === 'Other' && item.size
          ? `<span class="size">${escapeHtml(item.size)}</span>`
          : '';

      return `
        <div class="label">
          <div class="brand">
            <span>Bhagya Lakshmi Textiles</span>
            <span class="cat">${escapeHtml(product.category)}</span>
          </div>

          <div class="body">
            <div class="product-row">
              <p class="name">${escapeHtml(product.productName)}</p>
              ${sizeTag}
            </div>

            <div class="meta">
              <span class="lbl">PRICE</span>
              <span class="price">₹${price}</span>
            </div>

            <div class="bars">${item.svg}</div>

            <p class="code-str">${escapeHtml(item.barcodeId)}</p>
          </div>
        </div>
      `;
    })
    .join('');

  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(product.productName)} — Barcode Labels</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />

  <style>
    @page {
      size: A4;
      margin: 10mm;
    }

    * {
      box-sizing: border-box;
    }

    html,
    body {
      margin: 0;
      padding: 0;
      background: #ffffff;
      color: #000000;
      font-family: Arial, Helvetica, sans-serif;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .grid {
      display: flex;
      flex-wrap: wrap;
      gap: 2mm;
      justify-content: flex-start;
      align-items: flex-start;
    }

    /* Exact physical label dimensions */
    .label {
      width: 50mm;
      height: 30mm;
      border: 0.3mm solid #000000;
      border-radius: 0;
      overflow: hidden;
      background: #ffffff;
      color: #000000;
      page-break-inside: avoid;
      break-inside: avoid;
      margin: 0;
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
    }

    /* Shop header */
    .brand {
      height: 4.5mm;
      min-height: 4.5mm;
      background: #ffffff;
      color: #000000;
      padding: 0 1.5mm;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 7px;
      font-weight: bold;
      line-height: 1;
      border-bottom: 0.2mm solid #000000;
    }

    .brand .cat {
      background: #ffffff;
      color: #000000;
      padding: 0;
      font-size: 6px;
      font-weight: bold;
      text-transform: uppercase;
    }

    /* Label content */
    .body {
      padding: 0.5mm 1.5mm;
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .product-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1mm;
    }

    .name {
      font-size: 8px;
      font-weight: bold;
      color: #000000;
      margin: 0;
      line-height: 1.1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .size {
      font-size: 7px;
      font-weight: bold;
      color: #000000;
      white-space: nowrap;
    }

    .meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1mm;
    }

    .lbl {
      font-size: 6px;
      color: #000000;
      font-weight: bold;
      text-transform: uppercase;
      line-height: 1;
    }

    .price {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 10px;
      color: #000000;
      font-weight: bold;
      line-height: 1;
    }

    /* Barcode area: black bars on white background */
    .bars {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 12mm;
      overflow: hidden;
      background: #ffffff;
    }

    .bars svg {
      width: 100%;
      height: 100%;
      display: block;
      background: #ffffff;
    }

    .bars svg path {
      fill: #000000 !important;
    }

    .bars svg rect[fill="#000"],
    .bars svg rect[fill="#000000"] {
      fill: #000000 !important;
    }

    /* Human-readable barcode ID */
    .code-str {
      font-family: monospace;
      font-size: 7px;
      font-weight: bold;
      text-align: center;
      letter-spacing: 0.5px;
      color: #000000;
      margin: 0;
      line-height: 1;
    }

    @media screen {
      body {
        padding: 10mm;
      }
    }
  </style>
</head>

<body>
  <div class="grid">${labelsHtml}</div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const w = window.open(url, '_blank');

  if (w) {
    w.onload = () => {
      setTimeout(() => {
        w.focus();
        w.print();
      }, 500);
    };
  }
}

/* ---------------------------------------------------------
   HTML ESCAPING
--------------------------------------------------------- */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}