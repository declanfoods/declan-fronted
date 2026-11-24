import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getApiErrorMessage } from '../../../app/lib/api-types';
import SplashLoader from '../../../shared/ui/SplashLoader';
import { CancelOrderModal } from '../components/CancelOrderModal';
import OrderTrackingView from '../components/OrderTrackingView';
import { orderStatusKey } from '../orderPresentation';
import { useCancelOrder, useOrderDetails } from '../queries';

export default function OrderTrackingPage() {
  const { orderId = '' } = useParams<{ orderId: string }>();
  return <OrderTracking key={orderId} orderId={orderId} />;
}

function OrderTracking({ orderId }: { orderId: string }) {
  const navigate = useNavigate();
  const details = useOrderDetails(orderId, true);
  const cancel = useCancelOrder(orderId);
  const [showCancel, setShowCancel] = useState(false);

  const backToOrders = () => navigate('/app/orders');

  if (orderId && details.isPending) return <SplashLoader />;
  if (!details.data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-lg font-semibold text-ink">
          {details.isError ? 'Failed to load order tracking.' : 'Order not found'}
        </p>
        {details.isError && (
          <button
            type="button"
            onClick={() => void details.refetch()}
            className="text-sm font-semibold text-primary underline"
          >
            Try Again
          </button>
        )}
        <button
          type="button"
          onClick={backToOrders}
          className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  const { order, timeline } = details.data;
  const canCancel = orderStatusKey(order.orderStatus) === 'PENDING' && !cancel.isSuccess;

  return (
    <>
      <OrderTrackingView
        order={order}
        timeline={timeline}
        mode="account"
        onBack={backToOrders}
        notice={details.isRefetchError && (
          <div role="status" className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Could not refresh this order.
            <button
              type="button"
              onClick={() => void details.refetch()}
              className="ml-2 font-semibold underline"
            >
              Try Again
            </button>
          </div>
        )}
        footer={canCancel && (
          <button
            type="button"
            disabled={cancel.isPending}
            onClick={() => {
              cancel.reset();
              setShowCancel(true);
            }}
            className="w-full rounded-full border-2 border-red-300 py-4 text-lg font-bold text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50"
          >
            Cancel Order
          </button>
        )}
      />
      {showCancel && (
        <CancelOrderModal
          loading={cancel.isPending}
          error={cancel.isError ? getApiErrorMessage(cancel.error, 'Failed to cancel order. Please try again.') : ''}
          onClose={() => {
            if (cancel.isPending) return;
            setShowCancel(false);
            cancel.reset();
          }}
          onConfirm={(reason) => {
            if (!cancel.isPending) cancel.mutate(reason, { onSuccess: () => setShowCancel(false) });
          }}
        />
      )}
    </>
  );
}
