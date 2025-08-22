export default function PaymentFail() {
  const url = new URL(window.location.href);
  const code = url.searchParams.get('code');
  const message = url.searchParams.get('message');
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-red-600">결제 실패</h1>
      <p className="mt-2 text-gray-700">{message} ({code})</p>
    </div>
  );
}