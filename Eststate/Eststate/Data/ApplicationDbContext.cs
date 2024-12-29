using Eststate.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

public class ApplicationDbContext : IdentityDbContext<IdentityUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    // إضافة DbSet لموديل Stocks

    public DbSet<User> Users { get; set; }
    public DbSet<Stocks> Stocks { get; set; }
    public DbSet<YearsDB> yearsDBs { get; set; }
    public DbSet<AllYears> AllYears { get; set; }
    public DbSet<Decisions> Decisions { get; set; }
    public DbSet<Logs> Logs { get; set; }
}
