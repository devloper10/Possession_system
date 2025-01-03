import React from "react";
import { useNavigate } from "react-router-dom";




const formatDate = (date) => {
  if (!date) return "غير متوفر";
  const options = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: "Asia/Baghdad",
  };
  return new Date(date)
    .toLocaleString("en-CA", options)
    .replace(",", "")
    .replace(/\//g, "/");
};


const StocksTable = ({ data }) => {

  const navigate = useNavigate();


  if (!data || data.length === 0) return <div>لا توجد بيانات لعرضها</div>;
  
  return (
    <div className="overflow-x-auto">
      <table className="w-full bg-white border border-[#D9D9D9] rounded-lg shadow-md">
        <thead className="bg-[#353535] sticky top-0 shadow-md -translate-y-px">
          <tr>
            {[
              "التسلسل",
              "رقم العقار",
              "الجهة",
              "حالة الإستملاك",
              "مساحة السند",
              "الحالة",
              "المساحة المستملكة",
              "المساحة المتبقية",
              "أضيف بواسطة",
            ].map((header, idx) => (
              <th
                key={idx}
                className="py-4 px-6 text-center font-bold text-white"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((property, index) => (
            <tr
              key={property.guidId || index}
              className="border-b border-[#D9D9D9] hover:bg-gray-100"
              onDoubleClick={() => {
                navigate(`/details/${property.guidId}`);
              }}
            >
              <td className="py-4 px-6 text-center">{index + 1}</td>
              <td className="py-4 px-6 text-center">
                {property.propertyNumber || "غير متوفر"}
              </td>
              <td className="py-4 px-6 text-center">
                {property.side || "غير متوفر"}
              </td>
              <td className="py-4 px-6 text-center">
                {property.istimlackStatus || "غير متوفر"}
              </td>
              <td className="py-4 px-6 text-center">
                {property.totalArea || "غير متوفر"}
              </td>
              <td className="py-4 px-6 text-center">
                {property.status || "غير متوفر"}
              </td>
              <td className="py-4 px-6 text-center">
                {property.acquiredArea || 0}
              </td>
              <td className="py-4 px-6 text-center">
                {property.remainingArea || "غير متوفر"}
              </td>
              <td className="py-4 px-6 text-center">
                {property.userName || "غير معروف"} /{" "}
                {formatDate(property.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const YearsDBTable = ({ data }) => {
  const navigate = useNavigate();

  if (!data || data.length === 0) return <div>لا توجد بيانات لعرضها</div>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full bg-white border border-[#D9D9D9] rounded-lg shadow-md">
        <thead className="bg-[#353535] sticky top-0 shadow-md -translate-y-px">
          <tr>
            {[
              "ت",
              "رقم العقار",
              "المقاطعة",
              "التعاقد",
              "اسم الوكيل",
              "تدقيق الأضابير",
              "محضر",
              "تسجيل دعوى",
              "رقم الدعوى",
              "مرافعة",
              "كشف",
              "قرار المحكمة",
              "عملية الدفع",
              "المساحة المستملكة",
              "وحدة المساحة",
              "السعر بالمتر",
              "السعر الإجمالي",
              "أضيف بواسطة",
            ].map((header, idx) => (
              <th
                key={idx}
                className="py-4 px-6 text-center font-bold text-white"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr
              key={item.guidId || index}
              className="border-b border-[#D9D9D9] hover:bg-gray-100"
              onDoubleClick={() => {
                navigate(`/yearsDBDetails/${item.guidId}`);
              }}
            >
              <td className="py-4 px-6 text-center">{index + 1}</td>
              <td className="py-4 px-6 text-center">
                {item.propertyNumber || "غير متوفر"}
              </td>
              <td className="py-4 px-6 text-center">
                {item.district || "غير متوفر"}
              </td>
              <td className="py-4 px-6 text-center">
                {item.contract || "غير متوفر"}
              </td>
              <td className="py-4 px-6 text-center">
                {item.agentOrOwner || "غير متوفر"}
              </td>
              <td className="py-4 px-6 text-center">
                {item.dossierAudit || "غير متوفر"}
              </td>
              <td className="py-4 px-6 text-center">
                {item.report || "غير متوفر"}
              </td>
              <td className="py-4 px-6 text-center">
                {item.lawsuitRegistration || "غير متوفر"}
              </td>
              <td className="py-4 px-6 text-center">
                {item.lawsuitNumber || "غير متوفر"}
              </td>
              <td className="py-4 px-6 text-center">
                {item.pleading || "غير متوفر"}
              </td>
              <td className="py-4 px-6 text-center">
                {item.inspection || "غير متوفر"}
              </td>
              <td className="py-4 px-6 text-center">
                {item.courtDecision || "غير متوفر"}
              </td>
              <td className="py-4 px-6 text-center">
                {item.paymentProcess || "غير متوفر"}
              </td>
              <td className="py-4 px-6 text-center">
                {item.acquiredArea || 0}
              </td>
              <td className="py-4 px-6 text-center">
                {item.areaUnit || "غير متوفر"}
              </td>
              <td className="py-4 px-6 text-center">
                {item.pricePerMeter || 0}
              </td>
              <td className="py-4 px-6 text-center">
                {item.totalPrice || 0}
              </td>
              <td className="py-4 px-6 text-center">
                {item.userName || "غير معروف"} /{" "}
                {formatDate(item.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const DecisionsTable = ({ data }) => {
  const navigate = useNavigate();

  if (!data || data.length === 0) return <div>لا توجد بيانات لعرضها</div>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full bg-white border border-[#D9D9D9] rounded-lg shadow-md">
        <thead className="bg-[#353535] sticky top-0 shadow-md -translate-y-px">
          <tr>
            {[
              "ت",
              "رقم العقار",
              "المقاطعة",
              "رقم الدعوى",
              "المساحة في السند",
              "المساحة المستملكة",
              "وحدة المساحة",
              "السعر الإجمالي",
              "ملاحظات",
              "نوع القرار",
              "أضيف بواسطة",
            ].map((header, idx) => (
              <th
                key={idx}
                className="py-4 px-6 text-center font-bold text-white"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr
              key={item.guidId || index}
              className="border-b border-[#D9D9D9] hover:bg-gray-100"
              onDoubleClick={() => {
                navigate(`/DecisionDetails/${item.guidId}`);
              }}
            >
              <td className="py-4 px-6 text-center">{index + 1}</td>
              <td className="py-4 px-6 text-center">
                {item.propertyNumber || "غير متوفر"}
              </td>
              <td className="py-4 px-6 text-center">
                {item.district || "غير متوفر"}
              </td>
              <td className="py-4 px-6 text-center">
                {item.lawsuitNumber || "غير متوفر"}
              </td>
              <td className="py-4 px-6 text-center">
                {item.areaInDeed || 0}
              </td>
              <td className="py-4 px-6 text-center">
                {item.acquiredArea || 0}
              </td>
              <td className="py-4 px-6 text-center">
                {item.areaUnit || "غير متوفر"}
              </td>
              <td className="py-4 px-6 text-center">
                {item.price || 0}
              </td>
              <td className="py-4 px-6 text-center">
                {item.notes || "غير متوفر"}
              </td>
              <td className={`py-4 px-6 text-center ${
                item.isDone ? 'text-green-600 font-semibold' : 'text-blue-600 font-semibold'
              }`}>
                {item.isDone ? "قرارات" : "إستملاك"}
              </td>
              <td className="py-4 px-6 text-center">
                {item.userName || "غير معروف"} /{" "}
                {formatDate(item.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const AllYearsTable = ({ data }) => {

  const navigate = useNavigate();

  if (!data || data.length === 0) return <div>لا توجد بيانات لعرضها</div>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full bg-white border border-[#D9D9D9] rounded-lg shadow-md">
        <thead className="bg-[#353535] sticky top-0 shadow-md -translate-y-px">
          <tr>
            {[
              "ت",
              "رقم العقار",
              "المقاطعة",
              "رقم الدعوى",
              "المساحة في السند",
              "المساحة المستملكة",
              "وحدة المساحة",
              "السعر بالمتر",
              "سنة الاستملاك",
              "موقف الاستملاك",
              "أضيف بواسطة",
            ].map((header, idx) => (
              <th
                key={idx}
                className="py-4 px-6 text-center font-bold text-white"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr
              key={item.guidId || index}
              className="border-b border-[#D9D9D9] hover:bg-gray-100"
              onDoubleClick={() => {
                navigate(`/AllYearsDetails/${item.guidId}`);
              }}
            >
              <td className="py-4 px-6 text-center">{index + 1}</td>
              <td className="py-4 px-6 text-center">
                {item.propertyNumber || "غير متوفر"}
              </td>
              <td className="py-4 px-6 text-center">
                {item.district || "غير متوفر"}
              </td>
              <td className="py-4 px-6 text-center">
                {item.lawsuitNumber || "غير متوفر"}
              </td>
              <td className="py-4 px-6 text-center">
                {item.areaInDeed || "غير متوفر"}
              </td>
              <td className="py-4 px-6 text-center">
                {item.acquiredArea || "غير متوفر"}
              </td>
              <td className="py-4 px-6 text-center">
                {item.areaUnit || "غير متوفر"}
              </td>
              <td className="py-4 px-6 text-center">
                {item.pricePerMeter || "غير متوفر"}
              </td>
              <td className="py-4 px-6 text-center">
                {item.acquisitionYear || "غير متوفر"}
              </td>
              <td className="py-4 px-6 text-center">
                {item.acquisitionStatus || "غير متوفر"}
              </td>
              <td className="py-4 px-6 text-center">
                {item.userName || "غير معروف"} /{" "}
                {formatDate(item.createAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const CustomTable = ({ tableType, data }) => {
  const renderTable = () => {
    switch (tableType) {
      case "Stocks":
        return <StocksTable data={data} />;
      case "YearsDB":
        return <YearsDBTable data={data} />;
      case "AllYears":
        return <AllYearsTable data={data} />;
      case "Decisions":
        return <DecisionsTable data={data} />;
      default:
        return <div>نوع الجدول غير معروف</div>;
    }
  };

  return renderTable();
};

export default CustomTable;