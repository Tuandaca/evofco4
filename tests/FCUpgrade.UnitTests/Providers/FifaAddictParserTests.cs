using System.IO;
using FCUpgrade.Infrastructure.Providers.FIFAAddict;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace FCUpgrade.UnitTests.Providers;

public class FifaAddictParserTests
{
    private readonly FifaAddictParser _parser;

    public FifaAddictParserTests()
    {
        var loggerMock = new Mock<ILogger<FifaAddictParser>>();
        _parser = new FifaAddictParser(loggerMock.Object);
    }

    [Fact]
    public void ParsePlayerList_WithValidNuxtState_ReturnsParsedList()
    {
        // Arrange
        var fixturePath = Path.Combine(Directory.GetCurrentDirectory(), "../../../../../tests/fixtures/fifaaddict/sample_page.html");
        // Fallback for different execution contexts
        if (!File.Exists(fixturePath))
        {
            fixturePath = Path.Combine(Directory.GetCurrentDirectory(), "fixtures/fifaaddict/sample_page.html");
        }
        
        var html = @"<!doctype html> 
<html>
<body>
<script>
window.__NUXT__=(function(a,b,c){return {layout:""default"",data:[{items:[{uid:a,name:b,pricekr:c}]}]}}(""awoqywkd"", ""D. Maradona"", 7530000000000));
</script>
</body>
</html>"; // Using direct string to avoid IO path issues in test runners

        // Act
        var players = _parser.ParsePlayerList(html);

        // Assert
        Assert.NotNull(players);
        Assert.Single(players);
        Assert.Equal("awoqywkd", players[0].Uid);
        Assert.Equal("D. Maradona", players[0].Name);
        // PriceKr is a string in FifaAddictModels due to FlexibleStringConverter handling
        // (FIFAaddict API returns pricekr inconsistently as number or string)
        Assert.Equal("7530000000000", players[0].PriceKr);
    }
}
