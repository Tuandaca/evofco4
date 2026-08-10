using System;
using System.Linq;
using FCUpgrade.Domain.Entities;
using FCUpgrade.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FCUpgrade.IntegrationTests.Infrastructure;

/// <summary>
/// Provides a real PostgreSQL ApplicationDbContext for integration testing.
/// Tests using this fixture are SKIPPED if the INTEGRATION_DB_CONNECTIONSTRING
/// environment variable is not set — this is the standard CI/CD pattern.
///
/// Usage:
///   Set env var: INTEGRATION_DB_CONNECTIONSTRING=Host=localhost;Database=fcupgrade_test;Username=postgres;Password=...
/// </summary>
public class PostgresIntegrationFixture : IDisposable
{
    public const string EnvVarName = "INTEGRATION_DB_CONNECTIONSTRING";

    public string? ConnectionString { get; }
    public bool IsAvailable { get; }
    public ApplicationDbContext DbContext { get; }

    // IDs of seeded entities, set after seeding
    public int SeededPlayer1Id { get; private set; }
    public int SeededPlayer2Id { get; private set; }
    public int SeededSeason1Id { get; private set; }
    public int SeededPlayerSeason1Id { get; private set; }

    public PostgresIntegrationFixture()
    {
        ConnectionString = Environment.GetEnvironmentVariable(EnvVarName);
        IsAvailable = !string.IsNullOrWhiteSpace(ConnectionString);

        if (IsAvailable)
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseNpgsql(ConnectionString!)
                .EnableSensitiveDataLogging() // For test SQL inspection
                .Options;

            DbContext = new ApplicationDbContext(options);
            DbContext.Database.EnsureCreated();
            SeedTestData();
        }
        else
        {
            // Create a placeholder context so the property is not null — will never be called in skipped tests
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseNpgsql("Host=localhost;Database=dummy_placeholder")
                .Options;
            DbContext = new ApplicationDbContext(options);
        }
    }

    /// <summary>Call at the beginning of a test to skip gracefully if PostgreSQL is unavailable.</summary>
    public void SkipIfUnavailable()
    {
        if (!IsAvailable)
            throw new SkipException(
                $"PostgreSQL integration test skipped. " +
                $"Set env var '{EnvVarName}' to run against a real PostgreSQL instance.\n" +
                $"Example value: Host=localhost;Database=fcupgrade_test;Username=postgres;Password=yourpassword");
    }

    private void SeedTestData()
    {
        // Idempotent: only seed if table is empty
        if (DbContext.Players.Any()) return;

        var season1 = new Season
        {
            SeasonId = "season_test_110",
            Code = "110",
            Name = "Test Season 110",
            SourceUrl = "",
            IsActive = true,
        };
        var season2 = new Season
        {
            SeasonId = "season_test_120",
            Code = "120",
            Name = "Test Season 120",
            SourceUrl = "",
            IsActive = true,
        };
        DbContext.Seasons.AddRange(season1, season2);

        var player1 = new Player
        {
            SourceId = "test_pg_messi",
            Name = "Lionel Messi",
            NameShort = "L. Messi",
            SourceUrl = "",
        };
        var player2 = new Player
        {
            SourceId = "test_pg_ronaldo",
            Name = "Cristiano Ronaldo",
            NameShort = "C. Ronaldo",
            SourceUrl = "",
        };
        DbContext.Players.AddRange(player1, player2);
        DbContext.SaveChanges();

        var ps1 = new PlayerSeason
        {
            PlayerId = player1.Id,
            SeasonId = season1.Id,
            SourceId = "test_pg_messi_110",
            Ovr = 99,
            Pos1 = "RW",
            TeamName = "Inter Miami",
            NationName = "Argentina",
            LeagueName = "MLS",
            PriceKr = 1_000_000_000,
        };
        var ps2 = new PlayerSeason
        {
            PlayerId = player1.Id,
            SeasonId = season2.Id,
            SourceId = "test_pg_messi_120",
            Ovr = 103,
            Pos1 = "RW",
            TeamName = "Inter Miami",
            NationName = "Argentina",
            LeagueName = "MLS",
            PriceKr = 3_000_000_000,
        };
        var ps3 = new PlayerSeason
        {
            PlayerId = player2.Id,
            SeasonId = season1.Id,
            SourceId = "test_pg_ronaldo_110",
            Ovr = 98,
            Pos1 = "ST",
            TeamName = "Al Nassr",
            NationName = "Portugal",
            LeagueName = "Saudi Pro League",
            PriceKr = 800_000_000,
        };
        DbContext.PlayerSeasons.AddRange(ps1, ps2, ps3);
        DbContext.SaveChanges();

        // Capture IDs for test assertions
        SeededPlayer1Id = player1.Id;
        SeededPlayer2Id = player2.Id;
        SeededSeason1Id = season1.Id;
        SeededPlayerSeason1Id = ps1.Id;
    }

    public void Dispose()
    {
        if (IsAvailable)
        {
            // Clean up seeded test data on disposal to leave the DB clean for next run
            DbContext.PlayerSeasons.RemoveRange(
                DbContext.PlayerSeasons.Where(ps => ps.SourceId.StartsWith("test_pg_")));
            DbContext.Players.RemoveRange(
                DbContext.Players.Where(p => p.SourceId.StartsWith("test_pg_")));
            DbContext.Seasons.RemoveRange(
                DbContext.Seasons.Where(s => s.SeasonId.StartsWith("season_test_")));
            DbContext.SaveChanges();
            DbContext.Dispose();
        }
    }
}

/// <summary>
/// Thrown to signal that a test should be skipped (xUnit does not have native Skip for runtime conditions).
/// Wrap test body with: fixture.SkipIfUnavailable(); and catch this in CI to mark as skipped.
/// </summary>
public class SkipException : Exception
{
    public SkipException(string reason) : base(reason) { }
}
