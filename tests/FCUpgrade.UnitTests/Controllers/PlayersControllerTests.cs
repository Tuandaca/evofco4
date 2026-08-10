using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FCUpgrade.API.Controllers.v1;
using FCUpgrade.Application.Services;
using FCUpgrade.Contracts.Common;
using FCUpgrade.Contracts.DTOs;
using FCUpgrade.Contracts.Requests;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace FCUpgrade.UnitTests.Controllers;

public class PlayersControllerTests
{
    private readonly Mock<IPlayerService> _mockPlayerService;
    private readonly PlayersController _controller;

    public PlayersControllerTests()
    {
        _mockPlayerService = new Mock<IPlayerService>();
        _controller = new PlayersController(_mockPlayerService.Object);
    }

    [Fact]
    public async Task GetPlayers_ReturnsOkResult_WithPaginatedData()
    {
        // Arrange
        var request = new GetPlayersRequest { Page = 1, PageSize = 10, Search = "Messi" };
        var expectedResponse = new PaginatedResponse<PlayerListItemDto>
        {
            Items = new List<PlayerListItemDto>
            {
                new PlayerListItemDto { Id = 1, Name = "Lionel Messi" }
            },
            Page = 1,
            PageSize = 10,
            TotalItems = 1,
            TotalPages = 1
        };

        _mockPlayerService
            .Setup(s => s.GetPlayersAsync(request, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedResponse);

        // Act
        var result = await _controller.GetPlayers(request, CancellationToken.None);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var apiResponse = Assert.IsType<ApiResponse<object>>(okResult.Value);
        Assert.Equal(expectedResponse, apiResponse.Data);
    }

    [Fact]
    public async Task GetPlayer_ReturnsOkResult_WhenPlayerExists()
    {
        // Arrange
        var playerId = 1;
        var expectedPlayer = new PlayerDetailDto { Id = playerId, Name = "Lionel Messi" };

        _mockPlayerService
            .Setup(s => s.GetPlayerByIdAsync(playerId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedPlayer);

        // Act
        var result = await _controller.GetPlayer(playerId, CancellationToken.None);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var apiResponse = Assert.IsType<ApiResponse<object>>(okResult.Value);
        Assert.Equal(expectedPlayer, apiResponse.Data);
    }

    [Fact]
    public async Task GetPlayer_ReturnsNotFound_WhenPlayerDoesNotExist()
    {
        // Arrange
        var playerId = 99;
        _mockPlayerService
            .Setup(s => s.GetPlayerByIdAsync(playerId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((PlayerDetailDto?)null);

        // Act
        var result = await _controller.GetPlayer(playerId, CancellationToken.None);

        // Assert
        var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
        var apiResponse = Assert.IsType<ApiErrorResponse>(notFoundResult.Value);
        Assert.Equal("NOT_FOUND", apiResponse.Error.Code);
    }
}
