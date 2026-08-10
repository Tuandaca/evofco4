using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FCUpgrade.Contracts.DTOs;

namespace FCUpgrade.Application.Services;

public interface IFilterService
{
    Task<IEnumerable<FilterOptionDto>> GetPositionsAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<FilterOptionDto>> GetTeamsAsync(string? search = null, CancellationToken cancellationToken = default);
    Task<IEnumerable<FilterOptionDto>> GetNationsAsync(string? search = null, CancellationToken cancellationToken = default);
    Task<IEnumerable<FilterOptionDto>> GetLeaguesAsync(string? search = null, CancellationToken cancellationToken = default);
}
