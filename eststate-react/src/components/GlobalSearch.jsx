import React, { useState, useEffect } from "react";
import api from "@/api";
import CustomTable from "./CustomTable";
import { ChevronRight, ChevronLeft } from "lucide-react";

const GlobalSearch = () => {
  const [searchTerm, setSearchTerm] = useState(
    localStorage.getItem("searchTerm") || ""
  );
  const [results, setResults] = useState(
    JSON.parse(localStorage.getItem("searchResults")) || []
  );
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentTableIndex, setCurrentTableIndex] = useState(0);

  // حفظ قيمة البحث عند تحديثها
  useEffect(() => {
    localStorage.setItem("searchTerm", searchTerm);
  }, [searchTerm]);

  // حفظ النتائج عند تحديثها
  useEffect(() => {
    localStorage.setItem("searchResults", JSON.stringify(results));
  }, [results]);

  // تأخير البحث لتجنب الطلبات المتكررة
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.trim()) {
        handleSearch();
      } else {
        setResults([]);
        setError("");
      }
    }, 500); // تأخير 500 مللي ثانية

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleSearch = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await api.get(`/search/search?term=${searchTerm}`);
      if (response.data && Array.isArray(response.data)) {
        setResults(response.data);
        setCurrentTableIndex(0);
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

  const goToNextTable = () => {
    if (currentTableIndex < results.length - 1) {
      setCurrentTableIndex(currentTableIndex + 1);
    }
  };

  const goToPreviousTable = () => {
    if (currentTableIndex > 0) {
      setCurrentTableIndex(currentTableIndex - 1);
    }
  };

  const getNextTableName = () => {
    if (currentTableIndex < results.length - 1) {
      return results[currentTableIndex + 1].tableName;
    }
    return null;
  };

  const getPreviousTableName = () => {
    if (currentTableIndex > 0) {
      return results[currentTableIndex - 1].tableName;
    }
    return null;
  };

  return (
    <>
      <div className="global-search min-h-screen flex flex-col items-center p-4">
        <div className="flex flex-col items-start w-full">
          <button
            onClick={() => {
              window.history.back();
            }}
            className="px-3 py-2 bg-red-500 text-white font-serif font-bold rounded-xl transform duration-200 ease-in-out hover:bg-red-700"
          >
            رجوع
          </button>
        </div>
        <h1 className="text-2xl font-bold mb-4">بحث شامل</h1>

        <div className="relative w-80 mb-4">
          <input
            type="text"
            placeholder="أدخل رقم العقار"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-400 p-2 rounded pr-10"
          />
          {isLoading && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>

        {error && <p className="text-red-500 mt-4">{error}</p>}

        {results.length > 0 && (
          <div className="w-[90%]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={goToPreviousTable}
                  disabled={currentTableIndex === 0}
                  className="group relative p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-6 w-6" />
                  {getPreviousTableName() && (
                    <div className="absolute right-0 -top-10 mt-1 bg-gray-800 text-white text-sm py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      الجدول السابق: {getPreviousTableName()}
                    </div>
                  )}
                </button>
                {getPreviousTableName() && (
                  <span className="text-sm text-gray-500">
                    {getPreviousTableName()}
                  </span>
                )}
              </div>

              <h3 className="font-semibold text-xl">
                جدول: {results[currentTableIndex]?.tableName}
                <span className="text-sm text-gray-500 mr-2">
                  ({currentTableIndex + 1} / {results.length})
                </span>
              </h3>

              <div className="flex items-center gap-2">
                {getNextTableName() && (
                  <span className="text-sm text-gray-500">
                    {getNextTableName()}
                  </span>
                )}
                <button
                  onClick={goToNextTable}
                  disabled={currentTableIndex === results.length - 1}
                  className="group relative p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-6 w-6" />
                  {getNextTableName() && (
                    <div className="absolute left-0 -top-10 mt-1 bg-gray-800 text-white text-sm py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      الجدول التالي: {getNextTableName()}
                    </div>
                  )}
                </button>
              </div>
            </div>

            <div className="overflow-hidden">
              <div className="transition-transform duration-300">
                <CustomTable
                  tableType={results[currentTableIndex]?.tableName}
                  data={results[currentTableIndex]?.data}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default GlobalSearch;
