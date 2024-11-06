using System.Collections.Generic;
using System.Globalization;
using System.IO;

namespace CopilotChat.WebApi.Utilities;

public static class CitationUtils
{
    public static string GetContentType(string link)
    {
        string fileExtension = Path.GetExtension(link).TrimStart('.').ToLower(CultureInfo.CurrentCulture);
        return fileExtension switch
        {
            "pdf" => "application/pdf", // PDF files
            "doc" => "application/msword", // Microsoft Word documents
            "docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // Microsoft Word (OpenXML)
            "jpg" => "image/jpeg", // JPEG images
            "jpeg" => "image/jpeg", // JPEG images
            "png" => "image/png", // PNG images
            "gif" => "image/gif", // GIF images
            "csv" => "text/csv", // CSV files
            _ =>
                "application/octet-stream" // Default content type for unknown extensions
            ,
        };
    }

    public static  void UpdateMapCount(ref Dictionary<string, int> map, string key)
    {
        if (map.TryGetValue(key, out int count))
        {
            map[key] = count + 1;
        }
        else
        {
            map[key] = 1;
        }
    }

}
