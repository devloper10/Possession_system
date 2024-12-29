using System.ComponentModel.DataAnnotations.Schema;

namespace Eststate.Models
{
    public class Decisions
    {
        public int Id { get; set; }
        public Guid GuidId { get; set; } = Guid.NewGuid();
        public string? PropertyNumber { get; set; } // رقم العقار
        public string? District { get; set; } // المقاطعة
        public string? LawsuitNumber { get; set; } // رقم الدعوى
        public double? AreaInDeed { get; set; } // المساحة في السند (Area in Deed)

        // Acquired area with unit (meters or shares)
        private double? _acquiredArea;
        public double? AcquiredArea // المساحة المستملكة م2
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
        public decimal? Price { get; private set; } // السعر الكلي (Total Price)

        public string? Notes { get; set; } // ملاحضات
        public List<string>? ImageFilePaths { get; set; } // الصور
        public string? addBy { get; set; }
        public string? createdAt { get; set; }
        public string? editedAt { get; set; }
        public string? deletedAt { get; set; }
        public bool isDeleted { get; set; } = false;
        public bool isDone { get; set; } = false;

        [NotMapped]
        public string? UserName { get; set; } // خاصية غير مخرنة في قاعدة البيانات

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
