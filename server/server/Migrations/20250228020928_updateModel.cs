using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace server.Migrations
{
    /// <inheritdoc />
    public partial class updateModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "URL",
                table: "ShortUrls",
                newName: "originalUrl");

            migrationBuilder.RenameColumn(
                name: "ShortURL",
                table: "ShortUrls",
                newName: "domain");

            migrationBuilder.AddColumn<string>(
                name: "alias",
                table: "ShortUrls",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "alias",
                table: "ShortUrls");

            migrationBuilder.RenameColumn(
                name: "originalUrl",
                table: "ShortUrls",
                newName: "URL");

            migrationBuilder.RenameColumn(
                name: "domain",
                table: "ShortUrls",
                newName: "ShortURL");
        }
    }
}
