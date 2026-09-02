# This stage is used when running from VS in fast mode (Default for Debug configuration)
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
USER $APP_UID
WORKDIR /app
EXPOSE 8080


# This stage is used to build the service project
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["src/FCUpgrade.API/FCUpgrade.API.csproj", "src/FCUpgrade.API/"]
COPY ["src/FCUpgrade.Application/FCUpgrade.Application.csproj", "src/FCUpgrade.Application/"]
COPY ["src/FCUpgrade.Contracts/FCUpgrade.Contracts.csproj", "src/FCUpgrade.Contracts/"]
COPY ["src/FCUpgrade.Domain/FCUpgrade.Domain.csproj", "src/FCUpgrade.Domain/"]
COPY ["src/FCUpgrade.Infrastructure/FCUpgrade.Infrastructure.csproj", "src/FCUpgrade.Infrastructure/"]
RUN dotnet restore "./src/FCUpgrade.API/FCUpgrade.API.csproj"
COPY . .
WORKDIR "/src/src/FCUpgrade.API"
RUN dotnet build "./FCUpgrade.API.csproj" -c $BUILD_CONFIGURATION -o /app/build

# This stage is used to publish the service project to be copied to the final stage
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./FCUpgrade.API.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# This stage is used in production or when running from VS in regular mode (Default when not using the Debug configuration)
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "FCUpgrade.API.dll"]
