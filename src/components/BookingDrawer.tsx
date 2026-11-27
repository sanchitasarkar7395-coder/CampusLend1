import { useEffect, useState } from 'react';
import {
  ArrowRight,
  Lock,
  MapPin,
  ShieldCheck,
  X,
} from 'lucide-react';
import {
  DROP_SPOTS,
  DURATION_OPTIONS,
  PLATFORM_SERVICE_FEE,
} from '../data/mockData';
import {
  CatalogItem,
  DropSpot,
  RentalDurationId,
  RentalOrder,
  StudentProfile,
} from '../types';
import { PaymentGatewayModal } from './PaymentGatewayModal';
import { ProductImage } from './ProductImage';
import { UserAvatar } from './UserAvatar';

interface BookingDrawerProps {
  item: CatalogItem | null;
  profile: StudentProfile;
  onClose: () => void;
  onOpenVerify: () => void;
  onConfirmBooking: (order: RentalOrder) => void;
  onGoToRentals: () => void;
}

export function BookingDrawer({
  item,
  profile,
  onClose,
  onOpenVerify,
  onConfirmBooking,
  onGoToRentals,
}: BookingDrawerProps) {
  const [durationId, setDurationId] = useState<RentalDurationId>('1_month');
  const [dropSpot, setDropSpot] = useState<DropSpot>('Main Cafeteria');
  const [conditionChecked, setConditionChecked] = useState(false);
  const [isGatewayOpen, setIsGatewayOpen] = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState('#CL-2026-109');

  useEffect(() => {
    if (item) {
      setDurationId(item.billingUnit === 'event' ? '3_days' : '1_month');
      setDropSpot('Main Cafeteria');
      setConditionChecked(false);
      setIsGatewayOpen(false);
      setPendingOrderId(`#CL-2026-${Math.floor(105 + Math.random() * 890)}`);
    }
  }, [item]);

  if (!item) return null;

  const selectedDuration =
    DURATION_OPTIONS.find((opt) => opt.id === durationId) ?? DURATION_OPTIONS[1];
  const rentalFee = selectedDuration.getFee(item);
  const depositAmount = item.deposit;
  const totalPayable = rentalFee + depositAmount + PLATFORM_SERVICE_FEE;
  const selectedSpotInfo = DROP_SPOTS.find((spot) => spot.name === dropSpot) ?? DROP_SPOTS[0];
  const savingsVsRetail = Math.max(0, item.retailPrice - rentalFee);

  const handleProceedToPay = () => {
    if (!conditionChecked) return;
    setIsGatewayOpen(true);
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-end md:items-stretch md:justify-end bg-slate-900/50 backdrop-blur-xs"
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-drawer-title"
        onClick={onClose}
      >
        <div
          className="w-full md:max-w-[500px] bg-white rounded-t-3xl md:rounded-none md:rounded-l-2xl shadow-2xl border-t md:border-t-0 md:border-l border-slate-200 max-h-[92vh] md:max-h-screen flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Mobile sheet drag handle */}
          <div className="md:hidden flex justify-center pt-3">
            <div className="w-10 h-1.5 rounded-full bg-slate-300" />
          </div>

          {/* Drawer Header */}
          <div className="px-5 sm:px-6 pt-4 pb-4 border-b border-slate-100 flex items-center justify-between gap-4 shrink-0">
            <div>
              <p className="text-xs font-medium text-[#1E3A8A]">CampusLend Escrow Booking</p>
              <h2
                id="booking-drawer-title"
                className="font-display text-lg font-bold text-slate-900 tracking-tight"
              >
                Reserve Campus Gear
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close booking drawer"
              className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-6">
            {/* Item Summary Row */}
            <div className="flex items-center gap-4 pb-5 border-b border-slate-100">
              <div className="w-20 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200/70">
                <ProductImage
                  src={item.imageUrl}
                  alt={item.title}
                  category={item.category}
                />
              </div>
              <div className="min-w-0">
                <h3 className="font-display text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                  {item.title}
                </h3>
                <div className="flex items-center flex-wrap gap-x-1.5 gap-y-0.5 text-xs text-slate-500 mt-1">
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
                    {item.lenderName}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{item.hostelBlock}</span>
                </div>
              </div>
            </div>

            {/* Synced Borrower Account or Sign-In Prompt */}
            {profile.isSignedIn ? (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <UserAvatar
                    name={profile.fullName}
                    photoURL={profile.photoURL}
                    size="sm"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900 truncate">
                      Booking as {profile.fullName}
                    </p>
                    <p className="text-[11px] font-mono text-slate-500 truncate">
                      {profile.email}
                    </p>
                  </div>
                </div>
                {!profile.isVerified && (
                  <button
                    type="button"
                    onClick={onOpenVerify}
                    className="text-xs font-semibold text-[#1E3A8A] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Verify ID
                  </button>
                )}
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                <div className="text-xs text-slate-600 leading-relaxed">
                  Sign in with Google to attach your verified name &amp; Gmail receipt to this
                  escrow booking.
                </div>
                <button
                  type="button"
                  onClick={onOpenVerify}
                  className="text-xs font-semibold text-[#1E3A8A] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Sign In
                </button>
              </div>
            )}

            {/* Step 1: Select Rental Duration */}
            <section aria-labelledby="duration-heading">
              <h3 id="duration-heading" className="text-xs font-semibold text-slate-700 mb-2.5">
                1. Select Rental Duration
              </h3>
              <div className="grid grid-cols-1 gap-2.5">
                {DURATION_OPTIONS.map((opt) => {
                  const fee = opt.getFee(item);
                  const isSelected = opt.id === durationId;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setDurationId(opt.id)}
                      className={`w-full text-left px-4 py-3 rounded-xl border transition-colors flex items-center justify-between gap-3 cursor-pointer ${
                        isSelected
                          ? 'border-[#1E3A8A] bg-[#1E3A8A]/[0.04]'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{opt.label}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{opt.sublabel}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-mono text-sm font-bold text-[#1E3A8A] tabular-nums">
                          ₹{fee}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Step 2: Campus Drop-Spot Selection */}
            <section aria-labelledby="dropspot-heading">
              <label
                id="dropspot-heading"
                htmlFor="drop-spot-select"
                className="block text-xs font-semibold text-slate-700 mb-2"
              >
                2. Choose Campus Drop-Spot (Walking Distance)
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-[#1E3A8A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  id="drop-spot-select"
                  value={dropSpot}
                  onChange={(e) => setDropSpot(e.target.value as DropSpot)}
                  className="w-full min-h-[46px] pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
                >
                  {DROP_SPOTS.map((spot) => (
                    <option key={spot.name} value={spot.name}>
                      {spot.name} ({spot.timing})
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Handover point: {selectedSpotInfo.landmark}
              </p>
            </section>

            {/* Step 3: Transparent Escrow Cost Breakdown */}
            <section aria-labelledby="breakdown-heading">
              <div className="flex items-center justify-between mb-2.5">
                <h3 id="breakdown-heading" className="text-xs font-semibold text-slate-700">
                  3. Transparent Cost &amp; Escrow Breakdown
                </h3>
                {savingsVsRetail > 0 && (
                  <span className="text-xs font-semibold text-emerald-700 tabular-nums">
                    You save ₹{savingsVsRetail.toLocaleString('en-IN')} vs. retail
                  </span>
                )}
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 divide-y divide-slate-200/70 text-sm">
                <div className="px-4 py-3 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-slate-700 font-medium">Rental Fee</span>
                    <p className="text-xs text-slate-500">
                      Paid to peer lender ({item.lenderName})
                    </p>
                  </div>
                  <span className="font-mono font-semibold text-slate-900 tabular-nums">
                    ₹{rentalFee}
                  </span>
                </div>

                <div className="px-4 py-3 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-slate-700 font-medium flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-[#10B981]" />
                      Refundable Security Deposit
                    </span>
                    <p className="text-xs text-emerald-700">
                      Held safely in CampusLend Escrow · 100% refunded on return
                    </p>
                  </div>
                  <span className="font-mono font-semibold text-emerald-700 tabular-nums">
                    ₹{depositAmount}
                  </span>
                </div>

                <div className="px-4 py-3 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-slate-700 font-medium">Platform Service Fee</span>
                    <p className="text-xs text-slate-500">ID verification &amp; escrow protection</p>
                  </div>
                  <span className="font-mono font-semibold text-slate-900 tabular-nums">
                    ₹{PLATFORM_SERVICE_FEE}
                  </span>
                </div>

                <div className="px-4 py-3.5 flex items-center justify-between gap-4 bg-white rounded-b-xl">
                  <span className="font-display font-bold text-slate-900">Total Payable</span>
                  <span className="font-mono text-base font-bold text-[#1E3A8A] tabular-nums">
                    ₹{totalPayable}
                  </span>
                </div>
              </div>
            </section>

            {/* Step 4: Mandatory Condition Check-In Toggle */}
            <section>
              <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-white cursor-pointer hover:border-slate-300 transition-colors">
                <input
                  type="checkbox"
                  checked={conditionChecked}
                  onChange={(e) => setConditionChecked(e.target.checked)}
                  className="mt-0.5 w-5 h-5 rounded border-slate-300 text-[#1E3A8A] focus:ring-[#1E3A8A] shrink-0 cursor-pointer"
                />
                <span className="text-xs text-slate-700 leading-relaxed">
                  <strong className="font-semibold text-slate-900 block mb-0.5">
                    Mandatory Condition Check-In Agreement
                  </strong>
                  I confirm I will inspect and verify the item&apos;s working condition at{' '}
                  <span className="font-semibold text-slate-900">{dropSpot}</span> during pickup to
                  guarantee a 100% instant escrow deposit refund upon return.
                </span>
              </label>
            </section>
          </div>

          {/* Sticky Footer CTA */}
          <div className="p-5 sm:px-6 border-t border-slate-200 bg-white shrink-0 pb-safe">
            <button
              type="button"
              disabled={!conditionChecked}
              onClick={handleProceedToPay}
              className={`w-full min-h-[48px] rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                conditionChecked
                  ? 'bg-[#1E3A8A] hover:bg-[#172554] text-white cursor-pointer active:scale-[0.99]'
                  : 'bg-slate-200 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span className="tabular-nums">Proceed to Pay ₹{totalPayable}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            {!conditionChecked && (
              <p className="text-[11px] text-slate-500 text-center mt-2">
                Tick the Condition Check-In agreement above to open CampusLend Secure Checkout.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Razorpay-style Indian Payment Gateway Modal */}
      <PaymentGatewayModal
        isOpen={isGatewayOpen}
        orderId={pendingOrderId}
        item={item}
        duration={selectedDuration}
        dropSpot={dropSpot}
        rentalFee={rentalFee}
        depositAmount={depositAmount}
        totalPayable={totalPayable}
        profile={profile}
        onClose={(paymentCompleted) => {
          setIsGatewayOpen(false);
          if (paymentCompleted) {
            onClose();
          }
        }}
        onPaymentComplete={onConfirmBooking}
        onViewOrderHistory={() => {
          setIsGatewayOpen(false);
          onClose();
          onGoToRentals();
        }}
      />
    </>
  );
}
