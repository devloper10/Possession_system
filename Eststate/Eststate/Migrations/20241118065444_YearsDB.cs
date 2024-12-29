using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Eststate.Migrations
{
    /// <inheritdoc />
    public partial class YearsDB : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "InfoFull");

            migrationBuilder.CreateTable(
                name: "yearsDBs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    GuidId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PropertyNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    District = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Contract = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AgentOrOwner = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DossierAudit = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Report = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LawsuitRegistration = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LawsuitNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Pleading = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Inspection = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CourtDecision = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PaymentProcess = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AcquiredArea = table.Column<double>(type: "float", nullable: true),
                    AreaUnit = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PricePerMeter = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    TotalPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    DeedNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RemainingArea = table.Column<double>(type: "float", nullable: true),
                    TransactionActions = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PropertyLocation = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ImageFilePath = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EditedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ImageFilePaths = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    addBy = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    deleleBy = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Note = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_yearsDBs", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "yearsDBs");

            migrationBuilder.CreateTable(
                name: "InfoFull",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AcquiredArea = table.Column<double>(type: "float", nullable: true),
                    AgentOrOwner = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AreaUnit = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Contract = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CourtDecision = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeedNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    District = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DossierAudit = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EditedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ImageFilePath = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Inspection = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    LawsuitNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LawsuitRegistration = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PaymentProcess = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Pleading = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PricePerMeter = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    PropertyLocation = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PropertyNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RemainingArea = table.Column<double>(type: "float", nullable: true),
                    Report = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TotalPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    TransactionActions = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InfoFull", x => x.Id);
                });
        }
    }
}
