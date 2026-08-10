namespace FCUpgrade.Contracts.Common;

public class ApiErrorResponse
{
    public ErrorDetail Error { get; set; } = new ErrorDetail();

    public class ErrorDetail
    {
        public string Code { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
    }
}
