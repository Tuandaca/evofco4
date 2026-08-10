using System.Threading;
using System.Threading.Tasks;
using FCUpgrade.Contracts.Common;
using FCUpgrade.Contracts.DTOs;
using FCUpgrade.Contracts.Requests;

namespace FCUpgrade.Application.Services;

public interface ISeasonService
{
    Task<PaginatedResponse<SeasonListItemDto>> GetSeasonsAsync(GetSeasonsRequest request, CancellationToken cancellationToken = default);
    Task<SeasonDetailDto?> GetSeasonByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<SeasonDetailDto?> GetSeasonByCodeAsync(string code, CancellationToken cancellationToken = default);
}
