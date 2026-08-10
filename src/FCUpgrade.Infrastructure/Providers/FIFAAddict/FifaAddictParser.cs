using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Text.RegularExpressions;
using Jint;
using Microsoft.Extensions.Logging;

namespace FCUpgrade.Infrastructure.Providers.FIFAAddict;

public class FifaAddictParser
{
    private readonly ILogger<FifaAddictParser> _logger;

    public FifaAddictParser(ILogger<FifaAddictParser> logger)
    {
        _logger = logger;
    }

    public List<FifaAddictPlayerDto> ParsePlayerList(string html)
    {
        var nuxtJson = ExtractNuxtStateAsJson(html);
        if (string.IsNullOrEmpty(nuxtJson))
        {
            return new List<FifaAddictPlayerDto>();
        }

        try
        {
            using var doc = JsonDocument.Parse(nuxtJson);
            var root = doc.RootElement;
            
            if (root.TryGetProperty("data", out var dataArr) && dataArr.GetArrayLength() > 0)
            {
                var firstData = dataArr[0];
                if (firstData.TryGetProperty("items", out var items))
                {
                    var options = new JsonSerializerOptions { 
                        NumberHandling = System.Text.Json.Serialization.JsonNumberHandling.AllowReadingFromString,
                        PropertyNameCaseInsensitive = true
                    };
                    options.Converters.Add(new FlexibleStringConverter());
                    var result = JsonSerializer.Deserialize<List<FifaAddictPlayerDto>>(items.GetRawText(), options);
                    return result ?? new List<FifaAddictPlayerDto>();
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to parse Nuxt JSON state for player list");
        }

        return new List<FifaAddictPlayerDto>();
    }

    public FifaAddictPlayerDto? ParsePlayerDetail(string html)
    {
        var nuxtJson = ExtractNuxtStateAsJson(html);
        if (string.IsNullOrEmpty(nuxtJson))
        {
            return null;
        }

        try
        {
            using var doc = JsonDocument.Parse(nuxtJson);
            var root = doc.RootElement;
            
            if (root.TryGetProperty("data", out var dataArr) && dataArr.GetArrayLength() > 0)
            {
                var firstData = dataArr[0];
                if (firstData.TryGetProperty("foPlayerSSRdb", out var foPlayerSSRdb))
                {
                    var options = new JsonSerializerOptions { 
                        NumberHandling = System.Text.Json.Serialization.JsonNumberHandling.AllowReadingFromString,
                        PropertyNameCaseInsensitive = true
                    };
                    options.Converters.Add(new FlexibleStringConverter());
                    return JsonSerializer.Deserialize<FifaAddictPlayerDto>(foPlayerSSRdb.GetRawText(), options);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to parse Nuxt JSON state for player detail");
        }

        return null;
    }

    private string ExtractNuxtStateAsJson(string html)
    {
        var match = Regex.Match(html, @"window\.__NUXT__=(.+?);[\s]*</script>", RegexOptions.Singleline);
        if (!match.Success)
        {
            _logger.LogWarning("Could not find window.__NUXT__ in the HTML response");
            return string.Empty;
        }

        var jsCode = match.Value.Replace("</script>", "");
        
        try
        {
            var engine = new Engine();
            engine.Execute("var window = {};");
            engine.Execute(jsCode);
            var json = engine.Evaluate("JSON.stringify(window.__NUXT__)").AsString();
            return json;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to execute Nuxt JS payload via Jint");
            return string.Empty;
        }
    }
}
