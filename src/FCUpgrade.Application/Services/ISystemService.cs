using System.Threading;
using System.Threading.Tasks;

namespace FCUpgrade.Application.Services;

public interface ISystemService
{
    Task<object> GetDataStatusAsync(CancellationToken cancellationToken = default);
}
