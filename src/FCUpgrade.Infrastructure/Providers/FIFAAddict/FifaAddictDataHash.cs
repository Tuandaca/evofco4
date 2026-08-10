using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using FCUpgrade.Domain.Entities;

namespace FCUpgrade.Infrastructure.Providers.FIFAAddict;

public static class FifaAddictDataHash
{
    public static string GenerateHash(PlayerSeason season)
    {
        // Extract relevant fields to compare for changes
        var obj = new
        {
            season.Ovr,
            season.Pos1,
            season.Pos2,
            season.FootPref,
            season.FootWeak,
            season.SkillLevel,
            season.Height,
            season.Weight,
            season.Age,
            season.TeamId,
            season.NationId,
            season.LeagueId,
            season.Pac,
            season.Sho,
            season.Pas,
            season.Dri,
            season.Def,
            season.Phy,
            season.PriceKr,
            season.Traits,
            season.BodyType,
            season.WorkRateAtt,
            season.WorkRateDef
        };

        var json = JsonSerializer.Serialize(obj);
        using var sha256 = SHA256.Create();
        var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(json));
        
        var builder = new StringBuilder();
        foreach (var b in bytes)
        {
            builder.Append(b.ToString("x2"));
        }
        return builder.ToString();
    }
}
