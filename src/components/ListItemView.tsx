import React, { useRef, useState } from 'react';
import {
  Camera,
  CheckCircle2,
  Lock,
  MapPin,
  ShieldCheck,
  Upload,
} from 'lucide-react';
import {
  CATEGORIES,
  HOSTEL_BLOCKS,
  SAMPLE_IMAGES,
} from '../data/mockData';
import {
  BillingUnit,
  CatalogItem,
  ConditionLevel,
  HostelBlock,
  ItemCategory,
  StudentProfile,
} from '../types';
import { ProductImage } from './ProductImage';
import { UserAvatar } from './UserAvatar';

interface ListItemViewProps {
  profile: StudentProfile;
  onCreateListing: (item: CatalogItem) => void;
  onOpenVerifyModal: () => void;
}

const ITEM_CATEGORIES = CATEGORIES.filter((c): c is ItemCategory => c !== 'All');
const CONDITIONS: { value: ConditionLevel; note: string }[] = [
  { value: 'Mint', note: 'Like New · Checked' },
  { value: 'Good', note: 'Gently Used · Checked' },
  { value: 'Working', note: 'Working Condition · Tested' },
];

export function ListItemView({
  profile,
  onCreateListing,
  onOpenVerifyModal,
}: ListItemViewProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ItemCategory>('Hostel Appliances');
  const [condition, setCondition] = useState<ConditionLevel>('Mint');
  const [billingUnit, setBillingUnit] = useState<BillingUnit>('month');
  const [rate, setRate] = useState('150');
  const [retailPrice, setRetailPrice] = useState('2200');
  const [deposit, setDeposit] = useState('400');
  const [hostelBlock, setHostelBlock] = useState<HostelBlock>(profile.hostelBlock);
  const [description, setDescription] = useState('');
  const [imagePreview, setImagePreview] = useState(SAMPLE_IMAGES[0].url);
  const [error, setError] = useState('');

  const numericRate = Math.max(0, Number(rate) || 0);
  const numericRetail = Math.max(numericRate, Number(retailPrice) || 0);
  const numericDeposit = Math.max(0, Number(deposit) || 0);
  const computedSavings =
    numericRetail > 0
      ? Math.max(10, Math.min(95, Math.round(((numericRetail - numericRate) / numericRetail) * 100)))
      : 80;

  const conditionNote =
    CONDITIONS.find((c) => c.value === condition)?.note ?? 'Checked';

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPG, PNG, or WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImagePreview(reader.result);
        setError('');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (trimmedTitle.length < 4) {
      setError('Please enter a clear item name (e.g., Bajaj Immersion Water Heater).');
      return;
    }
    if (numericRate < 20) {
      setError('Please set a rental price of at least ₹20.');
      return;
    }
    if (numericDeposit < 100) {
      setError('Recommended refundable deposit should be at least ₹100 for escrow safety.');
      return;
    }

    const newItem: CatalogItem = {
      id: `item-user-${Date.now()}`,
      title: trimmedTitle,
      category,
      description:
        description.trim() ||
        `Available for walking-distance handover near ${hostelBlock}. Tested and ready for campus use.`,
      imageUrl: imagePreview,
      lenderName: profile.fullName || 'Aarav Sharma',
      lenderEmail: profile.isSignedIn ? profile.email : undefined,
      lenderPhotoURL: profile.isSignedIn ? profile.photoURL : undefined,
      lenderRole: profile.program || 'University Student',
      lenderRollNo: profile.rollNumber || '0251MBA183',
      lenderVerified: true,
      hostelBlock,
      condition,
      conditionNote,
      rate: numericRate,
      billingUnit,
      retailPrice: numericRetail > numericRate ? numericRetail : numericRate * 6,
      deposit: numericDeposit,
      available: true,
      isUserListing: true,
      createdAt: 'Just now',
    };

    onCreateListing(newItem);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium text-[#1E3A8A] mb-1">
          Lender Flow · 60-Second Listing
        </p>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          List an Idle Item &amp; Earn on Campus
        </h1>
        <p className="text-sm text-slate-600 mt-1.5 max-w-2xl">
          Turn unused appliances, formal blazers, or semester textbooks into steady pocket money.
          Every borrower&apos;s security deposit is held safely in CampusLend Escrow.
        </p>
      </div>

      {!profile.isVerified && (
        <div className="bg-white rounded-2xl border border-slate-200/85 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5 sm:mt-0" />
            <p className="text-sm text-slate-700">
              {profile.isSignedIn ? (
                <>
                  Add your College Student ID / Roll Number so your listing carries your{' '}
                  <strong className="text-slate-900">Verified Student</strong> badge.
                </>
              ) : (
                <>
                  Sign in with <span className="font-mono text-slate-900">@gmail.com</span> and
                  verify your College Student ID so your listing displays the{' '}
                  <strong className="text-slate-900">Verified Student</strong> badge.
                </>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenVerifyModal}
            className="min-h-[40px] px-4 rounded-xl bg-[#1E3A8A] hover:bg-[#172554] text-white text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer"
          >
            {profile.isSignedIn ? 'Verify Student ID' : 'Sign in with Gmail'}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Listing Form */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/85 p-5 sm:p-7 space-y-5"
        >
          {/* Item Name */}
          <div>
            <label
              htmlFor="list-title"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Item Name
            </label>
            <input
              id="list-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Bajaj Room Heater, Van Heusen Placement Suit, Lab Apron"
              className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
            />
          </div>

          {/* Category & Pickup Block */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="list-category"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Category
              </label>
              <select
                id="list-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as ItemCategory)}
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
              >
                {ITEM_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="list-hostel"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Pickup Hostel Block
              </label>
              <select
                id="list-hostel"
                value={hostelBlock}
                onChange={(e) => setHostelBlock(e.target.value as HostelBlock)}
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
              >
                {HOSTEL_BLOCKS.map((block) => (
                  <option key={block} value={block}>
                    {block}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Condition Selector */}
          <div>
            <span className="block text-xs font-semibold text-slate-700 mb-2">
              Condition
            </span>
            <div className="grid grid-cols-3 gap-2.5">
              {CONDITIONS.map((opt) => {
                const isSelected = condition === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setCondition(opt.value)}
                    className={`min-h-[44px] px-3 py-2 rounded-xl border text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                      isSelected
                        ? 'border-[#1E3A8A] bg-[#1E3A8A]/[0.05] text-[#1E3A8A]'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {opt.value}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pricing & Escrow Deposit */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="list-rate"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Rental Price (₹)
              </label>
              <input
                id="list-rate"
                type="number"
                min={20}
                max={5000}
                required
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-200 font-mono text-sm text-slate-900 tabular-nums focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
              />
            </div>

            <div>
              <label
                htmlFor="list-unit"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Rate Period
              </label>
              <select
                id="list-unit"
                value={billingUnit}
                onChange={(e) => setBillingUnit(e.target.value as BillingUnit)}
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
              >
                <option value="month">Per Month</option>
                <option value="event">Per Event (3 Days)</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="list-deposit"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Refundable Deposit (₹)
              </label>
              <input
                id="list-deposit"
                type="number"
                min={100}
                max={10000}
                required
                value={deposit}
                onChange={(e) => setDeposit(e.target.value)}
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-200 font-mono text-sm text-slate-900 tabular-nums focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
              />
            </div>
          </div>

          {/* Retail Price (for Savings Comparison) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="list-retail"
                className="text-xs font-semibold text-slate-700"
              >
                Original Retail Price (₹) — for savings tag
              </label>
              <span className="text-xs font-semibold text-emerald-700 tabular-nums">
                Shows &ldquo;Save {computedSavings}% vs. new&rdquo;
              </span>
            </div>
            <input
              id="list-retail"
              type="number"
              min={200}
              max={100000}
              value={retailPrice}
              onChange={(e) => setRetailPrice(e.target.value)}
              className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-200 font-mono text-sm text-slate-900 tabular-nums focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
            />
          </div>

          {/* Photo Upload + Quick Preset Selector */}
          <div>
            <span className="block text-xs font-semibold text-slate-700 mb-2">
              Item Photo
            </span>
            <div className="flex flex-wrap items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="min-h-[44px] px-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-800 inline-flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Upload className="w-4 h-4 text-[#1E3A8A]" />
                <span>Upload Photo from Device</span>
              </button>
              <span className="text-xs text-slate-400">or pick a campus preset below:</span>
            </div>

            <div className="mt-3 grid grid-cols-3 sm:grid-cols-6 gap-2">
              {SAMPLE_IMAGES.map((img) => {
                const isPicked = imagePreview === img.url;
                return (
                  <button
                    key={img.label}
                    type="button"
                    onClick={() => setImagePreview(img.url)}
                    title={img.label}
                    className={`aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                      isPicked
                        ? 'border-[#1E3A8A] ring-2 ring-[#1E3A8A]/20'
                        : 'border-transparent hover:border-slate-300'
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={img.label}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Short Description */}
          <div>
            <label
              htmlFor="list-desc"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Handover &amp; Condition Notes (Optional)
            </label>
            <textarea
              id="list-desc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Includes flat steel vessel, works great for hostel room use."
              className="w-full p-3.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full min-h-[48px] rounded-xl bg-[#1E3A8A] hover:bg-[#172554] text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Publish to Live Campus Catalog</span>
          </button>
        </form>

        {/* Live Catalog Card Preview */}
        <aside className="lg:col-span-5 space-y-3 lg:sticky lg:top-24">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Live Catalog Card Preview</span>
            <span className="inline-flex items-center gap-1">
              <Camera className="w-3.5 h-3.5" />
              4:3 Card Frame
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/85 overflow-hidden">
            <div className="aspect-[4/3] w-full bg-slate-100 border-b border-slate-100 overflow-hidden">
              <ProductImage
                src={imagePreview}
                alt={title || 'Item preview'}
                category={category}
              />
            </div>

            <div className="p-5">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5">
                <span className="font-medium text-slate-600">{category}</span>
                <span aria-hidden="true">·</span>
                <span>{conditionNote}</span>
              </div>

              <h3 className="font-display text-base font-bold text-slate-900 leading-snug">
                {title.trim() || 'Your Item Title Will Appear Here'}
              </h3>

              <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  {profile.isSignedIn && profile.photoURL ? (
                    <UserAvatar
                      name={profile.fullName || 'Aarav Sharma'}
                      photoURL={profile.photoURL}
                      size="xs"
                    />
                  ) : (
                    <ShieldCheck className="w-4 h-4 text-[#10B981] shrink-0" />
                  )}
                  <span className="font-semibold text-slate-800 truncate">
                    {profile.fullName || 'Aarav Sharma'}
                  </span>
                  <span aria-hidden="true" className="text-slate-300">
                    ·
                  </span>
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-medium truncate">
                    {profile.isSignedIn && profile.photoURL && (
                      <ShieldCheck className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                    )}
                    Verified Student
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{hostelBlock}</span>
                  <span aria-hidden="true" className="text-slate-300">
                    ·
                  </span>
                  <span className="truncate">
                    {profile.isSignedIn && profile.email
                      ? profile.email
                      : profile.rollNumber || '0251MBA183'}
                  </span>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-end justify-between gap-3">
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="font-mono text-xl font-bold text-slate-900 tabular-nums">
                      ₹{numericRate}
                    </span>
                    <span className="text-xs font-medium text-slate-500">/{billingUnit}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                    <Lock className="w-3 h-3 text-slate-400" />
                    <span className="font-mono tabular-nums">₹{numericDeposit}</span>
                    <span>Escrow Deposit</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block text-xs font-semibold text-emerald-700 tabular-nums">
                    Save {computedSavings}% vs. new
                  </span>
                  <span className="block text-[11px] text-slate-400 font-mono line-through tabular-nums">
                    MRP ₹{numericRetail.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
