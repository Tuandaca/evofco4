using FCUpgrade.IntegrationTests.Infrastructure;
using Xunit;

namespace FCUpgrade.IntegrationTests.Infrastructure;

/// <summary>
/// Marks a test collection that shares a single PostgresIntegrationFixture instance.
/// This prevents multiple fixture creations (= multiple DB setups) across test classes.
/// </summary>
[CollectionDefinition("PostgresIntegration")]
public class PostgresIntegrationCollection : ICollectionFixture<PostgresIntegrationFixture>
{
    // No body needed — this class just carries the CollectionDefinition attribute.
}
