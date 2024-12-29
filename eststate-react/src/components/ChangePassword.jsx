// ChangePassword.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2"; // استيراد مكتبة SweetAlert2
import api from "@/api"; // تأكد من مسار الاستيراد الصحيح

const ChangePassword = () => {
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const navigate = useNavigate();
  const [isTemporaryPassword, setIsTemporaryPassword] = useState(false);

  useEffect(() => {
    const tempPasswordFlag = localStorage.getItem("isTemporaryPassword");
    setIsTemporaryPassword(tempPasswordFlag === "true");
  }, []);

  const guidId = localStorage.getItem("guidId");

  const handleChangePassword = async (e) => {
    e.preventDefault();
  
    if (passwords.newPassword !== passwords.confirmPassword) {
      Swal.fire({
        title: "خطأ",
        text: "كلمة المرور الجديدة وتأكيدها غير متطابقتين.",
        icon: "error",
        confirmButtonText: "موافق",
      });
      return;
    }
  
    try {
      const payload = {
        GuidId: guidId,
        NewPassword: passwords.newPassword,
        CurrentPassword: isTemporaryPassword ? "" : passwords.currentPassword, // تعديل هنا
      };
  
      await api.post("/Account/change-password", payload);
  
      // تحديث العلامة في التخزين المحلي
      localStorage.setItem("isTemporaryPassword", "false");
  
      // عرض رسالة نجاح باستخدام SweetAlert
      Swal.fire({
        title: "تم التغيير بنجاح",
        text: "تم تغيير كلمة المرور بنجاح! سيتم تحويلك إلى الصفحة الرئيسية.",
        icon: "success",
        confirmButtonText: "موافق",
      }).then(() => {
        // توجيه المستخدم إلى الصفحة الرئيسية بعد إغلاق الرسالة
        navigate("/home");
      });
    } catch (error) {
      // عرض رسالة خطأ باستخدام SweetAlert عند حدوث خطأ
      Swal.fire({
        title: "خطأ أثناء تغيير كلمة المرور",
        text:
          error.response?.data ||
          "حدث خطأ أثناء محاولة تغيير كلمة المرور. يرجى المحاولة مرة أخرى.",
        icon: "error",
        confirmButtonText: "موافق",
      });
    }
  };
  

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">تغيير كلمة المرور</h2>
        <form onSubmit={handleChangePassword} className="space-y-6">
          {!isTemporaryPassword && (
            <div>
              <label
                htmlFor="currentPassword"
                className="block text-sm font-medium text-gray-700"
              >
                كلمة المرور الحالية
              </label>
              <input
                id="currentPassword"
                type="password"
                placeholder="أدخل كلمة المرور الحالية"
                value={passwords.currentPassword}
                onChange={(e) =>
                  setPasswords((prev) => ({
                    ...prev,
                    currentPassword: e.target.value,
                  }))
                }
                className="w-full p-3 border border-gray-300 rounded-lg mt-1 focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          )}
          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-gray-700"
            >
              كلمة المرور الجديدة
            </label>
            <input
              id="newPassword"
              type="password"
              placeholder="أدخل كلمة المرور الجديدة"
              value={passwords.newPassword}
              onChange={(e) =>
                setPasswords((prev) => ({
                  ...prev,
                  newPassword: e.target.value,
                }))
              }
              className="w-full p-3 border border-gray-300 rounded-lg mt-1 focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
              تأكيد كلمة المرور الجديدة
            </label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="أدخل تأكيد كلمة المرور الجديدة"
              value={passwords.confirmPassword}
              onChange={(e) =>
                setPasswords((prev) => ({
                  ...prev,
                  confirmPassword: e.target.value,
                }))
              }
              className="w-full p-3 border border-gray-300 rounded-lg mt-1 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-tr from-[#3C6E71] to-[#284B63] text-white p-3 rounded-lg font-semibold transition duration-500 ease-in-out hover:-translate-y-0.5"
          >
            تغيير كلمة المرور
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
