using System.Linq;
using System.Threading;
using FCUpgrade.Infrastructure.Persistence;
using FCUpgrade.Infrastructure.Providers.FIFAAddict;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddExceptionHandler<FCUpgrade.API.Middleware.GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

// Register EF Core
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ?? "Data Source=local.db";
builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    if (connectionString.Contains("Data Source"))
    {
        options.UseSqlite(connectionString);
    }
    else
    {
        options.UseNpgsql(connectionString);
    }
});

// Register FIFAaddict services
builder.Services.AddHttpClient<FifaAddictClient>();
builder.Services.AddScoped<FifaAddictParser>();
builder.Services.AddScoped<FifaAddictDataProvider>();
builder.Services.AddScoped<ImportJobService>();

// Register Application Services
builder.Services.AddScoped<FCUpgrade.Application.Services.IPlayerService, FCUpgrade.Infrastructure.Services.PlayerService>();
builder.Services.AddScoped<FCUpgrade.Application.Services.ISeasonService, FCUpgrade.Infrastructure.Services.SeasonService>();
builder.Services.AddScoped<FCUpgrade.Application.Services.IFilterService, FCUpgrade.Infrastructure.Services.FilterService>();
builder.Services.AddScoped<FCUpgrade.Application.Services.ISystemService, FCUpgrade.Infrastructure.Services.SystemService>();

var app = builder.Build();

// Auto-migrate database (for local SQLite dev only)
if (connectionString.Contains("Data Source"))
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    db.Database.EnsureCreated();
}

// CLI command execution intercept
if (args.Length >= 2 && args[0] == "data" && args[1] == "fifaaddict")
{
    using var scope = app.Services.CreateScope();
    var importService = scope.ServiceProvider.GetRequiredService<ImportJobService>();
    var type = args.Length >= 3 && args[2] == "sync" ? "SYNC" : "IMPORT_ALL";
    var isDryRun = args.Contains("--dry-run");
    
    // For a real CLI, we'd wait for this to finish then Environment.Exit(0)
    importService.RunSyncAsync(type, null, isDryRun, CancellationToken.None).GetAwaiter().GetResult();
    return;
}

app.UseExceptionHandler();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.MapControllers();
app.Run();

// Expose Program for WebApplicationFactory in integration tests
public partial class Program { }
