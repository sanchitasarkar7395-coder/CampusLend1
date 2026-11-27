import React, { useEffect, useState } from 'react';
import {
  Building2,
  Check,
  CheckCircle2,
  Copy,
  CreditCard,
  Loader2,
  Lock,
  QrCode,
  ShieldCheck,
  Smartphone,
  X,
} from 'lucide-react';
import {
  CatalogItem,
  DropSpot,
  DurationOption,
  RentalOrder,
  StudentProfile,
} from '../types';
import { PLATFORM_SERVICE_FEE } from '../data/mockData';

interface PaymentGatewayModalProps {
  isOpen: boolean;
  orderId: string;
  item: CatalogItem;
  duration: DurationOption;
  dropSpot: DropSpot;
  rentalFee: number;
  depositAmount: number;
  totalPayable: number;
  profile: StudentProfile;
  onClose: (paymentCompleted: boolean) => void;
  onPaymentComplete: (order: RentalOrder) => void;
  onViewOrderHistory: () => void;
}

type PaymentTab = 'upi' | 'card' | 'netbanking';
type GatewayStage = 'select' | 'verifying' | 'success';

const UPI_APPS = [
  { id: 'Google Pay', short: 'GPay', accent: 'text-blue-700 bg-blue-50 border-blue-200' },
  { id: 'PhonePe', short: 'Pe', accent: 'text-purple-700 bg-purple-50 border-purple-200' },
  { id: 'Paytm', short: 'Paytm', accent: 'text-sky-700 bg-sky-50 border-sky-200' },
  { id: 'BHIM', short: 'BHIM', accent: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
];

const INDIAN_BANKS = [
  { id: 'SBI', fullName: 'State Bank of India', code: 'SBI' },
  { id: 'HDFC', fullName: 'HDFC Bank', code: 'HDFC' },
  { id: 'ICICI', fullName: 'ICICI Bank', code: 'ICICI' },
  { id: 'Axis', fullName: 'Axis Bank', code: 'AXIS' },
];

// Deterministic clean scannable-style UPI QR matrix for campuslend@okicici
const QR_PATTERN = [
  '111111101010101111111',
  '100000100110001000001',
  '101110101001101011101',
  '101110100101001011101',
  '101110101110101011101',
  '100000100010001000001',
  '111111101010101111111',
  '000000001100100000000',
  '101101110101011010110',
  '010010001010100101001',
  '110111011011011100101',
  '001001100100100011010',
  '101110111010111010111',
  '000000001001101001001',
  '111111100110101101101',
  '100000101001000010010',
  '101110101110111011101',
  '101110100101001000100',
  '101110101011101110110',
  '100000100100001001001',
  '111111101101101011101',
];

function MockUpiQrCode() {
  return (
    <svg
      viewBox="0 0 21 21"
      className="w-32 h-32 shrink-0 rounded-lg bg-white p-2 border border-slate-200"
      role="img"
      aria-label="CampusLend UPI QR Code for campuslend@okicici"
    >
      <rect width="21" height="21" fill="#FFFFFF" />
      {QR_PATTERN.map((row, y) =>
        row.split('').map((cell, x) =>
          cell === '1' ? (
            <rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width="1"
              height="1"
              fill={
                (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13)
                  ? '#1E3A8A'
                  : '#0F172A'
              }
            />
          ) : null
        )
      )}
    </svg>
  );
}

function addDaysLabel(days: number): string {
  const target = new Date();
  target.setDate(target.getDate() + days);
  return target.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }
  return digits;
}

export function PaymentGatewayModal({
  isOpen,
  orderId,
  item,
  duration,
  dropSpot,
  rentalFee,
  depositAmount,
  totalPayable,
  profile,
  onClose,
  onPaymentComplete,
  onViewOrderHistory,
}: PaymentGatewayModalProps) {
  const [activeTab, setActiveTab] = useState<PaymentTab>('upi');
  const [stage, setStage] = useState<GatewayStage>('select');
  const [processingLabel, setProcessingLabel] = useState('Verifying UPI Payment...');
  const [copiedUpi, setCopiedUpi] = useState(false);

  // UPI state
  const [customUpiId, setCustomUpiId] = useState('');
  const [upiError, setUpiError] = useState('');

  // Card state
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState(profile.fullName || '');
  const [cardError, setCardError] = useState('');

  // Net banking state
  const [selectedBank, setSelectedBank] = useState<string>('SBI');

  // Completed order receipt
  const [completedOrder, setCompletedOrder] = useState<RentalOrder | null>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab('upi');
      setStage('select');
      setProcessingLabel('Verifying UPI Payment...');
      setCopiedUpi(false);
      setCustomUpiId('');
      setUpiError('');
      setCardNumber('');
      setCardExpiry('');
      setCardCvv('');
      setCardName(profile.isSignedIn ? profile.fullName : '');
      setCardError('');
      setSelectedBank('SBI');
      setCompletedOrder(null);
    }
  }, [isOpen, profile.isSignedIn, profile.fullName]);

  if (!isOpen) return null;

  const triggerPaymentVerification = (methodLabel: string, verifyText: string) => {
    setProcessingLabel(verifyText);
    setStage('verifying');

    const now = new Date();
    const bookedDateLabel = now.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const timestampLabel = now.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    const utrId = `UTR${Math.floor(42000000000 + Math.random() * 57999999999)}`;

    const newOrder: RentalOrder = {
      id: orderId,
      itemId: item.id,
      itemTitle: item.title,
      itemImage: item.imageUrl,
      itemCategory: item.category,
      orderRole: 'borrowed',
      lenderName: item.lenderName,
      lenderHostel: item.hostelBlock,
      borrowerName: profile.isSignedIn ? profile.fullName : 'Guest Student',
      borrowerEmail: profile.isSignedIn ? profile.email : undefined,
      borrowerPhotoURL: profile.isSignedIn ? profile.photoURL : undefined,
      durationLabel: duration.label,
      durationId: duration.id,
      rentalFee,
      depositAmount,
      platformFee: PLATFORM_SERVICE_FEE,
      totalPaid: totalPayable,
      retailPrice: item.retailPrice,
      dropSpot,
      conditionCheckedIn: true,
      escrowStatus: 'Deposit Held Safely',
      upiRef: utrId,
      paymentMethod: methodLabel,
      paymentTimestamp: timestampLabel,
      bookedAt: bookedDateLabel,
      returnDueDate: addDaysLabel(duration.days),
    };

    window.setTimeout(() => {
      onPaymentComplete(newOrder);
      setCompletedOrder(newOrder);
      setStage('success');
    }, 2000);
  };

  const handleCopyUpiHandle = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText('campuslend@okicici').catch(() => {});
    }
    setCopiedUpi(true);
    window.setTimeout(() => setCopiedUpi(false), 1800);
  };

  const handleCustomUpiPay = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = customUpiId.trim().toLowerCase();
    if (!/^[a-z0-9._-]{2,}@[a-z]{2,}$/.test(cleaned)) {
      setUpiError('Enter a valid UPI ID (e.g., student@oksbi or name@okhdfcbank).');
      return;
    }
    setUpiError('');
    triggerPaymentVerification(`UPI · ${cleaned}`, 'Verifying UPI Payment...');
  };

  const handleCardPay = (e: React.FormEvent) => {
    e.preventDefault();
    const digits = cardNumber.replace(/\D/g, '');
    if (digits.length < 16) {
      setCardError('Enter a valid 16-digit Debit or Credit Card number.');
      return;
    }
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardExpiry)) {
      setCardError('Enter expiry in MM/YY format.');
      return;
    }
    if (cardCvv.replace(/\D/g, '').length < 3) {
      setCardError('Enter a valid 3-digit CVV.');
      return;
    }
    if (cardName.trim().length < 2) {
      setCardError('Enter the cardholder name.');
      return;
    }
    setCardError('');
    triggerPaymentVerification(
      `Card ·••• ${digits.slice(-4)}`,
      'Verifying Card & Locking Escrow...'
    );
  };

  const handleNetBankingPay = () => {
    triggerPaymentVerification(
      `Net Banking · ${selectedBank}`,
      `Connecting to ${selectedBank} Net Banking...`
    );
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-slate-950/65 backdrop-blur-xs p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-gateway-title"
      onClick={stage === 'verifying' ? undefined : () => onClose(stage === 'success')}
    >
      <div
        className="w-full sm:max-w-3xl bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[94vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Institutional Navy Gateway Header Bar */}
        <div className="bg-[#1E3A8A] text-white px-5 sm:px-6 py-4 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white/12 border border-white/20 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-[#10B981]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2
                  id="payment-gateway-title"
                  className="font-display text-base sm:text-lg font-bold tracking-tight truncate"
                >
                  CampusLend Escrow
                </h2>
                <span className="text-[11px] font-mono text-emerald-300 font-semibold whitespace-nowrap">
                  Secure Checkout
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-2 text-xs text-blue-100/90 mt-0.5">
                <span className="font-mono font-semibold tabular-nums">{orderId}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono truncate max-w-[210px]">
                  {profile.isSignedIn ? profile.email : 'guest.student@gmail.com'}
                </span>
              </div>
            </div>
          </div>

          {stage !== 'verifying' && (
            <button
              type="button"
              onClick={() => onClose(stage === 'success')}
              aria-label="Close payment gateway"
              className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-blue-100 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Gateway Body */}
        <div className="flex-1 overflow-y-auto">
          {stage === 'verifying' ? (
            <div className="py-16 px-6 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#1E3A8A]/8 border border-[#1E3A8A]/15 flex items-center justify-center mb-5">
                <Loader2 className="w-8 h-8 text-[#1E3A8A] animate-spin" />
              </div>
              <h3 className="font-display text-xl font-bold text-slate-900">
                {processingLabel}
              </h3>
              <p className="text-sm text-slate-600 mt-2 max-w-sm leading-relaxed">
                Authorizing{' '}
                <span className="font-mono font-semibold text-slate-900 tabular-nums">
                  ₹{totalPayable}
                </span>{' '}
                and locking your refundable{' '}
                <span className="font-mono font-semibold text-emerald-700 tabular-nums">
                  ₹{depositAmount}
                </span>{' '}
                security deposit in CampusLend Escrow.
              </p>
              <div className="mt-6 inline-flex items-center gap-2 text-xs text-slate-500">
                <Lock className="w-3.5 h-3.5 text-[#10B981]" />
                <span>256-bit Encrypted · Do not close this window</span>
              </div>
            </div>
          ) : stage === 'success' && completedOrder ? (
            <div className="p-6 sm:p-8 max-w-xl mx-auto space-y-6">
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-3.5">
                  <CheckCircle2 className="w-8 h-8 text-[#10B981]" />
                </div>
                <h3 className="font-display text-2xl font-extrabold text-slate-900 tracking-tight">
                  Payment Successful!
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  Your booking is confirmed and logged in Order History.
                </p>
              </div>

              {/* Escrow Protection Banner */}
              <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-[#10B981] shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-emerald-950">
                      Active — Deposit Held Safely in Escrow
                    </p>
                    <p className="text-[11px] text-emerald-800 mt-0.5">
                      ₹{completedOrder.depositAmount} refundable instantly upon drop-spot return
                    </p>
                  </div>
                </div>
                <span className="font-mono text-xs font-bold text-emerald-800 tabular-nums shrink-0">
                  {completedOrder.id}
                </span>
              </div>

              {/* Instant Receipt */}
              <dl className="divide-y divide-slate-100 border border-slate-200 rounded-xl bg-white text-sm">
                <div className="px-4 py-3 flex items-center justify-between gap-4">
                  <dt className="text-slate-500">UTR / Reference ID</dt>
                  <dd className="font-mono font-bold text-[#1E3A8A] tabular-nums">
                    {completedOrder.upiRef}
                  </dd>
                </div>
                <div className="px-4 py-3 flex items-center justify-between gap-4">
                  <dt className="text-slate-500">Timestamp</dt>
                  <dd className="font-mono text-xs text-slate-700 tabular-nums">
                    {completedOrder.paymentTimestamp}
                  </dd>
                </div>
                <div className="px-4 py-3 flex items-center justify-between gap-4">
                  <dt className="text-slate-500">Payment Method</dt>
                  <dd className="font-semibold text-slate-900">{completedOrder.paymentMethod}</dd>
                </div>
                <div className="px-4 py-3 flex items-center justify-between gap-4">
                  <dt className="text-slate-500">Pickup Drop-Spot</dt>
                  <dd className="font-semibold text-slate-900">{completedOrder.dropSpot}</dd>
                </div>
                <div className="px-4 py-3 flex items-center justify-between gap-4 bg-slate-50/80 rounded-b-xl">
                  <dt className="font-display font-bold text-slate-900">Amount Paid</dt>
                  <dd className="font-mono text-base font-bold text-slate-900 tabular-nums">
                    ₹{completedOrder.totalPaid}
                  </dd>
                </div>
              </dl>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => onClose(true)}
                  className="sm:w-1/3 min-h-[46px] rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold transition-colors cursor-pointer"
                >
                  Done
                </button>
                <button
                  type="button"
                  onClick={onViewOrderHistory}
                  className="sm:w-2/3 min-h-[46px] rounded-xl bg-[#1E3A8A] hover:bg-[#172554] text-white text-sm font-semibold transition-colors cursor-pointer"
                >
                  View Receipt in Order History
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12">
              {/* Left Column: Itemized Order & Escrow Summary */}
              <aside className="md:col-span-5 bg-slate-50/90 border-b md:border-b-0 md:border-r border-slate-200 p-5 sm:p-6 flex flex-col justify-between gap-5">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-500">Order Summary</p>
                    <h3 className="font-display text-sm font-bold text-slate-900 mt-1 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {duration.label} · Pickup at {dropSpot}
                    </p>
                  </div>

                  <dl className="space-y-2.5 pt-3 border-t border-slate-200/80 text-xs">
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-slate-600">Rental Fee</dt>
                      <dd className="font-mono font-semibold text-slate-900 tabular-nums">
                        ₹{rentalFee}
                      </dd>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-slate-600">
                        Security Deposit{' '}
                        <span className="text-emerald-700 font-semibold">(Held in Escrow)</span>
                      </dt>
                      <dd className="font-mono font-semibold text-emerald-700 tabular-nums">
                        ₹{depositAmount}
                      </dd>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-slate-600">Platform Service Fee</dt>
                      <dd className="font-mono font-semibold text-slate-900 tabular-nums">
                        ₹{PLATFORM_SERVICE_FEE}
                      </dd>
                    </div>

                    <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
                      <dt className="font-display text-sm font-bold text-slate-900">
                        Total Payable
                      </dt>
                      <dd className="font-mono text-lg font-bold text-[#1E3A8A] tabular-nums">
                        ₹{totalPayable}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 flex items-start gap-2.5">
                  <Lock className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    <strong className="text-slate-900">100% Escrow Protection:</strong> Your{' '}
                    <span className="font-mono font-semibold text-emerald-700 tabular-nums">
                      ₹{depositAmount}
                    </span>{' '}
                    deposit stays locked with CampusLend Escrow and refunds automatically via UPI
                    on return.
                  </p>
                </div>
              </aside>

              {/* Right Column: Indian Payment Methods */}
              <div className="md:col-span-7 p-5 sm:p-6 space-y-5">
                {/* Payment Method Switcher */}
                <div
                  role="tablist"
                  aria-label="Payment methods"
                  className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-100"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === 'upi'}
                    onClick={() => setActiveTab('upi')}
                    className={`min-h-[40px] px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                      activeTab === 'upi'
                        ? 'bg-white text-[#1E3A8A] shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <QrCode className="w-3.5 h-3.5 shrink-0" />
                    <span>UPI / QR</span>
                  </button>

                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === 'card'}
                    onClick={() => setActiveTab('card')}
                    className={`min-h-[40px] px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                      activeTab === 'card'
                        ? 'bg-white text-[#1E3A8A] shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5 shrink-0" />
                    <span>Card</span>
                  </button>

                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === 'netbanking'}
                    onClick={() => setActiveTab('netbanking')}
                    className={`min-h-[40px] px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                      activeTab === 'netbanking'
                        ? 'bg-white text-[#1E3A8A] shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Net Banking</span>
                  </button>
                </div>

                {/* TAB 1: UPI QR & APPS */}
                {activeTab === 'upi' && (
                  <div className="space-y-5">
                    {/* Scannable QR Box */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row items-center gap-4">
                      <MockUpiQrCode />
                      <div className="text-center sm:text-left space-y-2 flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900">
                          Scan with any UPI App
                        </p>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200">
                          <span className="font-mono text-xs font-semibold text-[#1E3A8A]">
                            campuslend@okicici
                          </span>
                          <button
                            type="button"
                            onClick={handleCopyUpiHandle}
                            aria-label="Copy CampusLend UPI ID"
                            className="text-slate-400 hover:text-slate-700 cursor-pointer p-0.5"
                          >
                            {copiedUpi ? (
                              <Check className="w-3.5 h-3.5 text-[#10B981]" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            triggerPaymentVerification(
                              'UPI QR · campuslend@okicici',
                              'Verifying UPI Payment...'
                            )
                          }
                          className="w-full sm:w-auto min-h-[38px] px-3.5 rounded-lg bg-[#10B981] hover:bg-emerald-600 text-white text-xs font-semibold transition-colors cursor-pointer block"
                        >
                          Simulate QR Scan &amp; Pay ₹{totalPayable}
                        </button>
                      </div>
                    </div>

                    {/* One-Click UPI App Buttons */}
                    <div>
                      <p className="text-xs font-semibold text-slate-700 mb-2">
                        Pay Instantly with UPI Apps
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {UPI_APPS.map((app) => (
                          <button
                            key={app.id}
                            type="button"
                            onClick={() =>
                              triggerPaymentVerification(
                                `UPI · ${app.id}`,
                                `Verifying ${app.id} UPI Payment...`
                              )
                            }
                            className="min-h-[54px] px-2.5 py-2 rounded-xl border border-slate-200 bg-white hover:border-[#1E3A8A] hover:bg-slate-50 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-[0.98]"
                          >
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${app.accent}`}
                            >
                              {app.short}
                            </span>
                            <span className="text-xs font-semibold text-slate-800 whitespace-nowrap">
                              {app.id}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom UPI ID Input */}
                    <form onSubmit={handleCustomUpiPay} className="space-y-2.5 pt-2 border-t border-slate-100">
                      <label
                        htmlFor="custom-upi-input"
                        className="block text-xs font-semibold text-slate-700"
                      >
                        Or Pay via Custom UPI ID
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <div className="relative flex-1">
                          <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            id="custom-upi-input"
                            type="text"
                            value={customUpiId}
                            onChange={(e) => {
                              setCustomUpiId(e.target.value);
                              if (upiError) setUpiError('');
                            }}
                            placeholder="e.g., student@oksbi"
                            className="w-full min-h-[44px] pl-9 pr-3 rounded-xl border border-slate-200 text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                          />
                        </div>
                        <button
                          type="submit"
                          className="min-h-[44px] px-5 rounded-xl bg-[#1E3A8A] hover:bg-[#172554] text-white text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer"
                        >
                          Verify &amp; Pay
                        </button>
                      </div>
                      {upiError && (
                        <p role="alert" className="text-xs text-red-700 font-medium">
                          {upiError}
                        </p>
                      )}
                    </form>
                  </div>
                )}

                {/* TAB 2: DEBIT / CREDIT CARD */}
                {activeTab === 'card' && (
                  <form onSubmit={handleCardPay} className="space-y-4">
                    <div>
                      <label
                        htmlFor="card-number"
                        className="block text-xs font-semibold text-slate-700 mb-1.5"
                      >
                        Card Number
                      </label>
                      <input
                        id="card-number"
                        type="text"
                        inputMode="numeric"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                        placeholder="4242 4242 4242 4242"
                        className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-200 font-mono text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label
                          htmlFor="card-expiry"
                          className="block text-xs font-semibold text-slate-700 mb-1.5"
                        >
                          Expiry (MM/YY)
                        </label>
                        <input
                          id="card-expiry"
                          type="text"
                          inputMode="numeric"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                          placeholder="08/29"
                          className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-200 font-mono text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="card-cvv"
                          className="block text-xs font-semibold text-slate-700 mb-1.5"
                        >
                          CVV
                        </label>
                        <input
                          id="card-cvv"
                          type="password"
                          inputMode="numeric"
                          maxLength={4}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                          placeholder="123"
                          className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-200 font-mono text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="card-name"
                        className="block text-xs font-semibold text-slate-700 mb-1.5"
                      >
                        Cardholder Name
                      </label>
                      <input
                        id="card-name"
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="Name on card"
                        className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                      />
                    </div>

                    {cardError && (
                      <p role="alert" className="text-xs font-medium text-red-700">
                        {cardError}
                      </p>
                    )}

                    <button
                      type="submit"
                      className="w-full min-h-[48px] rounded-xl bg-[#1E3A8A] hover:bg-[#172554] text-white text-sm font-semibold transition-colors cursor-pointer tabular-nums"
                    >
                      Pay ₹{totalPayable} Securely
                    </button>
                  </form>
                )}

                {/* TAB 3: NET BANKING */}
                {activeTab === 'netbanking' && (
                  <div className="space-y-4">
                    <p className="text-xs font-semibold text-slate-700">
                      Select Popular Indian Bank
                    </p>
                    <div className="grid grid-cols-2 gap-2.5">
                      {INDIAN_BANKS.map((bank) => {
                        const isPicked = selectedBank === bank.id;
                        return (
                          <button
                            key={bank.id}
                            type="button"
                            onClick={() => setSelectedBank(bank.id)}
                            className={`min-h-[56px] px-3.5 py-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                              isPicked
                                ? 'border-[#1E3A8A] bg-[#1E3A8A]/[0.05]'
                                : 'border-slate-200 bg-white hover:border-slate-300'
                            }`}
                          >
                            <span className="font-mono text-xs font-bold text-[#1E3A8A] block">
                              {bank.code}
                            </span>
                            <span className="text-xs font-medium text-slate-700 block truncate mt-0.5">
                              {bank.fullName}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={handleNetBankingPay}
                      className="w-full min-h-[48px] rounded-xl bg-[#1E3A8A] hover:bg-[#172554] text-white text-sm font-semibold transition-colors cursor-pointer tabular-nums"
                    >
                      Pay ₹{totalPayable} via {selectedBank} Net Banking
                    </button>
                  </div>
                )}

                {/* Subtle Trust Footer */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Secured by CampusLend Escrow</span>
                  <span>UPI · RuPay · Visa · Mastercard</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
