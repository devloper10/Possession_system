import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import logo from '../assets/Image/Logo-Estate.ico';
import "./Login.css";
import api from "@/api";

const Login = ({ onLogin }) => {
  const [user, setUser] = useState({
    username: "",
    passWord: "",
  });

  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const startYear = currentYear - 1;
  const yearDisplay = startYear === currentYear ? currentYear : `${startYear}-${currentYear}`;

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("/Account/login", {
        username: user.username,
        password: user.passWord,
      });

      if (
        response.data &&
        response.data.guidId &&
        response.data.role &&
        response.data.fullName
      ) {
        localStorage.setItem("guidId", response.data.guidId);
        localStorage.setItem("role", response.data.role);
        localStorage.setItem("fullName", response.data.fullName);
        localStorage.setItem(
          "isTemporaryPassword",
          response.data.isTemporaryPassword
        );

        onLogin(
          response.data.guidId,
          response.data.role,
          response.data.fullName
        );

        if (response.data.isTemporaryPassword) {
          navigate("/ChangePassword");
        } else {
          navigate("/home");
        }
      }
    } catch (error) {
      Swal.fire({
        title: "خطأ في تسجيل الدخول",
        text:
          error.response?.data?.message || "معلومات تسجيل الدخول غير صحيحة.",
        icon: "error",
        confirmButtonText: "موافق",
      });
    }
  };

  return (
    <div className="flex items-center justify-end min-h-screen bg-[url('./assets/Image/markd3.jpg')] bg-no-repeat bg-cover">
      <div className="Container flex justify-center flex-col">
        <div className="-translate-y-28">
          <img src={logo} className="w-28 m-auto mb-20" alt="صورة البرنامج" />
          <h2 className="text-2xl font-extrabold text-center mb-6 -translate-y-3">
            تسجيل الدخول
          </h2>
          <form onSubmit={handleLogin} className="space-y-6 translate-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium mb-3"
              >
                إسم المستخدم :
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
                كلمة المرور :
              </label>
              <input
                id="password"
                type="password"
                placeholder="أدخل كلمة المرور"
                value={user.passWord}
                onChange={(e) =>
                  setUser((prevUser) => ({
                    ...prevUser,
                    passWord: e.target.value,
                  }))
                }
                className="w-full p-3 border border-gray-300 rounded-lg mt-1 focus:outline-none focus:border-blue-500 text-black"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-tr from-[#3C6E71] to-[#284B63] text-white p-3 translate-y-10 rounded-lg font-semibold transition duration-500 ease-in-out animate-pulse hover:animate-none"
            >
              تسجيل دخول
            </button>
          </form>
        </div>
        <span className="text-center translate-y-12">الحقوق الملكية © {yearDisplay} العتبة العسكرية المقدسة.</span>
      </div>
    </div>
  );
};

export default Login;