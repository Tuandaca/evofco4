using System;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using FCUpgrade.IntegrationTests.Infrastructure;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using FCUpgrade.Infrastructure.Persistence;
using Xunit;

namespace FCUpgrade.IntegrationTests.Api;

/// <summary>
/// HTTP-level integration tests for the Core API endpoints against a real PostgreSQL database.
/// Uses WebApplicationFactory to spin up the full ASP.NET Core pipeline.
/// Tests are SKIPPED if INTEGRATION_DB_CONNECTIONSTRING env var is not set.
///
/// Verifies:
/// - GET /api/v1/players          → 200 + paginated response
/// - GET /api/v1/players/{id}     → 200 + player detail with seasons
/// - GET /api/v1/players/{bad_id} → 404
/// - GET /api/v1/seasons          → 200 + season list
/// - GET /api/v1/player-seasons/{id} → 200 + full detail
/// </summary>
public class PlayersApiIntegrationTests : IClassFixture<PostgresIntegrationFixture>, IDisposable
{
    private readonly PostgresIntegrationFixture _fixture;
    private readonly WebApplicationFactory<Program>? _factory;
    private readonly HttpClient? _client;

    public PlayersApiIntegrationTests(PostgresIntegrationFixture fixture)
    {
        _fixture = fixture;

        if (fixture.IsAvailable)
        {
            _factory = new WebApplicationFactory<Program>()
                .WithWebHostBuilder(builder =>
                {
                    builder.UseEnvironment("Testing");
                    builder.ConfigureServices(services =>
                    {
                        // Replace the DbContext registration with our test PostgreSQL DB
                        var descriptor = services.SingleOrDefault(
                            d => d.ServiceType == typeof(DbContextOptions<ApplicationDbContext>));
                        if (descriptor != null)
                            services.Remove(descriptor);

                        services.AddDbContext<ApplicationDbContext>(options =>
                            options.UseNpgsql(fixture.ConnectionString!));
                    });
                });

            _client = _factory.CreateClient();
        }
    }

    // ─── GET /api/v1/players ──────────────────────────────────────────────────

    [Fact]
    [Trait("Category", "Integration")]
    public async Task GetPlayers_Returns200WithPaginatedData()
    {
        _fixture.SkipIfUnavailable();

        var response = await _client!.GetAsync("/api/v1/players?page=1&pageSize=10");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var body = await response.Content.ReadAsStringAsync();
        Assert.Contains("\"items\"", body);
        Assert.Contains("\"totalItems\"", body);
        Assert.Contains("\"page\"", body);
        Assert.Contains("\"pageSize\"", body);
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task GetPlayers_WithSearch_Returns200()
    {
        _fixture.SkipIfUnavailable();

        var response = await _client!.GetAsync("/api/v1/players?search=Messi");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var body = await response.Content.ReadAsStringAsync();
        Assert.Contains("Messi", body);
    }

    // ─── GET /api/v1/players/{id} ─────────────────────────────────────────────

    [Fact]
    [Trait("Category", "Integration")]
    public async Task GetPlayerById_Returns200WithSeasons()
    {
        _fixture.SkipIfUnavailable();

        var response = await _client!.GetAsync($"/api/v1/players/{_fixture.SeededPlayer1Id}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var body = await response.Content.ReadAsStringAsync();
        Assert.Contains("Messi", body);
        Assert.Contains("\"seasons\"", body);
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task GetPlayerById_Returns404WhenNotFound()
    {
        _fixture.SkipIfUnavailable();

        var response = await _client!.GetAsync("/api/v1/players/999999");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    // ─── GET /api/v1/seasons ──────────────────────────────────────────────────

    [Fact]
    [Trait("Category", "Integration")]
    public async Task GetSeasons_Returns200WithSeasonList()
    {
        _fixture.SkipIfUnavailable();

        var response = await _client!.GetAsync("/api/v1/seasons");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var body = await response.Content.ReadAsStringAsync();
        Assert.Contains("\"items\"", body);
    }

    // ─── GET /api/v1/player-seasons/{id} ─────────────────────────────────────

    [Fact]
    [Trait("Category", "Integration")]
    public async Task GetPlayerSeasonById_Returns200WithFullDetail()
    {
        _fixture.SkipIfUnavailable();

        var response = await _client!.GetAsync($"/api/v1/player-seasons/{_fixture.SeededPlayerSeason1Id}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var body = await response.Content.ReadAsStringAsync();
        Assert.Contains("Messi", body);
        Assert.Contains("\"ovr\"", body);
        Assert.Contains("\"pos1\"", body);
    }

    // ─── Cleanup ──────────────────────────────────────────────────────────────

    public void Dispose()
    {
        _client?.Dispose();
        _factory?.Dispose();
    }
}
