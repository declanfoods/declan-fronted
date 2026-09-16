export interface ReferralMember {
  id: string;
  name: string;
  avatarUrl: string;
  code: string;
  level: 'L1' | 'L2' | 'L3' | 'L4';
  status: 'Qualified' | 'Pending Review';
  networkSize: number;
  commissions: number;
  tier: string;
  cashback: number;
}

export const mockMembers: ReferralMember[] = [
  {
    id: '1',
    name: 'Tunde Kelani',
    avatarUrl: 'https://i.pravatar.cc/120?img=13',
    code: 'TUNDE24',
    level: 'L1',
    status: 'Qualified',
    networkSize: 142,
    commissions: 145000,
    tier: 'Tier 1 Elite',
    cashback: 12500,
  },
  {
    id: '2',
    name: 'Chukwuma Okafor',
    avatarUrl: 'https://i.pravatar.cc/120?img=33',
    code: 'CHUKW99',
    level: 'L3',
    status: 'Pending Review',
    networkSize: 12,
    commissions: 14200,
    tier: 'Tier 3 Associate',
    cashback: 1150,
  },
];

export interface DirectReferral {
  id: string;
  name: string;
  avatarUrl: string;
  refId: string;
  levelLabel: string;
  qualified: 'QUALIFIED' | 'NOT QUALIFIED';
  hasDownlines: boolean;
  orders: number;
  commission: number;
  network: number;
}

export interface ReferralMemberDetail {
  id: string;
  name: string;
  avatarUrl: string;
  refId: string;
  code: string;
  tier: string;
  status: 'ACTIVE' | 'INACTIVE';
  network: number;
  directs: number;
  qualified: number;
  lifetimeCommission: number;
  lifetimeRevenue: number;
  joined: string;
  directReferrals: DirectReferral[];
}

export const mockMemberDetails: Record<string, ReferralMemberDetail> = {
  '1': {
    id: '1',
    name: 'Ade Bakare',
    avatarUrl: 'https://i.pravatar.cc/120?img=13',
    refId: 'DF-REF-8821',
    code: 'ADE24',
    tier: 'GOLD PARTNER',
    status: 'ACTIVE',
    network: 142,
    directs: 18,
    qualified: 12,
    lifetimeCommission: 145000,
    lifetimeRevenue: 4200000,
    joined: '12 Oct 2023',
    directReferrals: [
      {
        id: 'd1',
        name: 'Amina Jibril',
        avatarUrl: 'https://i.pravatar.cc/120?img=47',
        refId: 'DF-REF-9021',
        levelLabel: 'L1 Referral',
        qualified: 'QUALIFIED',
        hasDownlines: true,
        orders: 24,
        commission: 8240,
        network: 12,
      },
      {
        id: 'd2',
        name: 'Tunde Kelani',
        avatarUrl: 'https://i.pravatar.cc/120?img=14',
        refId: 'DF-REF-9142',
        levelLabel: 'L1 Referral',
        qualified: 'QUALIFIED',
        hasDownlines: false,
        orders: 12,
        commission: 3150,
        network: 0,
      },
      {
        id: 'd3',
        name: 'Chima Obi',
        avatarUrl: 'https://i.pravatar.cc/120?img=15',
        refId: 'DF-REF-9300',
        levelLabel: 'L1 Referral',
        qualified: 'NOT QUALIFIED',
        hasDownlines: false,
        orders: 5,
        commission: 0,
        network: 2,
      },
    ],
  },
  '2': {
    id: '2',
    name: 'Chukwuma Okafor',
    avatarUrl: 'https://i.pravatar.cc/120?img=33',
    refId: 'DF-REF-7734',
    code: 'CHUKW99',
    tier: 'ASSOCIATE',
    status: 'ACTIVE',
    network: 12,
    directs: 4,
    qualified: 2,
    lifetimeCommission: 14200,
    lifetimeRevenue: 320000,
    joined: '02 Mar 2024',
    directReferrals: [],
  },
};

export interface PayoutRequest {
  id: string;
  name: string;
  bank: string;
  accountMasked: string;
  status: 'PENDING' | 'PROCESSING' | 'SUCCESSFUL';
  amount: number;
  date: string;
  note?: string;
}

export const mockPayoutRequests: PayoutRequest[] = [
  {
    id: 'p1',
    name: 'Bolanle J.',
    bank: 'Zenith Bank',
    accountMasked: '203***442',
    status: 'PENDING',
    amount: 15000,
    date: 'Oct 24, 10:20 AM',
  },
  {
    id: 'p2',
    name: 'Chidi E.',
    bank: 'Access Bank',
    accountMasked: '001***992',
    status: 'PROCESSING',
    amount: 42500,
    date: 'Oct 24, 09:15 AM',
    note: 'Verification in progress',
  },
  {
    id: 'p3',
    name: 'Fatima M.',
    bank: 'GTBank',
    accountMasked: '012***773',
    status: 'SUCCESSFUL',
    amount: 8900,
    date: 'Oct 23, 04:45 PM',
  },
];

export interface PayoutDetail extends PayoutRequest {
  fullName: string;
  accountNumber: string;
  totalBalance: number;
  referralsBalance: number;
  cashbackBalance: number;
  previousWithdrawals: { amount: number; status: 'SUCCESSFUL' | 'FAILED' }[];
  timeline: { label: string; timestamp?: string; done: boolean; current?: boolean }[];
}

export const mockPayoutDetails: Record<string, PayoutDetail> = {
  p1: {
    ...mockPayoutRequests[0],
    fullName: 'Bolanle Johnson',
    accountNumber: '0123456789',
    totalBalance: 22500,
    referralsBalance: 18000,
    cashbackBalance: 4500,
    previousWithdrawals: [
      { amount: 8000, status: 'SUCCESSFUL' },
      { amount: 12500, status: 'SUCCESSFUL' },
    ],
    timeline: [
      { label: 'Requested', timestamp: 'Oct 24, 2023 • 10:45 AM', done: true },
      { label: 'System Verified', timestamp: 'Oct 24, 2023 • 11:02 AM', done: true },
      { label: 'Awaiting Admin Approval', done: false, current: true },
    ],
  },
};

export const referralInsights = [
  {
    id: 'a1',
    icon: 'commission' as const,
    title: 'Tunde Kelani earned ₦1,500 commission',
    subtitle: 'Level 2 Referral • Just now',
  },
  {
    id: 'a2',
    icon: 'cashback' as const,
    title: 'Amaka Obi processed ₦240 cashback',
    subtitle: 'Qualified Purchase • 14 mins ago',
  },
  {
    id: 'a3',
    icon: 'tier' as const,
    title: "John Doe reached 'Gold' tier status",
    subtitle: 'Milestone Reward • 2 hours ago',
  },
  {
    id: 'a4',
    icon: 'qualification' as const,
    title: 'Fatima Yusuf completed qualification',
    subtitle: 'Onboarding Bonus Pending • 5 hours ago',
  },
];

export const topReferrers = [
  { id: 't1', initials: 'AM', name: 'Adekunle Musa', referrals: 142, earnings: 452000 },
  { id: 't2', initials: 'CE', name: 'Chioma Eze', referrals: 98, earnings: 284500 },
  { id: 't3', initials: 'BO', name: 'Babatunde Ola', referrals: 87, earnings: 195200 },
];