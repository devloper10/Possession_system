import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import api from "@/api";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";

const yearsDBs = () => {
  const [yearsDB, setYearsDB] = useState([
    {
      guidId: "",
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
      totalPrice: "", //
      deedNumber: "", //
      deedDate: "", //
      remainingArea: "", //
      transactionActions: "", //
      propertyLocation: "", //
      note: "", //
      isDeleted: "",
      deletedAt: "",
      createdAt: "",
      editedAt: "",
      imageFilePaths: "",
      addBy: "",
      deletedBy: "",
    },
  ]);

  const [deletedYearsDB, setDeletedYearsDB] = useState([]);
  const [isActive, setIsActive] = useState(false);
  const [filteredYearsDB, setFilteredYearsDB] = useState([]); // البيانات المفلترة
  const [searchQuery, setSearchQuery] = useState(""); // قيمة البحث
  const [isPopupOpen, setIsPopupOpen] = useState(false); // حالة للتحكم في النافذة المنبثقة
  const [isCustom, setIsCustom] = useState(false);
  const [isCustomEdit, setIsCustomEdit] = useState(false);
  const [activeTable, setActiveTable] = useState("YearsDB"); // 'YearsDB' or 'deleted'
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
    imageFilePaths: [],
  });

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

  // دالة لجلب بيانات العناصر العادية
  const fetchYearsDB = async () => {
    try {
      const response = await api.get("/YearsDB/GetYearsDB");

      setYearsDB(response.data);
      setFilteredYearsDB(response.data);
    } catch (error) {
      console.error("Error fetching YearsDB:", error);
    }
  };

  // دالة لجلب بيانات العناصر المحذوفة
  const fetchDeletedYearsDB = async () => {
    try {
      const response = await api.get("/YearsDB/GetDeletedYearsDB");
      setDeletedYearsDB(response.data);
      setFilteredYearsDB(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching deleted YearsDB:", error);
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
        await api.delete(`/YearsDB/DeleteYearsDB/${guidId}`, {
          headers: {
            guidId: GuidId,
          },
        });
        setSearchQuery(""); // إعادة تعيين البحث بعد الحذف

        // بعد الحذف، قم بتحديث البيانات
        if (activeTable === "YearsDB") {
          fetchYearsDB();
        } else {
          fetchDeletedYearsDB();
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
    if (activeTable === "YearsDB") {
      fetchYearsDB();
    } else {
      fetchDeletedYearsDB();
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
    const data = activeTable === "YearsDB" ? yearsDB : deletedYearsDB;

    if (query.trim() === "") {
      // إذا كان البحث فارغًا، استرجع البيانات الأصلية
      setFilteredYearsDB(data);
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

      setFilteredYearsDB(filteredData);
    }
  };

  // تحديث البيانات عند تغيير الجدول النشط
  useEffect(() => {
    const data = activeTable === "YearsDB" ? yearsDB : deletedYearsDB;

    // إذا كانت قيمة البحث موجودة، أعد تطبيق البحث
    if (searchQuery.trim() !== "") {
      handleSearch(searchQuery);
    } else {
      setFilteredYearsDB(data);
    }
  }, [activeTable, yearsDB, deletedYearsDB, searchQuery]);

  const exportToExcel = () => {
    const dataToExport = filteredYearsDB.map((item, index) => {
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
        activeTable === "YearsDB"
          ? "أضيف بواسطة / تاريخ الإضافة"
          : "حُذف بواسطة / تاريخ الحذف";

      const userAndDate =
        activeTable === "YearsDB"
          ? `${item.userName || "غير معروف"} / ${formatDate(item.createdAt)}`
          : `${item.userName || "غير معروف"} / ${formatDate(item.deletedAt)}`;

      return {
        ت: index + 1,
        "رقم العقار": item.propertyNumber,
        المقاطعة: item.district,
        التعاقد: item.contract,
        "اسم الوكيل او صاحب الملك": item.agentOrOwner,
        "تدقيق الاضابير": item.dossierAudit,
        محضر: item.report,
        "تسجيل دعوى": item.lawsuitRegistration,
        "رقم الدعوى": item.lawsuitNumber,
        مرافعة: item.pleading,
        كشف: item.inspection,
        "قرار المحكمة": item.courtDecision,
        "ترويج معاملة و صرف المستحقات": item.paymentProcess,
        "المساحة المستملكة": item.acquiredArea,
        "وحدة المساحة": item.areaUnit,
        "السعر بالمتر": item.pricePerMeter,
        السعر: item.totalPrice,
        "رقم الصك": item.deedNumber,
        "تأريخ الصك": item.deedDate,
        "المساحة المتبقية م2": item.remainingArea,
        "إجراءات المعاملة": item.transactionActions,
        "موقع العقار": item.propertyLocation,
        [userAndDateHeader]: userAndDate, // استخدام النص المطلوب في رأس الجدول
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "YearsDB Data");
    XLSX.writeFile(
      workbook,
      `${activeTable === "YearsDB" ? "YearsDBData" : "DeletedYearsDBData"}.xlsx`
    );
  };

  const openPopup = () => setIsPopupOpen(true);
  const closePopup = () => setIsPopupOpen(false);

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
    const isDuplicate = yearsDB.some(
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
      contract: formData.contract,
      agentOrOwner: formData.agentOrOwner,
      dossierAudit: formData.dossierAudit,
      report: formData.report,
      lawsuitRegistration: formData.lawsuitRegistration,
      lawsuitNumber: formData.lawsuitNumber,
      pleading: formData.pleading,
      inspection: formData.inspection,
      courtDecision: formData.courtDecision,
      paymentProcess: formData.paymentProcess,
      acquiredArea: formData.acquiredArea,
      areaUnit: formData.areaUnit,
      pricePerMeter: formData.pricePerMeter,
      deedNumber: formData.deedNumber,
      deedDate: formData.deedDate,
      remainingArea: formData.remainingArea,
      transactionActions: formData.transactionActions,
      propertyLocation: formData.propertyLocation,
      note: formData.note,
      addBy: guidId,
      deletedBy: "",
      imageFilePaths: formData.imageFilePaths,
    };

    console.log("Payload to send:", payload);

    try {
      await api.post("/YearsDB/PostYearsDB", payload);
      closePopup();

      // تحديث البيانات بعد الإضافة
      const response = await api.get("/YearsDB/GetYearsDB");
      setYearsDB(response.data);
      setFilteredYearsDB(response.data);

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

      closeEditPopup();
      fetchYearsDB();

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
      await api.put(`/YearsDB/RestoreYearsDB/${guidId}`);

      // تحديث العنصر محليًا في واجهة React
      const restoredItem = deletedYearsDB.find(
        (item) => item.guidId === guidId
      );

      if (restoredItem) {
        // تحديث حالة العنصر في واجهة React
        setDeletedYearsDB((prevDeletedYearsDB) =>
          prevDeletedYearsDB.filter((item) => item.guidId !== guidId)
        );
        setYearsDB((prevYearsDB) => [
          ...prevYearsDB,
          { ...restoredItem, IsDeleted: false },
        ]);

        // تحديث البيانات المعروضة بناءً على الجدول النشط
        if (activeTable === "deleted") {
          setFilteredYearsDB((prevFiltered) =>
            prevFiltered.filter((item) => item.guidId !== guidId)
          );
        } else if (activeTable === "YearsDB") {
          setFilteredYearsDB((prevFiltered) => [
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
          <h1 className="text-white text-3xl font-bold">تطبيق البيانات</h1>
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
                activeTable === "YearsDB"
                  ? "bg-[#3C6E71] text-white px-4 py-2 rounded-md shadow-lg transform scale-105"
                  : "text-[#353535] hover:text-[#3C6E71]"
              }`}
              onClick={() => setActiveTable("YearsDB")}
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
            {activeTable === "YearsDB" && IsAmeen != "Ameen" && (
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
                  "المنطقة",
                  "العقد",
                  "المالك أو الوكيل",
                  "تدقيق الإضبارة",
                  "التقرير",
                  "تسجيل الدعوى",
                  "رقم الدعوى",
                  "المرافعة",
                  "الكشف",
                  "قرار المحكمة",
                  "عملية الدفع",
                  "المساحة المستملكة",
                  "وحدة المساحة",
                  "السعر للمتر",
                  "السعر الإجمالي",
                  "رقم السند",
                  "تاريخ السند",
                  "المساحة المتبقية",
                  "إجراءات المعاملة",
                  "موقع العقار",
                  activeTable === "YearsDB" ? "أضيف بواسطة" : "حُذف بواسطة",
                ].map((header, idx) => (
                  <th
                    key={idx}
                    className="py-4 px-6 text-center font-bold text-white"
                    style={{
                      whiteSpace: "nowrap", // يمنع النصوص من الالتفاف
                      width: "150px", // عرض ثابت لكل عمود
                    }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-[#353535] font-semibold">
              {filteredYearsDB.map((property, index) => {
                const duplicateIndices = filteredYearsDB
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

                const formatdeedDate = (date) => {
                  if (!date) return "غير متوفر";

                  const options = {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    timeZone: "Asia/Baghdad",
                  };

                  // استخدام تنسيق 'yyyy/MM/dd'
                  return new Date(date)
                    .toLocaleDateString("en-CA", options)
                    .replace(/-/g, "/");
                };

                return (
                  <tr
                    key={property.guidId}
                    title="انقر زر الماوس الايمن لعرض القائمة"
                    className={`border-b border-[#D9D9D9] ${
                      property.transactionActions === "تم حسم السند"
                        ? "bg-green-100 text-green-800"
                        : property.transactionActions === "لم يتم حسم السند"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    } transition-colors duration-300 hover:bg-[#F1F1F1]`}
                    onContextMenu={(e) => handleContextMenu(e, property)}
                    onDoubleClick={() => {
                      navigate(`/yearsDBDetails/${property.guidId}`);
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
                      {property.contract}
                    </td>
                    <td
                      className="py-4 px-6 text-center cursor-default"
                      style={{ whiteSpace: "nowrap", width: "150px" }}
                    >
                      {property.agentOrOwner}
                    </td>
                    <td
                      className="py-4 px-6 text-center cursor-default"
                      style={{ whiteSpace: "nowrap", width: "150px" }}
                    >
                      {property.dossierAudit}
                    </td>
                    <td
                      className="py-4 px-6 text-center cursor-default"
                      style={{ whiteSpace: "nowrap", width: "150px" }}
                    >
                      {property.report}
                    </td>
                    <td
                      className="py-4 px-6 text-center cursor-default"
                      style={{ whiteSpace: "nowrap", width: "150px" }}
                    >
                      {property.lawsuitRegistration}
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
                      {property.pleading}
                    </td>
                    <td
                      className="py-4 px-6 text-center cursor-default"
                      style={{ whiteSpace: "nowrap", width: "150px" }}
                    >
                      {property.inspection}
                    </td>
                    <td
                      className="py-4 px-6 text-center cursor-default"
                      style={{ whiteSpace: "nowrap", width: "150px" }}
                    >
                      {property.courtDecision}
                    </td>
                    <td
                      className="py-4 px-6 text-center cursor-default"
                      style={{ whiteSpace: "nowrap", width: "150px" }}
                    >
                      {property.paymentProcess}
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
                      {property.totalPrice}
                    </td>
                    <td
                      className="py-4 px-6 text-center cursor-default"
                      style={{ whiteSpace: "nowrap", width: "150px" }}
                    >
                      {property.deedNumber}
                    </td>
                    <td
                      className="py-4 px-6 text-center cursor-default"
                      style={{ whiteSpace: "nowrap", width: "150px" }}
                    >
                      {formatdeedDate(property.deedDate)}
                    </td>
                    <td
                      className="py-4 px-6 text-center cursor-default"
                      style={{ whiteSpace: "nowrap", width: "150px" }}
                    >
                      {property.remainingArea}
                    </td>
                    <td
                      className="py-4 px-6 text-center cursor-default"
                      style={{ whiteSpace: "nowrap", width: "150px" }}
                    >
                      {property.transactionActions}
                    </td>
                    <td
                      className="py-4 px-6 text-center cursor-default"
                      style={{ whiteSpace: "nowrap", width: "150px" }}
                    >
                      {property.propertyLocation}
                    </td>
                    <td
                      className="py-4 px-6 text-center"
                      style={{ whiteSpace: "nowrap", width: "150px" }}
                    >
                      {property.userName ? property.userName : "غير معروف"}
                      {activeTable === "YearsDB"
                        ? `/ ${formatDate(property.createdAt)}`
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

                  {/* العقد */}
                  <div>
                    <label className="block font-semibold">العقد</label>
                    <input
                      type="text"
                      name="contract"
                      value={formData.contract || ""}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded"
                      required
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
                      value={formData.agentOrOwner || ""}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded"
                      required
                    />
                  </div>

                  {/* تدقيق الإضبارة */}
                  <div>
                    <label className="block font-semibold">
                      تدقيق الإضبارة
                    </label>
                    <input
                      type="text"
                      name="dossierAudit"
                      value={formData.dossierAudit || ""}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded"
                      required
                    />
                  </div>

                  {/* محضر */}
                  <div>
                    <label className="block font-semibold">محضر</label>
                    <input
                      type="text"
                      name="report"
                      value={formData.report || ""}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded"
                      required
                    />
                  </div>

                  {/* تسجيل الدعوى */}
                  <div>
                    <label className="block font-semibold">تسجيل الدعوى</label>
                    <input
                      type="text"
                      name="lawsuitRegistration"
                      value={formData.lawsuitRegistration || ""}
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

                  {/* المرافعة */}
                  <div>
                    <label className="block font-semibold">المرافعة</label>
                    <input
                      type="text"
                      name="pleading"
                      value={formData.pleading || ""}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded"
                      required
                    />
                  </div>

                  {/* الكشف */}
                  <div>
                    <label className="block font-semibold">الكشف</label>
                    <input
                      type="text"
                      name="inspection"
                      value={formData.inspection || ""}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded"
                      required
                    />
                  </div>

                  {/* قرار المحكمة */}
                  <div>
                    <label className="block font-semibold">قرار المحكمة</label>
                    <input
                      type="text"
                      name="courtDecision"
                      value={formData.courtDecision || ""}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded"
                      required
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
                      value={formData.paymentProcess || ""}
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

                  <div>
                    <label className="block font-semibold">السعر للمتر</label>
                    <input
                      type="number"
                      step="0.01" // لدعم الأرقام العشرية
                      name="pricePerMeter"
                      value={formData.pricePerMeter || ""} // القيمة الافتراضية إذا كانت فارغة
                      onChange={handleChange} // معالجة التغيير
                      className="w-full p-2 border border-gray-300 rounded"
                      required
                      placeholder="أدخل السعر للمتر"
                    />
                  </div>

                  {/* الوحدة */}
                  <div>
                    <label className="block font-semibold">الوحدة</label>
                    <input
                      type="text"
                      name="areaUnit"
                      value={formData.areaUnit || ""}
                      onChange={handleChange}
                      placeholder="مثال: متر"
                      className="w-full p-2 border border-gray-300 rounded"
                      required
                    />
                  </div>

                  {/* رقم الصك */}
                  <div>
                    <label className="block font-semibold">رقم الصك</label>
                    <input
                      type="text"
                      name="deedNumber"
                      value={formData.deedNumber || ""}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded"
                      required
                    />
                  </div>

                  {/* تاريخ الصك */}
                  <div>
                    <label className="block font-semibold">تاريخ الصك</label>
                    <input
                      type="date"
                      name="deedDate"
                      value={formData.deedDate || ""}
                      onChange={handleChange}
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
                      value={formData.remainingArea || ""}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded"
                      required
                    />
                  </div>

                  {/* موقع العقار */}
                  <div>
                    <label className="block font-semibold">موقع العقار</label>
                    <input
                      type="text"
                      name="propertyLocation"
                      value={formData.propertyLocation || ""}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded"
                      required
                    />
                  </div>

                  {/* إجراءات المعاملة */}
                  <div>
                    <label className="block font-semibold">
                      إجراءات المعاملة
                    </label>
                    <select
                      name="transactionActions"
                      value={isCustom ? "custom" : formData.transactionActions}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "custom") {
                          setIsCustom(true); // تفعيل الحقل المخصص
                          setFormData({ ...formData, transactionActions: "" }); // تعيين قيمة فارغة للحقل النصي
                        } else {
                          setIsCustom(false); // إلغاء تفعيل الحقل المخصص
                          setFormData({
                            ...formData,
                            transactionActions: value,
                          });
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
                    {isCustom && (
                      <input
                        type="text"
                        name="transactionActions"
                        placeholder="أدخل إجراء مخصص"
                        value={formData.transactionActions}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            transactionActions: e.target.value,
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
                      name="note"
                      value={formData.note || ""}
                      onChange={handleChange}
                      className="w-full h-32 max-h-32 p-2 border border-gray-300 rounded"
                    ></textarea>
                  </div>

                  {/* رفع الصور */}
                  <div className="col-span-2">
                    <label className="block font-semibold">رفع الصور</label>
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
                    <label className="block font-semibold">
                      تدقيق الإضبارة
                    </label>
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
                navigate(`/yearsDBDetails/${contextMenu.selectedRow.guidId}`); // الانتقال إلى صفحة التفاصيل دون إعادة تحميل
                closeContextMenu();
              }}
            >
              تفاصيل
            </li>

            {activeTable === "YearsDB" ? (
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

export default yearsDBs;
