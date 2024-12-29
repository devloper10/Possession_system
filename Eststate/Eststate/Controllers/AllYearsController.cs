using Eststate.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;

namespace Eststate.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AllYearsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AllYearsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET api/AllYears/GetAllYears
        [HttpGet("GetAllYears")]
        public async Task<ActionResult<IEnumerable<AllYears>>> Get()
        {
            // جلب جميع المستخدمين مرة واحدة في قاموس
            var users = await _context.Users.ToDictionaryAsync(u => u.guidId, u => u.fullName);

            // جلب العناصر من قاعدة البيانات
            var allYears = await _context.AllYears.Where(i => !i.IsDeleted).ToListAsync();

            // إضافة UserName إلى كل عنصر
            foreach (var year in allYears)
            {
                year.UserName = users.ContainsKey(year.addBy) ? users[year.addBy] : "غير معروف";
            }

            return Ok(allYears);
        }

        // GET api/AllYears/GetDeletedAllYears
        [HttpGet("GetDeletedAllYears")]
        public async Task<ActionResult<IEnumerable<AllYears>>> GetDeleted()
        {
            await DeleteOldAllYearsAsync();
            // جلب جميع المستخدمين مرة واحدة في قاموس
            var users = await _context.Users.ToDictionaryAsync(u => u.guidId, u => u.fullName);

            // جلب العناصر المحذوفة من قاعدة البيانات
            var deletedAllYears = await _context.AllYears.Where(i => i.IsDeleted).ToListAsync();

            // إضافة UserName إلى كل عنصر
            foreach (var year in deletedAllYears)
            {
                year.UserName = users.ContainsKey(year.addBy) ? users[year.addBy] : "غير معروف";
            }

            return Ok(deletedAllYears);
        }

        // GET api/AllYears/GetAllYearsDetails/{guidId}
        [HttpGet("GetAllYearsDetails/{guidId}")]
        public async Task<ActionResult<AllYears>> Get(Guid guidId)

        {
            var users = await _context.Users.ToDictionaryAsync(u => u.guidId, u => u.fullName);

            var allYear = await _context.AllYears.FirstOrDefaultAsync(i => i.GuidId == guidId);

            allYear.UserName = users.ContainsKey(allYear.addBy) ? users[allYear.addBy] : "غير معروف";

            if (allYear == null)
            {
                return NotFound();
            }
            return Ok(allYear);
        }

        // POST api/AllYears/PostAllYears
        [HttpPost("PostAllYears")]
        public async Task<ActionResult<AllYears>> Post([FromBody] AllYears allYears)
        {
            allYears.createAt = DateTime.Now;

            // حفظ الصور إذا كانت موجودة
            if (allYears.ImageFilePaths != null && allYears.ImageFilePaths.Count > 0)
            {
                allYears.ImageFilePaths = SaveFilesFromBase64(allYears.ImageFilePaths);
            }

            _context.AllYears.Add(allYears);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(Get), new { id = allYears.Id }, allYears);
        }

        // DELETE api/AllYears/DeleteAllYears/{guidId}
        [HttpDelete("DeleteAllYears/{guidId}")]
        public async Task<IActionResult> SoftDelete(Guid guidId)
        {
            var userId = Request.Headers["guidId"].ToString();
            var isAuth = await _context.AllYears.FirstOrDefaultAsync(s => s.addBy == userId && s.GuidId == guidId);

            if (isAuth == null)
            {
                return BadRequest();
            }

            var allYear = await _context.AllYears.FirstOrDefaultAsync(i => i.GuidId == guidId);
            if (allYear == null)
            {
                return NotFound();
            }

            // تحديث حالة الحذف وتسجيل التاريخ
            allYear.IsDeleted = true;
            allYear.deletedBy = userId;
            allYear.deletedAt = DateTime.Now;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // PUT api/AllYears/RestoreAllYears/{guidId}
        [HttpPut("RestoreAllYears/{guidId}")]
        public async Task<IActionResult> RestoreEstate(Guid guidId)
        {
            var allYear = await _context.AllYears.FirstOrDefaultAsync(s => s.GuidId == guidId);
            if (allYear == null)
            {
                return NotFound();
            }

            // تحديث حالة IsDeleted إلى false
            allYear.IsDeleted = false;
            allYear.deletedAt = null;
            allYear.deletedBy = null;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // PUT api/AllYears/PutAllYears/{guidId}
        [HttpPut("PutAllYears/{guidId}")]
        public async Task<IActionResult> UpdateAllYears(Guid guidId, [FromBody] UpdateAllYearsDto dto)
        {
            var allYear = await _context.AllYears.FirstOrDefaultAsync(i => i.GuidId == guidId);
            if (allYear == null)
            {
                return NotFound();
            }

            // تحديث البيانات العامة
            allYear.PropertyNumber = dto.PropertyNumber;
            allYear.District = dto.District;
            allYear.LawsuitNumber = dto.LawsuitNumber;
            allYear.AreaInDeed = dto.AreaInDeed;
            allYear.AcquiredArea = dto.AcquiredArea;
            allYear.AreaUnit = dto.AreaUnit;
            allYear.PricePerMeter = dto.PricePerMeter;
            allYear.AcquisitionYear = dto.AcquisitionYear;
            allYear.AcquisitionStatus = dto.AcquisitionStatus;
            allYear.Notes = dto.Notes;

            // حفظ الصور إذا كانت موجودة
            if (dto.ImageFilePaths != null && dto.ImageFilePaths.Count > 0)
            {
                allYear.ImageFilePaths = SaveFilesFromBase64(dto.ImageFilePaths);
            }

            // تحديث تاريخ التعديل
            allYear.EditedAt = DateTime.Now;

            await _context.SaveChangesAsync();

            return Ok(allYear);
        }

        private List<string> SaveFilesFromBase64(List<string> base64Files)
        {
            var savedFileUrls = new List<string>();
            var folderPath = Path.Combine(Directory.GetCurrentDirectory(), "ImagesOfAllYears");
            var baseUrl = "ImagesOfAllYears"; // يمكنك تعديل هذا الرابط حسب إعدادات السيرفر

            if (!Directory.Exists(folderPath))
            {
                Directory.CreateDirectory(folderPath);
            }

            foreach (var base64File in base64Files)
            {
                var fileData = base64File;
                string mimeType = "";
                string fileExtension = "";

                if (fileData.Contains(","))
                {
                    var parts = fileData.Split(',');
                    var metadata = parts[0]; // يحتوي على معلومات نوع الملف
                    fileData = parts[1];     // البيانات الفعلية للملف

                    if (metadata.Contains(";"))
                    {
                        mimeType = metadata.Split(':')[1].Split(';')[0];
                    }
                    else
                    {
                        mimeType = metadata.Split(':')[1];
                    }

                    // تحديد الامتداد بناءً على نوع MIME
                    switch (mimeType)
                    {
                        case "image/jpeg":
                            fileExtension = ".jpg";
                            break;
                        case "image/png":
                            fileExtension = ".png";
                            break;
                        case "application/pdf":
                            fileExtension = ".pdf";
                            break;
                        // يمكنك إضافة أنواع أخرى هنا
                        default:
                            fileExtension = ""; // أو يمكنك تخطي هذا الملف إذا كان النوع غير مدعوم
                            break;
                    }
                }
                else
                {
                    // إذا لم يحتوي على معلومات نوع MIME، يمكنك تعيين نوع افتراضي أو تخطيه
                    continue;
                }

                if (string.IsNullOrEmpty(fileExtension))
                {
                    // تخطي الملفات ذات الامتداد غير المعروف
                    continue;
                }

                var fileBytes = Convert.FromBase64String(fileData);
                var fileName = $"{Guid.NewGuid()}{fileExtension}";
                var filePath = Path.Combine(folderPath, fileName);

                System.IO.File.WriteAllBytes(filePath, fileBytes);

                // إنشاء رابط URL للملف
                var fileUrl = $"{baseUrl}/{fileName}";
                savedFileUrls.Add(fileUrl);
            }

            return savedFileUrls;
        }


        [NonAction]
        public async Task DeleteOldAllYearsAsync()
        {
            try
            {
                // تحديد التاريخ الذي يتم بناءً عليه الحذف (سنة واحدة مضت)
                var thresholdDate = DateTime.Now.AddYears(-1);

                // البحث عن العناصر المحذوفة التي مضى على حذفها سنة أو أكثر
                var oldRecords = await _context.AllYears
                    .Where(i => i.IsDeleted && i.deletedAt.HasValue && i.deletedAt <= thresholdDate)
                    .ToListAsync();

                if (oldRecords.Count > 0)
                {
                    // حذف الصور المرتبطة بالسجلات القديمة
                    foreach (var record in oldRecords)
                    {
                        // التحقق من وجود مسارات صور
                        if (record.ImageFilePaths != null && record.ImageFilePaths.Any())
                        {
                            foreach (var imagePath in record.ImageFilePaths)
                            {
                                // استخراج المسار الكامل للصورة
                                var fullImagePath = Path.Combine(Directory.GetCurrentDirectory(), imagePath);

                                // التحقق من وجود الملف قبل الحذف
                                if (System.IO.File.Exists(fullImagePath))
                                {
                                    try
                                    {
                                        // حذف الملف الفعلي
                                        System.IO.File.Delete(fullImagePath);
                                    }
                                    catch (Exception ex)
                                    {
                                        Console.WriteLine($"Error deleting image file {fullImagePath}: {ex.Message}");
                                        // يمكنك إضافة التسجيل أو معالجة الخطأ حسب الحاجة
                                    }
                                }
                            }
                        }
                    }

                    // حذف السجلات القديمة من قاعدة البيانات
                    _context.AllYears.RemoveRange(oldRecords);
                    await _context.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in DeleteOldAllYearsAsync: {ex.Message}");
            }
        }
    }
}

// تعريف DTO لتحديث AllYears
public class UpdateAllYearsDto
{
    public string? PropertyNumber { get; set; } // رقم العقار
    public string? District { get; set; } // المقاطعة
    public string? LawsuitNumber { get; set; } // رقم الدعوى
    public double? AreaInDeed { get; set; } // المساحة في السند
    public double? AcquiredArea { get; set; } // المساحة المستملكة
    public string? AreaUnit { get; set; } // وحدة المساحة
    public decimal? PricePerMeter { get; set; } // سعر المتر
    public string? AcquisitionYear { get; set; } // سنة الاستملاك
    public string? AcquisitionStatus { get; set; } // موقف الاستملاك
    public string? Notes { get; set; } // ملاحظات
    public List<string>? ImageFilePaths { get; set; } // قائمة مسارات الصور
}
