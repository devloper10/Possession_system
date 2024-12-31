import React, { useEffect, useState } from "react";
import "../../assets/css/styleImgDetails.css";
import { useParams , useNavigate } from "react-router-dom";
import api from "@/api";

const EstateDetails = () => {
  const { guidId } = useParams();
  const [details, setDetails] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);

  const navigate = useNavigate();


  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    propertyNumber: "",
    side: "",
    istimlackStatus: "",
    totalArea: "",
    yearlyArea: {},
    status: "",
    notes: "",
    imageFilePaths: [],
  });

  const closeEditPopup = () => setIsEditPopupOpen(false);

  const currentYear = new Date().getUTCFullYear();
  const years = Array.from(
    { length: currentYear - 2017 + 1 },
    (_, i) => 2017 + i
  );

  const openEditPopup = (row) => {
    setEditFormData({
      guidId: row.guidId,
      propertyNumber: row.propertyNumber,
      side: row.side,
      istimlackStatus: row.istimlackStatus,
      totalArea: row.totalArea,
      yearlyArea:
        row.yearlyArea ||
        years.reduce((acc, year) => {
          acc[year] = ""; // إعداد قيم افتراضية للسنة إذا لم تكن موجودة
          return acc;
        }, {}),
      status: row.status,
      notes: row.notes,
      imageFilePaths: row.imageFilePath,
    });
    setIsEditPopupOpen(true);
  };

  const handleSaveEdit = async (updatedData) => {
    try {
      const payload = {
        propertyNumber: updatedData.propertyNumber,
        side: updatedData.side,
        istimlackStatus: updatedData.istimlackStatus,
        totalArea: parseFloat(updatedData.totalArea),
        status: updatedData.status,
        notes: updatedData.notes,
        yearlyArea: updatedData.yearlyArea, // إرسال المساحات السنوية
      };
      console.log(payload);

      await api.put(`/Stocks/PutEstate/${updatedData.guidId}`, payload);

      setDetails(payload);

      closeEditPopup();


      Swal.fire({
        title: "تم التحديث",
        text: "تم تحديث البيانات بنجاح!",
        icon: "success",
        confirmButtonText: "موافق",
      });
    } catch (error) {
      console.error("Error updating data:", error);
      Swal.fire({
        title: "خطأ",
        text: "حدث خطأ أثناء تحديث البيانات",
        icon: "error",
        confirmButtonText: "موافق",
      });
    }
  };

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await api.get(`/Stocks/GetEstateDetails/${guidId}`);
        setDetails(response.data);
      } catch (error) {
        console.error("Error fetching details:", error);
      }
    };

    fetchDetails();
  }, [guidId]);

  if (!details) {
    return <p>Loading...</p>;
  }

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
    const formattedDate = new Date(date).toLocaleDateString(
      "en-CA",
      optionsDate
    );
    const formattedTime = new Date(date).toLocaleTimeString(
      "en-CA",
      optionsTime
    );

    // دمج التاريخ والوقت بالفاصلة المطلوبة
    return `${formattedDate} / ${formattedTime.toLowerCase()}`;
  };

  return (
    <div className="p-6 bg-[#E4F1F1] min-h-screen flex justify-center overflow-y-auto overflow-x-auto">
      <div className="w-full rounded-lg flex gap-10">
        {/* قسم التفاصيل */}
        <div className="w-2/3 flex flex-col gap-4 px-10 py-7 bg-[#fffef4] rounded-lg">
          {/* العنوان */}
          <div className="contaner">
            <button
              onClick={() => navigate(-1)}
              className="px-3 py-2 bg-red-500 text-white font-serif font-bold rounded-xl transform duration-200 ease-in-out hover:bg-red-700"
            >
              رجوع
            </button>
            <button
              className="px-3 py-2 mr-5 bg-blue-600 text-white font-serif font-bold rounded-xl transform duration-200 ease-in-out hover:bg-blue-800"
              onClick={() => {
                openEditPopup(details);
              }}
            >
              تعديل
            </button>
            <h2 className="text-3xl font-bold text-gray-800 text-center">
              تفاصيل رقم العقار : {details.propertyNumber}
            </h2>
          </div>

          {/* المعلومات الأساسية */}
          <div className="grid grid-cols-2 gap-y-4 text-center mt-8">
            <p className="text-gray-700 text-lg">
              <strong>الجهة : </strong> {details.side}
            </p>
            <p className="text-gray-700 text-lg">
              <strong>حالة الإستملاك : </strong> {details.istimlackStatus}
            </p>
            <p className="text-gray-700 text-lg">
              <strong>مساحة السند : </strong> {details.totalArea || 0}
            </p>
            <p className="text-gray-700 text-lg">
              <strong>الحالة : </strong> {details.status}
            </p>
            <p className="text-gray-700 text-lg">
              <strong>إضافة بواسطة: </strong> {details.userName || "غير متوفر"}
            </p>
            <p className="text-gray-700 text-lg">
              <strong>تاريخ الإضافة : </strong>
              <span dir="ltr">
                {details.createdAt
                  ? formatDate(details.createdAt)
                  : "غير متوفر"}
              </span>
            </p>
            {details.deletedAt && (
              <p className="text-gray-700 text-lg">
                <strong>تاريخ الحذف : </strong>
                <span dir="ltr">{formatDate(details.deletedAt)}</span>
              </p>
            )}
          </div>

          {/* قسم الملاحظات */}
          <div className="mt-4">
            <h3 className="text-lg font-bold text-gray-700">ملاحظات</h3>
            <p className="w-full mt-2 p-4 h-36 border border-gray-300 rounded-lg overflow-y-scroll break-words cursor-default">
              {details.notes}
            </p>
          </div>

          {/* جدول المساحات السنوية بشكل أفقي */}
          {/* جدول المساحات السنوية */}
          <div className="mt-4">
            <h3 className="text-lg font-bold text-gray-700 text-center mb-4">
              المساحات السنوية
            </h3>
            <div className="overflow-x-auto" style={{ height: "310px" }}>
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead className="bg-gray-100 text-gray-600 uppercase text-sm sticky top-0 z-10 -translate-y-px">
                  <tr>
                    <th className="py-3 px-6 text-center border-b">السنة</th>
                    <th className="py-3 px-6 text-center border-b">المساحة</th>
                  </tr>
                </thead>
                <tbody
                  className="overflow-y-auto translate-y-px"
                  style={{ maxHeight: "200px" }}
                >
                  {details.yearlyArea &&
                    Object.entries(details.yearlyArea).map(
                      ([year, area], index) => (
                        <tr key={index} className="border-b">
                          <td className="py-3 px-6 text-center text-gray-700">
                            {year}
                          </td>
                          <td className="py-3 px-6 text-center text-gray-700">
                            {area || 0}
                          </td>
                        </tr>
                      )
                    )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* قسم الصور وملفات PDF */}
        <div className="w-1/3 bg-[#fffef4] px-10 py-7 rounded-lg">
          <h3 className="text-xl font-bold text-gray-700 mb-4">
            صور وملفات العقار
          </h3>
          <div className="flex flex-wrap gap-y-8 justify-center overflow-y-auto h-94vh max-h-770px property-images">
            {details.imageFilePath && details.imageFilePath.length > 0 ? (
              details.imageFilePath.map((path, index) => {
                const fileUrl = `${
                  import.meta.env.VITE_APIIMAGES_BASE_URL
                }${path}`;
                const isPdf = path.toLowerCase().endsWith(".pdf");

                if (isPdf) {
                  return (
                    <div
                      key={index}
                      className="w-48 h-32 flex items-center justify-center border border-gray-300 rounded-lg shadow-sm bg-gray-100 cursor-pointer"
                      onClick={() => openImagePopup(fileUrl)}
                    >
                      <i className="fa-solid fa-file-pdf text-red-600 text-6xl"></i>
                    </div>
                  );
                } else {
                  return (
                    <img
                      key={index}
                      src={fileUrl}
                      alt={`Property File ${index + 1}`}
                      className="w-48 h-32 object-cover border border-gray-300 rounded-lg shadow-sm cursor-pointer"
                      onClick={() => openImagePopup(fileUrl)}
                    />
                  );
                }
              })
            ) : (
              <p className="text-gray-500">لا توجد صور أو ملفات متاحة.</p>
            )}
          </div>
        </div>
      </div>

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
              className="w-9/12 h-5/6 max-w-full max-h-full rounded-lg shadow-lg bg-white"
            ></iframe>
          ) : (
            <img
              src={selectedImage}
              alt="Expanded Property"
              className="w-9/12 max-w-full max-h-full object-contain rounded-lg shadow-lg"
            />
          )}
        </div>
      )}

      {isEditPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-1/2 py-6 px-10 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-center">
              تعديل البيانات
            </h2>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold">رقم العقار</label>
                  <input
                    type="text"
                    name="propertyNumber"
                    value={editFormData.propertyNumber}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        propertyNumber: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block font-semibold">الجهة</label>
                  <input
                    type="text"
                    name="side"
                    value={editFormData.side}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        side: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block font-semibold">حالة الإستملاك</label>
                  <input
                    type="text"
                    name="istimlackStatus"
                    value={editFormData.istimlackStatus}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        istimlackStatus: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block font-semibold">مساحة السند</label>
                  <input
                    type="number"
                    name="totalArea"
                    value={editFormData.totalArea}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        totalArea: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block font-semibold">الحالة</label>
                  <input
                    type="text"
                    name="status"
                    value={editFormData.status}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        status: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold">الملاحظات</label>
                <textarea
                  name="notes"
                  value={editFormData.notes}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      notes: e.target.value,
                    })
                  }
                  className="w-full h-32 max-h-32 p-2 border border-gray-300 rounded"
                ></textarea>
              </div>

              <div>
                <label className="block font-semibold">المساحات السنوية</label>
                <div className="space-y-2 max-h-52 overflow-y-auto border border-gray-200 px-6 py-4 rounded">
                  {years.map((year) => (
                    <div key={year} className="flex items-center mb-2">
                      <span className="w-20">{year}</span>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="رقم"
                        value={editFormData.yearlyArea?.[year] || ""}
                        onChange={(e) =>
                          setEditFormData((prev) => ({
                            ...prev,
                            yearlyArea: {
                              ...prev.yearlyArea,
                              [year]: e.target.value,
                            },
                          }))
                        }
                        onWheel={(e) => e.target.blur()}
                        className="w-full p-2 border border-gray-300 rounded appearance-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex w-full justify-end space-x-2 mt-4">
                <button
                  type="button"
                  onClick={closeEditPopup}
                  className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 ml-3"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveEdit(editFormData)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  حفظ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EstateDetails;
