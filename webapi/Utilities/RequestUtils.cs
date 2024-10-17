using System;

namespace CopilotChat.WebApi.Utilities;

/// <summary>
/// Utility class for handling request-related operations.
/// </summary>
internal static class RequestUtils
{
    /// <summary>
    /// Remove Environment.NewLine from parameter values.
    /// </summary>
    /// <param name="parameterValue">String request parameter.</param>
    /// <returns>Parameter string with all Environment.NewLine characters removed.</returns>
    public static string GetSanitizedParameter(string parameterValue)
    {
        return parameterValue.Replace(Environment.NewLine, string.Empty, StringComparison.Ordinal);
    }
}
