import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function PaymentPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full rounded-3xl bg-white shadow-xl border border-gray-200 p-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Payment Center</h1>
        <p className="text-gray-600 mb-6">
          This route is a payment landing page. If you are looking for the checkout result page,
          choose one of the options below.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link href="/checkout" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-black bg-black px-5 py-4 text-sm font-semibold text-white hover:bg-gray-950 transition">
            Go to Checkout <ChevronRight className="w-4 h-4" />
          </Link>
          <Link href="/payment/success" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-4 text-sm font-semibold text-gray-700 hover:border-black hover:text-black transition">
            Payment Success Page <ChevronRight className="w-4 h-4" />
          </Link>
          <Link href="/payment/failure" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-4 text-sm font-semibold text-gray-700 hover:border-black hover:text-black transition">
            Payment Failure Page <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
