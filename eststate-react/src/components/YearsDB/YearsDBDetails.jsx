import React, { useEffect, useState } from "react";
import "../../assets/css/styleImgDetails.css";
import { useParams , useNavigate } from "react-router-dom";
import api from "@/api";

const YearsDBDetails = () => {
  const { guidId } = useParams();
  const [details, setDetails] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [isCustomEdit, setIsCustomEdit] = useState(false);

  const navigate = useNavigate();


  const openEditPopup = (row) => {
    setEditFormData({
      guidId: row.guidId,
      propertyNumber: row.propertyNumber,
      district: row.district,
      contract: row.contract,
      agentOrOwner: row.agentOrOwner,
      dossierAudit: row.dossierAudit,
      report: row.report,
      lawsuitRegistration: row.lawsuitRegistration,
      lawsuitNumber: row.lawsuitNumber,
      pleading: row.pleading,
      inspection: row.inspection,
      courtDecision: row.courtDecision,
      paymentProcess: row.paymentProcess,
      acquiredArea: row.acquiredArea,
      areaUnit: row.areaUnit,
      pricePerMeter: row.pricePerMeter,
      deedNumber: row.deedNumber,
      deedDate: row.deedDate,
      remainingArea: row.remainingArea,
      transactionActions: row.transactionActions,
      propertyLocation: row.propertyLocation,
      note: row.note,
      imageFilePath: row.imageFilePaths,
    });
    setIsEditPopupOpen(true);
  };

  const closeEditPopup = () => setIsEditPopupOpen(false);

  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    propertyNumber: "", //
    district: "", //
    contract: "", //
    agentOrOwner: "", //
    dossierAudit: "", //
    report: "", //
    lawsuitRegistration: "", //
    lawsuitNumber: "", //
    pleading: "", //
    inspection: "", //
    courtDecision: "", //
    paymentProcess: "", //
    acquiredArea: "", //
    areaUnit: "", //
    pricePerMeter: "", //
    deedNumber: "", //
    deedDate: "", //
    remainingArea: "", //
    transactionActions: "", //
    propertyLocation: "", //
    note: "", //
  });

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

  const handleSaveEdit = async (updatedData) => {
      try {
        const payload = {
          propertyNumber: updatedData.propertyNumber,
          district: updatedData.district,
          contract: updatedData.contract,
          agentOrOwner: updatedData.agentOrOwner,
          dossierAudit: updatedData.dossierAudit,
          report: updatedData.report,
          lawsuitRegistration: updatedData.lawsuitRegistration,
          lawsuitNumber: updatedData.lawsuitNumber,
          pleading: updatedData.pleading,
          inspection: updatedData.inspection,
          courtDecision: updatedData.courtDecision,
          paymentProcess: updatedData.paymentProcess,
          acquiredArea: updatedData.acquiredArea,
          areaUnit: updatedData.areaUnit,
          pricePerMeter: updatedData.pricePerMeter,
          deedNumber: updatedData.deedNumber,
          deedDate: updatedData.deedDate,
          remainingArea: updatedData.remainingArea,
          transactionActions: updatedData.transactionActions,
          propertyLocation: updatedData.propertyLocation,
          note: updatedData.note,
        };
  
        await api.put(`/YearsDB/PutYearsDB/${updatedData.guidId}`, payload);
  
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
              <strong>المساحة المستملكة :</strong> {details.acquiredArea || 0}
            </p>
            <p className="text-[#244345]">
              <strong>المساحة المتبقية م2 :</strong>{" "}
              {details.remainingArea || 0}
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
              <strong>رقم الصك :</strong> {details.deedNumber || 0}
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
              <strong>المحضر :</strong> {details.report || 0}
            </p>
            <p className="text-[#244345]">
              <strong>السعر بالمتر :</strong> {details.pricePerMeter || 0}
            </p>
            <p className="text-[#244345]">
              <strong>السعر الكلي :</strong> {details.totalPrice || 0}
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

      {isEditPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-5xl py-6 px-8 rounded-lg shadow-lg overflow-auto max-h-[90vh]">
            <h2 className="text-2xl font-bold mb-6 text-center">
              تعديل البيانات
            </h2>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    required
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

                {/* العقد */}
                <div>
                  <label className="block font-semibold">العقد</label>
                  <input
                    type="text"
                    name="contract"
                    value={editFormData.contract || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        contract: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>

                {/* الوكيل أو صاحب الملك */}
                <div>
                  <label className="block font-semibold">
                    اسم الوكيل أو صاحب الملك
                  </label>
                  <input
                    type="text"
                    name="agentOrOwner"
                    value={editFormData.agentOrOwner || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        agentOrOwner: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>

                {/* تدقيق الإضبارة */}
                <div>
                  <label className="block font-semibold">تدقيق الإضبارة</label>
                  <input
                    type="text"
                    name="dossierAudit"
                    value={editFormData.dossierAudit || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        dossierAudit: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>

                {/* محضر */}
                <div>
                  <label className="block font-semibold">محضر</label>
                  <input
                    type="text"
                    name="report"
                    value={editFormData.report || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        report: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>

                {/* تسجيل الدعوى */}
                <div>
                  <label className="block font-semibold">تسجيل الدعوى</label>
                  <input
                    type="text"
                    name="lawsuitRegistration"
                    value={editFormData.lawsuitRegistration || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        lawsuitRegistration: e.target.value,
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

                {/* المرافعة */}
                <div>
                  <label className="block font-semibold">المرافعة</label>
                  <input
                    type="text"
                    name="pleading"
                    value={editFormData.pleading || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        pleading: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>

                {/* الكشف */}
                <div>
                  <label className="block font-semibold">الكشف</label>
                  <input
                    type="text"
                    name="inspection"
                    value={editFormData.inspection || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        inspection: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>

                {/* قرار المحكمة */}
                <div>
                  <label className="block font-semibold">قرار المحكمة</label>
                  <input
                    type="text"
                    name="courtDecision"
                    value={editFormData.courtDecision || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        courtDecision: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>

                {/* ترويج معاملة الصرف */}
                <div>
                  <label className="block font-semibold">
                    ترويج معاملة الصرف
                  </label>
                  <input
                    type="text"
                    name="paymentProcess"
                    value={editFormData.paymentProcess || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        paymentProcess: e.target.value,
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

                {/* السعر للمتر */}
                <div>
                  <label className="block font-semibold">السعر للمتر</label>
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

                {/* الوحدة */}
                <div>
                  <label className="block font-semibold">الوحدة</label>
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

                {/* رقم الصك */}
                <div>
                  <label className="block font-semibold">رقم الصك</label>
                  <input
                    type="text"
                    name="deedNumber"
                    value={editFormData.deedNumber || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        deedNumber: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>

                {/* تاريخ الصك */}
                <div>
                  <label className="block font-semibold">تاريخ الصك</label>
                  <input
                    type="date"
                    name="deedDate"
                    value={editFormData.deedDate || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        deedDate: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>

                {/* المساحة المتبقية */}
                <div>
                  <label className="block font-semibold">
                    المساحة المتبقية
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="remainingArea"
                    value={editFormData.remainingArea || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        remainingArea: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>

                {/* موقع العقار */}
                <div>
                  <label className="block font-semibold">موقع العقار</label>
                  <input
                    type="text"
                    name="propertyLocation"
                    value={editFormData.propertyLocation || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        propertyLocation: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>

                {/* إجراءات المعاملة */}
                <div>
                  <label className="block font-semibold">
                    إجراءات المعاملة
                  </label>
                  <select
                    name="transactionActions"
                    value={
                      editFormData.transactionActions === "" && isCustomEdit
                        ? "custom"
                        : editFormData.transactionActions
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "custom") {
                        setEditFormData({
                          ...editFormData,
                          transactionActions: "",
                        }); // تعيين قيمة فارغة للحقل النصي
                        setIsCustomEdit(true); // تفعيل الحقل المخصص
                      } else {
                        setEditFormData({
                          ...editFormData,
                          transactionActions: value,
                        });
                        setIsCustomEdit(false); // إلغاء تفعيل الحقل المخصص
                      }
                    }}
                    className="w-full p-2 border border-gray-300 rounded"
                  >
                    <option value="">اختر إجراء المعاملة</option>
                    <option value="تم حسم السند">تم حسم السند</option>
                    <option value="لم يتم حسم السند">لم يتم حسم السند</option>
                    <option value="custom">إجراء مخصص</option>
                  </select>

                  {/* حقل الإدخال المخصص */}
                  {isCustomEdit && (
                    <input
                      type="text"
                      name="transactionActions"
                      placeholder="أدخل إجراء مخصص"
                      value={editFormData.transactionActions}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          transactionActions: e.target.value,
                        })
                      }
                      className="w-full mt-2 p-2 border border-gray-300 rounded"
                    />
                  )}
                </div>

                {/* عرض الصور (للقراءة فقط) */}
                <div className="col-span-2">
                  <label className="block font-semibold">الصور</label>
                  <div className="flex flex-wrap gap-2">
                    {editFormData.imageFilePaths &&
                      editFormData.imageFilePaths.map((src, index) => (
                        <img
                          key={index}
                          src={src}
                          alt={`Image ${index + 1}`}
                          className="w-32 h-32 object-cover border border-gray-300 rounded"
                        />
                      ))}
                  </div>
                </div>
              </div>

              {/* ملاحظات */}
              <div>
                <label className="block font-semibold">ملاحظات</label>
                <textarea
                  name="note"
                  value={editFormData.note || ""}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, note: e.target.value })
                  }
                  className="w-full h-32 max-h-32 p-2 border border-gray-300 rounded"
                ></textarea>
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

export default YearsDBDetails;
