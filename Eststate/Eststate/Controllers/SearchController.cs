using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Eststate.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SearchController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public SearchController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("search")]
        public IActionResult Search(string term)
        {
            if (string.IsNullOrEmpty(term))
            {
                return BadRequest("يرجى إدخال مصطلح البحث.");
            }

            var results = new List<object>();

            var users = _context.Users.ToDictionary(u => u.guidId, u => u.fullName);

            // البحث في جدول Stocks
            var stocksResults = _context.Stocks
                .Where(x => x.PropertyNumber.Contains(term))
                .ToList();

            foreach (var Stocks in stocksResults)
            {
                Stocks.UserName = users.ContainsKey(Stocks.addBy) ? users[Stocks.addBy] : "غير معروف";
            }

            if (stocksResults.Any())
            {
                results.Add(new { TableName = "Stocks", Data = stocksResults });
            }

            // البحث في جدول YearsDB
            var yearsDBResults = _context.yearsDBs
                .Where(x => x.PropertyNumber.Contains(term))
                .ToList();

            foreach (var YearsDB in yearsDBResults)
            {
                YearsDB.UserName = users.ContainsKey(YearsDB.addBy) ? users[YearsDB.addBy] : "غير معروف";
            }

            if (yearsDBResults.Any())
            {
                results.Add(new { TableName = "YearsDB", Data = yearsDBResults });
            }

            // البحث في جدول AllYears
            var allYearsResults = _context.AllYears
                .Where(x => x.PropertyNumber.Contains(term))
                .ToList();

            foreach (var allYears in allYearsResults)
            {
                allYears.UserName = users.ContainsKey(allYears.addBy) ? users[allYears.addBy] : "غير معروف";
            }

            if (allYearsResults.Any())
            {
                results.Add(new { TableName = "AllYears", Data = allYearsResults });
            }

            // البحث في جدول Decisions
            var decisionsResults = _context.Decisions
                .Where(x => x.PropertyNumber.Contains(term))
                .ToList();

            foreach (var decision in decisionsResults)
            {
                decision.UserName = users.ContainsKey(decision.addBy) ? users[decision.addBy] : "غير معروف";
            }

            if (decisionsResults.Any())
            {
                results.Add(new { TableName = "Decisions", Data = decisionsResults });
            }

            // إذا لم يتم العثور على نتائج
            if (!results.Any())
            {
                return NotFound("لم يتم العثور على أي نتائج.");
            }

            return Ok(results);
        }
    }
}
