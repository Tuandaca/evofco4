using FCUpgrade.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace FCUpgrade.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<Player> Players => Set<Player>();
    public DbSet<Season> Seasons => Set<Season>();
    public DbSet<PlayerSeason> PlayerSeasons => Set<PlayerSeason>();
    public DbSet<ImportJob> ImportJobs => Set<ImportJob>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        modelBuilder.Entity<Player>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.SourceId).IsUnique();
            entity.HasIndex(e => e.Name); // Search index
        });

        modelBuilder.Entity<Season>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.SeasonId).IsUnique();
            entity.HasIndex(e => e.IsActive);
        });

        modelBuilder.Entity<PlayerSeason>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.SourceId).IsUnique();
            entity.HasIndex(e => new { e.PlayerId, e.SeasonId }).IsUnique();
            
            // Performance Indexes for Filtering/Sorting
            entity.HasIndex(e => e.Ovr);
            entity.HasIndex(e => e.Pos1);
            entity.HasIndex(e => e.TeamId);
            entity.HasIndex(e => e.NationId);
            entity.HasIndex(e => e.LeagueId);
            
            entity.HasOne(e => e.Player)
                .WithMany(p => p.PlayerSeasons)
                .HasForeignKey(e => e.PlayerId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Season)
                .WithMany(s => s.PlayerSeasons)
                .HasForeignKey(e => e.SeasonId)
                .OnDelete(DeleteBehavior.Cascade);
        });
        
        modelBuilder.Entity<ImportJob>(entity =>
        {
            entity.HasKey(e => e.Id);
        });
    }
}
