using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;

public class Stocks
{
    private decimal? _totalArea;
    private string _yearlyAreaJson;

    public int Id { get; set; }
    public Guid GuidId { get; set; } = Guid.NewGuid(); // تعيين Guid كمعرف فريد
    public string PropertyNumber { get; set; }
    public string Side { get; set; }
    public string IstimlackStatus { get; set; }

    [Column(TypeName = "decimal(18, 2)")]
    public decimal TotalArea
    {
        get => _totalArea ?? 0;
        set
        {
            _totalArea = value;
            CalculateRemainingArea();
        }
    }

    public string YearlyAreaJson
    {
        get => _yearlyAreaJson;
        set
        {
            _yearlyAreaJson = value;
            CalculateRemainingArea();
        }
    }

    [NotMapped]
    public Dictionary<int, decimal?> YearlyArea
    {
        get => string.IsNullOrEmpty(YearlyAreaJson)
            ? new Dictionary<int, decimal?>()
            : JsonSerializer.Deserialize<Dictionary<int, decimal?>>(YearlyAreaJson);
        set
        {
            YearlyAreaJson = JsonSerializer.Serialize(value);
            CalculateRemainingArea();
        }
    }

    [Column(TypeName = "decimal(18, 2)")]
    public decimal AcquiredArea { get; private set; }

    [Column(TypeName = "decimal(18, 2)")]
    public decimal RemainingArea { get; private set; }

    public string Status { get; set; } // تغيير Status إلى public set للوصول إليه من Controller
    public List<string>? ImageFilePath { get; set; }
    public string? Notes { get; set; }

    // الحقول الجديدة
    public bool IsDeleted { get; set; } = false; // القيمة الافتراضية هي false
    public DateTime? DeletedAt { get; set; } // يسجل تاريخ الحذف

    public DateTime? CreatedAt { get; set; } = DateTime.Now; // تسجيل تاريخ الاضافة
    public DateTime? EditedAt { get; set; } // تسجيل تاريخ التعديل

    public string addBy { get; set; } = null;
    public string deletedBy { get; set; } = null;

    // تغيير CalculateRemainingArea إلى public للوصول إليها من Controller
    public void CalculateRemainingArea()
    {
        var yearlyValues = YearlyArea;


        // حساب مجموع المساحات المأخوذة
        AcquiredArea = yearlyValues.Values
            .Where(v => v.HasValue)
            .Sum(v => v.Value);

        // حساب المساحة المتبقية
        RemainingArea = TotalArea - AcquiredArea;

        // تحديث الحالة فقط إذا كانت المساحة المتبقية أقل من 0.20
        if (Status == "مكتملة" || Status == "غير مكتملة" || Status == "" || Status == "غير مكتمل" || Status == "مكتمل" || Status == "لم يكتمل" || Status == "اكتمل")
        {
            if (RemainingArea <= 0.20m)
            {
                Status = "مكتملة";
            }
            else
            {
                Status = "غير مكتملة";
            }
        }
    }


    public void AddYearlyAcquisition(int year, decimal area)
    {
        // التحقق من أن المساحة المضافة لا تتجاوز المساحة المتبقية
        if (area > RemainingArea)
        {
            throw new InvalidOperationException(
                $"المساحة المدخلة ({area}) تتجاوز المساحة المتبقية ({RemainingArea})");
        }

        var yearlyValues = YearlyArea;
        yearlyValues[year] = area;
        YearlyArea = yearlyValues; // سيؤدي هذا إلى تحديث YearlyAreaJson وإعادة حساب المساحات
    }

    public void InitializeYearlyArea()
    {
        int startYear = 2017;
        int currentYear = DateTime.Now.Year;
        var yearlyValues = YearlyArea;

        for (int year = startYear; year <= currentYear; year++)
        {
            if (!yearlyValues.ContainsKey(year))
            {
                yearlyValues[year] = null;
            }
        }

        YearlyArea = yearlyValues;
    }

    // دالة مساعدة لعرض ملخص المساحات
    public string GetSummary()
    {
        return $@"
المساحة الكلية: {TotalArea}
المساحة المأخوذة: {AcquiredArea}
المساحة المتبقية: {RemainingArea}
الحالة: {Status}

تفاصيل المساحات السنوية:
{string.Join("\n", YearlyArea
    .Where(kv => kv.Value.HasValue)
    .OrderBy(kv => kv.Key)
    .Select(kv => $"سنة {kv.Key}: {kv.Value}"))}";
    }
}
