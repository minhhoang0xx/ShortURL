using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace server.Migrations
{
    /// <inheritdoc />
    public partial class deleteCreateDate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreatedDate",
                table: "ShortUrls");

            migrationBuilder.RenameColumn(
                name: "Url",
                table: "ShortUrls",
                newName: "URL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "URL",
                table: "ShortUrls",
                newName: "Url");

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedDate",
                table: "ShortUrls",
                type: "datetime2",
                nullable: true);
        }
    }
}
