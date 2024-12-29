using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Eststate.Migrations
{
    /// <inheritdoc />
    public partial class allYears05 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Guid",
                table: "AllYears",
                newName: "GuidId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "GuidId",
                table: "AllYears",
                newName: "Guid");
        }
    }
}
