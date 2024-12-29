using Eststate.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Eststate.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AccountController(ApplicationDbContext context)
        {
            _context = context;
        }

        private async Task LogEventAsync(string message)
        {
            var log = new Logs
            {
                log = message,
                date = DateTime.Now
            };

            _context.Logs.Add(log);
            await _context.SaveChangesAsync();
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _context.Users.Select(u => new
            {
                u.guidId,
                u.userName,
                u.fullName,
                u.role,
                u.IsTemporaryPassword
            }).ToListAsync();

            return Ok(users);
        }

        [HttpPost("reset-user-password")]
        public async Task<IActionResult> ResetUserPassword(ResetUserPasswordDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.guidId == dto.GuidId);

            if (user == null)
            {
                return NotFound("المستخدم غير موجود.");
            }

            var defaultPassword = "User1234";
            user.passWord = BCrypt.Net.BCrypt.HashPassword(defaultPassword);
            user.IsTemporaryPassword = true;

            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            await LogEventAsync($"تم اعادة تعين كلمة سر المستخدم {user.userName} إلى كلمة مرور افتراضية.");

            return Ok("تم إعادة تعيين كلمة المرور إلى الكلمة الافتراضية.");
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(UserRegistrationDto registrationDto)
        {
            if (_context.Users.Any(u => u.userName == registrationDto.Username))
            {
                return BadRequest("Username already exists");
            }

            var user = new User
            {
                userName = registrationDto.Username,
                passWord = BCrypt.Net.BCrypt.HashPassword(registrationDto.Password),
                role = registrationDto.role,
                fullName = registrationDto.FullName
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            await LogEventAsync($"قام ادمن بإضافة حساب جديد باسم {registrationDto.FullName}.");

            return Ok("User registered successfully");
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(UserLoginDto loginDto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.userName == loginDto.Username);

            if (user == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.passWord))
            {
                return Unauthorized("اسم المستخدم أو كلمة المرور غير صحيحة.");
            }

            await LogEventAsync($"قام المستخدم {user.userName} بتسجيل الدخول.");

            return Ok(new
            {
                guidId = user.guidId,
                role = user.role,
                fullName = user.fullName,
                isTemporaryPassword = user.IsTemporaryPassword
            });
        }

        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword(ChangePasswordDto changePasswordDto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.guidId == changePasswordDto.GuidId);

            if (user == null)
            {
                return NotFound("المستخدم غير موجود.");
            }

            if (!user.IsTemporaryPassword)
            {
                if (string.IsNullOrEmpty(changePasswordDto.CurrentPassword) || !BCrypt.Net.BCrypt.Verify(changePasswordDto.CurrentPassword, user.passWord))
                {
                    return Unauthorized("كلمة المرور الحالية غير صحيحة.");
                }
            }

            var oldPassword = user.passWord;

            user.passWord = BCrypt.Net.BCrypt.HashPassword(changePasswordDto.NewPassword);
            user.IsTemporaryPassword = false;

            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            await LogEventAsync($"قام المستخدم {user.fullName} بتغيير كلمة المرور الخاصة به. كلمة المرور الجديدة: {changePasswordDto.NewPassword}");

            return Ok("تم تغيير كلمة المرور بنجاح.");
        }
    }

    public class UserRegistrationDto
    {
        public string Username { get; set; }
        public string Password { get; set; }
        public string role { get; set; }
        public string FullName { get; set; }
    }

    public class UserLoginDto
    {
        public string Username { get; set; }
        public string Password { get; set; }
    }

    public class ChangePasswordDto
    {
        public string GuidId { get; set; }
        public string CurrentPassword { get; set; }
        public string NewPassword { get; set; }
    }

    public class ResetUserPasswordDto
    {
        public string GuidId { get; set; }
    }
}
