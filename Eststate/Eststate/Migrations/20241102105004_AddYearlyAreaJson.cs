using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Eststate.Migrations
{
    /// <inheritdoc />
    public partial class AddYearlyAreaJson : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Stocks",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PropertyNumber = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Side = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IstimlackStatus = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SandArea = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    YearlyAreaJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AcquiredArea = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RemainingArea = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ImageFilePath = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Stocks", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Stocks");
        }
    }
}
