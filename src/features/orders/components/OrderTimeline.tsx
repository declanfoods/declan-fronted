import type { OrderTimelineEvent } from '../api/orderApi';
import { formatOrderTime, orderProgress } from '../orderPresentation';

export default function OrderTimeline({ timeline, estimatedDeliveryTime }: {
  timeline: OrderTimelineEvent[];
  estimatedDeliveryTime: string | Date | null;
}) {
  if (timeline.length === 0) return null;

  return (
    <section className="rounded-3xl border-2 border-primary bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-bold text-ink">Order Progress</h3>
      <div className="relative h-3 overflow-hidden rounded-full bg-muted">
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${orderProgress(timeline)}%` }}
        />
      </div>

      <div className="mt-6 flex flex-col">
        {timeline.map((event, index) => (
          <div key={index} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={
                'h-4 w-4 rounded-full border-2 ' +
                (event.passed ? 'border-primary bg-primary' : 'border-muted bg-white')
              } />
              {index < timeline.length - 1 && (
                <div
                  className={`w-0.5 flex-1 ${event.passed ? 'bg-primary' : 'bg-muted'}`}
                  style={{ minHeight: '24px' }}
                />
              )}
            </div>
            <div className="pb-5">
              <p className={`text-sm font-semibold ${event.passed ? 'text-ink' : 'text-ink-soft'}`}>
                {event.label}
              </p>
              {event.passedAt && <p className="text-xs text-ink-soft">{formatOrderTime(event.passedAt)}</p>}
            </div>
          </div>
        ))}
      </div>
      <div>
        <i className="text-gray-500">Estimated Delivery time: {formatOrderTime(estimatedDeliveryTime)}</i>
      </div>
    </section>
  );
}
