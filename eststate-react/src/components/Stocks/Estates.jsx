import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import api from "@/api";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";

const Estates = () => {
  const [Estate, setEstate] = useState([
    {
      guidId: "",
      propertyNumber: "",
      side: "",
      istimlackStatus: "",
      totalArea: "",
      acquiredArea: "",
      remainingArea: "",
      status: "",
      deletedAt: "",
    },
  ]);

  const [deletedEstate, setDeletedEstate] = useState([]);
  const [isActive, setIsActive] = useState(false);
  const [filteredEstate, setFilteredEstate] = useState([]); // البيانات المفلترة
  const [searchQuery, setSearchQuery] = useState(""); // قيمة البحث
  const [isPopupOpen, setIsPopupOpen] = useState(false); // حالة للتحكم في النافذة المنبثقة
  const [activeTable, setActiveTable] = useState("Estate"); // 'Estate' or 'deleted'
  const navigate = useNavigate();
  const fullName = localStorage.getItem("fullName");

  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    selectedRow: null,
  });

  const [formData, setFormData] = useState({
    propertyNumber: "",
    side: "",
    istimlackStatus: "",
    totalArea: "",
    yearlyArea: {},
    status: "",
    notes: "",
    imageFilePath: "",
  });

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

  const currentYear = new Date().getUTCFullYear();
  const years = Array.from(
    { length: currentYear - 2017 + 1 },
    (_, i) => 2017 + i
  );

  // دالة لجلب بيانات العناصر العادية
  const fetchEstate = async () => {
    try {
      const response = await api.get("/Stocks/GetEstate");
      setEstate(response.data);
      setFilteredEstate(response.data);
    } catch (error) {
      console.error("Error fetching Estate:", error);
    }
  };

  // دالة لجلب بيانات العناصر المحذوفة
  const fetchDeletedEstate = async () => {
    try {
      const response = await api.get("/Stocks/GetDeleted");
      setDeletedEstate(response.data);
      setFilteredEstate(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching deleted Estate:", error);
    }
  };

  const handleDelete = async (guidId) => {
    const GuidId = localStorage.getItem("guidId");

    if (!GuidId) {
      Swal.fire({
        title: "خطأ",
        text: "لم يتم العثور على المستخدم الحالي",
        icon: "error",
        confirmButtonText: "موافق",
      });
      return;
    }

    const result = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "لن تتمكن من استعادة هذا العنصر بعد الحذف!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "نعم، احذف",
      cancelButtonText: "إلغاء",
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/Stocks/DeleteEstate/${guidId}`, {
          headers: {
            guidId: GuidId,
          },
        });
        setSearchQuery(""); // إعادة تعيين البحث بعد الحذف

        // بعد الحذف، قم بتحديث البيانات
        if (activeTable === "Estate") {
          fetchEstate();
        } else {
          fetchDeletedEstate();
        }

        // عرض رسالة نجاح بعد الحذف
        Swal.fire({
          title: "تم الحذف!",
          text: "تم حذف العنصر بنجاح.",
          icon: "success",
          confirmButtonText: "موافق",
        });
      } catch (error) {
        console.error("Error deleting item:", error);
        if (error.response && error.response.status === 400) {
          // إذا كانت حالة الخطأ 400
          Swal.fire({
            title: "غير مصرح لك",
            text: "غير مصرح لك إجراء عملية الحذف",
            icon: "error",
            confirmButtonText: "موافق",
          });
        } else {
          // لأي أخطاء أخرى
          Swal.fire({
            title: "خطأ",
            text: "حدث خطأ أثناء عملية الحذف",
            icon: "error",
            confirmButtonText: "موافق",
          });
        }
      }
    }
  };

  useEffect(() => {
    if (activeTable === "Estate") {
      fetchEstate();
    } else {
      fetchDeletedEstate();
    }

    // Event listener to close context menu on click outside
    const handleClickOutside = () =>
      setContextMenu({ ...contextMenu, visible: false });
    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [activeTable]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    const data = activeTable === "Estate" ? Estate : deletedEstate;

    if (query === "") {
      setFilteredEstate(data); // إعادة البيانات الأصلية عند حذف البحث
    } else {
      const filteredData = data.filter((item) =>
        [
          item.propertyNumber,
          item.side,
          item.istimlackStatus,
          item.totalArea,
          item.acquiredArea,
          item.remainingArea,
          item.status,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase())
      );
      setFilteredEstate(filteredData);
    }
  };

  // تحديث البيانات عند تغيير الجدول
  useEffect(() => {
    const data = activeTable === "Estate" ? Estate : deletedEstate;

    // إذا كانت قيمة البحث موجودة، أعد تطبيق البحث
    if (searchQuery.trim() !== "") {
      handleSearch(searchQuery);
    } else {
      setFilteredEstate(data);
    }
  }, [activeTable, Estate, deletedEstate, searchQuery]);

  const exportToExcel = () => {
    const dataToExport = filteredEstate.map((item, index) => {
      // تنسيق التاريخ
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
        const formattedDate = new Date(date).toLocaleString("en-CA", options);
        return formattedDate.replace(",", "").replace(/\//g, "/");
      };

      // تحديد العمود الخاص باسم المستخدم والتاريخ بناءً على الجدول النشط
      const userAndDateHeader =
        activeTable === "Estate"
          ? "أضيف بواسطة / تاريخ الإضافة"
          : "حُذف بواسطة / تاريخ الحذف";

      const userAndDate =
        activeTable === "Estate"
          ? `${item.userName || "غير معروف"} / ${formatDate(item.createdAt)}`
          : `${item.userName || "غير معروف"} / ${formatDate(item.deletedAt)}`;

      return {
        ت: index + 1,
        "رقم العقار": item.propertyNumber,
        الجهة: item.side,
        "حالة الإستملاك": item.istimlackStatus,
        "مساحة السند": item.totalArea,
        الحالة: item.status,
        "المساحة المستملكة": item.acquiredArea,
        "المساحة المتبقية": item.remainingArea,
        [userAndDateHeader]: userAndDate, // استخدام النص المطلوب في رأس الجدول
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Estate Data");
    XLSX.writeFile(
      workbook,
      `${activeTable === "Estate" ? "EstateData" : "DeletedEstateData"}.xlsx`
    );
  };

  const openPopup = () => setIsPopupOpen(true);
  const closePopup = () => setIsPopupOpen(false);

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

  const closeEditPopup = () => setIsEditPopupOpen(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleYearlyAreaChange = (year, value) => {
    setFormData({
      ...formData,
      yearlyArea: {
        ...formData.yearlyArea,
        [year]: value ? parseFloat(value) : null,
      },
    });
  };

  // تحميل وتحويل الصورة إلى Base64
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const fileReaders = files.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(fileReaders).then((base64Images) => {
      setFormData({
        ...formData,
        imageFilePaths: base64Images, // تعيين الصور في مصفوفة
      });
    });
  };

  const handlePost = async () => {

    event.preventDefault();
    // احصل على guidId من localStorage
    const guidId = localStorage.getItem("guidId");

    if (!guidId) {
      Swal.fire({
        title: "خطأ",
        text: "لم يتم العثور على المستخدم الحالي",
        icon: "error",
        confirmButtonText: "موافق",
      });
      return;
    }

    // تحقق إذا كان رقم العقار مكررًا
    const isDuplicate = Estate.some(
      (item) => item.propertyNumber === formData.propertyNumber
    );

    if (isDuplicate) {
      // استخدم SweetAlert2 لإظهار نافذة تأكيد
      const result = await Swal.fire({
        title: "الرقم مكرر",
        text: "هل أنت متأكد من الإضافة؟",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "نعم، إضافة",
        cancelButtonText: "إلغاء",
      });

      // تحقق من قرار المستخدم
      if (!result.isConfirmed) {
        return; // إذا ضغط المستخدم "إلغاء"، تنتهي الدالة هنا
      }
    }

    const payload = {
      propertyNumber: formData.propertyNumber,
      side: formData.side,
      istimlackStatus: formData.istimlackStatus,
      totalArea: parseFloat(formData.totalArea),
      status: formData.status,
      notes: formData.notes,
      imageFilePath: formData.imageFilePaths,
      yearlyArea: formData.yearlyArea,
      addBy: guidId,
      deletedBy: "",
    };

    try {
      await api.post("/Stocks/PostEstate", payload);
      closePopup();

      // تحديث البيانات بعد الإضافة
      const response = await api.get("/Stocks/GetEstate");
      setEstate(response.data);
      setFilteredEstate(response.data);
      // عرض رسالة نجاح
      Swal.fire({
        title: "تمت الإضافة",
        text: "تمت إضافة البيانات بنجاح!",
        icon: "success",
        confirmButtonText: "موافق",
      });
    } catch (error) {
      console.error("Error adding data:", error);
    }
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

      closeEditPopup();
      fetchEstate();

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

  // القائمة
  const handleContextMenu = (event, row) => {
    event.preventDefault();

    const offsetX = -190;
    const offsetY = -50;
    const windowHeight = window.innerHeight;

    // تحديد إذا كانت القائمة يجب أن تظهر للأعلى أو للأسفل
    const yPosition = event.pageY + offsetY;
    const isNearBottom = windowHeight - yPosition < 150; // إذا كان قريباً من الأسفل (150 بكسل هو ارتفاع تقريبي للقائمة)

    setContextMenu({
      visible: true,
      x: event.pageX + offsetX,
      y: isNearBottom ? yPosition - 150 : yPosition, // إذا كان قريب من الأسفل، يعرض القائمة للأعلى
      selectedRow: row,
    });
  };

  const closeContextMenu = () => {
    setContextMenu({ ...contextMenu, visible: false });
  };

  const handleRestore = async (guidId) => {
    try {
      // استدعاء دالة استعادة العنصر من واجهة البرمجة الخلفية
      await api.put(`/Stocks/RestoreEstate/${guidId}`);

      // تحديث العنصر محليًا في واجهة React
      const restoredItem = deletedEstate.find((item) => item.guidId === guidId);

      if (restoredItem) {
        // تحديث حالة العنصر في واجهة React
        setDeletedEstate((prevDeletedEstate) =>
          prevDeletedEstate.filter((item) => item.guidId !== guidId)
        );
        setEstate((prevEstate) => [
          ...prevEstate,
          { ...restoredItem, IsDeleted: false },
        ]);

        // تحديث البيانات المعروضة بناءً على الجدول النشط
        if (activeTable === "deleted") {
          setFilteredEstate((prevFiltered) =>
            prevFiltered.filter((item) => item.guidId !== guidId)
          );
        } else if (activeTable === "Estate") {
          setFilteredEstate((prevFiltered) => [
            ...prevFiltered,
            { ...restoredItem, IsDeleted: false },
          ]);
        }
      }

      // عرض رسالة نجاح
      Swal.fire({
        title: "تمت الاستعادة",
        text: "تم استعادة العنصر بنجاح!",
        icon: "success",
        confirmButtonText: "موافق",
      });
    } catch (error) {
      console.error("Error restoring item:", error);
      Swal.fire({
        title: "خطأ",
        text: "حدث خطأ أثناء استعادة العنصر",
        icon: "error",
        confirmButtonText: "موافق",
      });
    }
  };

  let IsAmeen = localStorage.getItem("role");

  return (
    <>
      {/* شريط لوحة التحكم في الأعلى */}
      <nav className="z-70 py-2 mb-2 bg-gradient-to-r from-[#3C6E71] to-[#284B63]">
        <div className="flex justify-between items-center mx-auto w-[90%]">
          <h1 className="text-white text-3xl font-bold">تطبيق الاسهم</h1>
          <div className="flex bg-[#FFF8E1] px-4 py-2 rounded-lg shadow-lg">
            <Link
              to="/"
              className="flex items-center hover:text-[#3C6E71] transition mx-1 px-3"
            >
              <i className="fa-solid fa-home"></i>
              <span className="ml-2 pr-3 text-[#353535]">الصفحة الرئيسية</span>
            </Link>
            <Link
              to="#"
              className={`flex items-center transition px-4 py-2 mx-1 ${
                activeTable === "Estate"
                  ? "bg-[#3C6E71] text-white px-4 py-2 rounded-md shadow-lg transform scale-105"
                  : "text-[#353535] hover:text-[#3C6E71]"
              }`}
              onClick={() => setActiveTable("Estate")}
            >
              <i className="fa-solid fa-table"></i>
              <span className="ml-2 pr-3">جدول العقارات</span>
            </Link>
            <Link
              to="#"
              className={`flex items-center transition px-4 py-2 mx-1 ${
                activeTable === "deleted"
                  ? "bg-[#3C6E71] text-white px-4 py-2 rounded-md shadow-lg transform scale-105"
                  : "text-[#353535] hover:text-[#3C6E71]"
              }`}
              onClick={() => setActiveTable("deleted")}
            >
              <i className="fa-solid fa-recycle"></i>
              <span className="ml-2 pr-3">سلة المحذوفات</span>
            </Link>
          </div>
          <div>
            {/* إضافة أيقونة المستخدم لتغيير كلمة المرور */}
            <Link
              to={"/ChangePassword"}
              className="text-white p-2 py-1 ml-4 text-md cursor-pointer bg-slate-800 rounded-md "
              title="تغيير كلمة المرور"
            >
              <span className="ml-3">{fullName}</span>
              <FontAwesomeIcon icon={faUser} />
            </Link>

            {/* إضافة أيقونة تسجيل الخروج */}
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="bg-[#ff0019] px-2 py-2 text-white rounded-md font-semibol transition duration-200"
              title="تسجيل الخروج"
            >
              <div className="inline-block ml-2">
                <i className="fas fa-sign-out-alt"></i>
              </div>
              تسجيل الخروج
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-[95%] relative mx-auto p-1">
        <section className="max-h-[85vh] flex flex-col">
          <div className="flex justify-between mb-1">
            <section className="flex items-center space-x-2">
              <button
                onClick={exportToExcel}
                className="ml-3 px-4 py-2 bg-gradient-to-r from-[#3C6E71] to-[#284B63] text-white rounded-lg font-semibold hover:shadow-md transition duration-200 transform hover:scale-105"
              >
                تحميل إلى Excel
              </button>
              {activeTable === "Estate" && IsAmeen != "Ameen" && (
                <button
                  onClick={openPopup}
                  className="px-4 py-2 bg-gradient-to-r from-[#3C6E71] to-[#284B63] text-white rounded-lg font-semibold hover:shadow-md transition duration-200 transform hover:scale-105"
                >
                  إضافة
                </button>
              )}

              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="بحث"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className={`absolute right-0 transform transition-all duration-300 ease-in-out outline-none bg-[#FFF8E1] h-10 rounded-lg pl-4 pr-6 shadow-md ${
                    isActive ? "opacity-100 w-60 right-7" : "opacity-0 w-0"
                  } text-[#353535] placeholder-gray-600`}
                />
                <button
                  className="px-3 py-2 bg-[#284B63] text-white rounded-lg hover:bg-[#3C6E71] transition duration-200 relative z-10 transform hover:scale-105"
                  onClick={() => setIsActive(!isActive)}
                >
                  <i className="fas fa-search"></i>
                </button>
              </div>
            </section>
          </div>

          <div className="overflow-auto flex-grow">
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
                  activeTable === "Estate" ? "أضيف بواسطة" : "حُذف بواسطة",
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
            <tbody className="ext-[#353535] font-semibold">
              {filteredEstate.map((property, index) => {
                const duplicateIndices = filteredEstate
                  .map((item, i) =>
                    item.propertyNumber === property.propertyNumber &&
                    i !== index
                      ? i + 1
                      : null
                  )
                  .filter((seqNumber) => seqNumber !== null);

                const isDuplicate = duplicateIndices.length > 0;

                const formatDate = (date) => {
                  if (!date) return "غير متوفر";

                  // إعداد خيارات التنسيق
                  const options = {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: true, // لتنسيق 24 ساعة
                    timeZone: "Asia/Baghdad", // تحديد توقيت بغداد
                  };

                  // تحويل التاريخ باستخدام الخيارات المحددة
                  const formattedDate = new Date(date).toLocaleString(
                    "en-CA",
                    options
                  );

                  // تنسيق النتيجة النهائية
                  return formattedDate.replace(",", "").replace(/\//g, "/"); // إزالة الفاصلة إذا كانت موجودة
                };

                return (
                  <tr
                    key={property.guidId}
                    title="انقر زر الماوس الايمن لعرض القائمة"
                    className={`border-b border-[#D9D9D9] ${
                      property.status === "مكتملة" ||
                      property.status === "اكتمل" ||
                      property.status === "مكتمل"
                        ? "bg-green-100 text-green-800"
                        : property.status === "غير مكتملة" ||
                          property.status === "لم يكتمل" ||
                          property.status === "غير مكتمل"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    } transition-colors duration-300 hover:bg-[#F1F1F1]`}
                    onContextMenu={(e) => handleContextMenu(e, property)}
                    onDoubleClick={() => {
                      navigate(`/details/${property.guidId}`); // الانتقال إلى صفحة التفاصيل دون إعادة تحميل
                    }}
                  >
                    <td className="py-4 px-6 text-center cursor-default">
                      {index + 1}
                    </td>
                    <td className="py-4 px-6 text-center cursor-default">
                      {isDuplicate && (
                        <span
                          className="text-red-600 ml-2"
                          title={`مكرر في تسلسل رقم ${duplicateIndices.join(
                            " و "
                          )}`}
                        >
                          <i className="fas fa-sync"></i>
                        </span>
                      )}
                      {property.propertyNumber}
                    </td>
                    <td className="py-4 px-6 text-center cursor-default">
                      {property.side}
                    </td>
                    <td className="py-4 px-6 text-center cursor-default">
                      {property.istimlackStatus}
                    </td>
                    <td className="py-4 px-6 text-center cursor-default">
                      {property.totalArea}
                    </td>
                    <td className="py-4 px-6 text-center cursor-default">
                      <span className="px-3 py-1 text-xs font-bold">
                        {property.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center cursor-default">
                      {property.acquiredArea}
                    </td>
                    <td className="py-4 px-6 text-center cursor-default">
                      {property.remainingArea}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {property.userName || "غير معروف" + " "}
                      {activeTable === "Estate"
                        ? `/ ${formatDate(property.createdAt)}`
                        : `/ ${formatDate(property.deletedAt)}`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>

          
        </section>

        {isPopupOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white w-1/2 py-6 px-10 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold mb-4 text-center">
                إضافة بيانات جديدة
              </h2>
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold">رقم العقار</label>
                    <input
                      type="text"
                      name="propertyNumber"
                      value={formData.propertyNumber}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold">الجهة</label>
                    <input
                      type="text"
                      name="side"
                      value={formData.side}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold">
                      حالة الإستملاك
                    </label>
                    <input
                      type="text"
                      name="istimlackStatus"
                      value={formData.istimlackStatus}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold">مساحة السند</label>
                    <input
                      type="number"
                      name="totalArea"
                      onWheel={(e) => e.target.blur()}
                      value={formData.totalArea}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold">الحالة</label>
                    <input
                      type="text"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold">تحميل الصورة</label>
                    <input
                      type="file"
                      multiple
                      onChange={handleImageUpload} // استدعاء دالة التحميل عند اختيار صورة
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                    {formData.imageFilePath &&
                      formData.imageFilePath.length > 0 && (
                        <p className="text-sm text-green-600 mt-2">
                          تم رفع {formData.imageFilePath.length} ملف/ملفات.
                        </p>
                      )}
                  </div>
                </div>
                <div>
                  <label className="block font-semibold">الملاحظات</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    className="w-full h-32 max-h-32 p-2 border border-gray-300 rounded"
                  ></textarea>
                </div>
                <div>
                  <label className="block font-semibold">
                    المساحات السنوية
                  </label>
                  <div className="space-y-2 max-h-52 overflow-y-auto border border-gray-200 px-6 py-4 rounded">
                    {years.map((year) => (
                      <div key={year} className="flex items-center mb-2">
                        <span className="w-20">{year}</span>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="رقم"
                          value={formData.yearlyArea[year] || ""}
                          onChange={(e) =>
                            handleYearlyAreaChange(year, e.target.value)
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
                    onClick={closePopup}
                    className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 ml-3"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    onClick={handlePost}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    إضافة
                  </button>
                </div>
              </form>
            </div>
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
                    <label className="block font-semibold">
                      حالة الإستملاك
                    </label>
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
                  <label className="block font-semibold">
                    المساحات السنوية
                  </label>
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
                    type="submit"
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

        {/* Context Menu */}
        {contextMenu.visible && (
          <ul
            className="absolute bg-white border border-gray-300 shadow-md rounded p-2"
            style={{
              top: `${contextMenu.y}px`,
              left: `${contextMenu.x}px`,
              zIndex: 1000,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <li
              className="py-3 px-7 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                navigate(`/details/${contextMenu.selectedRow.guidId}`); // الانتقال إلى صفحة التفاصيل دون إعادة تحميل
                closeContextMenu();
              }}
            >
              تفاصيل
            </li>

            {activeTable === "Estate" ? (
              <>
                <li
                  className="py-3 px-7 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    openEditPopup(contextMenu.selectedRow);
                    closeContextMenu();
                  }}
                >
                  تعديل
                </li>

                <li
                  className="py-3 px-7 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    handleDelete(contextMenu.selectedRow.guidId);
                    closeContextMenu();
                  }}
                >
                  حذف
                </li>
              </>
            ) : (
              <li
                className="py-3 px-7 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  handleRestore(contextMenu.selectedRow.guidId);
                  closeContextMenu();
                }}
              >
                استعادة المحذوف
              </li>
            )}
          </ul>
        )}
      </div>
    </>
  );
};

export default Estates;
