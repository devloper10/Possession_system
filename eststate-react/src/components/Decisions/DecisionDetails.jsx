// DecisionDetails.jsx
import React, { useEffect, useState } from "react";
import "../../assets/css/styleImgDetails.css"; // قم بإنشاء ملف CSS حسب الحاجة أو استخدم نفس التنسيق
import { useParams } from "react-router-dom";
import api from "@/api";

const DecisionDetails = () => {
  const { guidId } = useParams();
  const [details, setDetails] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await api.get(`/Decisions/GetDecisionDetails/${guidId}`);
        setDetails(response.data);
      } catch (error) {
        console.error("Error fetching details:", error);
      }
    };

    fetchDetails();
  }, [guidId]);

  const formatDate = (date) => {
    if (!date) return "غير متوفر";

    // تحويل التاريخ إلى كائن Date
    const optionsDate = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: "Asia/Baghdad", // تحديد توقيت بغداد
    };

    const optionsTime = {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
      timeZone: "Asia/Baghdad", // تحديد توقيت بغداد
    };

    // استخراج الجزء الخاص بالتاريخ والوقت بشكل منفصل
    const formattedDate = new Date(date).toLocaleDateString("en-CA", optionsDate);
    const formattedTime = new Date(date).toLocaleTimeString("en-CA", optionsTime);

    // دمج التاريخ والوقت بالفاصلة المطلوبة
    return `${formattedDate} / ${formattedTime.toLowerCase()}`;
  };

  const openImagePopup = (path) => {
    setSelectedImage(path);
  };

  const closeImagePopup = () => {
    setSelectedImage(null);
  };

  if (!details) {
    return <p>Loading...</p>;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen flex justify-center">
      <div className="w-full h-[93vh] bg-white rounded-lg shadow-lg p-6 flex gap-10">
        {/* قسم التفاصيل */}
        <div className="w-2/3 flex flex-col gap-4 px-10">
        <div className="contaner">
        <button
            onClick={() => {
              window.history.back();
            }}
            className="px-3 py-2 bg-red-500 text-white font-serif font-bold rounded-xl transform duration-200 ease-in-out hover:bg-red-700"
          >
            رجوع
          </button>
          <h2 className="text-3xl font-bold text-gray-800 text-center">
            تفاصيل العقار رقم: {details.propertyNumber}
          </h2>
        </div>
          <div className="grid grid-cols-2 gap-14 xl:gap-20 text-center mt-8">
            <p className="text-gray-700 text-lg">
              <strong>المقاطعة: </strong> {details.district}
            </p>
            <p className="text-gray-700 text-lg">
              <strong>رقم الدعوى: </strong> {details.lawsuitNumber || "غير متوفر"}
            </p>
            <p className="text-gray-700 text-lg">
              <strong>المساحة في السند: </strong> {details.areaInDeed || "غير متوفر"}
            </p>
            <p className="text-gray-700 text-lg">
              <strong>المساحة المستملكة: </strong> {details.acquiredArea || "غير متوفر"}
            </p>
            <p className="text-gray-700 text-lg">
              <strong>سعر المتر: </strong> {details.pricePerMeter || "غير متوفر"}
            </p>
            <p className="text-gray-700 text-lg">
              <strong>سعر الكلي: </strong> {details.price || "غير متوفر"}
            </p>
            <p className="text-gray-700 text-lg">
              <strong>موقف الاستملاك: </strong> {details.acquisitionStatus || "غير متوفر"}
            </p>
            <p className="text-gray-700 text-lg">
              <strong>موقف السند: </strong> {details.isDone === true ? "تم الحسم (السند)" : "لم يتم حسم (السند)"}
            </p>
            <p className="text-gray-700 text-lg">
              <strong>أضيف بواسطة: </strong> {details.userName || "غير معروف"}
            </p>
            <p className="text-gray-700 text-lg">
              <strong>تاريخ الإضافة: </strong>
              <span dir="ltr">{formatDate(details.createdAt || "غير معروف")}</span>
            </p>
            {details.deletedAt && (
              <p className="text-gray-700 text-lg">
                <strong>تاريخ الحذف: </strong> 
                <span dir="ltr">{formatDate(details.deletedAt || "غير معروف")}</span>
              </p>
            )}
          </div>

          {/* الملاحظات */}
          <div className="mt-4">
            <h3 className="text-lg font-bold text-gray-700">ملاحظات</h3>
            <p className="w-full mt-2 p-4 h-36 border border-gray-300 rounded-lg overflow-y-scroll break-words">
              {details.notes || "لا توجد ملاحظات"}
            </p>
          </div>
        </div>

        {/* قسم الصور */}
        <div className="w-1/3">
          <h3 className="text-xl font-bold text-gray-700 mb-4">صور وملفات العقار</h3>
          <div className="overflow-y-auto p-2 m-1 grid xl:grid-cols-3 lg:grid-cols-2 gap-y-4 justify-center h-[94%]">
            {details.imageFilePaths && details.imageFilePaths.length > 0 ? (
              details.imageFilePaths.map((path, index) => {
                const fileUrl = `${import.meta.env.VITE_APIIMAGES_BASE_URL}${path}`;
                console.log("Image File Paths:", details.imageFilePaths);

                const isPdf = path.toLowerCase().endsWith(".pdf");

                return isPdf ? (
                  <div
                    key={index}
                    className="w-32 h-32 flex items-center justify-center border border-gray-300 rounded-lg shadow-sm bg-gray-100 cursor-pointer"
                    onClick={() => openImagePopup(fileUrl)}
                  >
                    <i className="fa-solid fa-file-pdf text-red-600 text-5xl"></i>
                  </div>
                ) : (
                  <img
                    key={index}
                    src={fileUrl}
                    alt={`File ${index + 1}`}
                    className="w-32 h-32 object-cover border border-gray-300 rounded-lg shadow-sm cursor-pointer"
                    onClick={() => openImagePopup(fileUrl)}
                  />
                );
              })
            ) : (
              <p className="text-gray-500">لا توجد صور أو ملفات.</p>
            )}
          </div>
        </div>
      </div>

      {/* النافذة المنبثقة */}
      {selectedImage && (
        <div
          onClick={closeImagePopup}
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
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
              className="w-10/12 h-5/6 max-w-full max-h-full rounded-lg shadow-lg bg-white"
            ></iframe>
          ) : (
            <img
              src={selectedImage}
              alt="Expanded View"
              className="w-10/12 max-w-full max-h-full object-contain rounded-lg shadow-lg"
            />
          )}
        </div>
      )}
    </div>
  );
};

export default DecisionDetails;
