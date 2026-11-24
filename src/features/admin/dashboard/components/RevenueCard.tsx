import { Minus, TrendingDown, TrendingUp } from 'lucide-react';
import { formatNaira } from '../../../../shared/formatters/formatNaira';
import type { RevenueInsight } from '../api';

export default function RevenueCard({ revenue }: { revenue: RevenueInsight }) {
  const direction = revenue.direction ?? 'neutral';
  const RevenueIcon = direction === 'up' ? TrendingUp : direction === 'down' ? TrendingDown : Minus;

  return (
    <div className="rounded-2xl bg-primary p-4 text-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <RevenueIcon size={16} strokeWidth={2} />
          Revenue Insight
        </div>
        <span className="text-sm font-bold">
          {formatNaira(Number(revenue.todayRevenue ?? 0))}
        </span>
      </div>

      <p className="mt-1 text-sm text-white/90">
        {revenue.changePercentage === null ||
        revenue.changePercentage === undefined ? (
          <>
            Today so far. No comparison available for the same time
            yesterday.
          </>
        ) : (
          <>
            {direction === 'up' ? 'Up' : direction === 'down' ? 'Down' : 'Level'}{' '}
            {Math.abs(Number(revenue.changePercentage))}% against the same
            time yesterday
            {revenue.yesterdaySameTimeRevenue > 0 && (
              <>
                {' '}
                ({formatNaira(Number(revenue.yesterdaySameTimeRevenue))})
              </>
            )}
            .
          </>
        )}
      </p>
    </div>
  );
}
