using System;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Polly;
using Polly.Retry;

namespace FCUpgrade.Infrastructure.Providers.FIFAAddict;

public class FifaAddictClient
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<FifaAddictClient> _logger;
    private readonly AsyncRetryPolicy<HttpResponseMessage> _retryPolicy;

    public FifaAddictClient(HttpClient httpClient, ILogger<FifaAddictClient> logger)
    {
        _httpClient = httpClient;
        _logger = logger;

        _httpClient.BaseAddress = new Uri("https://en.fifaaddict.com/");
        _httpClient.Timeout = TimeSpan.FromSeconds(15);
        
        // Randomize User-Agent to avoid simple blocks
        _httpClient.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
        _httpClient.DefaultRequestHeaders.Add("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8");
        _httpClient.DefaultRequestHeaders.Add("Accept-Language", "en-US,en;q=0.5");

        _retryPolicy = Policy
            .HandleResult<HttpResponseMessage>(r => !r.IsSuccessStatusCode)
            .Or<HttpRequestException>()
            .Or<TaskCanceledException>()
            .WaitAndRetryAsync(3, retryAttempt => 
                TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)), 
                onRetry: (outcome, timespan, retryCount, context) =>
                {
                    _logger.LogWarning("Delaying for {delay}ms, then making retry {retry}. Reason: {reason}", timespan.TotalMilliseconds, retryCount, outcome.Exception?.Message ?? outcome.Result?.StatusCode.ToString());
                });
    }

    public async Task<string> GetPageHtmlAsync(string url, CancellationToken cancellationToken = default)
    {
        var response = await _retryPolicy.ExecuteAsync(async () =>
        {
            var res = await _httpClient.GetAsync(url, cancellationToken);
            
            if ((int)res.StatusCode == 429)
            {
                _logger.LogWarning("Rate limited (429) by FIFAAddict");
                // Respect Retry-After if provided
                if (res.Headers.RetryAfter != null && res.Headers.RetryAfter.Delta.HasValue)
                {
                    await Task.Delay(res.Headers.RetryAfter.Delta.Value, cancellationToken);
                }
                else
                {
                    await Task.Delay(TimeSpan.FromSeconds(5), cancellationToken);
                }
            }
            
            return res;
        });

        response.EnsureSuccessStatusCode();
        return await response.Content.ReadAsStringAsync(cancellationToken);
    }
}
