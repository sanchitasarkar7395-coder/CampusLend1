import {
  CheckCircle2,
  MapPin,
  Plus,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { DROP_SPOTS } from '../data/mockData';
import { CatalogItem, RentalOrder, StudentProfile } from '../types';
import { ProductImage } from './ProductImage';
import { UserAvatar } from './UserAvatar';

interface ProfileViewProps {
  profile: StudentProfile;
  rentals: RentalOrder[];
  userListings: CatalogItem[];
  onOpenVerifyModal: () => void;
  onSignOut: () => void;
  onToggleListingAvailability: (itemId: string) => void;
  onDeleteListing: (itemId: string) => void;
  onGoToList: () => void;
  onGoToRentals: () => void;
}

export function ProfileView({
  profile,
  rentals,
  userListings,
  onOpenVerifyModal,
  onSignOut,
  onToggleListingAvailability,
  onDeleteListing,
  onGoToList,
  onGoToRentals,
}: ProfileViewProps) {
  const activeRentals = rentals.filter((r) => r.escrowStatus !== 'Deposit Refunded');
  const heldEscrow = activeRentals.reduce((sum, r) => sum + r.depositAmount, 0);
  const refundedDeposits = rentals
    .filter((r) => r.escrowStatus === 'Deposit Refunded')
    .reduce((sum, r) => sum + r.depositAmount, 0);
  const retailSavings = rentals
    .filter((r) => r.orderRole === 'borrowed')
    .reduce(
      (sum, r) => sum + Math.max(0, r.retailPrice - (r.rentalFee + r.platformFee)),
      0
    );
  const totalSavedAndRefunded = retailSavings + refundedDeposits;
  // Realistic semester earnings baseline + user listings potential
  const estimatedEarnings = 640 + userListings.reduce((sum, item) => sum + item.rate, 0);

  return (
    <div className="space-y-6">
      {/* Student Identity & Verification Card */}
      <section className="bg-white rounded-2xl border border-slate-200/85 p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <UserAvatar
            name={profile.isSignedIn ? profile.fullName : 'Guest Student'}
            photoURL={profile.isSignedIn ? profile.photoURL : undefined}
            size="lg"
            className="rounded-2xl"
          />

          <div>
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
              <h1 className="font-display text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {profile.isSignedIn ? profile.fullName : 'Guest Student'}
              </h1>
              {profile.isVerified ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                  <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                  Verified Student
                </span>
              ) : profile.isSignedIn ? (
                <span className="text-xs font-medium text-amber-700">
                  Student ID Not Verified Yet
                </span>
              ) : (
                <span className="text-xs font-medium text-slate-500">
                  Not Signed In
                </span>
              )}
            </div>

            <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm text-slate-500">
              <span>{profile.program}</span>
              <span aria-hidden="true">·</span>
              <span>{profile.hostelBlock}</span>
              {profile.isVerified && profile.rollNumber && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono font-semibold text-[#1E3A8A] tabular-nums">
                    {profile.rollNumber}
                  </span>
                </>
              )}
            </div>

            {profile.isSignedIn && profile.email && (
              <p className="text-xs font-mono text-slate-500 mt-1">{profile.email}</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onOpenVerifyModal}
            className={`min-h-[44px] px-5 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              profile.isVerified
                ? 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                : 'bg-[#1E3A8A] hover:bg-[#172554] text-white'
            }`}
          >
            {profile.isVerified
              ? 'Manage Verified ID'
              : profile.isSignedIn
                ? 'Verify Student ID'
                : 'Sign in with Gmail'}
          </button>

          {profile.isSignedIn && (
            <button
              type="button"
              onClick={onSignOut}
              className="min-h-[44px] px-4 rounded-xl border border-slate-200 text-slate-600 hover:text-red-700 hover:border-red-200 hover:bg-red-50 text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Sign Out
            </button>
          )}
        </div>
      </section>

      {/* 4-Column Tabular Dashboard KPI Strip */}
      <section aria-label="Student savings and escrow metrics" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
          <p className="text-xs font-medium text-slate-500">Total Saved / Refunded</p>
          <p className="font-mono text-2xl font-bold text-emerald-700 mt-1.5 tabular-nums">
            ₹{totalSavedAndRefunded.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-slate-500 mt-1 tabular-nums">
            Includes ₹{refundedDeposits.toLocaleString('en-IN')} deposits refunded
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
          <p className="text-xs font-medium text-slate-500">Earned Lending</p>
          <p className="font-mono text-2xl font-bold text-slate-900 mt-1.5 tabular-nums">
            ₹{estimatedEarnings.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-slate-500 mt-1">Peer payouts via UPI</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
          <p className="text-xs font-medium text-slate-500">Held Escrow Deposits</p>
          <p className="font-mono text-2xl font-bold text-[#1E3A8A] mt-1.5 tabular-nums">
            ₹{heldEscrow.toLocaleString('en-IN')}
          </p>
          <button
            type="button"
            onClick={onGoToRentals}
            className="text-xs font-semibold text-[#1E3A8A] hover:underline mt-1 cursor-pointer"
          >
            View Order History ({activeRentals.length} active) →
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
          <p className="text-xs font-medium text-slate-500">My Listed Items</p>
          <p className="font-mono text-2xl font-bold text-slate-900 mt-1.5 tabular-nums">
            {userListings.length}
          </p>
          <button
            type="button"
            onClick={onGoToList}
            className="text-xs font-semibold text-[#1E3A8A] hover:underline mt-1 cursor-pointer"
          >
            + List idle gear
          </button>
        </div>
      </section>

      {/* My Listed Items Management */}
      <section className="bg-white rounded-2xl border border-slate-200/85 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900">
              My Listed Campus Gear
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Items you publish appear immediately in the verified campus catalog.
            </p>
          </div>
          <button
            type="button"
            onClick={onGoToList}
            className="min-h-[40px] px-4 rounded-xl bg-[#1E3A8A] hover:bg-[#172554] text-white text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>List New Item</span>
          </button>
        </div>

        {userListings.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm font-semibold text-slate-800">
              You haven&apos;t listed any idle hostel items yet
            </p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Got an extra kettle, winter heater, or semester textbook? List it in 60 seconds and
              earn monthly rent from verified juniors.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 mt-2">
            {userListings.map((item) => (
              <div
                key={item.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-20 h-15 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/70 shrink-0">
                    <ProductImage
                      src={item.imageUrl}
                      alt={item.title}
                      category={item.category}
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-display text-sm font-bold text-slate-900 truncate">
                      {item.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 mt-1">
                      <span className="font-mono font-semibold text-slate-800 tabular-nums">
                        ₹{item.rate}/{item.billingUnit}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">₹{item.deposit} Escrow</span>
                      <span aria-hidden="true">·</span>
                      <span>{item.hostelBlock}</span>
                      <span aria-hidden="true">·</span>
                      <span
                        className={
                          item.available
                            ? 'text-emerald-700 font-semibold'
                            : 'text-slate-400 font-medium'
                        }
                      >
                        {item.available ? 'Live in Catalog' : 'Paused'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onToggleListingAvailability(item.id)}
                    className="min-h-[40px] px-3.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer"
                  >
                    {item.available ? 'Pause' : 'Make Live'}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteListing(item.id)}
                    aria-label={`Remove ${item.title}`}
                    className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Campus Drop-Spots Guide */}
      <section className="bg-white rounded-2xl border border-slate-200/85 p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-1">
          <MapPin className="w-4 h-4 text-[#1E3A8A]" />
          <h2 className="font-display text-base font-bold text-slate-900">
            Verified Campus Handover Drop-Spots
          </h2>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          All pickups and returns happen on-campus in walking distance — zero courier delays or
          shipping fees.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {DROP_SPOTS.map((spot) => (
            <div
              key={spot.name}
              className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70"
            >
              <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                <span>{spot.name}</span>
              </div>
              <p className="text-xs font-mono text-[#1E3A8A] mt-1">{spot.timing}</p>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{spot.landmark}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
