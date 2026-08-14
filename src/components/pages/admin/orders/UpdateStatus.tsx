import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { X, MoreVertical, ArrowRight } from 'lucide-react';
import { adminOrderApi, type AdminOrder } from '../../../../app/lib/adminOrderApi';
import StatusPill from '../../../admin/StatusPill';

const allStatuses = [
  'PENDING',
  'PROCESSING',
  'ASSIGNED',
  'PICKED_UP',
  'IN_TRANSIT',
  'CODE_EXCHANGED',
  'DELIVERED',
  'COMPLETED',
  'CANCELLED',
];

export default function UpdateStatus() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchOrder = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await adminOrderApi.getOrderById(id);
      setOrder(res.data.data.order);
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to load order.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleMarkProcessing = async () => {
    if (!id) return;
    setUpdating(true);
    setError('');
    try {
      await adminOrderApi.markAsProcessing(id);
      navigate(`/admin/orders/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to update status.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F3F7EE]">
        <p className="text-sm text-gray-400">Loading order...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F3F7EE] pb-28">
      <header className="flex items-center justify-between px-5 pt-6">
        <button type="button" onClick={() => navigate(-1)} className="text-primary-dark">
          <X size={22} strokeWidth={2} />
        </button>
        <h1 className="text-lg font-bold text-primary-dark">Update Status</h1>
        <button type="button" className="text-primary-dark">
          <MoreVertical size={22} strokeWidth={2} />
        </button>
      </header>

      <main className="flex-1 space-y-4 px-5 pt-5">
        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </p>
        )}

        <div className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
          <div>
            <p className="text-xs font-semibold tracking-wide text-gray-400">ORDER REFERENCE</p>
            <p className="text-lg font-bold text-gray-900">#{id?.slice(0, 8)}</p>
          </div>
          {order && <StatusPill label={order.status} dot />}
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="mb-3 text-xs font-semibold tracking-wide text-gray-400">ALL STAGES</p>
          <div className="flex flex-wrap gap-2">
            {allStatuses.map((s) => (
              <span
                key={s}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  order?.status === s
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {s.replace('_', ' ')}
              </span>
            ))}
          </div>
          <p className="mt-3 text-xs text-gray-400">
            Only the "processing" transition has a dedicated endpoint right now — the button
            below wires to it. Once the other stage-transition endpoints are available I can wire
            "Move to Next Stage" for every step.
          </p>
        </div>

        <button
          type="button"
          disabled={updating}
          onClick={handleMarkProcessing}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {updating ? 'Updating...' : 'Mark Order as Processing'}
          <ArrowRight size={16} />
        </button>
      </main>
    </div>
  );
}