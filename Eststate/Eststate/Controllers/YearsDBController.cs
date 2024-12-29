using Eststate.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Eststate.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class YearsDBController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public YearsDBController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET api/infofull
        [HttpGet("GetYearsDB")]
        public async Task<ActionResult<IEnumerable<YearsDB>>> Get()
        {
            // جلب جميع المستخدمين مرة واحدة في قاموس
            var users = await _context.Users.ToDictionaryAsync(u => u.guidId, u => u.fullName);

            // جلب العناصر من قاعدة البيانات
            var yearsDBs = await _context.yearsDBs.Where(i => !i.IsDeleted).ToListAsync();

            // إضافة UserName إلى كل عنصر
            foreach (var year in yearsDBs)
            {
                year.UserName = users.ContainsKey(year.addBy) ? users[year.addBy] : "غير معروف";
            }

            return Ok(yearsDBs);
        }

        [HttpGet("GetDeletedYearsDB")]
        public async Task<ActionResult<IEnumerable<YearsDB>>> GetDeleted()
        {
            await DeleteOldAllYearsAsync();
            // جلب جميع المستخدمين مرة واحدة في قاموس
            var users = await _context.Users.ToDictionaryAsync(u => u.guidId, u => u.fullName);

            // جلب العناصر من قاعدة البيانات
            var deletedYearsDBs = await _context.yearsDBs.Where(i => i.IsDeleted).ToListAsync();

            // إضافة UserName إلى كل عنصر
            foreach (var year in deletedYearsDBs)
            {
                year.UserName = users.ContainsKey(year.addBy) ? users[year.addBy] : "غير معروف";
            }

            return Ok(deletedYearsDBs);
        }



        // GET api/YearsDB/{guidId}
        [HttpGet("GetYearsDBDetails/{guidId}")]
        public async Task<ActionResult<YearsDB>> Get(Guid guidId)
        {
            var users = await _context.Users.ToDictionaryAsync(u => u.guidId, u => u.fullName);

            var YearsDB = await _context.yearsDBs.FirstOrDefaultAsync(i => i.GuidId == guidId);

            YearsDB.UserName = users.ContainsKey(YearsDB.addBy) ? users[YearsDB.addBy] : "غير معروف";

            if (YearsDB == null)
            {
                return NotFound();
            }
            return Ok(YearsDB);
        }

        // POST api/yearsDB
        [HttpPost("PostYearsDB")]
        public async Task<ActionResult<YearsDB>> Post([FromBody] YearsDB yearsDB)
        {
            yearsDB.CreatedAt = DateTime.Now;

            // حفظ الصور إذا كانت موجودة
            if (yearsDB.ImageFilePaths != null && yearsDB.ImageFilePaths.Count > 0)
            {
                yearsDB.ImageFilePaths = SaveFilesFromBase64(yearsDB.ImageFilePaths);
            }

            _context.yearsDBs.Add(yearsDB);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(Get), new { id = yearsDB.Id }, yearsDB);
        }

        // DELETE api/infofull/{id}
        [HttpDelete("DeleteYearsDB/{guidId}")]
        public async Task<IActionResult> SoftDelete(Guid guidId)
        {
            var userId = Request.Headers["guidId"].ToString();
            var IsAuth = await _context.yearsDBs.FirstOrDefaultAsync(s => s.addBy == userId && s.GuidId == guidId);

            if (IsAuth == null)
            {
                return BadRequest();
            }

            var YearsDB = await _context.yearsDBs.FirstOrDefaultAsync(i => i.GuidId == guidId);
            if (YearsDB == null)
            {
                return NotFound();
            }

            // تحديث حالة الحذف وتسجيل التاريخ
            YearsDB.IsDeleted = true;
            YearsDB.deletedBy = userId;
            YearsDB.DeletedAt = DateTime.Now;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // PUT api/YearsDB/restore/{guidId}
        [HttpPut("RestoreYearsDB/{guidId}")]
        public async Task<IActionResult> RestoreEstate(Guid guidId)
        {
            var stock = await _context.yearsDBs.FirstOrDefaultAsync(s => s.GuidId == guidId);
            if (stock == null)
            {
                return NotFound();
            }

            // تحديث حالة IsDeleted إلى false
            stock.IsDeleted = false;
            stock.DeletedAt = null;
            stock.deletedBy = "";

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // PUT api/YearsDB/{id}
        [HttpPut("PutYearsDB/{guidId}")]
        public async Task<IActionResult> UpdateFullInfo(Guid guidId, [FromBody] UpdateYearsDBDto dto)
        {
            var YearsDB = await _context.yearsDBs.FirstOrDefaultAsync(i => i.GuidId == guidId);
            if (YearsDB == null)
            {
                return NotFound();
            }

            // تحديث البيانات العامة
            YearsDB.PropertyNumber = dto.PropertyNumber;
            YearsDB.District = dto.District;
            YearsDB.Contract = dto.Contract;
            YearsDB.AgentOrOwner = dto.AgentOrOwner;
            YearsDB.DossierAudit = dto.DossierAudit;
            YearsDB.Report = dto.Report;
            YearsDB.LawsuitRegistration = dto.LawsuitRegistration;
            YearsDB.LawsuitNumber = dto.LawsuitNumber;
            YearsDB.Pleading = dto.Pleading;
            YearsDB.Inspection = dto.Inspection;
            YearsDB.CourtDecision = dto.CourtDecision;
            YearsDB.PaymentProcess = dto.PaymentProcess;
            YearsDB.AcquiredArea = dto.AcquiredArea;
            YearsDB.AreaUnit = dto.AreaUnit;
            YearsDB.PricePerMeter = dto.PricePerMeter;
            YearsDB.DeedNumber = dto.DeedNumber;
            YearsDB.DeedDate = dto.DeedDate;
            YearsDB.RemainingArea = dto.RemainingArea;
            YearsDB.TransactionActions = dto.TransactionActions;
            YearsDB.PropertyLocation = dto.PropertyLocation;
            YearsDB.Note = dto.Note;

            // حفظ الصور إذا كانت موجودة
            if (dto.ImageFilePaths != null && dto.ImageFilePaths.Count > 0)
            {
                YearsDB.ImageFilePaths = SaveFilesFromBase64(dto.ImageFilePaths);
            }

            // تحديث تاريخ التعديل
            YearsDB.EditedAt = DateTime.Now;

            await _context.SaveChangesAsync();

            return Ok(YearsDB);
        }


        private List<string> SaveFilesFromBase64(List<string> base64Files)
        {
            var savedFileUrls = new List<string>();
            var folderPath = Path.Combine(Directory.GetCurrentDirectory(), "ImagesOfYearsDB");
            var baseUrl = "ImagesOfYearsDB"; // يمكنك تعديل هذا الرابط حسب إعدادات السيرفر

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
                var oldRecords = await _context.yearsDBs
                    .Where(i => i.IsDeleted && i.DeletedAt.HasValue && i.DeletedAt <= thresholdDate)
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
                    _context.yearsDBs.RemoveRange(oldRecords);
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

// تعريف DTO لتحديث InfoFull
public class UpdateYearsDBDto
{
    public string? PropertyNumber { get; set; }
    public string? District { get; set; }
    public string? Contract { get; set; }
    public string? AgentOrOwner { get; set; }
    public string? DossierAudit { get; set; }
    public string? Report { get; set; }
    public string? LawsuitRegistration { get; set; }
    public string? LawsuitNumber { get; set; }
    public string? Pleading { get; set; }
    public string? Inspection { get; set; }
    public string? CourtDecision { get; set; }
    public string? PaymentProcess { get; set; }
    public double? AcquiredArea { get; set; }
    public string? AreaUnit { get; set; }
    public decimal? PricePerMeter { get; set; }
    public string? DeedNumber { get; set; }
    public DateTime? DeedDate { get; set; }
    public double? RemainingArea { get; set; }
    public string? TransactionActions { get; set; }
    public string? PropertyLocation { get; set; }
    public string? Note { get; set; }
    public List<string>? ImageFilePaths { get; set; }
}
