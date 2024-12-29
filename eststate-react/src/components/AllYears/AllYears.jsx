import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import api from "@/api";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";

const allYears = () => {
  const [allYears, setAllYears] = useState([
    {
      guidId: "",
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
      isDeleted: "",
      deletedAt: "",
      createAt: "",
      editedAt: "",
      addBy: "",
      imageFilePaths: "",
      deletedBy: "",
    },
  ]);

  const [deletedAllYears, setDeletedAllYears] = useState([]);
  const [isActive, setIsActive] = useState(false);
  const [filteredAllYears, setFilteredAllYears] = useState([]); // البيانات المفلترة
  const [searchQuery, setSearchQuery] = useState(""); // قيمة البحث
  const [isPopupOpen, setIsPopupOpen] = useState(false); // حالة للتحكم في النافذة المنبثقة
  const [isCustomAcquisitionStatus, setIsCustomAcquisitionStatus] =
    useState(false);
  const [activeTable, setActiveTable] = useState("AllYears"); // 'AllYears' or 'deleted'
  const navigate = useNavigate();
  const fullName = localStorage.getItem("fullName");

  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    selectedRow: null,
  });

  // إنشاء حالة لكل الحقول المطلوبة
  const [formData, setFormData] = useState({
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
    imageFilePaths: [],
  });

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

  // دالة لجلب بيانات العناصر العادية
  const fetchAllYears = async () => {
    try {
      const response = await api.get("/AllYears/GetAllYears");
      console.log(response.data);

      setAllYears(response.data);
      setFilteredAllYears(response.data);
    } catch (error) {
      console.error("Error fetching AllYears:", error);
    }
  };

  // دالة لجلب بيانات العناصر المحذوفة
  const fetchDeletedAllYears = async () => {
    try {
      const response = await api.get("/AllYears/GetDeletedAllYears");
      setDeletedAllYears(response.data);
      setFilteredAllYears(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching deleted AllYears:", error);
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
        await api.delete(`/AllYears/DeleteAllYears/${guidId}`, {
          headers: {
            guidId: GuidId,
          },
        });
        setSearchQuery(""); // إعادة تعيين البحث بعد الحذف

        // بعد الحذف، قم بتحديث البيانات
        if (activeTable === "AllYears") {
          fetchAllYears();
        } else {
          fetchDeletedAllYears();
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
    if (activeTable === "AllYears") {
      fetchAllYears();
    } else {
      fetchDeletedAllYears();
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

    // اختر البيانات المناسبة بناءً على الجدول النشط
    const data = activeTable === "AllYears" ? allYears : deletedAllYears;

    if (query.trim() === "") {
      // إذا كان البحث فارغًا، استرجع البيانات الأصلية
      setFilteredAllYears(data);
    } else {
      // فلترة البيانات بناءً على الحقول
      const filteredData = data.filter((item) => {
        const searchString = [
          item.propertyNumber || "",
          item.district || "",
          item.contract || "",
          item.agentOrOwner || "",
          item.dossierAudit || "",
          item.report || "",
          item.lawsuitNumber || "",
          item.pleading || "",
          item.inspection || "",
          item.courtDecision || "",
          item.paymentProcess || "",
          item.acquiredArea || "",
          item.areaUnit || "",
          item.pricePerMeter || "",
          item.totalPrice || "",
          item.deedNumber || "",
          item.deedDate || "",
          item.remainingArea || "",
          item.transactionActions || "",
          item.propertyLocation || "",
          item.note || "",
        ]
          .join(" ")
          .toLowerCase();
        return searchString.includes(query.toLowerCase());
      });

      setFilteredAllYears(filteredData);
    }
  };

  // تحديث البيانات عند تغيير الجدول النشط
  useEffect(() => {
    const data = activeTable === "AllYears" ? allYears : deletedAllYears;

    // إذا كانت قيمة البحث موجودة، أعد تطبيق البحث
    if (searchQuery.trim() !== "") {
      handleSearch(searchQuery);
    } else {
      setFilteredAllYears(data);
    }
  }, [activeTable, allYears, deletedAllYears, searchQuery]);

  const exportToExcel = () => {
    const dataToExport = filteredAllYears.map((item, index) => {
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
        activeTable === "AllYears"
          ? "أضيف بواسطة / تاريخ الإضافة"
          : "حُذف بواسطة / تاريخ الحذف";

      const userAndDate =
        activeTable === "AllYears"
          ? `${item.userName || "غير معروف"} / ${formatDate(item.createAt)}`
          : `${item.userName || "غير معروف"} / ${formatDate(item.deletedAt)}`;

      return {
        ت: index + 1,
        "رقم العقار": item.propertyNumber,
        المقاطعة: item.district,
        "رقم الدعوى": item.lawsuitNumber,
        "المساحة في السند": item.areaInDeed,
        "المساحة المستملكة": item.acquiredArea,
        "وحدة المساحة": item.areaUnit,
        "سعر المتر": item.pricePerMeter,
        "سنة الاستملاك": item.acquisitionYear,
        "موقف الاستملاك": item.acquisitionStatus,
        [userAndDateHeader]: userAndDate, // استخدام النص المطلوب في رأس الجدول
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "AllYears Data");
    XLSX.writeFile(
      workbook,
      `${
        activeTable === "AllYears" ? "AllYearsData" : "DeletedAllYearsData"
      }.xlsx`
    );
  };

  const openPopup = () => setIsPopupOpen(true);
  const closePopup = () => setIsPopupOpen(false);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
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
    const isDuplicate = allYears.some(
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
      district: formData.district,
      lawsuitNumber: formData.lawsuitNumber,
      areaInDeed: formData.areaInDeed,
      acquiredArea: formData.acquiredArea,
      areaUnit: formData.areaUnit,
      pricePerMeter: formData.pricePerMeter,
      acquisitionYear: formData.acquisitionYear,
      acquisitionStatus: formData.acquisitionStatus,
      notes: formData.notes,
      addBy: guidId,
      deletedBy: "",
      imageFilePaths: formData.imageFilePaths,
    };

    console.log("Payload to send:", payload);

    try {
      await api.post("/AllYears/PostAllYears", payload);
      closePopup();

      // تحديث البيانات بعد الإضافة
      const response = await api.get("/AllYears/GetAllYears");
      setAllYears(response.data);
      setFilteredAllYears(response.data);

      // عرض رسالة نجاح
      Swal.fire({
        title: "تمت الإضافة",
        text: "تمت إضافة البيانات بنجاح!",
        icon: "success",
        confirmButtonText: "موافق",
      });
    } catch (error) {
      console.error("Error adding data:", error.response?.data || error);
    }
  };

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

      closeEditPopup();
      fetchAllYears();

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
      await api.put(`/AllYears/RestoreAllYears/${guidId}`);

      // تحديث العنصر محليًا في واجهة React
      const restoredItem = deletedAllYears.find(
        (item) => item.guidId === guidId
      );

      if (restoredItem) {
        // تحديث حالة العنصر في واجهة React
        setDeletedAllYears((prevDeletedAllYears) =>
          prevDeletedAllYears.filter((item) => item.guidId !== guidId)
        );
        setAllYears((prevAllYears) => [
          ...prevAllYears,
          { ...restoredItem, IsDeleted: false },
        ]);

        // تحديث البيانات المعروضة بناءً على الجدول النشط
        if (activeTable === "deleted") {
          setFilteredAllYears((prevFiltered) =>
            prevFiltered.filter((item) => item.guidId !== guidId)
          );
        } else if (activeTable === "AllYears") {
          setFilteredAllYears((prevFiltered) => [
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
      <nav className="z-70 py-2 mb-2 bg-gradient-to-r from-[#3C6E71] to-[#284B63]">
        <div className="flex justify-between items-center mx-auto w-[90%]">
          <h1 className="text-white text-3xl font-bold">تطبيق السنوات</h1>
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
                activeTable === "AllYears"
                  ? "bg-[#3C6E71] text-white px-4 py-2 rounded-md shadow-lg transform scale-105"
                  : "text-[#353535] hover:text-[#3C6E71]"
              }`}
              onClick={() => setActiveTable("AllYears")}
            >
              <i className="fa-solid fa-table"></i>
              <span className="ml-2 pr-3">جدول البيانات</span>
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
        <div className="flex justify-between mb-1">
          <section className="flex items-center space-x-2">
            <button
              onClick={exportToExcel}
              className="ml-3 px-4 py-2 bg-gradient-to-r from-[#3C6E71] to-[#284B63] text-white rounded-lg font-semibold hover:shadow-md transition duration-200 transform hover:scale-105"
            >
              تحميل إلى Excel
            </button>
            {activeTable === "AllYears" && IsAmeen != "Ameen" && (
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
        <div className="overflow-auto flex-grow max-h-[80vh]">
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
                  "سعر المتر",
                  "سنة الاستملاك",
                  "موقف الاستملاك",
                  activeTable === "AllYears" ? "أضيف بواسطة" : "حُذف بواسطة",
                ].map((header, idx) => (
                  <th
                    key={idx}
                    className="py-4 px-6 text-center font-bold text-white"
                    style={{
                      whiteSpace: "nowrap",
                      width: "150px",
                    }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-[#353535] font-semibold">
              {filteredAllYears.map((property, index) => {
                const duplicateIndices = filteredAllYears
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

                return (
                  <tr
                    key={property.guidId}
                    title="انقر زر الماوس الايمن لعرض القائمة"
                    className={`border-b border-[#D9D9D9] ${
                      property.acquisitionStatus === "تم الحسم سند"
                        ? "bg-green-100 text-green-800"
                        : property.acquisitionStatus === "لم يتم الحسم سند"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    } transition-colors duration-300 hover:bg-[#F1F1F1]`}
                    onContextMenu={(e) => handleContextMenu(e, property)}
                    onDoubleClick={() => {
                      navigate(`/AllYearsDetails/${property.guidId}`);
                    }}
                  >
                    <td
                      className="py-4 px-6 text-center cursor-default"
                      style={{ whiteSpace: "nowrap", width: "150px" }}
                    >
                      {index + 1}
                    </td>
                    <td
                      className="py-4 px-6 text-center cursor-default"
                      style={{ whiteSpace: "nowrap", width: "150px" }}
                    >
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
                    <td
                      className="py-4 px-6 text-center cursor-default"
                      style={{ whiteSpace: "nowrap", width: "150px" }}
                    >
                      {property.district}
                    </td>
                    <td
                      className="py-4 px-6 text-center cursor-default"
                      style={{ whiteSpace: "nowrap", width: "150px" }}
                    >
                      {property.lawsuitNumber}
                    </td>
                    <td
                      className="py-4 px-6 text-center cursor-default"
                      style={{ whiteSpace: "nowrap", width: "150px" }}
                    >
                      {property.areaInDeed}
                    </td>
                    <td
                      className="py-4 px-6 text-center cursor-default"
                      style={{ whiteSpace: "nowrap", width: "150px" }}
                    >
                      {property.acquiredArea}
                    </td>
                    <td
                      className="py-4 px-6 text-center cursor-default"
                      style={{ whiteSpace: "nowrap", width: "150px" }}
                    >
                      {property.areaUnit}
                    </td>
                    <td
                      className="py-4 px-6 text-center cursor-default"
                      style={{ whiteSpace: "nowrap", width: "150px" }}
                    >
                      {property.pricePerMeter}
                    </td>
                    <td
                      className="py-4 px-6 text-center cursor-default"
                      style={{ whiteSpace: "nowrap", width: "150px" }}
                    >
                      {property.acquisitionYear}
                    </td>
                    <td
                      className="py-4 px-6 text-center cursor-default"
                      style={{ whiteSpace: "nowrap", width: "150px" }}
                    >
                      {property.acquisitionStatus}
                    </td>
                    <td
                      className="py-4 px-6 text-center"
                      style={{ whiteSpace: "nowrap", width: "150px" }}
                    >
                      {property.userName ? property.userName : "غير معروف"}
                      {activeTable === "AllYears"
                        ? `/ ${formatDate(property.createAt)}`
                        : `/ ${formatDate(property.deletedAt)}`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {isPopupOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-5xl py-6 px-8 rounded-lg shadow-lg overflow-auto max-h-[90vh]">
              <h2 className="text-2xl font-bold mb-6 text-center">
                إضافة بيانات جديدة
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
                      value={formData.propertyNumber || ""}
                      onChange={handleChange}
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
                      value={formData.district || ""}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded"
                      required
                    />
                  </div>

                  {/* رقم الدعوى */}
                  <div>
                    <label className="block font-semibold">رقم الدعوى</label>
                    <input
                      type="text"
                      name="lawsuitNumber"
                      value={formData.lawsuitNumber || ""}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded"
                      required
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
                      value={formData.areaInDeed || ""}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded"
                      required
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
                      value={formData.acquiredArea || ""}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded"
                      required
                    />
                  </div>

                  {/* وحدة المساحة */}
                  <div>
                    <label className="block font-semibold">وحدة المساحة</label>
                    <input
                      type="text"
                      name="areaUnit"
                      value={formData.areaUnit || ""}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded"
                      required
                    />
                  </div>

                  {/* سعر المتر */}
                  <div>
                    <label className="block font-semibold">سعر المتر</label>
                    <input
                      type="number"
                      step="0.01"
                      name="pricePerMeter"
                      value={formData.pricePerMeter || ""}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded"
                      required
                    />
                  </div>

                  {/* سنة الاستملاك */}
                  <div>
                    <label className="block font-semibold">سنة الاستملاك</label>
                    <input
                      type="number"
                      name="acquisitionYear"
                      value={formData.acquisitionYear || ""}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded"
                      required
                    />
                  </div>

                  {/* موقف الاستملاك */}
                  <div>
                    <label className="block font-semibold">
                      موقف الاستملاك
                    </label>
                    <select
                      name="acquisitionStatus"
                      value={
                        formData.acquisitionStatus === "custom"
                          ? "custom"
                          : formData.acquisitionStatus
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "custom") {
                          setFormData({ ...formData, acquisitionStatus: "" });
                          setIsCustomAcquisitionStatus(true); // تفعيل الحقل المخصص
                        } else {
                          setFormData({
                            ...formData,
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
                      <option value="custom">موقف مخصص</option>
                    </select>

                    {/* حقل الإدخال المخصص */}
                    {isCustomAcquisitionStatus && (
                      <input
                        type="text"
                        name="acquisitionStatus"
                        placeholder="أدخل موقف مخصص"
                        value={formData.acquisitionStatus}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
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
                      value={formData.notes || ""}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded"
                      rows="4"
                      placeholder="أدخل الملاحظات هنا..."
                    ></textarea>
                  </div>

                  {/* رفع الملفات */}
                  <div className="col-span-2">
                    <label className="block font-semibold">رفع الملفات</label>
                    <input
                      type="file"
                      name="files"
                      multiple
                      onChange={handleImageUpload}
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                    {formData.imageFilePaths &&
                      formData.imageFilePaths.length > 0 && (
                        <p className="text-sm text-green-600 mt-2">
                          تم رفع {formData.imageFilePaths.length} ملف/ملفات.
                        </p>
                      )}
                  </div>
                </div>

                {/* الأزرار */}
                <div className="flex justify-end space-x-2 mt-4">
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
                    <label className="block font-semibold">
                      موقف الاستملاك
                    </label>
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
                navigate(`/AllYearsDetails/${contextMenu.selectedRow.guidId}`);
                closeContextMenu();
              }}
            >
              تفاصيل
            </li>

            {activeTable === "AllYears" ? (
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

export default allYears;
