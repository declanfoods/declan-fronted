import { useEffect, useState } from "react";
import { adminOrderApi } from "../lib/adminOrderApi";

export function usePendingOrdersCount() {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    let cancelled = false;

    const fetchCount = async () => {
      try {
        const res = await adminOrderApi.getPendingOrders();
        if (res.data.statusCode !== 200) return;
        const data = res.data.data.pendingOrders;
        console.log("Data: " + data)
        if (!cancelled) setCount(data ?? 0);
      } catch {
        console.log("An error")
      }
    };

    fetchCount();

    const interval = setInterval(fetchCount, 60_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return count;
}
