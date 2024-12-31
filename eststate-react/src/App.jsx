import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/register";
import ChangePassword from "./components/ChangePassword";
import Home from "./components/Home";
import UserManagement from "./components/UserManagement";
// app 1
import Estates from "./components/Stocks/Estates";
import EstateDetails from "./components/Stocks/EstateDetails";
// app 2
import YearsDB from "./components/YearsDB/YearsDB";
import YearsDBDetails from "./components/YearsDB/YearsDBDetails";
// app 3
import AllYears from "./components/AllYears/AllYears";
import AllYearsDetails from "./components/AllYears/AllYearsDetails";
// app 4
import Decisions from "./components/Decisions/Decisions";
import DecisionDetails from "./components/Decisions/DecisionDetails";
// search
import GlobalSearch from "./components/GlobalSearch"; // استيراد المكون الجديد

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // تحقق من حالة المصادقة عند التحميل الأولي للتطبيق
    const guidId = localStorage.getItem("guidId");
    const userRole = localStorage.getItem("role");
    if (guidId) {
      setIsAuthenticated(true);
      setRole(userRole);
    } else {
      setIsAuthenticated(false);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      // وضع مؤشر في sessionStorage للإشارة إلى إعادة التحميل
      sessionStorage.setItem("isReloading", "true");
    };

    const handleUnload = (e) => {
      // تحقق إذا كان المستخدم يغلق النافذة وليس يعيد تحميل الصفحة
      if (!sessionStorage.getItem("isReloading")) {
        localStorage.removeItem("guidId");
        localStorage.removeItem("role");
        localStorage.removeItem("fullName");
      }
      // تنظيف sessionStorage بعد الإغلاق أو إعادة التحميل
      sessionStorage.removeItem("isReloading");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("unload", handleUnload);

    // تنظيف الأحداث عند إلغاء المكون
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("unload", handleUnload);
    };
  }, []);

  const handleLogin = (guidId, userRole, fullName) => {
    // تخزين البيانات في Local Storage
    localStorage.setItem("guidId", guidId);
    localStorage.setItem("role", userRole);
    localStorage.setItem("fullName", fullName);
    setIsAuthenticated(true);
    setRole(userRole);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/home" /> : <Login onLogin={handleLogin} />} />
        <Route path="/Register" element={<Register />} />
        <Route path="/Login" element={<Login onLogin={handleLogin} />} />
        <Route path="/home" element={isAuthenticated ? <Home /> : <Navigate to="/" />} />
        <Route path="/estate" element={isAuthenticated ? <Estates /> : <Navigate to="/" />} />
        <Route path="/details/:guidId" element={isAuthenticated ? <EstateDetails /> : <Navigate to="/" />} />
        <Route path="/yearsDB" element={isAuthenticated ? <YearsDB /> : <Navigate to="/" />} />
        <Route path="/yearsDBDetails/:guidId" element={isAuthenticated ? <YearsDBDetails /> : <Navigate to="/" />} />
        <Route path="/allYears" element={isAuthenticated ? <AllYears /> : <Navigate to="/" />} />
        <Route path="/AllYearsDetails/:guidId" element={isAuthenticated ? <AllYearsDetails /> : <Navigate to="/" />} />
        <Route path="/decisions"element={isAuthenticated ? <Decisions /> : <Navigate to="/" />}/>
        <Route path="/DecisionDetails/:guidId" element={isAuthenticated ? <DecisionDetails /> : <Navigate to="/" />} />
        <Route path="/ChangePassword" element={isAuthenticated ? <ChangePassword /> : <Navigate to="/" />} />
        <Route path="/user-management" element={isAuthenticated && (role === 'Admin' || role === 'Support') ? <UserManagement /> : <Navigate to="/" />} />
        <Route path="/global-search" element={isAuthenticated ? <GlobalSearch /> : <Navigate to="/" />} />
    </Routes>
  );
};

export default App;
