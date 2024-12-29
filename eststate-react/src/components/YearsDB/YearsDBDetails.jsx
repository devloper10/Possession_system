import React, { useEffect, useState } from "react";
import "../../assets/css/styleImgDetails.css";
import { useParams } from "react-router-dom";
import api from "@/api";

const YearsDBDetails = () => {
  const { guidId } = useParams();
  const [details, setDetails] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await api.get(`/YearsDB/GetYearsDBDetails/${guidId}`);
        setDetails(response.data);
      } catch (error) {
        console.error("Error fetching details:", error);
      }
    };

    fetchDetails();
  }, [guidId]);

  // فتح الصورة في نافذة منبثقة
  const openImagePopup = (path) => {
    setSelectedImage(path);
  };

  // إغلاق النافذة المنبثقة
  const closeImagePopup = () => {
    setSelectedImage(null);
  };

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
    return new Date(date).toLocaleString("en-CA", options).replace(",", "");
  };

  return (
    <div className="p-8 h-screen flex bg-[#E4F1F1]">
      {/* القسم الأول */}
      <div className="bg-[#fffef4] rounded-lg shadow-lg p-6 w-2/3 h-full flex flex-col gap-4">
        <div className="contaner">
          <button
            onClick={() => {
              window.history.back();
            }}
            className="px-3 py-2 bg-red-500 text-white font-serif font-bold rounded-xl transform duration-200 ease-in-out hover:bg-red-700"
          >
            رجوع
          </button>
          <h2 className="text-xl font-bold text-center mb-16 text-[#244345]">
            تفاصيل رقم العقار : {details.propertyNumber || "غير متوفر"}
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-1 mx-10">
          <div className="grid lg:gap-6 gap-y-8">
            <p className="text-[#244345]">
              <strong>المقاطعة :</strong> {details.district || "غير متوفر"}
            </p>
            <p className="text-[#244345]">
              <strong>المساحة المستملكة :</strong>{" "}
              {details.acquiredArea || "غير متوفر"}
            </p>
            <p className="text-[#244345]">
              <strong>المساحة المتبقية م2 :</strong>{" "}
              {details.remainingArea || "غير متوفر"}
            </p>
            <p className="text-[#244345]">
              <strong>تدقيق الأضابير :</strong>{" "}
              {details.dossierAudit || "غير متوفر"}
            </p>
            <p className="text-[#244345]">
              <strong>ترويج معاملة صرف المستحقات :</strong>{" "}
              {details.paymentProcess || "غير متوفر"}
            </p>
            <p className="text-[#244345]">
              <strong>رقم الصك :</strong> {details.deedNumber || "غير متوفر"}
            </p>
            <p className="text-[#244345]">
              <strong>تأريخ الصك :</strong>{" "}
              {formatDate(details.deedDate || "غير متوفر")}
            </p>
            <p className="text-[#244345]">
              <strong> اضيف بواسطة :</strong> {details.userName || "غير متوفر"}
            </p>
          </div>
          <div className="grid lg:gap-6 gap-y-8">
            <p className="text-[#244345]">
              <strong>اسم الوكيل أو صاحب الملك :</strong>{" "}
              {details.agentOrOwner || "غير متوفر"}
            </p>
            <p className="text-[#244345]">
              <strong>وحدة المساحة :</strong> {details.areaUnit || "غير متوفر"}
            </p>
            <p className="text-[#244345]">
              <strong>المحضر :</strong> {details.report || "غير متوفر"}
            </p>
            <p className="text-[#244345]">
              <strong>السعر بالمتر :</strong>{" "}
              {details.pricePerMeter || "غير متوفر"}
            </p>
            <p className="text-[#244345]">
              <strong>السعر الكلي :</strong> {details.totalPrice || "غير متوفر"}
            </p>
            <p className="text-[#244345]">
              <strong>إجراءات المعاملة :</strong>{" "}
              {details.transactionActions || "غير متوفر"}
            </p>
            <p className="text-[#244345]">
              <strong>موقع العقار :</strong>{" "}
              {details.propertyLocation || "غير متوفر"}
            </p>
          </div>
        </div>
        <div className="mt-6">
          <h3 className="text-lg font-bold mb-3 mx-10 text-[#244345]">
            ملاحضات
          </h3>
          <textarea
            value={details.note || "غير متوفر"}
            readOnly
            className="w-11/12 h-40 px-4 py-2 bg-[#fffeed] border border-gray-500 rounded-lg resize-none mx-10 outline-none text-[#244345] cursor-default"
          ></textarea>
        </div>
      </div>

      {/* القسم الثاني والثالث */}
      <div className="w-1/3 flex flex-col gap-4 pl-6 mr-7">
        {/* القسم الثاني */}
        <div className="bg-[#fffef4] rounded-lg shadow-lg p-4 h-1/2">
          <h3 className="text-lg font-bold mt-2 mr-1 text-[#244345]">
            تفاصيل إضافية
          </h3>
          <div className="grid grid-cols-1 gap-5 m-8">
            <p className="text-[#244345]">
              <strong>التعاقد :</strong> {details.contract || "غير متوفر"}
            </p>
            <p className="text-[#244345]">
              <strong>تسجيل الدعوى :</strong>{" "}
              {details.lawsuitRegistration || "غير متوفر"}
            </p>
            <p className="text-[#244345]">
              <strong>رقم الدعوى :</strong>{" "}
              {details.lawsuitNumber || "غير متوفر"}
            </p>
            <p className="text-[#244345]">
              <strong>المرافعة :</strong> {details.pleading || "غير متوفر"}
            </p>
            <p className="text-[#244345]">
              <strong>الكشف :</strong> {details.pleading || "غير متوفر"}
            </p>
            <p className="text-[#244345]">
              <strong>قرار المحكمة :</strong> {details.pleading || "غير متوفر"}
            </p>
            <p className="text-[#244345]">
              <strong>تاريخ الاضافة :</strong>
              <span dir="ltr">
                {formatDate(details.createdAt || "غير متوفر")}
              </span>
            </p>
            {details.deletedAt && (
              <p className="text-[#244345]">
                <strong>تاريخ الحذف : </strong>
                <span dir="ltr">
                  {formatDate(details.deletedAt || "غير متوفر")}
                </span>
              </p>
            )}
          </div>
        </div>

        {/* القسم الثالث */}
        <div className="bg-[#fffef4] rounded-lg shadow-lg p-4 h-1/2">
          <h3 className="text-lg font-bold text-center mb-4 text-[#244345]">
            الصور والملفات
          </h3>
          <div className="overflow-y-auto h-80 p-2 m-1 flex flex-wrap gap-y-4 justify-center property-images">
            {details.imageFilePaths && details.imageFilePaths.length > 0 ? (
              details.imageFilePaths.map((path, index) => {
                const fileUrl = `${
                  import.meta.env.VITE_APIIMAGES_BASE_URL
                }${path}`;
                const isPdf = path.toLowerCase().endsWith(".pdf");

                return isPdf ? (
                  <div
                    key={index}
                    className="mb-2 w-48 h-32 flex items-center justify-center border border-gray-300 rounded-lg shadow-sm bg-gray-100 cursor-pointer"
                    onClick={() => openImagePopup(fileUrl)}
                  >
                    <i className="fa-solid fa-file-pdf text-red-600 text-6xl"></i>
                  </div>
                ) : (
                  <img
                    key={index}
                    src={fileUrl}
                    alt={`File ${index + 1}`}
                    className="mb-2 w-48 h-32 object-cover border border-gray-300 rounded-lg shadow-sm cursor-pointer"
                    onClick={() => openImagePopup(fileUrl)}
                  />
                );
              })
            ) : (
              <p className="text-gray-500 text-center">
                لا توجد صور أو ملفات متاحة.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* نافذة منبثقة للصور وملفات PDF */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={closeImagePopup}
        >
          <button
            className="absolute top-2 right-40 text-red-600 text-6xl transition duration-500 ease-in-out hover:text-red-500"
            onClick={closeImagePopup}
          >
            &times;
          </button>
          {selectedImage.toLowerCase().endsWith(".pdf") ? (
            <iframe
              src={selectedImage}
              title="PDF Viewer"
              className="w-9/12 h-5/6 max-w-full max-h-full rounded-lg shadow-lg bg-white"
            ></iframe>
          ) : (
            <img
              src={selectedImage}
              alt="Expanded"
              className="w-9/12 max-w-full max-h-full rounded-lg"
            />
          )}
        </div>
      )}
    </div>
  );
};

export default YearsDBDetails;
