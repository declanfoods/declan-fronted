import { Truck, ClipboardList, ClipboardCheck, CheckCircle } from 'lucide-react';
import RiderLayout from './RiderLayout';

const STATS = [
  { label: 'Active Deliveries', value: 0, icon: Truck },
  { label: 'Assigned Deliveries', value: 0, icon: ClipboardList },
  { label: 'Pending Pickups', value: 0, icon: ClipboardCheck },
  { label: 'Completed Today', value: 0, icon: CheckCircle },
];

export default function RiderHome() {
  return (
    <RiderLayout>
      {/* Welcome banner */}
      <div className="mb-6 rounded-2xl bg-primary px-6 py-8">
        <h1 className="text-2xl font-bold leading-snug text-white">
          Welcome Back,<br />Johnson!
        </h1>
        <p className="mt-2 text-sm text-white/80">
          Here's your delivery overview for today
        </p>
      </div>

      {/* Stats */}
      <div className="space-y-4">
        {STATS.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="flex items-center justify-between rounded-2xl border border-gray-200 px-6 py-5"
          >
            <div>
              <p className="text-sm font-semibold text-primary">{label}</p>
              <p className="mt-2 text-2xl font-bold text-ink">{value}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Icon size={24} className="text-primary" strokeWidth={1.5} />
            </div>
          </div>
        ))}
      </div>
    </RiderLayout>
  );
}