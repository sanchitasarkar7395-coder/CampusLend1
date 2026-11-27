import { useEffect, useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { BookingDrawer } from './components/BookingDrawer';
import { BrowseView } from './components/BrowseView';
import { ListItemView } from './components/ListItemView';
import { Navigation } from './components/Navigation';
import { OrderHistoryView } from './components/OrderHistoryView';
import { ProfileView } from './components/ProfileView';
import { VerifyStudentModal } from './components/VerifyStudentModal';
import {
  INITIAL_CATALOG_ITEMS,
  INITIAL_RENTALS,
  INITIAL_STUDENT_PROFILE,
} from './data/mockData';
import { signOutFromFirebase, subscribeToFirebaseAuth } from './firebase';
import {
  ActiveTab,
  CatalogItem,
  RentalOrder,
  StudentProfile,
} from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('browse');
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>(INITIAL_CATALOG_ITEMS);
  const [rentals, setRentals] = useState<RentalOrder[]>(INITIAL_RENTALS);
  const [profile, setProfile] = useState<StudentProfile>(INITIAL_STUDENT_PROFILE);
  const [bookingItem, setBookingItem] = useState<CatalogItem | null>(null);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  useEffect(() => {
    const unsubscribe = subscribeToFirebaseAuth((firebaseUser) => {
      if (firebaseUser) {
        setProfile((prev) => ({
          ...prev,
          uid: firebaseUser.uid,
          fullName:
            firebaseUser.displayName ||
            prev.fullName ||
            firebaseUser.email?.split('@')[0] ||
            'CampusLend Student',
          email: firebaseUser.email || prev.email,
          photoURL: firebaseUser.photoURL || prev.photoURL,
          isSignedIn: true,
          authMethod: 'google',
        }));
      }
    });
    return () => unsubscribe();
  }, []);

  const activeRentalsCount = rentals.filter(
    (r) => r.escrowStatus !== 'Deposit Refunded'
  ).length;
  const userListings = catalogItems.filter((item) => item.isUserListing);

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSignInSuccess = (updatedProfile: StudentProfile) => {
    setProfile(updatedProfile);
    setToastMessage(`Signed in as ${updatedProfile.fullName} (${updatedProfile.email}).`);
  };

  const handleVerifySuccess = (updatedProfile: StudentProfile) => {
    setProfile(updatedProfile);
    setToastMessage(
      `Verified Student badge unlocked for ${updatedProfile.rollNumber}.`
    );
  };

  const handleSignOut = async () => {
    try {
      await signOutFromFirebase();
    } catch {
      // Ignore Firebase sign-out error when using demo/manual mode
    }
    setProfile(INITIAL_STUDENT_PROFILE);
    setToastMessage('Signed out of CampusLend.');
  };

  const handleConfirmBooking = (newOrder: RentalOrder) => {
    setRentals((prev) => [newOrder, ...prev]);
    setToastMessage(
      `Booking ${newOrder.id} confirmed — ₹${newOrder.depositAmount} held safely in Escrow.`
    );
  };

  const handleReturnAndRefund = (orderId: string) => {
    const target = rentals.find((r) => r.id === orderId);
    const todayLabel = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    setRentals((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? { ...order, escrowStatus: 'Deposit Refunded', returnedAt: todayLabel }
          : order
      )
    );
    if (target) {
      setToastMessage(
        `${target.id} marked returned — ₹${target.depositAmount} escrow deposit refunded via UPI.`
      );
    }
  };

  const handleCreateListing = (newItem: CatalogItem) => {
    setCatalogItems((prev) => [newItem, ...prev]);
    setActiveTab('browse');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setToastMessage(`"${newItem.title}" is now live in the verified campus catalog.`);
  };

  const handleToggleListingAvailability = (itemId: string) => {
    setCatalogItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, available: !item.available } : item
      )
    );
  };

  const handleDeleteListing = (itemId: string) => {
    setCatalogItems((prev) => prev.filter((item) => item.id !== itemId));
    setToastMessage('Listing removed from catalog.');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navigation
        activeTab={activeTab}
        onTabChange={handleTabChange}
        profile={profile}
        activeRentalsCount={activeRentalsCount}
        onOpenVerifyModal={() => setIsVerifyModalOpen(true)}
        onSignOut={handleSignOut}
      />

      {/* Main Content Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24 md:py-8">
        {activeTab === 'browse' && (
          <BrowseView
            items={catalogItems}
            profile={profile}
            onRentItem={(item) => setBookingItem(item)}
            onOpenVerifyModal={() => setIsVerifyModalOpen(true)}
            onGoToList={() => handleTabChange('list')}
          />
        )}

        {activeTab === 'rentals' && (
          <OrderHistoryView
            rentals={rentals}
            profile={profile}
            onReturnAndRefund={handleReturnAndRefund}
            onGoToBrowse={() => handleTabChange('browse')}
            onOpenVerifyModal={() => setIsVerifyModalOpen(true)}
          />
        )}

        {activeTab === 'list' && (
          <ListItemView
            profile={profile}
            onCreateListing={handleCreateListing}
            onOpenVerifyModal={() => setIsVerifyModalOpen(true)}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            profile={profile}
            rentals={rentals}
            userListings={userListings}
            onOpenVerifyModal={() => setIsVerifyModalOpen(true)}
            onSignOut={handleSignOut}
            onToggleListingAvailability={handleToggleListingAvailability}
            onDeleteListing={handleDeleteListing}
            onGoToList={() => handleTabChange('list')}
            onGoToRentals={() => handleTabChange('rentals')}
          />
        )}
      </main>

      {/* Quiet Footer (Desktop) */}
      <footer className="hidden md:block border-t border-slate-200/80 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-[#1E3A8A]">CampusLend</span>
            <span aria-hidden="true">·</span>
            <span>Dehradun University Campuses &amp; Student Hostels</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Verified Student ID Escrow</span>
            <span aria-hidden="true">·</span>
            <span>On-Campus Drop-Spot Handovers</span>
          </div>
        </div>
      </footer>

      {/* Gmail Login & Student ID Verification Gate Modal */}
      <VerifyStudentModal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        profile={profile}
        onSignInSuccess={handleSignInSuccess}
        onVerifySuccess={handleVerifySuccess}
        onSignOut={handleSignOut}
      />

      {/* Escrow Booking & Campus Drop-Spot Checkout Drawer */}
      <BookingDrawer
        item={bookingItem}
        profile={profile}
        onClose={() => setBookingItem(null)}
        onOpenVerify={() => setIsVerifyModalOpen(true)}
        onConfirmBooking={handleConfirmBooking}
        onGoToRentals={() => handleTabChange('rentals')}
      />

      {/* Non-intrusive Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-20 md:bottom-6 right-4 left-4 md:left-auto md:max-w-md z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
            <span className="text-xs sm:text-sm font-medium leading-snug">{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            aria-label="Dismiss notification"
            className="text-slate-400 hover:text-white p-1 cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
