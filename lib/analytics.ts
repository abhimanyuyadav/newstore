import type { Order } from "./types";
export function weeklySales(orders: Order[], now = new Date()) {
  return Array.from({ length: 7 }, (_, index) => {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - 6 + index);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    const amount = orders.filter(order => order.paymentStatus === "paid" && order.status !== "cancelled" && new Date(order.createdAt) >= start && new Date(order.createdAt) < end)
      .reduce((total, order) => total + order.total, 0);
    return { day: start.toLocaleDateString("en", { weekday: "short", day: "numeric" }), amount };
  });
}
