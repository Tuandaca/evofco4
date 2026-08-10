using System.Threading;
using System.Threading.Tasks;
using FCUpgrade.Contracts.Common;
using FCUpgrade.Contracts.DTOs;
using FCUpgrade.Contracts.Requests;

namespace FCUpgrade.Application.Services;

public interface IPlayerService
{
    Task<PaginatedResponse<PlayerListItemDto>> GetPlayersAsync(GetPlayersRequest request, CancellationToken cancellationToken = default);
    Task<PlayerDetailDto?> GetPlayerByIdAsync(int id, CancellationToken cancellationToken = default);
    
    // PlayerSeason related queries
    Task<PaginatedResponse<PlayerSeasonListItemDto>> GetPlayerSeasonsAsync(GetPlayersRequest request, CancellationToken cancellationToken = default);
    Task<PaginatedResponse<PlayerSeasonListItemDto>> GetPlayerSeasonsByPlayerIdAsync(int playerId, GetPlayersRequest request, CancellationToken cancellationToken = default);
    Task<PlayerSeasonDetailDto?> GetPlayerSeasonByIdAsync(int id, CancellationToken cancellationToken = default);
}
