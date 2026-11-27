import { useMemo, useState } from 'react';
import {
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Lock,
  MapPin,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react';
import { RentalOrder, StudentProfile } from '../types';
import { ProductImage } from './ProductImage';
import { ReturnCheckoutModal } from './ReturnCheckoutModal';
import { UserAvatar } from './UserAvatar';

interface OrderHistoryViewProps {
  rentals: RentalOrder[];
  profile: StudentProfile;
  onReturnAndRefund: (orderId: string) => void;
  onGoToBrowse: () => void;
  onOpenVerifyModal: () => void;
}

type OrderFilter = 'all' | 'active' | 'completed' | 'lent';

export function OrderHistoryView({
  rentals,
  profile,
  onReturnAndRefund,
  onGoToBrowse,
  onOpenVerifyModal,
}: OrderHistoryViewProps) {
  const [filter, setFilter] = useState<OrderFilter>('all');
  const [checkoutOrder, setCheckoutOrder] = useState<RentalOrder | null>(null);

  const counts = useMemo(() => {
    const active = rentals.filter((r) => r.escrowStatus !== 'Deposit Refunded').length;
    const completed = rentals.filter((r) => r.escrowStatus === 'Deposit Refunded').length;
    const lent = rentals.filter((r) => r.orderRole === 'lent').length;
    return {
      all: rentals.length,
      active,
      completed,
      lent,
    };
  }, [rentals]);

  const filteredOrders = useMemo(() => {
    switch (filter) {
      case 'active':
        return rentals.filter((r) => r.escrowStatus !== 'Deposit Refunded');
      case 'completed':
        return rentals.filter((r) => r.escrowStatus === 'Deposit Refunded');
      case 'lent':
        return rentals.filter((r) => r.orderRole === 'lent');
      default:
        return rentals;
    }
  }, [rentals, filter]);

  const heldEscrowTotal = rentals
    .filter((r) => r.escrowStatus !== 'Deposit Refunded')
    .reduce((sum, r) => sum + r.depositAmount, 0);

  const refundedDepositsTotal = rentals
    .filter((r) => r.escrowStatus === 'Deposit Refunded')
    .reduce((sum, r) => sum + r.depositAmount, 0);

  const retailSavingsTotal = rentals
    .filter((r) => r.orderRole === 'borrowed')
    .reduce(
      (sum, r) => sum + Math.max(0, r.retailPrice - (r.rentalFee + r.platformFee)),
      0
    );

  const totalSavedAndRefunded = retailSavingsTotal + refundedDepositsTotal;

  const filterOptions: { id: OrderFilter; label: string; count: number }[] = [
    { id: 'all', label: 'All Orders', count: counts.all },
    { id: 'active', label: 'Active Rentals', count: counts.active },
    { id: 'completed', label: 'Completed & Returned', count: counts.completed },
    { id: 'lent', label: 'Items I Lent Out', count: counts.lent },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header & Logged-in Google Account Strip */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-[#1E3A8A] mb-1">
            CampusLend Escrow &amp; Handover Ledger
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Order History
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Track active rentals, campus drop-spot pickups, escrow deposits, and items you lent out.
          </p>
        </div>

        {profile.isSignedIn ? (
          <div className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200/85 self-start md:self-auto">
            <UserAvatar name={profile.fullName} photoURL={profile.photoURL} size="sm" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate">{profile.fullName}</p>
              <p className="text-[11px] font-mono text-slate-500 truncate">{profile.email}</p>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={onOpenVerifyModal}
            className="min-h-[40px] px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-[#1E3A8A] self-start md:self-auto whitespace-nowrap cursor-pointer"
          >
            Sign in with Google to sync orders →
          </button>
        )}
      </div>

      {/* 3-Column Tabular Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/85 p-5">
          <p className="text-xs font-medium text-slate-500">Total Saved / Refunded</p>
          <p className="font-mono text-2xl font-bold text-emerald-700 mt-1.5 tabular-nums">
            ₹{totalSavedAndRefunded.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-slate-500 mt-1 tabular-nums">
            ₹{retailSavingsTotal.toLocaleString('en-IN')} saved vs. retail · ₹
            {refundedDepositsTotal.toLocaleString('en-IN')} deposits refunded
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/85 p-5">
          <p className="text-xs font-medium text-slate-500">Deposits Held Safely in Escrow</p>
          <p className="font-mono text-2xl font-bold text-[#1E3A8A] mt-1.5 tabular-nums">
            ₹{heldEscrowTotal.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-slate-500 mt-1 tabular-nums">
            Across {counts.active} active {counts.active === 1 ? 'order' : 'orders'}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/85 p-5">
          <p className="text-xs font-medium text-slate-500">Completed &amp; Lent Activity</p>
          <p className="font-mono text-2xl font-bold text-slate-900 mt-1.5 tabular-nums">
            {counts.completed} Returned · {counts.lent} Lent
          </p>
          <p className="text-xs text-emerald-700 mt-1 font-medium">
            100% on-time campus drop-spot record
          </p>
        </div>
      </div>

      {/* Interactive Filter Tabs */}
      <div
        role="tablist"
        aria-label="Filter order history"
        className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1"
      >
        {filterOptions.map((opt) => {
          const isActive = filter === opt.id;
          return (
            <button
              key={opt.id}
              role="tab"
              aria-selected={isActive}
              type="button"
              onClick={() => setFilter(opt.id)}
              className={`min-h-[40px] px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-[#1E3A8A] text-white font-semibold'
                  : 'bg-white text-slate-600 border border-slate-200/85 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              {opt.label}{' '}
              <span
                className={`font-mono text-xs ml-1 tabular-nums ${
                  isActive ? 'text-blue-200' : 'text-slate-400'
                }`}
              >
                ({opt.count})
              </span>
            </button>
          );
        })}
      </div>

      {/* Chronological Order Cards */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/85 py-14 px-6 text-center">
          <ShoppingBag className="w-9 h-9 text-slate-300 mx-auto mb-3" />
          <p className="font-display text-base font-bold text-slate-900">
            No orders in this category yet
          </p>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            {filter === 'lent'
              ? 'Publish an idle item under My Listings so verified peers can rent from you.'
              : 'Browse verified campus gear to book your first escrow-protected rental.'}
          </p>
          <button
            type="button"
            onClick={onGoToBrowse}
            className="mt-5 min-h-[44px] px-5 rounded-xl bg-[#1E3A8A] hover:bg-[#172554] text-white text-sm font-semibold transition-colors cursor-pointer"
          >
            Browse Campus Catalog
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isCompleted = order.escrowStatus === 'Deposit Refunded';
            const isLent = order.orderRole === 'lent';

            const effectiveBorrowerName = isLent
              ? order.borrowerName || 'Verified Peer'
              : order.borrowerName || (profile.isSignedIn ? profile.fullName : 'You');
            const effectiveBorrowerEmail = isLent
              ? order.borrowerEmail
              : order.borrowerEmail || (profile.isSignedIn ? profile.email : undefined);
            const effectiveBorrowerPhoto = isLent
              ? order.borrowerPhotoURL
              : order.borrowerPhotoURL || (profile.isSignedIn ? profile.photoURL : undefined);

            return (
              <article
                key={order.id}
                className="bg-white rounded-2xl border border-slate-200/85 p-5 sm:p-6 transition-colors hover:border-slate-300"
              >
                <div className="flex flex-col lg:flex-row gap-5">
                  {/* Thumbnail */}
                  <div className="w-full lg:w-48 aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 border border-slate-200/70 shrink-0">
                    <ProductImage
                      src={order.itemImage}
                      alt={order.itemTitle}
                      category={order.itemCategory}
                    />
                  </div>

                  {/* Card Body */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      {/* Top Meta Line + Semantic Status Indicator */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500">
                          <span className="font-mono font-bold text-[#1E3A8A] tabular-nums">
                            {order.id}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="font-medium text-slate-600">{order.itemCategory}</span>
                          {isLent && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="inline-flex items-center gap-0.5 font-semibold text-[#1E3A8A]">
                                <ArrowUpRight className="w-3.5 h-3.5" />
                                Item You Lent Out
                              </span>
                            </>
                          )}
                        </div>

                        {/* Status Badge: Active (Amber/Blue) vs Completed (Emerald) */}
                        {isCompleted ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-200/90 text-xs font-semibold text-emerald-800 whitespace-nowrap tabular-nums">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                            <span>
                              Completed — Deposit Refunded (₹{order.depositAmount})
                            </span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-50 border border-amber-200/90 text-xs font-semibold text-amber-900 whitespace-nowrap">
                            <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>Active — Deposit Held Safely</span>
                          </span>
                        )}
                      </div>

                      {/* Item Title */}
                      <h2 className="font-display text-lg font-bold text-slate-900 leading-snug">
                        {order.itemTitle}
                      </h2>

                      {/* Dates, Duration, Drop-Spot & Peer Identity */}
                      <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-600">
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-mono tabular-nums">
                            {order.bookedAt} – {order.returnDueDate}
                          </span>
                          <span aria-hidden="true" className="text-slate-300">
                            ·
                          </span>
                          <strong className="text-slate-800">{order.durationLabel}</strong>
                        </span>

                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#1E3A8A] shrink-0" />
                          <span>
                            Drop-Spot: <strong className="text-slate-800">{order.dropSpot}</strong>
                          </span>
                        </span>

                        {isLent ? (
                          <span className="inline-flex items-center gap-1.5">
                            <UserAvatar
                              name={effectiveBorrowerName}
                              photoURL={effectiveBorrowerPhoto}
                              size="xs"
                            />
                            <span>
                              Rented by{' '}
                              <strong className="text-slate-800">{effectiveBorrowerName}</strong>
                            </span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                            <span>
                              Lender: <strong className="text-slate-800">{order.lenderName}</strong>{' '}
                              ({order.lenderHostel})
                            </span>
                          </span>
                        )}
                      </div>

                      {/* Payment & Escrow Breakdown */}
                      <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div>
                          <span className="text-slate-500 block">Rental Fee</span>
                          <span className="font-mono font-semibold text-slate-900 mt-0.5 block tabular-nums">
                            ₹{order.rentalFee}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Platform Fee</span>
                          <span className="font-mono font-semibold text-slate-900 mt-0.5 block tabular-nums">
                            ₹{order.platformFee}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Security Deposit</span>
                          <span
                            className={`font-mono font-semibold mt-0.5 block tabular-nums ${
                              isCompleted ? 'text-emerald-700' : 'text-amber-800'
                            }`}
                          >
                            ₹{order.depositAmount}{' '}
                            <span className="font-sans font-normal text-slate-500">
                              {isCompleted ? '(Refunded)' : '(In Escrow)'}
                            </span>
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Total UPI Paid</span>
                          <span className="font-mono font-bold text-[#1E3A8A] mt-0.5 block tabular-nums">
                            ₹{order.totalPaid}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Footer Action Row */}
                    <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-500">
                        <span className="font-mono font-medium text-slate-700 tabular-nums">
                          {order.upiRef}
                        </span>
                        {order.paymentMethod && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-medium text-slate-600">
                              {order.paymentMethod}
                            </span>
                          </>
                        )}
                        {!isLent && profile.isSignedIn && effectiveBorrowerEmail && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="inline-flex items-center gap-1.5">
                              <UserAvatar
                                name={effectiveBorrowerName}
                                photoURL={effectiveBorrowerPhoto}
                                size="xs"
                              />
                              <span className="font-mono truncate max-w-[180px]">
                                {effectiveBorrowerEmail}
                              </span>
                            </span>
                          </>
                        )}
                        {isCompleted && order.returnedAt && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-emerald-700 font-medium">
                              Returned {order.returnedAt}
                            </span>
                          </>
                        )}
                      </div>

                      {!isCompleted && (
                        <button
                          type="button"
                          onClick={() => setCheckoutOrder(order)}
                          className="min-h-[44px] px-4 rounded-xl bg-[#1E3A8A] hover:bg-[#172554] active:scale-[0.99] text-white text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 transition-all whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          <RotateCcw className="w-4 h-4" />
                          <span>Mark Returned &amp; Release Deposit</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Condition Check-Out Confirmation Modal */}
      <ReturnCheckoutModal
        order={checkoutOrder}
        onClose={() => setCheckoutOrder(null)}
        onConfirmReturn={onReturnAndRefund}
      />
    </div>
  );
}
