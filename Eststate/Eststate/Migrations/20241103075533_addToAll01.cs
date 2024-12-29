using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Eststate.Migrations
{
    /// <inheritdoc />
    public partial class addToAll01 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EditHistoryJson",
                table: "Stocks");

            migrationBuilder.DropColumn(
                name: "EditHistoryJson",
                table: "InfoFull");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "EditHistoryJson",
                table: "Stocks",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "EditHistoryJson",
                table: "InfoFull",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }
    }
}
