import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2"; // استيراد مكتبة SweetAlert2
import logo from "../assets/Image/Logo-Estate.ico";
import "./Login.css";
import api from "@/api";

const Register = () => {
  const [user, setUser] = useState({
    username: "",
    password: "",
    role: "",
    fullName: "",
  });

  const [currentRole, setCurrentRole] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("role");
    console.log(role);
    setCurrentRole(role);
  }, []);

  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const startYear = currentYear - 1;
  const yearDisplay = startYear === currentYear ? currentYear : `${startYear}-${currentYear}`;

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      // إرسال طلب التسجيل
      const response = await api.post("/Account/register", {
        username: user.username,
        password: user.password,
        role: user.role,
        fullName: user.fullName,
      });

      Swal.fire({
        title: "تم التسجيل بنجاح",
        text: "تم إنشاء الحساب الجديد بنجاح! سيتم تحويلك إلى صفحة تسجيل الدخول.",
        icon: "success",
        confirmButtonText: "موافق",
      }).then(() => {
        navigate("/Login");
      });
    } catch (error) {
      Swal.fire({
        title: "خطأ أثناء التسجيل",
        text:
          error.response?.data ||
          "حدث خطأ أثناء محاولة إنشاء الحساب. يرجى المحاولة مرة أخرى.",
        icon: "error",
        confirmButtonText: "موافق",
      });
    }
  };

  return (
    <div className="flex items-center justify-end min-h-screen bg-[url('./assets/Image/markd3.jpg')] bg-no-repeat bg-cover">
      <div className="Container flex justify-center flex-col">
        <div className="-translate-y-24">
          <img src={logo} className="w-28 m-auto mb-16 translate-y-10" alt="صورة البرنامج" />
          <h2 className="text-2xl font-bold text-center mb-6 -translate-y-3">
            إنشاء حساب جديد
          </h2>
          <form onSubmit={handleRegister} className="space-y-6 translate-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium mb-3"
              >
                اسم المستخدم
              </label>
              <input
                id="username"
                type="text"
                placeholder="أدخل اسم المستخدم"
                value={user.username}
                onChange={(e) =>
                  setUser((prevUser) => ({
                    ...prevUser,
                    username: e.target.value,
                  }))
                }
                className="w-full p-3 border border-gray-300 rounded-lg mt-1 focus:outline-none focus:border-blue-500 text-black"
                required
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-3"
              >
                كلمة المرور
              </label>
              <input
                id="password"
                type="password"
                placeholder="أدخل كلمة المرور"
                value={user.password}
                onChange={(e) =>
                  setUser((prevUser) => ({
                    ...prevUser,
                    password: e.target.value,
                  }))
                }
                className="w-full p-3 border border-gray-300 rounded-lg mt-1 focus:outline-none focus:border-blue-500 text-black"
                required
              />
            </div>
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium mb-3"
              >
                الاسم الكامل
              </label>
              <input
                id="fullName"
                type="text"
                placeholder="أدخل الاسم الكامل"
                value={user.fullName}
                onChange={(e) =>
                  setUser((prevUser) => ({
                    ...prevUser,
                    fullName: e.target.value,
                  }))
                }
                className="w-full p-3 border border-gray-300 rounded-lg mt-1 focus:outline-none focus:border-blue-500 text-black"
                required
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium mb-3">
                الدور
              </label>
              <select
                id="role"
                value={user.role}
                onChange={(e) =>
                  setUser((prevUser) => ({
                    ...prevUser,
                    role: e.target.value,
                  }))
                }
                className="w-full p-3 border border-gray-300 rounded-lg mt-1 focus:outline-none focus:border-blue-500 text-black"
                required
              >
                <option value="" disabled>
                  اختر الدور
                </option>
                {currentRole === "Admin" && (
                  <>
                    <option value="Admin">مدير</option>
                    <option value="Ameen">أمين</option>
                    <option value="Support">صيانة</option>
                    <option value="User">مستخدم</option>
                  </>
                )}
                {currentRole === "Support" && (
                  <>
                    <option value="User">مستخدم</option>
                  </>
                )}
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-tr from-[#3C6E71] to-[#284B63] text-white p-3 translate-y-10 rounded-lg font-semibold transition duration-500 ease-in-out animate-pulse hover:animate-none"
            >
              تسجيل
            </button>
          </form>
        </div>
        <span className="text-center translate-y-12">الحقوق الملكية © {yearDisplay} العتبة العسكرية المقدسة.</span>
      </div>
    </div>
  );
};

export default Register;
