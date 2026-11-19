import { useState } from 'react';
import {
  CheckCircle2,
  Lock,
  MapPin,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react';
import { RentalOrder } from '../types';
import { ProductImage } from './ProductImage';
import { UserAvatar } from './UserAvatar';

interface MyRentalsViewProps {
  rentals: RentalOrder[];
  onConfirmPickup: (orderId: string) => void;
  onReturnAndRefund: (orderId: string) => void;
  onGoToBrowse: () => void;
}

export function MyRentalsView({
  rentals,
  onConfirmPickup,
  onReturnAndRefund,
  onGoToBrowse,
}: MyRentalsViewProps) {
  const [filter, setFilter] = useState<'active' | 'history'>('active');

  const activeRentals = rentals.filter((r) => r.escrowStatus !== 'Deposit Refunded');
  const completedRentals = rentals.filter((r) => r.escrowStatus === 'Deposit Refunded');
  const displayedRentals = filter === 'active' ? activeRentals : completedRentals;

  const heldEscrowTotal = activeRentals.reduce((sum, r) => sum + r.depositAmount, 0);
  const totalSaved = rentals.reduce(
    (sum, r) => sum + Math.max(0, r.retailPrice - (r.rentalFee + r.platformFee)),
    0
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-[#1E3A8A] mb-1">
            CampusLend Escrow Ledger
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Rentals &amp; Deposits
          </h1>
        </div>

        {/* Interactive Filter Segmented Control */}
        <div className="inline-flex items-center p-1 bg-slate-200/70 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setFilter('active')}
            className={`min-h-[38px] px-4 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
              filter === 'active'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Active ({activeRentals.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('history')}
            className={`min-h-[38px] px-4 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
              filter === 'history'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Returned ({completedRentals.length})
          </button>
        </div>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
          <p className="text-xs font-medium text-slate-500">Deposits Held in Escrow</p>
          <p className="font-mono text-2xl font-bold text-emerald-700 mt-1.5 tabular-nums">
            ₹{heldEscrowTotal.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-slate-500 mt-1">100% refundable upon drop-spot return</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
          <p className="text-xs font-medium text-slate-500">Active Campus Rentals</p>
          <p className="font-mono text-2xl font-bold text-[#1E3A8A] mt-1.5 tabular-nums">
            {activeRentals.length}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {completedRentals.length} completed with full refund
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
          <p className="text-xs font-medium text-slate-500">Total Saved vs. Retail</p>
          <p className="font-mono text-2xl font-bold text-slate-900 mt-1.5 tabular-nums">
            ₹{totalSaved.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-emerald-700 mt-1 font-medium">
            Across {rentals.length} verified peer rentals
          </p>
        </div>
      </div>

      {/* Rental Cards List */}
      {displayedRentals.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 py-14 px-6 text-center">
          <ShoppingBag className="w-9 h-9 text-slate-300 mx-auto mb-3" />
          <p className="font-display text-base font-bold text-slate-900">
            {filter === 'active' ? 'No active rentals yet' : 'No returned rentals yet'}
          </p>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            {filter === 'active'
              ? 'Browse verified appliances, blazers, and academic kits from hostel peers in Dehradun.'
              : 'Completed rentals and refunded escrow receipts will appear here.'}
          </p>
          {filter === 'active' && (
            <button
              type="button"
              onClick={onGoToBrowse}
              className="mt-5 min-h-[44px] px-5 rounded-xl bg-[#1E3A8A] hover:bg-[#172554] text-white text-sm font-semibold transition-colors cursor-pointer"
            >
              Browse Campus Catalog
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {displayedRentals.map((order) => {
            const isRefunded = order.escrowStatus === 'Deposit Refunded';
            const isCheckedIn = order.escrowStatus === 'In Use · Checked In';

            return (
              <article
                key={order.id}
                className="bg-white rounded-2xl border border-slate-200/85 p-5 sm:p-6"
              >
                <div className="flex flex-col md:flex-row gap-5">
                  {/* Thumbnail */}
                  <div className="w-full md:w-44 aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 border border-slate-200/70 shrink-0">
                    <ProductImage
                      src={order.itemImage}
                      alt={order.itemTitle}
                      category={order.itemCategory}
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      {/* Top line: Order ID & Explicit Escrow Status */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span className="font-mono font-semibold text-slate-700 tabular-nums">
                            {order.id}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>Booked {order.bookedAt}</span>
                        </div>

                        <div
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                            isRefunded ? 'text-slate-600' : 'text-emerald-700'
                          }`}
                        >
                          {isRefunded ? (
                            <CheckCircle2 className="w-4 h-4 text-slate-500" />
                          ) : (
                            <Lock className="w-3.5 h-3.5 text-[#10B981]" />
                          )}
                          <span>{order.escrowStatus}</span>
                        </div>
                      </div>

                      <h2 className="font-display text-lg font-bold text-slate-900 leading-snug">
                        {order.itemTitle}
                      </h2>

                      <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-600">
                        <span className="inline-flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
                          <span>
                            Lender: <strong className="text-slate-800">{order.lenderName}</strong> (
                            {order.lenderHostel})
                          </span>
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#1E3A8A]" />
                          <span>
                            Drop-Spot: <strong className="text-slate-800">{order.dropSpot}</strong>
                          </span>
                        </span>
                        {order.borrowerName && (
                          <span className="inline-flex items-center gap-1.5">
                            <UserAvatar
                              name={order.borrowerName}
                              photoURL={order.borrowerPhotoURL}
                              size="xs"
                            />
                            <span>
                              Booked by{' '}
                              <strong className="text-slate-800">{order.borrowerName}</strong>
                              {order.borrowerEmail && (
                                <span className="font-mono text-slate-500">
                                  {' '}
                                  ({order.borrowerEmail})
                                </span>
                              )}
                            </span>
                          </span>
                        )}
                      </div>

                      {/* Itemized Tabular Figures */}
                      <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div>
                          <span className="text-slate-500 block">Duration</span>
                          <span className="font-semibold text-slate-900 mt-0.5 block">
                            {order.durationLabel}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Return Due</span>
                          <span className="font-mono font-semibold text-slate-900 mt-0.5 block tabular-nums">
                            {order.returnDueDate}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Escrow Deposit</span>
                          <span
                            className={`font-mono font-semibold mt-0.5 block tabular-nums ${
                              isRefunded ? 'text-slate-600' : 'text-emerald-700'
                            }`}
                          >
                            ₹{order.depositAmount}{' '}
                            {isRefunded ? '(Refunded)' : '(Held)'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Total Paid (UPI)</span>
                          <span className="font-mono font-semibold text-slate-900 mt-0.5 block tabular-nums">
                            ₹{order.totalPaid}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Row */}
                    {!isRefunded && (
                      <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                        <span className="text-xs text-slate-500 font-mono tabular-nums">
                          Ref: {order.upiRef}
                        </span>
                        <div className="flex flex-col sm:flex-row gap-2.5">
                          {!isCheckedIn && (
                            <button
                              type="button"
                              onClick={() => onConfirmPickup(order.id)}
                              className="min-h-[42px] px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-800 transition-colors cursor-pointer"
                            >
                              Mark Picked Up (Condition OK)
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onReturnAndRefund(order.id)}
                            className="min-h-[42px] px-4 rounded-xl bg-[#1E3A8A] hover:bg-[#172554] text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span className="tabular-nums">
                              Complete Return &amp; Refund ₹{order.depositAmount}
                            </span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
