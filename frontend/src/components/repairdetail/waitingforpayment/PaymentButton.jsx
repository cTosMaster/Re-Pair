function PaymentButton({ onClick, disabled }) {
  return (
    <div className="flex justify-center">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`w-full max-w-[200px] py-3 rounded-md font-medium transition
          ${disabled
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-[#A5CD82] text-white hover:bg-[#94bb71]"
          }`}
      >
        결제하기
      </button>
    </div>
  );
}

export default PaymentButton;