import Link from "next/link";
import { XCircle } from "lucide-react";
export default function PaymentFailure() {
  return (
    <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-lg">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><XCircle className="w-8 h-8 text-red-500" /></div>
        <h1 className="text-2xl font-bold text-red-600 mb-2">Payment Failed</h1>
        <p className="text-gray-500 text-sm mb-6">Payment not completed. Your cart is still saved.</p>
        <div className="flex flex-col gap-2">
          <Link href="/checkout" className="bg-black text-white py-3 rounded-xl font-semibold text-sm hover:bg-black transition-colors">Try Again</Link>
          <Link href="/cart" className="bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold text-sm">Back to Cart</Link>
        </div>
      </div>
    </div>
  );
}
