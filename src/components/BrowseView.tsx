import { useMemo, useState } from 'react';
import {
  ArrowRight,
  Lock,
  MapPin,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { CATEGORIES, calculateSavingsPercent } from '../data/mockData';
import { CatalogItem, Category, StudentProfile } from '../types';
import { ProductImage } from './ProductImage';
import { UserAvatar } from './UserAvatar';

interface BrowseViewProps {
  items: CatalogItem[];
  profile: StudentProfile;
  onRentItem: (item: CatalogItem) => void;
  onOpenVerifyModal: () => void;
  onGoToList: () => void;
}

type SortOption = 'recommended' | 'price_low' | 'savings_high';

export function BrowseView({
  items,
  profile,
  onRentItem,
  onOpenVerifyModal,
  onGoToList,
}: BrowseViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recommended');

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const list = items.filter((item) => {
      if (!item.available) return false;
      const matchesCategory =
        selectedCategory === 'All' || item.category === selectedCategory;
      const matchesQuery =
        query.length === 0 ||
        item.title.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.hostelBlock.toLowerCase().includes(query) ||
        item.lenderName.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });

    if (sortBy === 'price_low') {
      return [...list].sort((a, b) => a.rate - b.rate);
    }
    if (sortBy === 'savings_high') {
      return [...list].sort(
        (a, b) => calculateSavingsPercent(b) - calculateSavingsPercent(a)
      );
    }
    return list;
  }, [items, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="space-y-8">
      {/* Compact Institutional Hero */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 lg:p-10">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-slate-500 mb-3">
            <span className="text-[#1E3A8A] font-semibold">
              Dehradun University Campuses
            </span>
            <span aria-hidden="true">·</span>
            <span>Hostel-to-Hostel Peer Marketplace</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-700 font-medium">100% Escrow Protected</span>
          </div>

          <h1 className="font-display text-2xl sm:text-3xl lg:text-[40px] font-extrabold text-slate-900 tracking-tight leading-[1.15] [text-wrap:balance]">
            Rent Campus Essentials from Verified Hostel Peers at 80% Less.
          </h1>

          <p className="text-sm sm:text-base text-slate-600 mt-3.5 max-w-2xl leading-relaxed">
            Skip buying full-price induction cooktops, winter heaters, lab kits, or placement
            blazers for a single semester. Pick up at walking-distance campus drop spots with
            refundable UPI escrow deposits.
          </p>

          {/* Search Input + Secondary Action */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search induction, blazer, heater, Boys Hostel B..."
                aria-label="Search campus gear catalog"
                className="w-full min-h-[46px] pl-10 pr-10 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={onGoToList}
              className="min-h-[46px] px-5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm font-semibold text-slate-800 inline-flex items-center justify-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>Earn from Idle Gear</span>
              <ArrowRight className="w-4 h-4 text-[#1E3A8A]" />
            </button>
          </div>
        </div>

        {/* Contextual Gmail Login & Student Verification Strip */}
        {!profile.isVerified && (
          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-2.5 text-sm text-slate-600">
              <ShieldCheck className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5 sm:mt-0" />
              {profile.isSignedIn ? (
                <span>
                  Signed in with <span className="font-mono text-slate-800">{profile.email}</span>.
                  Add your College Roll Number to unlock the{' '}
                  <strong className="text-slate-900">Verified Student</strong> badge.
                </span>
              ) : (
                <span>
                  Sign in with any <span className="font-mono text-slate-800">@gmail.com</span>{' '}
                  account and verify your College Student ID to unlock the{' '}
                  <strong className="text-slate-900">Verified Student</strong> badge.
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={onOpenVerifyModal}
              className="text-sm font-semibold text-[#1E3A8A] hover:text-[#172554] hover:underline whitespace-nowrap shrink-0 self-start sm:self-auto cursor-pointer"
            >
              {profile.isSignedIn ? 'Verify Student ID →' : 'Sign in with Gmail →'}
            </button>
          </div>
        )}
      </section>

      {/* Filter Tabs + Sort Bar */}
      <section aria-label="Filter catalog">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Category Segmented Controls */}
          <div
            role="tablist"
            aria-label="Gear categories"
            className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 lg:pb-0 -mx-1 px-1"
          >
            {CATEGORIES.map((category) => {
              const isActive = selectedCategory === category;
              return (
                <button
                  key={category}
                  role="tab"
                  aria-selected={isActive}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`min-h-[40px] px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-[#1E3A8A] text-white font-semibold'
                      : 'bg-white text-slate-600 border border-slate-200/80 hover:text-slate-900 hover:border-slate-300'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>

          {/* Result Count + Sort Control */}
          <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
            <span className="text-xs font-medium text-slate-500 tabular-nums whitespace-nowrap">
              {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} available
            </span>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                aria-label="Sort campus gear"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="min-h-[38px] pl-2.5 pr-7 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
              >
                <option value="recommended">Recommended</option>
                <option value="price_low">Lowest Rate</option>
                <option value="savings_high">Highest Savings</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 py-14 px-6 text-center">
          <p className="font-display text-base font-bold text-slate-900">
            No matching campus gear found
          </p>
          <p className="text-sm text-slate-500 mt-1.5 max-w-md mx-auto">
            Try clearing your search term or switching back to all campus categories.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('All');
              setSearchQuery('');
            }}
            className="mt-5 min-h-[44px] px-5 rounded-xl bg-[#1E3A8A] text-white text-sm font-semibold hover:bg-[#172554] transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <section
          aria-label="Verified campus listings"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredItems.map((item) => {
            const savingsPct = calculateSavingsPercent(item);
            return (
              <article
                key={item.id}
                className="group bg-white rounded-2xl border border-slate-200/85 overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
              >
                {/* 4:3 Studio Product Image */}
                <div className="aspect-[4/3] w-full bg-slate-100 overflow-hidden border-b border-slate-100">
                  <ProductImage
                    src={item.imageUrl}
                    alt={item.title}
                    category={item.category}
                    className="transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                </div>

                {/* Card Body — Identical Field Order & Zero-Pill Metadata */}
                <div className="p-5 flex-1 flex flex-col">
                  {/* Quiet 1-line unboxed kicker: Category · Condition */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5">
                    <span className="font-medium text-slate-600 truncate">{item.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="truncate">{item.conditionNote}</span>
                  </div>

                  {/* Primary Title */}
                  <h2 className="font-display text-base font-bold text-slate-900 leading-snug line-clamp-2 min-h-[44px]">
                    {item.title}
                  </h2>

                  {/* Verified Senior Lender + Hostel Block */}
                  <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      {item.lenderPhotoURL ? (
                        <UserAvatar
                          name={item.lenderName}
                          photoURL={item.lenderPhotoURL}
                          size="xs"
                        />
                      ) : (
                        <ShieldCheck
                          className="w-4 h-4 text-[#10B981] shrink-0"
                          aria-hidden="true"
                        />
                      )}
                      <span className="font-semibold text-slate-800 truncate">
                        {item.lenderName}
                      </span>
                      <span aria-hidden="true" className="text-slate-300">
                        ·
                      </span>
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-medium truncate">
                        {item.lenderPhotoURL && (
                          <ShieldCheck className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                        )}
                        Verified Student
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                      <span>{item.hostelBlock}</span>
                      <span aria-hidden="true" className="text-slate-300">
                        ·
                      </span>
                      <span>{item.lenderRole}</span>
                    </div>
                  </div>

                  {/* Divider + Pricing & Escrow Block */}
                  <div className="mt-5 pt-4 border-t border-slate-100 space-y-3 mt-auto">
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <div className="flex items-baseline gap-1">
                          <span className="font-mono text-xl font-bold text-slate-900 tabular-nums">
                            ₹{item.rate}
                          </span>
                          <span className="text-xs font-medium text-slate-500">
                            /{item.billingUnit}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                          <Lock className="w-3 h-3 text-slate-400 shrink-0" aria-hidden="true" />
                          <span className="font-mono tabular-nums">₹{item.deposit}</span>
                          <span>Escrow Deposit</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="block text-xs font-semibold text-emerald-700 tabular-nums">
                          Save {savingsPct}% vs. new
                        </span>
                        <span className="block text-[11px] text-slate-400 font-mono line-through tabular-nums">
                          MRP ₹{item.retailPrice.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRentItem(item)}
                      className="w-full min-h-[44px] rounded-xl bg-[#1E3A8A] hover:bg-[#172554] active:scale-[0.99] text-white text-sm font-semibold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A] focus-visible:ring-offset-2"
                    >
                      Rent Now
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}
