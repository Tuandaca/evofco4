using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FCUpgrade.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTargetBarsToBaitSession : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "TargetBars",
                table: "BaitSessions",
                type: "REAL",
                nullable: false,
                defaultValue: 0.0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TargetBars",
                table: "BaitSessions");
        }
    }
}
