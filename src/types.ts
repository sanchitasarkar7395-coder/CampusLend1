export type Category =
  | 'All'
  | 'Hostel Appliances'
  | 'Formal & Placement Attire'
  | 'Academic & Lab Gear'
  | 'Mobility';

export type ItemCategory = Exclude<Category, 'All'>;

export type ConditionLevel = 'Mint' | 'Good' | 'Working';

export type BillingUnit = 'month' | 'event';

export type RentalDurationId = '3_days' | '1_month' | '1_semester';

export type DropSpot =
  | 'Main Cafeteria'
  | 'Hostel Common Room'
  | 'Campus Main Gate'
  | 'Central Library Steps';

export type HostelBlock = string;

export type ActiveTab = 'browse' | 'rentals' | 'list' | 'profile';

export interface CatalogItem {
  id: string;
  title: string;
  category: ItemCategory;
  description: string;
  imageUrl: string;
  lenderName: string;
  lenderEmail?: string;
  lenderPhotoURL?: string;
  lenderRole: string;
  lenderRollNo: string;
  lenderVerified: boolean;
  hostelBlock: HostelBlock;
  condition: ConditionLevel;
  conditionNote: string;
  rate: number; // Base rate in INR
  billingUnit: BillingUnit; // 'month' or 'event' (3-day event rate)
  retailPrice: number; // Retail price in INR for savings %
  deposit: number; // Refundable Escrow Deposit in INR
  available: boolean;
  isUserListing?: boolean;
  createdAt: string;
}

export type EscrowStatus =
  | 'Deposit Held Safely'
  | 'In Use · Checked In'
  | 'Deposit Refunded';

export type OrderRole = 'borrowed' | 'lent';

export interface RentalOrder {
  id: string;
  itemId: string;
  itemTitle: string;
  itemImage: string;
  itemCategory: ItemCategory;
  orderRole: OrderRole;
  lenderName: string;
  lenderHostel: HostelBlock;
  borrowerName?: string;
  borrowerEmail?: string;
  borrowerPhotoURL?: string;
  durationLabel: string;
  durationId: RentalDurationId;
  rentalFee: number;
  depositAmount: number;
  platformFee: number;
  totalPaid: number;
  retailPrice: number;
  dropSpot: DropSpot;
  conditionCheckedIn: boolean;
  escrowStatus: EscrowStatus;
  upiRef: string;
  paymentMethod?: string;
  paymentTimestamp?: string;
  bookedAt: string;
  returnDueDate: string;
  returnedAt?: string;
}

export interface StudentProfile {
  uid?: string;
  fullName: string;
  email: string;
  photoURL?: string;
  rollNumber: string;
  program: string;
  hostelBlock: HostelBlock;
  isSignedIn: boolean;
  authMethod?: 'google' | 'demo_google' | 'password';
  isVerified: boolean;
  verifiedAt?: string;
}

export interface DurationOption {
  id: RentalDurationId;
  label: string;
  sublabel: string;
  getFee: (item: CatalogItem) => number;
  days: number;
}
