const MysuriRequestCard = ({ request }) => {
  return (
    <div className="bg-white p-4 shadow rounded border flex justify-between items-center">
      <div>
        <p className="font-semibold">{request.name}</p>
        <p className="text-sm text-gray-500">{request.product}</p>
      </div>
      <div>
        <p className="text-sm">{request.date}</p>
        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
          {request.status}
        </span>
      </div>
    </div>
  );
};

export default MysuriRequestCard;