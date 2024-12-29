import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import {
  faBuilding,
  faCogs,
  faDatabase,
  faTable,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";

const Home = () => {
  const Application = [
    { id: 1, text: "الاسهم مفصل", path: "/estate", icon: faBuilding },
    {
      id: 2,
      text: "قاعدة بيانات 2022-2023-2024",
      path: "/yearsDB",
      icon: faDatabase,
    },
    { id: 3, text: "قاعدة لكل السنوات", path: "/allYears", icon: faTable },
    {
      id: 4,
      text: "القرارات الغير مصروفة لسنتي (2023-2022) (تم الاسترداد)",
      path: "/decisions",
      icon: faCogs,
    },
  ];

  const userRole = localStorage.getItem("role");
  const fullName = localStorage.getItem("fullName");

  return (
    <div className="bg-[url('./assets/Image/bg-home.svg')] bg-no-repeat bg-cover min-h-screen flex flex-col justify-center items-center overflow-hidden">
      <h1 className="text-4xl font-cairo font-bold text-gray-800 text-center relative -top-44">
        مرحبا بكم في البرنامج
      </h1>
      {userRole !== "Support" && (
        <Link
          to="/global-search"
          className="w-16 h-16 bg-slate-500 cursor-pointer -translate-y-16 p-3 rounded-50"
        >
          <FontAwesomeIcon
            icon={faSearch}
            className="text-white text-4xl cursor-pointer"
          />
        </Link>
      )}
      ;
      <div className="flex justify-center items-center">
        {userRole !== "Support" && (
          <div className="grid grid-cols-2 gap-10 transform -rotate-45">
            {Application.map((item) => (
              <Link
                to={item.path}
                key={item.id}
                className="group relative w-28 h-28 border border-slate-700 bg-gray-800 cursor-pointer flex justify-center items-center shadow-lg transition-transform hover:scale-105"
              >
                {/* الأيقونة */}
                <FontAwesomeIcon
                  icon={item.icon}
                  className="text-white text-4xl cursor-pointer transition-transform transform group-hover:scale-110 rotate-45"
                />

                {/* النص عند التمرير */}
                <div className="absolute top-[-35px] left-[89px] scale-0 transition-transform group-hover:scale-100 group-hover:translate-y-2 bg-gray-900 text-white text-xs font-semibold px-3 py-1 rounded-lg shadow-md rotate-45">
                  {item.text}
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="absolute bottom-7">
          <Link
            to={"/ChangePassword"}
            className="text-slate-900 font-semibold bg-slate-300 p-3 inline-block rounded-lg cursor-pointer transition duration-200 hover:bg-slate-400 mr-6"
          >
            <FontAwesomeIcon icon={faUser} className="mr-2 ml-2" />
            {fullName}
          </Link>

          {(userRole === "Admin" || userRole === "Support") && (
            <>
              <Link
                to={"/Register"}
                className="bg-[#FFF8E1] text-slate-900 p-3 inline-block rounded-lg cursor-pointer font-semibold transition duration-200 hover:bg-[#ffefb7] mr-6"
              >
                تسجيل حساب جديد
              </Link>
              <Link
                to={"/user-management"}
                className="bg-blue-600 text-white p-3 inline-block rounded-lg cursor-pointer transition duration-200 hover:bg-blue-500 mr-6"
              >
                إدارة المستخدمين
              </Link>
            </>
          )}

          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            className="p-3 inline-block mr-5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition duration-200 transform"
          >
            تسجيل الخروج
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
