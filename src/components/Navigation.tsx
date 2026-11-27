import { useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  LayoutGrid,
  LogOut,
  PlusCircle,
  ShieldCheck,
  ShoppingBag,
  UserCheck,
  UserCircle2,
} from 'lucide-react';
import { ActiveTab, StudentProfile } from '../types';
import { UserAvatar } from './UserAvatar';

interface NavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  profile: StudentProfile;
  activeRentalsCount: number;
  onOpenVerifyModal: () => void;
  onSignOut: () => void;
}

export function Navigation({
  activeTab,
  onTabChange,
  profile,
  activeRentalsCount,
  onOpenVerifyModal,
  onSignOut,
}: NavigationProps) {
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!accountMenuOpen) return;
    const handleOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setAccountMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [accountMenuOpen]);

  const navItems: { id: ActiveTab; label: string; mobileLabel: string; count?: number }[] = [
    { id: 'browse', label: 'Browse', mobileLabel: 'Browse' },
    {
      id: 'rentals',
      label: activeRentalsCount > 0 ? `Order History (${activeRentalsCount})` : 'Order History',
      mobileLabel: 'Orders',
      count: activeRentalsCount,
    },
    { id: 'list', label: 'My Listings', mobileLabel: 'Listings' },
    { id: 'profile', label: 'Profile', mobileLabel: 'Profile' },
  ];

  const getMobileIcon = (id: ActiveTab) => {
    switch (id) {
      case 'browse':
        return LayoutGrid;
      case 'rentals':
        return ShoppingBag;
      case 'list':
        return PlusCircle;
      case 'profile':
        return profile.isVerified ? UserCheck : UserCircle2;
    }
  };

  const firstName = (profile.fullName || 'Student').split(' ')[0];

  return (
    <>
      {/* Desktop Top Navigation Bar — Strict 3-zone contract */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-13 md:h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-line brand wordmark */}
          <button
            type="button"
            onClick={() => onTabChange('browse')}
            className="font-display text-lg md:text-xl font-extrabold tracking-tight text-[#1E3A8A] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A] rounded-md px-1 -ml-1 cursor-pointer"
          >
            CampusLend
          </button>

          {/* Zone 2: 4 concise single-line text links (desktop) */}
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-7 text-sm font-medium"
          >
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onTabChange(item.id)}
                  className={`relative py-2 whitespace-nowrap shrink-0 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A] rounded ${
                    isActive
                      ? 'text-[#1E3A8A] font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute left-0 right-0 -bottom-[17px] h-0.5 bg-[#1E3A8A]"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 primary action (Sign In OR Synced Google User Account menu) */}
          <div className="relative flex items-center shrink-0" ref={menuRef}>
            {profile.isSignedIn ? (
              <>
                <button
                  type="button"
                  onClick={() => setAccountMenuOpen((prev) => !prev)}
                  aria-expanded={accountMenuOpen}
                  aria-haspopup="menu"
                  className="inline-flex items-center gap-2 pl-1.5 pr-3 py-1.5 min-h-[40px] rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A]"
                >
                  <UserAvatar
                    name={profile.fullName}
                    photoURL={profile.photoURL}
                    size="sm"
                  />
                  <span className="text-xs sm:text-sm font-semibold text-slate-800 max-w-[110px] truncate">
                    {firstName}
                  </span>
                  {profile.isVerified && (
                    <ShieldCheck
                      className="w-4 h-4 text-[#10B981] shrink-0"
                      aria-label="Verified Student"
                    />
                  )}
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </button>

                {accountMenuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-[calc(100%+8px)] w-64 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-slate-100 flex items-center gap-3">
                      <UserAvatar
                        name={profile.fullName}
                        photoURL={profile.photoURL}
                        size="md"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">
                          {profile.fullName}
                        </p>
                        <p className="text-xs font-mono text-slate-500 truncate">
                          {profile.email}
                        </p>
                      </div>
                    </div>

                    <div className="p-2 space-y-1">
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setAccountMenuOpen(false);
                          onOpenVerifyModal();
                        }}
                        className="w-full min-h-[40px] px-3 rounded-xl text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                        <span>
                          {profile.isVerified
                            ? 'Verified Student ID Details'
                            : 'Verify Student ID'}
                        </span>
                      </button>

                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setAccountMenuOpen(false);
                          onSignOut();
                        }}
                        className="w-full min-h-[40px] px-3 rounded-xl text-left text-xs font-semibold text-red-700 hover:bg-red-50 flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <button
                type="button"
                onClick={onOpenVerifyModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[40px] text-xs md:text-sm font-semibold text-white bg-[#1E3A8A] hover:bg-[#172554] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A] focus-visible:ring-offset-2"
              >
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Fixed Bottom Tab Bar — Thumb-zone anchored, compact height */}
      <nav
        aria-label="Mobile navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 pb-safe"
      >
        <div className="grid grid-cols-4 h-[58px]">
          {navItems.map((item) => {
            const Icon = getMobileIcon(item.id);
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={`relative flex flex-col items-center justify-center min-h-[44px] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1E3A8A] ${
                  isActive ? 'text-[#1E3A8A]' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span className="relative">
                  <Icon className="w-[21px] h-[21px]" strokeWidth={isActive ? 2.2 : 1.75} />
                  {item.count !== undefined && item.count > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-[#1E3A8A] text-white text-[10px] font-mono font-semibold flex items-center justify-center tabular-nums">
                      {item.count}
                    </span>
                  )}
                </span>
                <span
                  className={`text-[11px] leading-none mt-1 whitespace-nowrap ${
                    isActive ? 'font-semibold text-[#1E3A8A]' : 'font-medium text-slate-500'
                  }`}
                >
                  {item.mobileLabel}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
