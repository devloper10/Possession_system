import React, { useState } from "react";
import api from "@/api";
import CustomTable from "./CustomTable";

const GlobalSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(""); // الحالة لتحديد التبويب النشط

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      alert("يرجى إدخال رقم العقار");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      const response = await api.get(`/search/search?term=${searchTerm}`);
      
      if (response.data && Array.isArray(response.data)) {
        setResults(response.data);
        setActiveTab(response.data[0]?.tableName || ""); // تحديد أول تبويب
      } else {
        setError("تنسيق البيانات غير صحيح");
        setResults([]);
      }
      
      if (response.data.length === 0) {
        setError("لم يتم العثور على نتائج");
      }
    } catch (err) {
      console.error("Error fetching search results:", err);
      setError("حدث خطأ أثناء البحث. يرجى المحاولة مرة أخرى.");
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="global-search min-h-screen flex flex-col items-center p-4">
      <h1 className="text-2xl font-bold mb-4">بحث شامل</h1>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="أدخل رقم العقار"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-400 p-2 rounded w-80"
          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
        />
        <button
          onClick={handleSearch}
          disabled={isLoading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
        >
          {isLoading ? "جاري البحث..." : "بحث"}
        </button>
      </div>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {/* التبويبات */}
      <div className="tabs flex gap-4 border-b-2 border-gray-300 mb-4">
        {results.map((table, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(table.tableName)}
            className={`px-4 py-2 ${
              activeTab === table.tableName ? "border-b-4 border-blue-500 font-bold" : ""
            }`}
          >
            {table.tableName}
          </button>
        ))}
      </div>

      {/* عرض الجدول النشط */}
      <div className="tab-content w-full max-w-7xl">
        {results
          .filter((table) => table.tableName === activeTab)
          .map((table, index) => (
            <div key={index} className="result-table mb-6">
              <CustomTable tableType={table.tableName} data={table.data} />
            </div>
          ))}
      </div>
    </div>
  );
};

export default GlobalSearch;
