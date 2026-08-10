using System.Text.Json.Serialization;

namespace FCUpgrade.Infrastructure.Providers.FIFAAddict;

public class FifaAddictPlayerDto
{
    [JsonPropertyName("uid")]
    public string Uid { get; set; } = string.Empty;

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("name_short")]
    public string NameShort { get; set; } = string.Empty;

    [JsonPropertyName("year")]
    public string Year { get; set; } = string.Empty;

    [JsonPropertyName("season_name")]
    public string SeasonName { get; set; } = string.Empty;

    [JsonPropertyName("season_full")]
    public string SeasonFull { get; set; } = string.Empty;

    [JsonPropertyName("current_ovr")]
    public string CurrentOvr { get; set; } = string.Empty;

    [JsonPropertyName("pos1")]
    public string Pos1 { get; set; } = string.Empty;

    [JsonPropertyName("pos2")]
    public string Pos2 { get; set; } = string.Empty;

    [JsonPropertyName("team_id")]
    public string TeamId { get; set; } = string.Empty;

    [JsonPropertyName("team_name")]
    public string TeamName { get; set; } = string.Empty;

    [JsonPropertyName("nation_id")]
    public string NationId { get; set; } = string.Empty;

    [JsonPropertyName("nation_name")]
    public string NationName { get; set; } = string.Empty;

    [JsonPropertyName("league_id")]
    public string LeagueId { get; set; } = string.Empty;

    [JsonPropertyName("league_name")]
    public string LeagueName { get; set; } = string.Empty;

    [JsonPropertyName("height")]
    public string Height { get; set; } = string.Empty;

    [JsonPropertyName("weight")]
    public string Weight { get; set; } = string.Empty;

    [JsonPropertyName("age")]
    public string Age { get; set; } = string.Empty;

    [JsonPropertyName("foot_pref")]
    public string FootPref { get; set; } = string.Empty;

    [JsonPropertyName("foot_weak")]
    public int FootWeak { get; set; }

    [JsonPropertyName("skill_level")]
    public int SkillLevel { get; set; }

    [JsonPropertyName("pricekr")]
    public string PriceKr { get; set; } = string.Empty;

    [JsonPropertyName("bodytype_name")]
    public string BodyTypeName { get; set; } = string.Empty;

    [JsonPropertyName("workrate_att")]
    public string WorkRateAtt { get; set; } = string.Empty;

    [JsonPropertyName("workrate_def")]
    public string WorkRateDef { get; set; } = string.Empty;

    [JsonPropertyName("trait3")]
    public string Traits { get; set; } = string.Empty;

    [JsonPropertyName("attrgroup")]
    public FifaAddictAttrGroupDto? AttrGroup { get; set; }
}

public class FifaAddictAttrGroupDto
{
    [JsonPropertyName("labels")]
    public string[] Labels { get; set; } = Array.Empty<string>();

    [JsonPropertyName("data")]
    public int[] Data { get; set; } = Array.Empty<int>();
}
