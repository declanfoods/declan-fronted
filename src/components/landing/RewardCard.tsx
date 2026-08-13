import { type ReactNode } from "react";

interface RewardCardProps {
  icon: ReactNode;
  title: string;
  body: string;
}

export default function RewardCard({ icon, title, body }: RewardCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-green-200 bg-white p-6 shadow-sm">
      <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-primary">
        {icon}
      </div>

      <h3 className="text-lg font-bold text-gray-900">{title}</h3>

      <div className="flex items-center gap-0.5 text-accent">
        {[...Array(5)].map((_, i) => (
          <span key={i}>●</span>
        ))}
      </div>

      <p className="text-sm leading-relaxed text-gray-500">{body}</p>
    </div>
  );
}