import { useEffect, useState } from 'react';
import { CheckCircle2, Lock, MapPin, ShieldCheck, X } from 'lucide-react';
import { RentalOrder } from '../types';
import { ProductImage } from './ProductImage';

interface ReturnCheckoutModalProps {
  order: RentalOrder | null;
  onClose: () => void;
  onConfirmReturn: (orderId: string) => void;
}

export function ReturnCheckoutModal({
  order,
  onClose,
  onConfirmReturn,
}: ReturnCheckoutModalProps) {
  const [workingOk, setWorkingOk] = useState(false);
  const [accessoriesIntact, setAccessoriesIntact] = useState(false);
  const [handoverConfirmed, setHandoverConfirmed] = useState(false);

  useEffect(() => {
    if (order) {
      setWorkingOk(false);
      setAccessoriesIntact(false);
      setHandoverConfirmed(false);
    }
  }, [order]);

  if (!order) return null;

  const allChecked = workingOk && accessoriesIntact && handoverConfirmed;
  const isLentOrder = order.orderRole === 'lent';

  const handleConfirm = () => {
    if (!allChecked) return;
    onConfirmReturn(order.id);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-xs p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="return-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl border border-slate-200 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile sheet drag handle */}
        <div className="sm:hidden flex justify-center pt-3">
          <div className="w-10 h-1.5 rounded-full bg-slate-300" />
        </div>

        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-slate-100 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-[#1E3A8A] mb-1">
              <ShieldCheck className="w-4 h-4 text-[#10B981]" />
              <span>Condition Check-Out · Escrow Release</span>
            </div>
            <h2
              id="return-modal-title"
              className="font-display text-xl font-bold text-slate-900 tracking-tight"
            >
              Confirm Return &amp; Release Deposit
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close return confirmation modal"
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5">
          {/* Item & Order Summary */}
          <div className="flex items-center gap-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="w-20 h-15 rounded-lg overflow-hidden bg-slate-100 border border-slate-200/70 shrink-0">
              <ProductImage
                src={order.itemImage}
                alt={order.itemTitle}
                category={order.itemCategory}
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="font-mono font-semibold text-[#1E3A8A]">{order.id}</span>
                <span aria-hidden="true">·</span>
                <span>{order.durationLabel}</span>
              </div>
              <h3 className="font-display text-sm font-bold text-slate-900 leading-snug line-clamp-1 mt-0.5">
                {order.itemTitle}
              </h3>
              <div className="flex items-center gap-1 text-xs text-slate-600 mt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Return Drop-Spot: {order.dropSpot}</span>
              </div>
            </div>
          </div>

          {/* Escrow Refund Banner */}
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-emerald-700 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-emerald-950">
                  {isLentOrder
                    ? 'Borrower Escrow Deposit to Release'
                    : '100% Security Deposit Refund via UPI'}
                </p>
                <p className="text-[11px] text-emerald-800 mt-0.5">
                  Instant release upon completing the 3-point condition check-out
                </p>
              </div>
            </div>
            <span className="font-mono text-lg font-bold text-emerald-700 tabular-nums shrink-0">
              ₹{order.depositAmount}
            </span>
          </div>

          {/* Condition Check-Out Checklist */}
          <fieldset className="space-y-2.5">
            <legend className="text-xs font-semibold text-slate-700 mb-2">
              Condition Check-Out Verification
            </legend>

            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={workingOk}
                onChange={(e) => setWorkingOk(e.target.checked)}
                className="mt-0.5 w-5 h-5 rounded border-slate-300 text-[#1E3A8A] focus:ring-[#1E3A8A] shrink-0 cursor-pointer"
              />
              <span className="text-xs text-slate-700 leading-relaxed">
                <strong className="font-semibold text-slate-900 block">
                  Working Condition Verified
                </strong>
                Item has been tested and shows no new physical damage or functional faults.
              </span>
            </label>

            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={accessoriesIntact}
                onChange={(e) => setAccessoriesIntact(e.target.checked)}
                className="mt-0.5 w-5 h-5 rounded border-slate-300 text-[#1E3A8A] focus:ring-[#1E3A8A] shrink-0 cursor-pointer"
              />
              <span className="text-xs text-slate-700 leading-relaxed">
                <strong className="font-semibold text-slate-900 block">
                  All Parts &amp; Accessories Returned
                </strong>
                Power cords, hangers, locks, or bundled tools included at pickup are intact.
              </span>
            </label>

            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={handoverConfirmed}
                onChange={(e) => setHandoverConfirmed(e.target.checked)}
                className="mt-0.5 w-5 h-5 rounded border-slate-300 text-[#1E3A8A] focus:ring-[#1E3A8A] shrink-0 cursor-pointer"
              />
              <span className="text-xs text-slate-700 leading-relaxed">
                <strong className="font-semibold text-slate-900 block">
                  Drop-Spot Handover Completed
                </strong>
                Handover verified at{' '}
                <span className="font-semibold text-slate-900">{order.dropSpot}</span> with{' '}
                {isLentOrder ? order.borrowerName || 'the borrower' : order.lenderName}.
              </span>
            </label>
          </fieldset>

          {/* Action Buttons */}
          <div className="pt-1 flex flex-col-reverse sm:flex-row gap-3">
            <button
              type="button"
              onClick={onClose}
              className="sm:w-1/3 min-h-[46px] rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!allChecked}
              onClick={handleConfirm}
              className={`sm:w-2/3 min-h-[46px] rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2 transition-all ${
                allChecked
                  ? 'bg-[#10B981] hover:bg-emerald-600 text-white cursor-pointer active:scale-[0.99]'
                  : 'bg-slate-200 text-slate-500 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span className="tabular-nums">
                Release ₹{order.depositAmount} Escrow Deposit
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
