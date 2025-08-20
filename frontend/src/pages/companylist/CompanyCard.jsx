import { useNavigate } from "react-router-dom";

const CompanyCard = ({ customerId, companyName, region, avgRating }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/customers/${customerId}`)}
      className="flex items-center px-4 py-4 bg-white rounded-lg transition h-28 w-fit hover:bg-gray-50 cursor-pointer"
    >
      {/* 로고 (왼쪽, 크게) */}
      <div className="w-20 h-20 bg-gray-100 flex items-center justify-center rounded-md overflow-hidden flex-shrink-0">
        <span className="text-gray-400 text-sm">Logo</span>
      </div>

      {/* 업체 정보 (오른쪽) */}
      <div className="flex flex-col justify-center ml-4 min-w-[150px]">
        <h3 className="font-semibold text-gray-800 text-base whitespace-nowrap">
          {companyName}
        </h3>
        <p className="text-sm text-gray-500 whitespace-nowrap">{region}</p>
        <p className="text-sm text-yellow-500 mt-1">
          ⭐ {avgRating?.toFixed(1) ?? "0.0"}
        </p>
      </div>
    </div>
  );
};

export default CompanyCard;