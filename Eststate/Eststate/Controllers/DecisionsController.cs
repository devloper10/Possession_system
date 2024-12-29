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
    public class DecisionsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DecisionsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // الحصول على البيانات التي بدون حسم
        // جدول القرارات
        [HttpGet("GetNotDoneDecisions")]
        public async Task<ActionResult<IEnumerable<Decisions>>> Get()
        {
            // جلب جميع المستخدمين مرة واحدة في قاموس
            var users = await _context.Users.ToDictionaryAsync(u => u.guidId, u => u.fullName);

            // جلب العناصر من قاعدة البيانات
            var decisions = await _context.Decisions.Where(i => !i.isDeleted && !i.isDone).ToListAsync();

            // إضافة UserName إلى كل عنصر
            foreach (var decision in decisions)
            {
                decision.UserName = users.ContainsKey(decision.addBy) ? users[decision.addBy] : "غير معروف";
            }

            return Ok(decisions);
        }

        // الحصول على البيانات التي تمتلك حسم
        // جدول الإستملاكات
        [HttpGet("DoneDecisions")]
        public async Task<ActionResult<IEnumerable<Decisions>>> GetDone()
        {
            // جلب جميع المستخدمين مرة واحدة في قاموس
            var users = await _context.Users.ToDictionaryAsync(u => u.guidId, u => u.fullName);

            // جلب العناصر من قاعدة البيانات
            var decisions = await _context.Decisions.Where(i => !i.isDeleted && i.isDone).ToListAsync();

            // إضافة UserName إلى كل عنصر
            foreach (var decision in decisions)
            {
                decision.UserName = users.ContainsKey(decision.addBy) ? users[decision.addBy] : "غير معروف";
            }

            return Ok(decisions);
        }

        // جلب بيانات التي بدون ( حسم ) في سلهة المهملات
        [HttpGet("GetDeletedNotDoneDecisions")]
        public async Task<ActionResult<IEnumerable<Decisions>>> GetDeleted()
        {
            await DeleteOldDecisionsAsync();
            // جلب جميع المستخدمين مرة واحدة في قاموس
            var users = await _context.Users.ToDictionaryAsync(u => u.guidId, u => u.fullName);

            // جلب العناصر المحذوفة من قاعدة البيانات
            var deletedDecisions = await _context.Decisions.Where(i => i.isDeleted && !i.isDone).ToListAsync();

            // إضافة UserName إلى كل عنصر
            foreach (var decision in deletedDecisions)
            {
                decision.UserName = users.ContainsKey(decision.addBy) ? users[decision.addBy] : "غير معروف";
            }

            return Ok(deletedDecisions);
        }

        // جلب بيانات التي تمتلك ( حسم ) في سلهة المهملات
        [HttpGet("GetDeletedDoneDecisions")]
        public async Task<ActionResult<IEnumerable<Decisions>>> GetDoneDeleted()
        {
            await DeleteOldDecisionsAsync();
            // جلب جميع المستخدمين مرة واحدة في قاموس
            var users = await _context.Users.ToDictionaryAsync(u => u.guidId, u => u.fullName);

            // جلب العناصر المحذوفة من قاعدة البيانات
            var deletedDecisions = await _context.Decisions.Where(i => i.isDeleted && i.isDone).ToListAsync();

            // إضافة UserName إلى كل عنصر
            foreach (var decision in deletedDecisions)
            {
                decision.UserName = users.ContainsKey(decision.addBy) ? users[decision.addBy] : "غير معروف";
            }

            return Ok(deletedDecisions);
        }

        // GET api/Decisions/GetDecisionDetails/{guidId}
        [HttpGet("GetDecisionDetails/{guidId}")]
        public async Task<ActionResult<Decisions>> Get(Guid guidId)

        {
            await DeleteOldDecisionsAsync();

            var users = await _context.Users.ToDictionaryAsync(u => u.guidId, u => u.fullName);

            var decision = await _context.Decisions.FirstOrDefaultAsync(i => i.GuidId == guidId);

            if (decision == null)
            {
                return NotFound();
            }

            decision.UserName = users.ContainsKey(decision.addBy) ? users[decision.addBy] : "غير معروف";

            return Ok(decision);
        }

        // POST api/Decisions/PostDecision
        [HttpPost("PostDecision")]
        public async Task<ActionResult<Decisions>> Post([FromBody] Decisions decision)
        {
            decision.createdAt = DateTime.Now.ToString("yyyy-MM-ddTHH:mm:ss");

            // حفظ الصور إذا كانت موجودة
            if (decision.ImageFilePaths != null && decision.ImageFilePaths.Count > 0)
            {
                decision.ImageFilePaths = SaveFilesFromBase64(decision.ImageFilePaths);
            }

            _context.Decisions.Add(decision);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(Get), new { id = decision.Id }, decision);
        }

        // DELETE api/Decisions/DeleteDecision/{guidId}
        [HttpDelete("DeleteDecision/{guidId}")]
        public async Task<IActionResult> SoftDelete(Guid guidId)
        {
            var userId = Request.Headers["guidId"].ToString();
            var isAuth = await _context.Decisions.FirstOrDefaultAsync(s => s.addBy == userId && s.GuidId == guidId);

            if (isAuth == null)
            {
                return BadRequest();
            }

            var decision = await _context.Decisions.FirstOrDefaultAsync(i => i.GuidId == guidId);
            if (decision == null)
            {
                return NotFound();
            }

            // تحديث حالة الحذف وتسجيل التاريخ
            decision.isDeleted = true;
            decision.deletedAt = DateTime.Now.ToString("yyyy-MM-ddTHH:mm:ss");

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // PUT api/Decisions/RestoreDecision/{guidId}
        [HttpPut("RestoreDecision/{guidId}")]
        public async Task<IActionResult> RestoreDecision(Guid guidId)
        {
            var decision = await _context.Decisions.FirstOrDefaultAsync(s => s.GuidId == guidId);
            if (decision == null)
            {
                return NotFound();
            }

            // تحديث حالة isDeleted إلى false
            decision.isDeleted = false;
            decision.deletedAt = null;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // PUT api/Decisions/MarkAsDone/{guidId}
        [HttpPut("MarkAsDone/{guidId}")]
        public async Task<IActionResult> MarkAsDone(Guid guidId)
        {
            var decision = await _context.Decisions.FirstOrDefaultAsync(i => i.GuidId == guidId);
            if (decision == null)
            {
                return NotFound();
            }

            // تحديث حقل isDone إلى true
            decision.isDone = true;

            // تحديث تاريخ التعديل (اختياري)
            decision.editedAt = DateTime.Now.ToString("yyyy-MM-ddTHH:mm:ss");

            await _context.SaveChangesAsync();

            return Ok(decision);
        }


        // PUT api/Decisions/PutDecision/{guidId}
        [HttpPut("PutDecision/{guidId}")]
        public async Task<IActionResult> UpdateDecision(Guid guidId, [FromBody] UpdateDecisionDto dto)
        {
            var decision = await _context.Decisions.FirstOrDefaultAsync(i => i.GuidId == guidId);
            if (decision == null)
            {
                return NotFound();
            }

            // تحديث البيانات
            decision.PropertyNumber = dto.PropertyNumber;
            decision.District = dto.District;
            decision.AreaInDeed = dto.AreaInDeed;
            decision.AcquiredArea = dto.AcquiredArea;
            decision.AreaUnit = dto.AreaUnit;
            decision.PricePerMeter = dto.PricePerMeter;
            decision.Notes = dto.Notes;

            // حفظ الصور إذا كانت موجودة
            if (dto.ImageFilePaths != null && dto.ImageFilePaths.Count > 0)
            {
                decision.ImageFilePaths = SaveFilesFromBase64(dto.ImageFilePaths);
            }

            // تحديث تاريخ التعديل
            decision.editedAt = DateTime.Now.ToString("yyyy-MM-ddTHH:mm:ss");

            await _context.SaveChangesAsync();

            return Ok(decision);
        }

        private List<string> SaveFilesFromBase64(List<string> base64Files)
        {
            var savedFileUrls = new List<string>();
            var folderPath = Path.Combine(Directory.GetCurrentDirectory(), "ImagesOfDecisions");
            var baseUrl = "ImagesOfDecisions"; // يمكنك تعديل هذا الرابط حسب إعدادات السيرفر

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
        public async Task DeleteOldDecisionsAsync()
        {
            try
            {
                // تحديد التاريخ الذي يتم بناءً عليه الحذف (سنة واحدة مضت)
                var thresholdDate = DateTime.Now.AddYears(-1);

                // البحث عن العناصر المحذوفة التي مضى على حذفها سنة أو أكثر
                var oldRecords = await _context.Decisions
                    .Where(i => i.isDeleted && !string.IsNullOrEmpty(i.deletedAt) && DateTime.Parse(i.deletedAt) <= thresholdDate)
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
                    _context.Decisions.RemoveRange(oldRecords);
                    await _context.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in DeleteOldDecisionsAsync: {ex.Message}");
            }
        }
    }
}

// تعريف DTO لتحديث Decisions
public class UpdateDecisionDto
{
    public string? PropertyNumber { get; set; } // رقم العقار
    public string? District { get; set; } // المقاطعة
    public string? LawsuitNumber { get; set; } // رقم الدعوى
    public double? AreaInDeed { get; set; } // المساحة في السند
    public double? AcquiredArea { get; set; } // المساحة المستملكة
    public string? AreaUnit { get; set; } // وحدة المساحة
    public decimal? PricePerMeter { get; set; } // سعر المتر
    public string? Notes { get; set; } // ملاحظات
    public List<string>? ImageFilePaths { get; set; } // قائمة مسارات الصور
}
