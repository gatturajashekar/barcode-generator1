import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronDown,
  Shirt,
  Tag,
  DollarSign,
  IndianRupee,
  Package,
  Plus,
  RotateCcw,
  Minus,
} from 'lucide-react';
import {
  PRODUCT_TYPES,
  SIZE_OPTIONS,
  OFFER_OPTIONS,
  type Category,
  type ClothingSize,
  type ProductForm,
  type ProductType,
  type SizeQuantity,
  type OfferType,
} from '../types';

type ProductFormCardProps = {
  onAdd: (form: ProductForm) => void;
  onReset: () => void;
};

const SAREE_SUGGESTIONS = [
  'Synthetic Saree',
  'Silk Saree',
  'Cotton Saree',
  'Georgette Saree',
];

const OTHER_SUGGESTIONS = ['Polo T-Shirt', 'Kurta', 'Leggings', 'Churidar'];

function initialForm(): ProductForm {
  return {
    category: 'Saree',
    productName: '',
    distributorName: '',
    productType: 'Kids Wear',
    purchasePrice: '',
    sellingPrice: '',
    offer: 'No Offer',
    sizeQuantities: SIZE_OPTIONS['Kids Wear'].map((size) => ({
      size,
      quantity: 0,
      sellingPrice: '',
    })),
  };
}

export default function ProductFormCard({ onAdd, onReset }: ProductFormCardProps) {
  const [form, setForm] = useState<ProductForm>(initialForm());
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [sareeQuantity, setSareeQuantity] = useState('1');
  const [errors, setErrors] = useState<Partial<Record<keyof ProductForm, string>>>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const availableSizes = useMemo<ClothingSize[]>(
    () => (form.productType ? SIZE_OPTIONS[form.productType] : []),
    [form.productType],
  );

  const activeSizeQtys = useMemo(
    () => form.sizeQuantities.filter((sq) => availableSizes.includes(sq.size)),
    [form.sizeQuantities, availableSizes],
  );

  const totalQuantity = useMemo(
    () => activeSizeQtys.reduce((sum, sq) => sum + sq.quantity, 0),
    [activeSizeQtys],
  );

  const suggestions = useMemo(() => {
    const base = form.category === 'Saree' ? SAREE_SUGGESTIONS : OTHER_SUGGESTIONS;
    return base.filter((s) => s.toLowerCase().includes(form.productName.toLowerCase()));
  }, [form.category, form.productName]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // When product type changes, reset size quantities to one of each available size at 0
  // Preserve any per-size selling prices already entered for sizes that still exist.
  useEffect(() => {
    setForm((f) => ({
      ...f,
      sizeQuantities: SIZE_OPTIONS[f.productType ?? 'Kids Wear'].map((size) => {
        const existing = f.sizeQuantities.find((sq) => sq.size === size);
        return {
          size,
          quantity: existing?.quantity ?? 0,
          sellingPrice: existing?.sellingPrice ?? '',
        };
      }),
    }));
  }, [form.productType]);

  function update<K extends keyof ProductForm>(key: K, value: ProductForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function setSizeQuantity(size: ClothingSize, quantity: number) {
    setForm((f) => ({
      ...f,
      sizeQuantities: f.sizeQuantities.map((sq) =>
        sq.size === size ? { ...sq, quantity: Math.max(0, Math.floor(quantity)) } : sq,
      ),
    }));
    setErrors((prev) => ({ ...prev, sizeQuantities: undefined }));
  }

  function setSizePrice(size: ClothingSize, price: string) {
    setForm((f) => ({
      ...f,
      sizeQuantities: f.sizeQuantities.map((sq) =>
        sq.size === size ? { ...sq, sellingPrice: price } : sq,
      ),
    }));
    setErrors((prev) => ({ ...prev, sizeQuantities: undefined }));
  }

  function toggleSize(size: ClothingSize) {
    setForm((f) => {
      const exists = f.sizeQuantities.some((sq) => sq.size === size);
      if (exists) {
        return {
          ...f,
          sizeQuantities: f.sizeQuantities.map((sq) =>
            sq.size === size ? { ...sq, quantity: sq.quantity > 0 ? 0 : 1 } : sq,
          ),
        };
      }
      return { ...f, sizeQuantities: [...f.sizeQuantities, { size, quantity: 1 }] };
    });
  }

  
function validate(): boolean {
  const next: Partial<Record<keyof ProductForm, string>> = {};
  const name = form.productName.trim();

  // Validate product name
  if (!name) {
    next.productName = 'Product name is required';
  } else if (name.length < 2) {
    next.productName = 'Name is too short';
  }

  // Validate purchase price
  const purchase = Number(form.purchasePrice);

  if (form.purchasePrice === '' || Number.isNaN(purchase)) {
    next.purchasePrice = 'Enter a valid purchase price';
  } else if (purchase < 0) {
    next.purchasePrice = 'Price cannot be negative';
  } else if (purchase > 1_000_000) {
    next.purchasePrice = 'Price looks too high';
  }

  // Validate general selling price ONLY for Saree
  if (form.category === 'Saree') {
    const selling = Number(form.sellingPrice);

    if (form.sellingPrice === '' || Number.isNaN(selling)) {
      next.sellingPrice = 'Enter a valid selling price';
    } else if (selling < 0) {
      next.sellingPrice = 'Price cannot be negative';
    } else if (selling > 1_000_000) {
      next.sellingPrice = 'Price looks too high';
    }

    // Validate saree quantity
    const sq = Number(sareeQuantity);

    if (sareeQuantity === '' || Number.isNaN(sq)) {
      next.sizeQuantities = 'Enter a quantity';
    } else if (!Number.isInteger(sq)) {
      next.sizeQuantities = 'Quantity must be a whole number';
    } else if (sq < 1) {
      next.sizeQuantities = 'Quantity must be at least 1';
    } else if (sq > 500) {
      next.sizeQuantities = 'Maximum 500 items at a time';
    }
  } else {
    // Validate Other category quantities
    if (totalQuantity < 1) {
      next.sizeQuantities = 'Enter at least one item across sizes';
    } else if (totalQuantity > 500) {
      next.sizeQuantities = 'Maximum 500 items at a time';
    }

    // Validate selling prices for sizes with quantities
    const missingPrice = activeSizeQtys.some((sq) => {
      if (sq.quantity <= 0) return false;

      const price = Number(sq.sellingPrice);

      return (
        sq.sellingPrice === '' ||
        Number.isNaN(price) ||
        price < 0 ||
        price > 1_000_000
      );
    });

    if (missingPrice) {
      next.sizeQuantities =
        'Enter a valid selling price for every size with a quantity';
    }
  }

  setErrors(next);

  return Object.keys(next).length === 0;
}


  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    if (form.category === 'Saree') {
      onAdd({
        ...form,
        sizeQuantities: [
          { size: null as unknown as ClothingSize, quantity: Number(sareeQuantity), sellingPrice: form.sellingPrice },
        ],
      });
    } else {
      onAdd({ ...form, sizeQuantities: activeSizeQtys.filter((sq) => sq.quantity > 0) });
    }
  }

  function handleReset() {
    setForm(initialForm());
    setSareeQuantity('1');
    setErrors({});
    onReset();
    nameInputRef.current?.focus();
  }

  function selectSuggestion(s: string) {
    update('productName', s);
    setShowSuggestions(false);
    setFocusedIndex(-1);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((i) => (i - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter' && focusedIndex >= 0) {
      e.preventDefault();
      selectSuggestion(suggestions[focusedIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  }

  const isSaree = form.category === 'Saree';

  return (
    <section className="no-print animate-fade-in-up rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card sm:p-5 md:p-7">
      <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4 sm:mb-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-maroon-50 text-maroon-700 ring-1 ring-maroon-100">
          <Tag size={18} />
        </div>
        <div className="min-w-0">
          <h2 className="font-serif text-lg text-maroon-800 sm:text-xl">Product Entry</h2>
          <p className="text-xs text-slate-500 sm:text-sm">
            Fill in the details to generate a barcode label.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Category */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
            Category
          </label>
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
            {(['Saree', 'Other'] as Category[]).map((cat) => {
              const active = form.category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    update('category', cat);
                    setShowSuggestions(false);
                  }}
                  className={`flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'bg-white text-maroon-700 shadow-sm ring-1 ring-maroon-100'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                  aria-pressed={active}
                >
                  <Shirt size={15} className={active ? 'opacity-100' : 'opacity-60'} />
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Type dropdown (Other only) */}
        {!isSaree && (
          <div>
            <label
              htmlFor="productType"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600"
            >
              Product Type
            </label>
            <div className="relative">
              <select
                id="productType"
                value={form.productType ?? 'Kids Wear'}
                onChange={(e) => update('productType', e.target.value as ProductType)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3.5 pr-10 text-base text-slate-800 transition-colors focus:border-maroon-400 focus:outline-none focus:ring-2 focus:ring-maroon-100 sm:text-sm"
              >
                {PRODUCT_TYPES.map((pt) => (
                  <option key={pt} value={pt}>
                    {pt}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </div>
        )}

        {/* Product Name with suggestions */}
        <div ref={containerRef} className="relative">
          <label
            htmlFor="productName"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600"
          >
            Product Name
          </label>
          <div className="relative">
            <input
              ref={nameInputRef}
              id="productName"
              type="text"
              inputMode="text"
              enterKeyHint="next"
              value={form.productName}
              onChange={(e) => {
                update('productName', e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={handleKeyDown}
              placeholder={isSaree ? 'e.g. Silk Saree' : 'e.g. Polo T-Shirt'}
              className={`w-full rounded-xl border bg-white px-4 py-3.5 pr-10 text-base text-slate-800 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 sm:text-sm ${
                errors.productName
                  ? 'border-rose-300 focus:ring-rose-200'
                  : 'border-slate-200 focus:border-maroon-400 focus:ring-maroon-100'
              }`}
              autoComplete="off"
              autoCapitalize="words"
            />
            <ChevronDown
              size={16}
              className={`pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-transform ${
                showSuggestions ? 'rotate-180' : ''
              }`}
            />
          </div>

          {showSuggestions && suggestions.length > 0 && (
            <ul className="absolute z-20 mt-1.5 w-full overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg ring-1 ring-slate-900/5 animate-fade-in-up">
              {suggestions.map((s, i) => (
                <li key={s}>
                  <button
                    type="button"
                    onClick={() => selectSuggestion(s)}
                    onMouseEnter={() => setFocusedIndex(i)}
                    className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm transition-colors ${
                      i === focusedIndex
                        ? 'bg-maroon-50 text-maroon-800'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-maroon-300" />
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {errors.productName && (
            <p className="mt-1.5 text-xs text-rose-500">{errors.productName}</p>
          )}
        </div>
        {/* Distributor Name */}
        <div>
          <label
            htmlFor="distributorName"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600"
          >
            Distributor Name
          </label>

          <input
            id="distributorName"
            type="text"
            value={form.distributorName}
            onChange={(e) => update('distributorName', e.target.value)}
            placeholder="Enter distributor / supplier name"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-base text-slate-800 focus:border-maroon-400 focus:outline-none focus:ring-2 focus:ring-maroon-100 sm:text-sm"
          />
        </div>
        {/* Offer Selection */}
<div>
  <label
    htmlFor="productOffer"
    className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600"
  >
    Product Offer
  </label>

  <div className="relative">
    <select
      id="productOffer"
      value={form.offer}
      onChange={(e) => update('offer', e.target.value as OfferType)}
      className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3.5 pr-10 text-base text-slate-800 transition-colors focus:border-maroon-400 focus:outline-none focus:ring-2 focus:ring-maroon-100 sm:text-sm"
    >
      {OFFER_OPTIONS.map((offer) => (
        <option key={offer} value={offer}>
          {offer === 'No Offer'
            ? 'No Offer'
            : offer === '1+1'
              ? '1+1 — Buy 1 Get 1 Free'
              : '2+1 — Buy 2 Get 1 Free'}
        </option>
      ))}
    </select>

    <ChevronDown
      size={16}
      className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
    />
  </div>
</div>
        {/* Prices */}
        <div className={`grid grid-cols-1 gap-4 ${isSaree ? 'sm:grid-cols-2' : ''}`}>
          <Field
            id="purchasePrice"
            label="Purchase Price"
            icon={<IndianRupee size={15} />}
            value={form.purchasePrice}
            onChange={(v) => update('purchasePrice', v)}
            placeholder="0.00"
            error={errors.purchasePrice}
            type="number"
            min="0"
            step="0.01"
          />
          {isSaree && (
            <Field
              id="sellingPrice"
              label="Selling Price"
              icon={<DollarSign size={15} />}
              value={form.sellingPrice}
              onChange={(v) => update('sellingPrice', v)}
              placeholder="0.00"
              error={errors.sellingPrice}
              type="number"
              min="0"
              step="0.01"
            />
          )}
        </div>
        {!isSaree && errors.sellingPrice && (
          <p className="-mt-2 text-xs text-rose-500">{errors.sellingPrice}</p>
        )}

        {/* Quantity section */}
        {isSaree ? (
          <Field
            id="sareeQuantity"
            label="Quantity"
            icon={<Package size={15} />}
            value={sareeQuantity}
            onChange={setSareeQuantity}
            placeholder="1"
            error={errors.sizeQuantities}
            type="number"
            min="1"
            step="1"
            max="500"
          />
        ) : (
          <SizeQuantitySection
            availableSizes={availableSizes}
            sizeQuantities={form.sizeQuantities}
            onToggle={toggleSize}
            onChange={setSizeQuantity}
            onPriceChange={setSizePrice}
            total={totalQuantity}
            error={errors.sizeQuantities}
          />
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <button
            type="submit"
            className="group flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl bg-maroon-700 px-5 py-3.5 text-sm font-semibold text-white shadow-maroon transition-all duration-200 hover:bg-maroon-800 hover:shadow-lg active:scale-[0.98] sm:px-6"
          >
            <Plus size={18} className="transition-transform group-hover:rotate-90" />
            Generate Barcode
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-600 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98] sm:px-6 sm:flex-none"
          >
            <RotateCcw size={17} />
            Reset
          </button>
        </div>
      </form>
    </section>
  );
}

function SizeQuantitySection({
  availableSizes,
  sizeQuantities,
  onToggle,
  onChange,
  onPriceChange,
  total,
  error,
}: {
  availableSizes: ClothingSize[];
  sizeQuantities: SizeQuantity[];
  onToggle: (size: ClothingSize) => void;
  onChange: (size: ClothingSize, quantity: number) => void;
  onPriceChange: (size: ClothingSize, price: string) => void;
  total: number;
  error?: string;
}) {
  const qtyFor = (size: ClothingSize) =>
    sizeQuantities.find((sq) => sq.size === size)?.quantity ?? 0;
  const priceFor = (size: ClothingSize) =>
    sizeQuantities.find((sq) => sq.size === size)?.sellingPrice ?? '';

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
          Size-wise Quantity &amp; Price
        </label>
        <span className="text-xs text-slate-400">Tap size to enable</span>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {availableSizes.map((size) => {
          const qty = qtyFor(size);
          const active = qty > 0;
          return (
            <div
              key={size}
              className={`flex flex-col gap-2 rounded-xl border px-3 py-2.5 transition-colors ${
                active
                  ? 'border-maroon-200 bg-maroon-50/60'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onToggle(size)}
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold transition-all ${
                    active
                      ? 'bg-maroon-700 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                  aria-pressed={active}
                  aria-label={`Toggle size ${size}`}
                >
                  {size}
                </button>
                <div className="flex flex-1 items-center justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => onChange(size, qty - 1)}
                    disabled={qty === 0}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200 disabled:opacity-40"
                    aria-label={`Decrease ${size} quantity`}
                  >
                    <Minus size={15} />
                  </button>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={500}
                    value={qty}
                    onChange={(e) => onChange(size, Number(e.target.value) || 0)}
                    className="w-14 rounded-lg border border-slate-200 px-2 py-1.5 text-center text-base sm:text-sm focus:border-maroon-400 focus:outline-none focus:ring-2 focus:ring-maroon-100"
                    aria-label={`${size} quantity`}
                  />
                  <button
                    type="button"
                    onClick={() => onChange(size, qty + 1)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200"
                    aria-label={`Increase ${size} quantity`}
                  >
                    <Plus size={15} />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center text-slate-400">
                  <IndianRupee size={14} />
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="0.01"
                  value={priceFor(size)}
                  onChange={(e) => onPriceChange(size, e.target.value)}
                  placeholder="Selling price"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-base text-slate-800 placeholder:text-slate-400 focus:border-maroon-400 focus:outline-none focus:ring-2 focus:ring-maroon-100 sm:text-sm"
                  aria-label={`${size} selling price`}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between rounded-xl bg-maroon-50 px-4 py-2.5">
        <span className="text-xs font-semibold uppercase tracking-wider text-maroon-600">
          Total Quantity
        </span>
        <span className="font-serif text-lg font-semibold text-maroon-800">{total}</span>
      </div>
      {error && <p className="mt-1.5 text-xs text-rose-500">{error}</p>}
    </div>
  );
}

type FieldProps = {
  id: string;
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  type?: string;
  min?: string;
  max?: string;
  step?: string;
};

function Field({
  id,
  label,
  icon,
  value,
  onChange,
  placeholder,
  error,
  type = 'text',
  min,
  max,
  step,
}: FieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600"
      >
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </span>
        <input
          id={id}
          type={type}
          inputMode={type === 'number' ? 'decimal' : 'text'}
          enterKeyHint="next"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-xl border bg-white py-3.5 pl-10 pr-4 text-base text-slate-800 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 sm:text-sm ${
            error
              ? 'border-rose-300 focus:ring-rose-200'
              : 'border-slate-200 focus:border-maroon-400 focus:ring-maroon-100'
          }`}
          aria-label={label}
          aria-invalid={error ? true : undefined}
        />
      </div>
      {error && <p className="mt-1.5 text-xs text-rose-500">{error}</p>}
    </div>
  );
}
