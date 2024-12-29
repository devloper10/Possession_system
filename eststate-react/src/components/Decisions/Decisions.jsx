import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import api from "@/api"; // تأكد من مسار الـ API الخاص بك
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";

const Decisions = () => {
  const [decisions, setDecisions] = useState([]);
  const [deletedDecisions, setDeletedDecisions] = useState([]);
  const [filteredDecisions, setFilteredDecisions] = useState([]);
  const [isActive, setIsActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const [activeTable, setActiveTable] = useState("Decisions"); // 'Decisions' or 'deleted'
  const [status, setStatus] = useState("notDone"); // 'notDone' or 'done'
  const [activeTableSelect, setActiveTableSelect] = useState("possession"); // 'possession' or 'decisions'
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
    district: "",
    lawsuitNumber: "",
    areaInDeed: "",
    acquiredArea: "",
    areaUnit: "",
    pricePerMeter: "",
    notes: "",
    imageFilePaths: [],
  });

  const [editFormData, setEditFormData] = useState({
    guidId: "",
    propertyNumber: "",
    district: "",
    lawsuitNumber: "",
    areaInDeed: "",
    acquiredArea: "",
    areaUnit: "",
    pricePerMeter: "",
    notes: "",
    imageFilePaths: [],
  });

  // دالة لجلب البيانات بناءً على الحالة النشطة
  const fetchDecisions = async () => {
    try {
      let endpoint = "";

      if (activeTable === "Decisions") {
        // جدول الاستملاك أو القرارات
        endpoint =
          status === "notDone"
            ? "/Decisions/GetNotDoneDecisions"
            : "/Decisions/DoneDecisions";
      } else if (activeTable === "deleted") {
        // سلة المحذوفات
        endpoint =
          status === "notDone"
            ? "/Decisions/GetDeletedNotDoneDecisions"
            : "/Decisions/GetDeletedDoneDecisions";
      }

      const response = await api.get(endpoint);

      if (activeTable === "Decisions") {
        setDecisions(response.data);
        setFilteredDecisions(response.data);
      } else {
        setDeletedDecisions(response.data);
        setFilteredDecisions(response.data);
      }
    } catch (error) {
      console.error("Error fetching decisions:", error);
    }
  };

  // دالة لحذف القرار
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
        await api.delete(`/Decisions/DeleteDecision/${guidId}`, {
          headers: {
            guidId: GuidId,
          },
        });
        setSearchQuery("");

        fetchDecisions();

        Swal.fire({
          title: "تم الحذف!",
          text: "تم حذف العنصر بنجاح.",
          icon: "success",
          confirmButtonText: "موافق",
        });
      } catch (error) {
        console.error("Error deleting item:", error);
        if (error.response && error.response.status === 400) {
          Swal.fire({
            title: "غير مصرح لك",
            text: "غير مصرح لك إجراء عملية الحذف",
            icon: "error",
            confirmButtonText: "موافق",
          });
        } else {
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

  // دالة لاستعادة القرار المحذوف
  const handleRestore = async (guidId) => {
    try {
      await api.put(`/Decisions/RestoreDecision/${guidId}`);

      fetchDecisions();

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

  useEffect(() => {
    fetchDecisions();

    const handleClickOutside = () =>
      setContextMenu({ ...contextMenu, visible: false });
    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [activeTable, status]);

  const handleSearch = (query) => {
    setSearchQuery(query);

    const data = activeTable === "Decisions" ? decisions : deletedDecisions;

    if (query.trim() === "") {
      setFilteredDecisions(data);
    } else {
      const filteredData = data.filter((item) => {
        const searchString = [
          item.propertyNumber || "",
          item.district || "",
          item.lawsuitNumber || "",
          item.notes || "",
        ]
          .join(" ")
          .toLowerCase();
        return searchString.includes(query.toLowerCase());
      });

      setFilteredDecisions(filteredData);
    }
  };

  useEffect(() => {
    const data = activeTable === "Decisions" ? decisions : deletedDecisions;

    if (searchQuery.trim() !== "") {
      handleSearch(searchQuery);
    } else {
      setFilteredDecisions(data);
    }
  }, [activeTable, decisions, deletedDecisions, searchQuery]);

  const exportToExcel = () => {
    const dataToExport = filteredDecisions.map((item, index) => {
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

      const userAndDateHeader =
        activeTable === "Decisions"
          ? "أضيف بواسطة / تاريخ الإضافة"
          : "حُذف بواسطة / تاريخ الحذف";

      const userAndDate =
        activeTable === "Decisions"
          ? `${item.userName || "غير معروف"} / ${formatDate(item.createdAt)}`
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
        ملاحظات: item.notes,
        [userAndDateHeader]: userAndDate,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Decisions Data");
    XLSX.writeFile(
      workbook,
      `${
        activeTable === "Decisions" ? "DecisionsData" : "DeletedDecisionsData"
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
      notes: row.notes,
      imageFilePaths: row.imageFilePaths || [],
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

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value,
    });
  };

  const handleImageUpload = (e, isEdit = false) => {
    const files = Array.from(e.target.files);
    const fileReaders = files.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(fileReaders).then((base64Images) => {
      if (isEdit) {
        setEditFormData({
          ...editFormData,
          imageFilePaths: base64Images,
        });
      } else {
        setFormData({
          ...formData,
          imageFilePaths: base64Images,
        });
      }
    });
  };

  const handlePost = async () => {
    event.preventDefault();

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

    const isDuplicate = decisions.some(
      (item) => item.propertyNumber === formData.propertyNumber
    );

    if (isDuplicate) {
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

      if (!result.isConfirmed) {
        return;
      }
    }

    const payload = {
      ...formData,
      addBy: guidId,
    };

    try {
      await api.post("/Decisions/PostDecision", payload);
      closePopup();

      fetchDecisions();

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

  const handleSaveEdit = async () => {
    try {
      const payload = {
        ...editFormData,
      };

      await api.put(`/Decisions/PutDecision/${editFormData.guidId}`, payload);

      closeEditPopup();
      fetchDecisions();

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

  // دالة لتغيير حالة القرار إلى مكتمل
  const handleMarkAsDone = async (guidId) => {
    try {
      await api.put(`/Decisions/MarkAsDone/${guidId}`);
      fetchDecisions();

      Swal.fire({
        title: "تم التحديث",
        text: "تم تغيير حالة القرار إلى مكتمل!",
        icon: "success",
        confirmButtonText: "موافق",
      });
    } catch (error) {
      console.error("Error marking as done:", error);
      Swal.fire({
        title: "خطأ",
        text: "حدث خطأ أثناء تحديث الحالة",
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

    const yPosition = event.pageY + offsetY;
    const isNearBottom = windowHeight - yPosition < 150;

    setContextMenu({
      visible: true,
      x: event.pageX + offsetX,
      y: isNearBottom ? yPosition - 150 : yPosition,
      selectedRow: row,
    });
  };

  const closeContextMenu = () => {
    setContextMenu({ ...contextMenu, visible: false });
  };

  let IsAmeen = localStorage.getItem("role");

  return (
    <>
      <nav className="z-70 py-2 mb-2 bg-gradient-to-r from-[#3C6E71] to-[#284B63]">
        <div className="flex justify-between items-center mx-auto w-[90%]">
          <h1 className="text-white text-3xl font-bold">تطبيق القرارات</h1>
          <div className="flex bg-[#FFF8E1] px-4 py-2 rounded-lg shadow-lg">
            <Link
              to="/"
              className="flex items-center hover:text-[#3C6E71] transition mx-1 px-3"
            >
              <i className="fa-solid fa-home"></i>
              <span className="ml-2 pr-3 text-[#353535]">الصفحة الرئيسية</span>
            </Link>
            <button
              className={`flex items-center transition px-4 py-2 mx-1 ${
                status === "notDone"
                  ? "bg-[#3C6E71] text-white px-4 py-2 rounded-md shadow-lg transform scale-105"
                  : "text-[#353535] hover:text-[#3C6E71]"
              }`}
              onClick={() => {
                setStatus("notDone");
                setActiveTable("Decisions");
                setActiveTableSelect("possession");
              }}
            >
              <i className="fa-solid fa-hourglass-start"></i>
              <span className="ml-2 pr-3">الإستملاك</span>
            </button>
            <button
              className={`flex items-center transition px-4 py-2 mx-1 ${
                status === "done"
                  ? "bg-[#3C6E71] text-white px-4 py-2 rounded-md shadow-lg transform scale-105"
                  : "text-[#353535] hover:text-[#3C6E71]"
              }`}
              onClick={() => {
                setStatus("done");
                setActiveTable("Decisions");
                setActiveTableSelect("decisions");
              }}
            >
              <i className="fa-solid fa-check-circle"></i>
              <span className="ml-2 pr-3">القرارات</span>
            </button>
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
        <div class="flex justify-between mb-1 py-4 px-3 pattern-dots pattern-gray-300 pattern-bg-transparent pattern-size-4 pattern-opacity-100">
          <section className="flex items-center space-x-3">
            <button
              onClick={exportToExcel}
              className="ml-3 px-4 py-2 bg-gradient-to-r from-[#3C6E71] to-[#284B63] text-white rounded-lg font-semibold hover:shadow-md transition duration-200 transform hover:scale-105"
            >
              تحميل إلى Excel
            </button>
            {activeTable === "Decisions" &&
              IsAmeen !== "Ameen" &&
              status === "notDone" && (
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
                className={`cursor-text absolute right-0 transform transition-all duration-300 ease-in-out outline-none bg-[#FFF8E1] h-10 rounded-lg pl-4 pr-6 shadow-md ${
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
          <section className="flex items-center space-x-3">
            <span
              className="text-lg font-bold text-gray-800"
              style={{ textShadow: "1px 2px 5px rgba(190,190,190,0.9)" }}
            >
              {activeTable === "Decisions" && activeTableSelect === "possession"
                ? "جدول الاستملاك"
                : activeTable === "Decisions" &&
                  activeTableSelect === "decisions"
                ? "جدول القرارات"
                : activeTable === "deleted" &&
                  activeTableSelect === "possession"
                ? "سلة محذوفات الاستملاك"
                : activeTable === "deleted" && activeTableSelect === "decisions"
                ? "سلة محذوفات القرارات"
                : "غير محدد"}
            </span>
          </section>
          <section className="flex bg-[#992a2a] ml-4 px-2 py-1 rounded-lg shadow-lg transition duration-200 transform hover:scale-105">
            <button
              className={"flex items-center transition px-1 py-1 text-[#fff]"}
              onClick={() => {
                if (activeTable === "Decisions") {
                  setActiveTable("deleted"); // عرض سلة محذوفات الاستملاك
                } else if (activeTable === "deleted") {
                  setActiveTable("Decisions"); // العودة إلى الجدول الأساسي
                }
              }}
            >
              <i className="fa-solid fa-trash-can"></i>
              <span className="mr-2 cursor-pointer">
                {activeTableSelect === "possession"
                  ? "سلة مهملات الاستملاك"
                  : "سلة مهملات القرارات"}
              </span>
            </button>
          </section>
        </div>

        {/* جدول البيانات */}
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
                  "السعر الكلي",
                  activeTable === "Decisions" ? "أضيف بواسطة" : "حُذف بواسطة",
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
              {filteredDecisions.map((decision, index) => {
                const duplicateIndices = filteredDecisions
                  .map((item, i) =>
                    item.propertyNumber === decision.propertyNumber &&
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
                    key={decision.guidId}
                    title="انقر زر الماوس الأيمن لعرض القائمة"
                    className={`border-b border-[#D9D9D9] ${
                      decision.isDone
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    } transition-colors duration-300 hover:bg-[#F1F1F1]`}
                    onContextMenu={(e) => handleContextMenu(e, decision)}
                    onDoubleClick={() => {
                      navigate(`/DecisionDetails/${decision.guidId}`);
                    }}
                  >
                    <td
                      className="py-4 px-6 text-center cursor-default"
                      style={{
                        whiteSpace: "nowrap",
                        width: "150px",
                      }}
                    >
                      {index + 1}
                    </td>
                    <td
                      className="py-4 px-6 text-center cursor-default"
                      style={{
                        whiteSpace: "nowrap",
                        width: "150px",
                      }}
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
                      {decision.propertyNumber}
                    </td>
                    <td
                      className="py-4 px-6 text-center cursor-default"
                      style={{
                        whiteSpace: "nowrap",
                        width: "150px",
                      }}
                    >
                      {decision.district}
                    </td>
                    <td
                      className="py-4 px-6 text-center cursor-default"
                      style={{
                        whiteSpace: "nowrap",
                        width: "150px",
                      }}
                    >
                      {decision.lawsuitNumber}
                    </td>
                    <td
                      className="py-4 px-6 text-center cursor-default"
                      style={{
                        whiteSpace: "nowrap",
                        width: "150px",
                      }}
                    >
                      {decision.areaInDeed}
                    </td>
                    <td
                      className="py-4 px-6 text-center cursor-default"
                      style={{
                        whiteSpace: "nowrap",
                        width: "150px",
                      }}
                    >
                      {decision.acquiredArea}
                    </td>
                    <td
                      className="py-4 px-6 text-center cursor-default"
                      style={{
                        whiteSpace: "nowrap",
                        width: "150px",
                      }}
                    >
                      {decision.areaUnit}
                    </td>
                    <td
                      className="py-4 px-6 text-center cursor-default"
                      style={{
                        whiteSpace: "nowrap",
                        width: "150px",
                      }}
                    >
                      {decision.pricePerMeter}
                    </td>
                    <td
                      className="py-4 px-6 text-center cursor-default"
                      style={{
                        whiteSpace: "nowrap",
                        width: "150px",
                      }}
                    >
                      {decision.price}
                    </td>
                    <td
                      className="py-4 px-6 text-center"
                      style={{
                        whiteSpace: "nowrap",
                        width: "150px",
                      }}
                    >
                      {activeTable === "Decisions"
                        ? formatDate(decision.createdAt)
                        : formatDate(decision.deletedAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {/* نافذة الإضافة */}
        {isPopupOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-5xl py-6 px-8 rounded-lg shadow-lg overflow-auto max-h-[90vh]">
              <h2 className="text-2xl font-bold mb-6 text-center">
                إضافة قرار جديد
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
                  {/* ملاحظات */}
                  <div className="col-span-2">
                    <label className="block font-semibold">ملاحظات</label>
                    <textarea
                      name="notes"
                      value={formData.notes || ""}
                      onChange={handleChange}
                      className="w-full h-32 max-h-32 p-2 border border-gray-300 rounded"
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
        {/* نافذة التعديل */}
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
                      onChange={handleEditChange}
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
                      onChange={handleEditChange}
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
                      onChange={handleEditChange}
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
                      onChange={handleEditChange}
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
                      onChange={handleEditChange}
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
                      onChange={handleEditChange}
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
                      onChange={handleEditChange}
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                  </div>
                  {/* ملاحظات */}
                  <div className="col-span-2">
                    <label className="block font-semibold">ملاحظات</label>
                    <textarea
                      name="notes"
                      value={editFormData.notes || ""}
                      onChange={handleEditChange}
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
                    onClick={handleSaveEdit}
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
                navigate(`/DecisionDetails/${contextMenu.selectedRow.guidId}`);
                closeContextMenu();
              }}
            >
              تفاصيل
            </li>

            {activeTable === "Decisions" ? (
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

                {!contextMenu.selectedRow.isDone && (
                  <li
                    className="py-3 px-7 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      handleMarkAsDone(contextMenu.selectedRow.guidId);
                      closeContextMenu();
                    }}
                  >
                    وضع كـ مكتمل
                  </li>
                )}
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

export default Decisions;
