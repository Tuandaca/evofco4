using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FCUpgrade.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveUniqueConstraintPlayerSeason : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_PlayerSeasons_PlayerId_SeasonId",
                table: "PlayerSeasons");

            migrationBuilder.CreateIndex(
                name: "IX_PlayerSeasons_PlayerId_SeasonId",
                table: "PlayerSeasons",
                columns: new[] { "PlayerId", "SeasonId" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_PlayerSeasons_PlayerId_SeasonId",
                table: "PlayerSeasons");

            migrationBuilder.CreateIndex(
                name: "IX_PlayerSeasons_PlayerId_SeasonId",
                table: "PlayerSeasons",
                columns: new[] { "PlayerId", "SeasonId" },
                unique: true);
        }
    }
}
