using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

[Route("api/[controller]")]
[ApiController]
public class StocksController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public StocksController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET api/stocks
    [HttpGet("GetEstate")]
    public async Task<ActionResult<IEnumerable<Stocks>>> Get()
    {
        var estates = await _context.Stocks
            .Where(s => !s.IsDeleted)
            .Select(s => new
            {
                s.GuidId,
                s.PropertyNumber,
                s.Side,
                s.IstimlackStatus,
                s.TotalArea,
                s.AcquiredArea,
                s.RemainingArea,
                s.Status,
                s.YearlyArea,
                s.Notes,
                s.CreatedAt,
                UserName = _context.Users
                    .Where(u => u.guidId == s.addBy)
                    .Select(u => u.fullName)
                    .FirstOrDefault()
            })
            .ToListAsync();

        return Ok(estates);
    }

    // GET api/stocks/deleted
    [HttpGet("GetDeleted")]
    public async Task<ActionResult<IEnumerable<Stocks>>> GetDeleted()
    {
        await DeleteOldStocksAsync();

        var estates = await _context.Stocks
            .Where(s => s.IsDeleted)
            .Select(s => new
            {
                s.GuidId,
                s.PropertyNumber,
                s.Side,
                s.IstimlackStatus,
                s.TotalArea,
                s.AcquiredArea,
                s.RemainingArea,
                s.Status,
                s.Notes,
                s.DeletedAt,
                UserName = _context.Users
                    .Where(u => u.guidId == s.deletedBy)
                    .Select(u => u.fullName)
                    .FirstOrDefault()
            })
            .ToListAsync();

        return Ok(estates);
    }

    // GET api/stocks/{guidId}
    [HttpGet("GetEstateDetails/{guidId}")]
    public async Task<ActionResult> Get(Guid guidId)
    {
        var stock = await _context.Stocks
            .Where(s => s.GuidId == guidId)
            .Select(s => new
            {
                s.GuidId,
                s.PropertyNumber,
                s.Side,
                s.IstimlackStatus,
                s.TotalArea,
                s.Status,
                s.Notes,
                s.ImageFilePath,
                s.YearlyArea,
                s.CreatedAt, // تاريخ الإضافة
                s.DeletedAt, // تاريخ الحذف
                UserName = _context.Users
                    .Where(u => u.guidId == s.addBy)
                    .Select(u => u.fullName)
                    .FirstOrDefault()
            })
            .FirstOrDefaultAsync();

        if (stock == null)
        {
            return NotFound();
        }

        return Ok(stock);
    }

    // POST api/stocks
    [HttpPost("PostEstate")]
    [AllowAnonymous]
    public async Task<ActionResult<Stocks>> Post([FromBody] Stocks stock)
    {

        stock.CreatedAt = DateTime.Now;
        stock.InitializeYearlyArea();

        if (stock.ImageFilePath != null && stock.ImageFilePath.Count > 0)
        {
            stock.ImageFilePath = SaveFilesFromBase64(stock.ImageFilePath);
        }


        _context.Stocks.Add(stock);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { guidId = stock.GuidId }, stock);
    }



    // DELETE api/stocks/{guidId}
    [HttpDelete("DeleteEstate/{guidId}")]
    public async Task<IActionResult> SoftDelete(Guid guidId)
    {
        var userId = Request.Headers["guidId"].ToString();
        var IsAuth = await _context.Stocks.FirstOrDefaultAsync(s => s.addBy == userId && s.GuidId == guidId);

        if(IsAuth == null)
        {
            return BadRequest();
        }

        var stock = await _context.Stocks.FirstOrDefaultAsync(s => s.GuidId == guidId);
        if (stock == null)
        {
            return NotFound();
        }

        // تحديث حالة الحذف وتسجيل التاريخ
        stock.IsDeleted = true;
        stock.deletedBy = userId;
        stock.DeletedAt = DateTime.Now;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // PUT api/stocks/restore/{guidId}
    [HttpPut("RestoreEstate/{guidId}")]
    public async Task<IActionResult> RestoreEstate(Guid guidId)
    {
        var stock = await _context.Stocks.FirstOrDefaultAsync(s => s.GuidId == guidId);
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

    // PUT api/stocks/{guidId}
    [HttpPut("PutEstate/{guidId}")]
    public async Task<IActionResult> UpdateFullStock(Guid guidId, [FromBody] UpdateFullStockDto dto)
    {
        try
        {
            var stock = await _context.Stocks.FirstOrDefaultAsync(s => s.GuidId == guidId);
            if (stock == null)
            {
                return NotFound();
            }

            // تحديث الحقول فقط بدون تغيير الصورة
            stock.PropertyNumber = dto.PropertyNumber;
            stock.Side = dto.Side;
            stock.IstimlackStatus = dto.IstimlackStatus;
            stock.TotalArea = dto.TotalArea;
            stock.Status = dto.Status;
            stock.Notes = dto.Notes;

            // تعيين المساحات السنوية
            stock.YearlyArea = dto.YearlyArea;
            stock.CalculateRemainingArea();
            stock.EditedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(stock);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in UpdateFullStock: {ex.Message}");
            return StatusCode(500, "Internal server error");
        }
    }



    private List<string> SaveFilesFromBase64(List<string> base64Files)
    {
        var savedFileUrls = new List<string>();
        var folderPath = Path.Combine(Directory.GetCurrentDirectory(), "ImagesOfStocks");
        var baseUrl = "ImagesOfStocks"; // يمكنك تعديل هذا الرابط حسب إعدادات السيرفر

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
    public async Task DeleteOldStocksAsync()
    {
        try
        {
            // تحديد التاريخ الذي يتم بناءً عليه الحذف (سنة واحدة مضت)
            var thresholdDate = DateTime.Now.AddYears(-1);

            // البحث عن العناصر المحذوفة التي مضى على حذفها سنة أو أكثر
            var oldRecords = await _context.Stocks
                .Where(i => i.IsDeleted && i.DeletedAt.HasValue && i.DeletedAt <= thresholdDate)
                .ToListAsync();

            if (oldRecords.Count > 0)
            {
                // حذف الصور المرتبطة بالسجلات القديمة
                foreach (var record in oldRecords)
                {
                    // التحقق من وجود مسارات صور
                    if (record.ImageFilePath != null && record.ImageFilePath.Any())
                    {
                        foreach (var imagePath in record.ImageFilePath)
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
                _context.Stocks.RemoveRange(oldRecords);
                await _context.SaveChangesAsync();
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in DeleteOldAllYearsAsync: {ex.Message}");
        }


    }

    }


// تعريف DTO للمدخلات السنوية
public class UpdateFullStockDto
{
    public string PropertyNumber { get; set; }
    public string Side { get; set; }
    public string IstimlackStatus { get; set; }
    public decimal TotalArea { get; set; }
    public string Status { get; set; }
    public string Notes { get; set; }
    public Dictionary<int, decimal?> YearlyArea { get; set; }
}


