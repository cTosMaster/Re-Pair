const reviews = [
  {
    rating: 5,
    content: "정말 친절하게 설명해주시고 빠르게 수리해주셨어요!",
    user: "김민지",
  },
  {
    rating: 4,
    content: "견적 비교할 수 있어서 너무 좋았고, 생각보다 저렴했어요.",
    user: "박준형",
  },
  {
    rating: 5,
    content: "수리 완료까지 상태를 실시간으로 볼 수 있어 안심됐습니다.",
    user: "이서윤",
  },
];

const ReviewSection = () => {
  return (
    <section className="bg-gray-50 py-16 px-6">
      <h2 className="text-3xl font-bold text-center mb-12">고객 후기</h2>
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {reviews.map((review, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl shadow p-6 flex flex-col justify-between"
          >
            <div className="mb-4">
              <div className="text-yellow-400 text-xl mb-2">
                {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
              </div>
              <p className="text-gray-700 text-sm">{review.content}</p>
            </div>
            <div className="text-right text-xs text-gray-500 mt-4">- {review.user}님</div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ReviewSection;
