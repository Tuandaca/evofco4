using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FCUpgrade.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddBaitSessionTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "BaitSessions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    TargetFromLevel = table.Column<int>(type: "INTEGER", nullable: false),
                    BaitHistoryJson = table.Column<string>(type: "TEXT", nullable: false),
                    TotalBaitCount = table.Column<int>(type: "INTEGER", nullable: false),
                    SuccessCount = table.Column<int>(type: "INTEGER", nullable: false),
                    FailCount = table.Column<int>(type: "INTEGER", nullable: false),
                    ConsecutiveFails = table.Column<int>(type: "INTEGER", nullable: false),
                    TotalLevelsDropped = table.Column<int>(type: "INTEGER", nullable: false),
                    PredictedProbability = table.Column<double>(type: "REAL", nullable: false),
                    PredictedRiskLevel = table.Column<string>(type: "TEXT", nullable: false),
                    ActualSuccess = table.Column<bool>(type: "INTEGER", nullable: true),
                    ActualDroppedToLevel = table.Column<int>(type: "INTEGER", nullable: true),
                    Notes = table.Column<string>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    FeedbackAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BaitSessions", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BaitSessions_ActualSuccess",
                table: "BaitSessions",
                column: "ActualSuccess");

            migrationBuilder.CreateIndex(
                name: "IX_BaitSessions_CreatedAt",
                table: "BaitSessions",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_BaitSessions_TargetFromLevel",
                table: "BaitSessions",
                column: "TargetFromLevel");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BaitSessions");
        }
    }
}
