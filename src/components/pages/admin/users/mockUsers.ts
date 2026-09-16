export type UserStatus = 'Active' | 'Inactive' | 'Suspended';

export interface MockTransaction {
  id: string;
  title: string;
  ref: string;
  date: string;
  amount: number;
  status: 'Success' | 'Pending' | 'Failed';
  icon: 'order' | 'topup' | 'referral' | 'cashback';
}

export interface MockUser {
  id: string;
  custId: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
  verified: boolean;
  status: UserStatus;
  walletBalance: number;
  cashback: number;
  referralEarnings: number;
  pendingBalance: number;
  lifetimeSpend: number;
  totalOrders: number;
  referralActive: boolean;
  lastSeen: string;
  deliveryAddress: string;
  dateJoined: string;
  lastLogin: string;
  referralCode: string;
  transactions: MockTransaction[];
}

export const mockUsers: MockUser[] = [
  {
    id: '1',
    custId: '#DF-9021',
    name: 'Tunde Kelani',
    email: 't.kelani@domain.com',
    phone: '+234 801 234 5678',
    avatarUrl: 'https://i.pravatar.cc/120?img=13',
    verified: true,
    status: 'Active',
    walletBalance: 12500,
    cashback: 2400,
    referralEarnings: 15000,
    pendingBalance: 0,
    lifetimeSpend: 145000,
    totalOrders: 14,
    referralActive: true,
    lastSeen: '2 hrs ago',
    deliveryAddress: '14, Admiralty Way, Lekki Phase 1, Lagos',
    dateJoined: 'Oct 12, 2023',
    lastLogin: '2 hours ago',
    referralCode: 'TUNDE24K',
    transactions: [
      { id: 't1', title: 'Order Payment', ref: '#DF-9021', date: 'Oct 24, 2023 • 14:30', amount: -4200, status: 'Success', icon: 'order' },
      { id: 't2', title: 'Wallet Top-up', ref: '#TX-5542', date: 'Oct 23, 2023 • 09:15', amount: 10000, status: 'Success', icon: 'topup' },
      { id: 't3', title: 'Referral Commission', ref: '#RF-0032', date: 'Oct 22, 2023 • 18:45', amount: 1500, status: 'Pending', icon: 'referral' },
      { id: 't4', title: 'Cashback Credited', ref: '#CB-1122', date: 'Oct 21, 2023 • 12:20', amount: 450, status: 'Success', icon: 'cashback' },
    ],
  },
  {
    id: '2',
    custId: '#DF-8812',
    name: 'Chidi Eze',
    email: 'ceze@email.com',
    phone: '+234 802 555 1290',
    avatarUrl: 'https://i.pravatar.cc/120?img=15',
    verified: false,
    status: 'Suspended',
    walletBalance: 0,
    cashback: 0,
    referralEarnings: 0,
    pendingBalance: 0,
    lifetimeSpend: 32000,
    totalOrders: 3,
    referralActive: false,
    lastSeen: '12 days ago',
    deliveryAddress: '7 Marina Road, Onikan, Lagos',
    dateJoined: 'Feb 3, 2023',
    lastLogin: '12 days ago',
    referralCode: 'CHIDI09X',
    transactions: [
      { id: 't5', title: 'Order Payment', ref: '#DF-8811', date: 'Aug 2, 2023 • 10:05', amount: -3000, status: 'Success', icon: 'order' },
    ],
  },
];

export function findMockUser(id: string) {
  return mockUsers.find((u) => u.id === id);
}