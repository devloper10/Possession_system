using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Eststate.Migrations
{
    /// <inheritdoc />
    public partial class image1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ImageFilePaths",
                table: "Stocks");

            migrationBuilder.AddColumn<string>(
                name: "ImageFilePath",
                table: "Stocks",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ImageFilePath",
                table: "Stocks");

            migrationBuilder.AddColumn<string>(
                name: "ImageFilePaths",
                table: "Stocks",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }
    }
}
