using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Eststate.Models
{
    public class AllYears
    {
        [Key]
        public int Id { get; set; } // Primary key

        public Guid GuidId { get; set; } = Guid.NewGuid();
        public string? PropertyNumber { get; set; } // رقم العقار
        public string? District { get; set; } // المقاطعة
        public string? LawsuitNumber { get; set; } // رقم الدعوة
        public double? AreaInDeed { get; set; } // المساحة في السند (Area in Deed)

        // Acquired area with unit (meters or shares)
        private double? _acquiredArea;
        public double? AcquiredArea
        {
            get => _acquiredArea;
            set
            {
                _acquiredArea = value;
                CalculatePrice();
            }
        }

        public string? AreaUnit { get; set; } // Unit (e.g., "م" or "سهم")

        private decimal? _pricePerMeter;
        [Column(TypeName = "decimal(18, 2)")]
        public decimal? PricePerMeter
        {
            get => _pricePerMeter;
            set
            {
                _pricePerMeter = value;
                CalculatePrice();
            }
        }

        // سيتم تخزين السعر الكلي في قاعدة البيانات
        [Column(TypeName = "decimal(18, 2)")]
        public decimal? Price { get; private set; } // السعر (Total Price)

        public string? AcquisitionYear { get; set; } // سنة الاستملاك (Acquisition Year)
        public string? AcquisitionStatus { get; set; } // موقف الاستملاك (Acquisition Status)
        public string? Notes { get; set; } // ملاحظات (Notes)
        public List<string>? ImageFilePaths { get; set; } // قائمة مسارات الصور

        public string addBy { get; set; } // اضافة من قبل 
        public DateTime? createAt { get; set; } = DateTime.Now; // تم انشائها في تاريخ كذا
        public DateTime? EditedAt { get; set; } // تسجيل تاريخ التعديل

        public DateTime? deletedAt { get; set; } // تم حذفها (سلة المهملات) في تاريخ كذا
        public string? deletedBy { get; set; }
        public bool IsDeleted { get; set; } = false; // القيمة الافتراضية هي false
        [NotMapped]
        public string? UserName { get; set; } // خاصية غير مخرنة في قاعدة البيانات


        // دالة لحساب السعر وتحديثه
        private void CalculatePrice()
        {
            if (AcquiredArea.HasValue && PricePerMeter.HasValue)
            {
                Price = (decimal)AcquiredArea.Value * PricePerMeter.Value;
            }
            else
            {
                Price = null;
            }
        }
    }
}
