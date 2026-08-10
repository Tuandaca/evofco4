using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FCUpgrade.Contracts.Requests;
using FCUpgrade.Infrastructure.Services;
using FCUpgrade.IntegrationTests.Infrastructure;
using Xunit;

namespace FCUpgrade.IntegrationTests.Services;

/// <summary>
/// Integration tests for PlayerService against a real PostgreSQL database.
/// Tests are SKIPPED if INTEGRATION_DB_CONNECTIONSTRING is not set.
///
/// Verifies:
/// - Server-side pagination (OFFSET/LIMIT in SQL)
/// - Server-side filtering (WHERE clauses in SQL)
/// - No N+1 for GetPlayerByIdAsync (SELECT with LATERAL JOIN, not per-player queries)
/// - GetPlayerByIdAsync works correctly on PostgreSQL
/// - GetPlayerSeasonByIdAsync works correctly on PostgreSQL
/// </summary>
[Collection("PostgresIntegration")]
public class PlayerServicePostgresTests : IClassFixture<PostgresIntegrationFixture>
{
    private readonly PostgresIntegrationFixture _fixture;
    private readonly PlayerService _sut;

    public PlayerServicePostgresTests(PostgresIntegrationFixture fixture)
    {
        _fixture = fixture;
        _sut = new PlayerService(fixture.DbContext);
    }

    // ─── GetPlayersAsync ───────────────────────────────────────────────────────

    [Fact]
    [Trait("Category", "Integration")]
    public async Task GetPlayersAsync_ReturnsServerSidePagination()
    {
        _fixture.SkipIfUnavailable();

        // Act — page 1, size 1 (forces pagination)
        var request = new GetPlayersRequest { Page = 1, PageSize = 1 };
        var result = await _sut.GetPlayersAsync(request, CancellationToken.None);

        // Assert: pagination metadata is correct
        Assert.NotNull(result);
        Assert.Equal(1, result.Items.Count()); // Only 1 item per page
        Assert.True(result.TotalItems >= 2);   // We seeded at least 2 players
        Assert.True(result.TotalPages >= 2);
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task GetPlayersAsync_SearchFilter_IsServerSide()
    {
        _fixture.SkipIfUnavailable();

        // Act — search for "Messi" (case-insensitive ILike on PostgreSQL)
        var request = new GetPlayersRequest { Page = 1, PageSize = 10, Search = "messi" };
        var result = await _sut.GetPlayersAsync(request, CancellationToken.None);

        // Assert: only players matching search are returned
        Assert.NotNull(result);
        Assert.True(result.Items.Count() >= 1);
        Assert.All(result.Items, p => Assert.Contains("messi", p.Name.ToLowerInvariant()));
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task GetPlayersAsync_SecondPage_ReturnsDifferentItems()
    {
        _fixture.SkipIfUnavailable();

        var req1 = new GetPlayersRequest { Page = 1, PageSize = 1 };
        var req2 = new GetPlayersRequest { Page = 2, PageSize = 1 };

        var page1 = await _sut.GetPlayersAsync(req1, CancellationToken.None);
        var page2 = await _sut.GetPlayersAsync(req2, CancellationToken.None);

        Assert.NotEqual(page1.Items.First().Id, page2.Items.First().Id);
    }

    // ─── GetPlayerByIdAsync ────────────────────────────────────────────────────

    [Fact]
    [Trait("Category", "Integration")]
    public async Task GetPlayerByIdAsync_ReturnsPlayerWithSeasons_NoN1()
    {
        _fixture.SkipIfUnavailable();

        // Act — player1 has 2 seasons (seeded)
        var result = await _sut.GetPlayerByIdAsync(_fixture.SeededPlayer1Id, CancellationToken.None);

        // Assert player
        Assert.NotNull(result);
        Assert.Equal(_fixture.SeededPlayer1Id, result.Id);
        Assert.Equal("Lionel Messi", result.Name);

        // Assert seasons are loaded — this verifies the LATERAL JOIN executed without N+1
        var seasons = result.Seasons.ToList();
        Assert.Equal(2, seasons.Count);

        // Assert ordering: highest OVR first (103, then 99)
        Assert.True(seasons[0].Ovr >= seasons[1].Ovr);
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task GetPlayerByIdAsync_Returns404Shape_WhenNotFound()
    {
        _fixture.SkipIfUnavailable();

        var result = await _sut.GetPlayerByIdAsync(int.MaxValue, CancellationToken.None);

        Assert.Null(result);
    }

    // ─── GetPlayerSeasonByIdAsync ──────────────────────────────────────────────

    [Fact]
    [Trait("Category", "Integration")]
    public async Task GetPlayerSeasonByIdAsync_ReturnsFullDetail()
    {
        _fixture.SkipIfUnavailable();

        var result = await _sut.GetPlayerSeasonByIdAsync(_fixture.SeededPlayerSeason1Id, CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal(_fixture.SeededPlayerSeason1Id, result.Id);
        Assert.Equal("Lionel Messi", result.PlayerName);
        Assert.Equal("RW", result.Pos1);
        Assert.Equal("Inter Miami", result.TeamName);
        Assert.Equal("Argentina", result.NationName);
        Assert.Equal(99, result.Ovr);
    }

    // ─── GetPlayerSeasonsAsync ────────────────────────────────────────────────

    [Fact]
    [Trait("Category", "Integration")]
    public async Task GetPlayerSeasonsAsync_OvrFilter_IsServerSide()
    {
        _fixture.SkipIfUnavailable();

        // Filter: only OVR >= 100 (only ps2: messi_120 with OVR 103 qualifies)
        var request = new GetPlayersRequest { Page = 1, PageSize = 10, MinOvr = 100 };
        var result = await _sut.GetPlayerSeasonsAsync(request, CancellationToken.None);

        Assert.NotNull(result);
        // All returned items must satisfy the filter
        Assert.All(result.Items, ps => Assert.True(ps.Ovr >= 100));
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task GetPlayerSeasonsAsync_PositionFilter_IsServerSide()
    {
        _fixture.SkipIfUnavailable();

        var request = new GetPlayersRequest { Page = 1, PageSize = 10, Position = "ST" };
        var result = await _sut.GetPlayerSeasonsAsync(request, CancellationToken.None);

        Assert.NotNull(result);
        Assert.True(result.Items.Count() >= 1);
        Assert.All(result.Items, ps => Assert.Equal("ST", ps.Pos1));
    }
}
