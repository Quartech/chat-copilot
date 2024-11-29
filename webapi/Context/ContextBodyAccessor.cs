using System;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace CopilotChat.WebApi.Context;

public class ContextBodyAccessor(IHttpContextAccessor contextAccessor) : IContextBodyAccessor
{
    public async Task<T?> ReadBody<T>()
        where T : class
    {
        var context = contextAccessor.HttpContext;

        if (context == null)
        {
            return null;
        }

        var request = context.Request;

        if (request.ContentLength == 0 || request.ContentLength == null)
        {
            return null;
        }

        request.EnableBuffering();

        try
        {
            var buffer = new byte[Convert.ToInt32(request.ContentLength)];
            await request.Body.ReadExactlyAsync(buffer, 0, buffer.Length);

            var bodyText = Encoding.UTF8.GetString(buffer).Replace("\0", string.Empty, StringComparison.Ordinal);

            var options = new JsonSerializerOptions() { PropertyNameCaseInsensitive = true };

            return JsonSerializer.Deserialize<T>(bodyText, options);
        }
        finally
        {
            request.Body.Position = 0;
        }
    }
}
