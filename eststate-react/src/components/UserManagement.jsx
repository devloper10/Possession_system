// UserManagement.js
import React, { useEffect, useState } from "react";
import api from "@/api";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // جلب قائمة المستخدمين عند تحميل المكون
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get("/Account/users");
      setUsers(response.data);
    } catch (error) {
      Swal.fire({
        title: "خطأ",
        text: error.response?.data || "حدث خطأ أثناء جلب المستخدمين.",
        icon: "error",
        confirmButtonText: "موافق",
      });
    }
  };

  const handleResetPassword = async (guidId) => {
    try {
      await api.post("/Account/reset-user-password", { guidId });
      await Swal.fire({
        title: "تم إعادة تعيين كلمة المرور",
        text: "تم إعادة تعيين كلمة المرور إلى الكلمة الافتراضية.",
        icon: "success",
        confirmButtonText: "موافق",
      });
      // تحديث قائمة المستخدمين بعد إعادة التعيين
      fetchUsers();
    } catch (error) {
      Swal.fire({
        title: "خطأ",
        text: error.response?.data || "حدث خطأ أثناء إعادة تعيين كلمة المرور.",
        icon: "error",
        confirmButtonText: "موافق",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center">
      <div className="w-full max-w-6xl mt-10">
        <h2 className="text-3xl font-bold text-center mb-6">
          إدارة المستخدمين
        </h2>
        <div className="overflow-x-auto">
          {users.length > 0 ? (
            <table
              className="min-w-full bg-white shadow-md rounded-lg overflow-hidden"
              dir="rtl"
            >
              <thead className="bg-gradient-to-r from-[#3C6E71] to-[#284B63] text-white">
                <tr>
                  <th className="py-3 px-5 text-right">الاسم الكامل</th>
                  <th className="py-3 px-5 text-right">اسم المستخدم</th>
                  <th className="py-3 px-5 text-right">الدور</th>
                  <th className="py-3 px-5 text-right">
                    كلمة المرور الافتراضية
                  </th>
                  <th className="py-3 px-5 text-right">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr
                    key={user.guidId}
                    className={`border-b ${
                      index % 2 === 0 ? "bg-gray-50" : "bg-white"
                    }`}
                  >
                    <td className="py-3 px-5 text-right">{user.fullName}</td>
                    <td className="py-3 px-5 text-right">{user.userName}</td>
                    <td className="py-3 px-5 text-right">{user.role}</td>
                    <td className="py-3 px-5 text-right">
                      {user.isTemporaryPassword ? (
                        <span className="text-red-600 font-semibold">نعم</span>
                      ) : (
                        <span className="text-green-600 font-semibold">لا</span>
                      )}
                    </td>
                    <td className="py-3 px-5 text-right">
                      <button
                        onClick={() => handleResetPassword(user.guidId)}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-200"
                      >
                        إعادة تعيين كلمة المرور
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-10">
              <p className="text-xl text-gray-600">لا يوجد مستخدمون لعرضهم.</p>
            </div>
          )}
        </div>
        <div className="flex justify-center mt-6">
          <button
            onClick={() => navigate("/home")}
            className="bg-gradient-to-tr from-[#3C6E71] to-[#284B63] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition duration-200"
          >
            العودة إلى الصفحة الرئيسية
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
