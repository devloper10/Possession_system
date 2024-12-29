using System.ComponentModel.DataAnnotations.Schema;

namespace Eststate.Models
{
    public class YearsDB
    {
        public int Id { get; set; } // Primary key
        public Guid GuidId { get; set; } = Guid.NewGuid(); // تعيين Guid كمعرف فريد
        public string? PropertyNumber { get; set; } // رقم العقار
        public string? District { get; set; } // المقاطعة
        public string? Contract { get; set; } // التعاقد
        public string? AgentOrOwner { get; set; } // اسم الوكيل او صاحب الملك
        public string? DossierAudit { get; set; } // تدقيق الاضابير
        public string? Report { get; set; } // محضر
        public string? LawsuitRegistration { get; set; } // تسجيل دعوى
        public string? LawsuitNumber { get; set; } // رقم الدعوى
        public string? Pleading { get; set; } // مرافعة
        public string? Inspection { get; set; } // كشف
        public string? CourtDecision { get; set; } // قرار المحكمة
        public string? PaymentProcess { get; set; } // ترويج معاملة صرف المستحقات

        // Store the acquired area and its type (meter or share)
        private double? _acquiredArea;
        public double? AcquiredArea
        {
            get => _acquiredArea;
            set
            {
                _acquiredArea = value;
                CalculateTotalPrice();
            }
        }

        public string? AreaUnit { get; set; } // Unit of area (e.g., "م" or "سهم")

        private decimal? _pricePerMeter;
        [Column(TypeName = "decimal(18, 2)")]
        public decimal? PricePerMeter
        {
            get => _pricePerMeter;
            set
            {
                _pricePerMeter = value;
                CalculateTotalPrice();
            }
        }

        // سيتم تخزين السعر الكلي في قاعدة البيانات
        [Column(TypeName = "decimal(18, 2)")]
        public decimal? TotalPrice { get; private set; } // السعر الكلي

        public string? DeedNumber { get; set; } // رقم الصك
        public DateTime? DeedDate { get; set; } // تاريخ الصك (nullable)

        public double? RemainingArea { get; set; } // المساحة المتبقية م2
        public string? TransactionActions { get; set; } // إجراءات المعاملة
        public string? PropertyLocation { get; set; } // موقع العقار

        public bool IsDeleted { get; set; } = false; // القيمة الافتراضية هي false
        public DateTime? DeletedAt { get; set; } // يسجل تاريخ الحذف

        public DateTime? CreatedAt { get; set; } = DateTime.Now; // تسجيل تاريخ الاضافة
        public DateTime? EditedAt { get; set; } // تسجيل تاريخ التعديل
        public List<string>? ImageFilePaths { get; set; } // قائمة مسارات الصور
        public string addBy { get; set; } // تمت الاضافة من قبل 
        public string deletedBy { get; set; }
        public string? Note { get; set; } // ملاحظات
        [NotMapped]
        public string? UserName { get; set; } // خاصية غير مخرنة في قاعدة البيانات


        // دالة لحساب السعر الكلي وتحديثه
        private void CalculateTotalPrice()
        {
            if (AcquiredArea.HasValue && PricePerMeter.HasValue)
            {
                TotalPrice = (decimal)AcquiredArea.Value * PricePerMeter.Value;
            }
            else
            {
                TotalPrice = null;
            }
        }
    }
}
