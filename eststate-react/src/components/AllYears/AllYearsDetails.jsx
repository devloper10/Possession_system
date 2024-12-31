import React, { useEffect, useState } from "react";
import "../../assets/css/styleImgDetails.css"; // قم بإنشاء ملف CSS حسب الحاجة أو استخدم نفس التنسيق
import { useParams , useNavigate } from "react-router-dom";
import api from "@/api";

const AllYearsDetails = () => {
  const { guidId } = useParams();
  const [details, setDetails] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);

    const navigate = useNavigate();
  

  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    propertyNumber: "", //
    district: "", //
    lawsuitNumber: "", //
    areaInDeed: "", //
    acquiredArea: "", //
    areaUnit: "", //
    pricePerMeter: "", //
    acquisitionYear: "", //
    acquisitionStatus: "", //
    notes: "", //
  });

  const openEditPopup = (row) => {
    setEditFormData({
      guidId: row.guidId,
      propertyNumber: row.propertyNumber,
      district: row.district,
      lawsuitNumber: row.lawsuitNumber,
      areaInDeed: row.areaInDeed,
      acquiredArea: row.acquiredArea,
      areaUnit: row.areaUnit,
      pricePerMeter: row.pricePerMeter,
      acquisitionYear: row.acquisitionYear,
      acquisitionStatus: row.acquisitionStatus,
      notes: row.notes,
      imageFilePath: row.imageFilePaths,
    });
    setIsEditPopupOpen(true);
  };

  const closeEditPopup = () => setIsEditPopupOpen(false);

  const [isCustomAcquisitionStatus, setIsCustomAcquisitionStatus] =
      useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await api.get(
          `/AllYears/GetAllYearsDetails/${guidId}`
        );
        setDetails(response.data);
      } catch (error) {
        console.error("Error fetching details:", error);
      }
    };

    fetchDetails();
  }, [guidId]);

  const handleSaveEdit = async (updatedData) => {
      try {
        const payload = {
          propertyNumber: updatedData.propertyNumber,
          district: updatedData.district,
          lawsuitNumber: updatedData.lawsuitNumber,
          areaInDeed: updatedData.areaInDeed,
          acquiredArea: updatedData.acquiredArea,
          areaUnit: updatedData.areaUnit,
          pricePerMeter: updatedData.pricePerMeter,
          acquisitionYear: updatedData.acquisitionYear,
          acquisitionStatus: updatedData.acquisitionStatus,
          notes: updatedData.notes,
        };
  
        await api.put(`/AllYears/PutAllYears/${updatedData.guidId}`, payload);
  
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
    <div className="p-8 bg-gray-100 min-h-screen flex justify-center">
      <div className="w-full h-[93vh] bg-white rounded-lg shadow-lg p-6 flex gap-10">
        {/* قسم التفاصيل */}
        <div className="w-2/3 flex flex-col gap-4 px-10">
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
              تفاصيل العقار رقم: {details.propertyNumber}
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-y-16 text-center mt-8">
            <p className="text-gray-700 text-lg">
              <strong>المقاطعة: </strong> {details.district}
            </p>
            <p className="text-gray-700 text-lg">
              <strong>رقم الدعوى: </strong>{" "}
              {details.lawsuitNumber || "غير متوفر"}
            </p>
            <p className="text-gray-700 text-lg">
              <strong>المساحة في السند: </strong> {details.areaInDeed || 0}
            </p>
            <p className="text-gray-700 text-lg">
              <strong>المساحة المستملكة: </strong> {details.acquiredArea || 0}
            </p>
            <p className="text-gray-700 text-lg">
              <strong>سعر المتر: </strong> {details.pricePerMeter || 0}
            </p>
            <p className="text-gray-700 text-lg">
              <strong>سنة الاستملاك: </strong>{" "}
              {details.acquisitionYear || "غير متوفر"}
            </p>
            <p className="text-gray-700 text-lg">
              <strong>موقف الاستملاك: </strong>{" "}
              {details.acquisitionStatus || "غير متوفر"}
            </p>
            <p className="text-gray-700 text-lg">
              <strong>أضيف بواسطة: </strong> {details.userName || "غير معروف"}
            </p>
            <p className="text-gray-700 text-lg">
              <strong>تاريخ الإضافة: </strong>
              <span dir="ltr">
                {formatDate(details.createAt || "غير معروف")}
              </span>
            </p>
            {details.deletedAt && (
              <p className="text-gray-700 text-lg">
                <strong>تاريخ الحذف: </strong>
                <span dir="ltr">
                  {formatDate(details.deletedAt || "غير معروف")}
                </span>
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
          <h3 className="text-xl font-bold text-gray-700 mb-4">
            صور وملفات العقار
          </h3>
          <div className="overflow-y-auto p-2 m-1 grid grid-cols-3 gap-y-4 justify-center h-94vh max-h-770px">
            {details.imageFilePaths && details.imageFilePaths.length > 0 ? (
              details.imageFilePaths.map((path, index) => {
                const fileUrl = `${
                  import.meta.env.VITE_APIIMAGES_BASE_URL
                }${path}`;
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

      {isEditPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-5xl py-6 px-8 rounded-lg shadow-lg overflow-auto max-h-[90vh]">
            <h2 className="text-2xl font-bold mb-6 text-center">
              تعديل البيانات
            </h2>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* الحقول الحالية */}
                {/* رقم العقار */}
                <div>
                  <label className="block font-semibold">رقم العقار</label>
                  <input
                    type="text"
                    name="propertyNumber"
                    value={editFormData.propertyNumber || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        propertyNumber: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>

                {/* المقاطعة */}
                <div>
                  <label className="block font-semibold">المقاطعة</label>
                  <input
                    type="text"
                    name="district"
                    value={editFormData.district || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        district: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>

                {/* رقم الدعوى */}
                <div>
                  <label className="block font-semibold">رقم الدعوى</label>
                  <input
                    type="text"
                    name="lawsuitNumber"
                    value={editFormData.lawsuitNumber || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        lawsuitNumber: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>

                {/* المساحة في السند */}
                <div>
                  <label className="block font-semibold">
                    المساحة في السند
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="areaInDeed"
                    value={editFormData.areaInDeed || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        areaInDeed: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>

                {/* المساحة المستملكة */}
                <div>
                  <label className="block font-semibold">
                    المساحة المستملكة
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="acquiredArea"
                    value={editFormData.acquiredArea || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        acquiredArea: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>

                {/* وحدة المساحة */}
                <div>
                  <label className="block font-semibold">وحدة المساحة</label>
                  <input
                    type="text"
                    name="areaUnit"
                    value={editFormData.areaUnit || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        areaUnit: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>

                {/* سعر المتر */}
                <div>
                  <label className="block font-semibold">سعر المتر</label>
                  <input
                    type="number"
                    step="0.01"
                    name="pricePerMeter"
                    value={editFormData.pricePerMeter || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        pricePerMeter: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>

                {/* سنة الاستملاك */}
                <div>
                  <label className="block font-semibold">سنة الاستملاك</label>
                  <input
                    type="number"
                    name="acquisitionYear"
                    value={editFormData.acquisitionYear || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        acquisitionYear: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>

                {/* موقف الاستملاك */}
                <div>
                  <label className="block font-semibold">موقف الاستملاك</label>
                  <select
                    name="acquisitionStatus"
                    value={
                      editFormData.acquisitionStatus === "custom"
                        ? "custom"
                        : editFormData.acquisitionStatus
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "custom") {
                        setEditFormData({
                          ...editFormData,
                          acquisitionStatus: "",
                        });
                        setIsCustomAcquisitionStatus(true); // تفعيل الحقل المخصص
                      } else {
                        setEditFormData({
                          ...editFormData,
                          acquisitionStatus: value,
                        });
                        setIsCustomAcquisitionStatus(false); // إلغاء تفعيل الحقل المخصص
                      }
                    }}
                    className="w-full p-2 border border-gray-300 rounded"
                  >
                    <option value="">اختر موقف الاستملاك</option>
                    <option value="تم الحسم سند">تم الحسم سند</option>
                    <option value="لم يتم الحسم سند">لم يتم الحسم سند</option>
                    <option value="custom">إجراء مخصص</option>
                  </select>

                  {/* حقل الإدخال المخصص */}
                  {isCustomAcquisitionStatus && (
                    <input
                      type="text"
                      name="acquisitionStatus"
                      placeholder="أدخل إجراء مخصص"
                      value={editFormData.acquisitionStatus}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          acquisitionStatus: e.target.value,
                        })
                      }
                      className="w-full mt-2 p-2 border border-gray-300 rounded"
                    />
                  )}
                </div>

                {/* ملاحظات */}
                <div className="col-span-2">
                  <label className="block font-semibold">ملاحظات</label>
                  <textarea
                    name="notes"
                    value={editFormData.notes || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        notes: e.target.value,
                      })
                    }
                    className="w-full h-32 max-h-32 p-2 border border-gray-300 rounded"
                    rows="4"
                    placeholder="أدخل الملاحظات هنا..."
                  ></textarea>
                </div>
              </div>

              {/* الأزرار */}
              <div className="flex justify-end space-x-2 mt-4">
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

export default AllYearsDetails;
