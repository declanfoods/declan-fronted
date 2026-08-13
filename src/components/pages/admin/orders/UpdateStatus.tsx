import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { X, MoreVertical, Check, ArrowRight, Bell, MessageSquarePlus } from 'lucide-react';

const stages = [
  { key: 'Pending', time: '09:30 AM', done: true },
  { key: 'Confirmed', time: '09:45 AM', done: true },
  { key: 'Preparing', time: '10:15 AM', current: true },
  { key: 'Packed', done: false },
  { key: 'Out for Delivery', done: false },
  { key: 'Delivered', done: false },
];

export default function UpdateStatus() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [notes, setNotes] = useState('Currently sorting organic avocados. Checking for ripeness.');
  const [notify, setNotify] = useState(true);

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
        <div className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
          <div>
            <p className="text-xs font-semibold tracking-wide text-gray-400">ORDER REFERENCE</p>
            <p className="text-lg font-bold text-gray-900">#DF-{id ?? '882190'}</p>
          </div>
          <span className="rounded-full bg-[#F3F7EE] px-3 py-1 text-xs font-semibold text-primary-dark">
            Priority Handling
          </span>
        </div>

        <div className="space-y-0 rounded-2xl bg-white p-4 shadow-sm">
          {stages.map((stage, idx) => (
            <div key={stage.key}>
              <div className="flex items-center gap-3 py-2">
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                    stage.done
                      ? 'bg-primary text-white'
                      : stage.current
                      ? 'border-2 border-primary bg-white'
                      : 'bg-gray-100 text-gray-300'
                  }`}
                >
                  {stage.done ? (
                    <Check size={14} />
                  ) : stage.current ? (
                    <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-gray-300" />
                  )}
                </span>
                <div className="flex flex-1 items-center justify-between">
                  <p
                    className={`text-sm font-bold ${
                      stage.done || stage.current ? 'text-primary' : 'text-gray-300'
                    }`}
                  >
                    {stage.key}
                  </p>
                  {stage.time ? (
                    <p className="text-xs text-gray-400">
                      {stage.done ? 'Completed, ' : ''}
                      {stage.time}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-300">Upcoming</p>
                  )}
                </div>
              </div>

              {stage.current && (
                <div className="ml-10 mb-3 mt-1 space-y-3">
                  <div>
                    <p className="mb-1 text-xs font-semibold tracking-wide text-gray-400">
                      Order Notes
                    </p>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                      className="w-full rounded-xl border border-gray-200 bg-[#F3F7EE]/60 p-3 text-sm text-gray-700 outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-semibold text-white"
                  >
                    Move to Next Stage
                    <ArrowRight size={16} />
                  </button>
                </div>
              )}

              {idx < stages.length - 1 && <div className="ml-[13px] h-3 w-0.5 bg-gray-100" />}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Bell size={16} className="text-gray-400" />
            <p className="text-sm font-semibold text-gray-800">Notify Customer</p>
          </div>
          <button
            type="button"
            onClick={() => setNotify((v) => !v)}
            className={`h-6 w-11 rounded-full transition-colors ${
              notify ? 'bg-primary' : 'bg-gray-200'
            }`}
          >
            <span
              className={`block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow transition-transform ${
                notify ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        <button
          type="button"
          className="flex items-center justify-center gap-2 text-sm font-semibold text-primary"
        >
          <MessageSquarePlus size={16} />
          Add Extra Internal Notes
        </button>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-gray-100 bg-white p-4">
        <button
          type="button"
          onClick={() => navigate(`/admin/orders/${id}`)}
          className="w-full rounded-full bg-primary py-4 text-sm font-semibold text-white"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
