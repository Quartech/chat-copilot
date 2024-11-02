// Copyright (c) Microsoft. All rights reserved.

using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Azure.AI.Vision.ImageAnalysis;
using Microsoft.KernelMemory.DataFormats;

namespace CopilotChat.Shared.Ocr.AzureVision;

/// <summary>
/// Wrapper for the TesseractEngine within the Tesseract OCR library.
/// </summary>
public class AzureVisionOcrEngine : IOcrEngine
{
    private readonly ImageAnalysisClient _engine;
    private readonly List<string> _features;
    /// <summary>
    /// Creates a new instance of the TesseractEngineWrapper passing in a valid TesseractEngine.
    /// </summary>
    public AzureVisionOcrEngine(AzureVisionOptions azureVisionOptions)
    {
        if (string.IsNullOrEmpty(azureVisionOptions.Endpoint) || string.IsNullOrEmpty(azureVisionOptions.Key))
        {
            throw new ArgumentNullException($"Missing configuration when constructing {nameof(AzureVisionOcrEngine)}");
        }
        this._engine = new ImageAnalysisClient(new System.Uri(azureVisionOptions.Endpoint), new Azure.AzureKeyCredential(azureVisionOptions.Key));
        this._features = azureVisionOptions.Features.ToList();
    }

    ///<inheritdoc/>
    public async Task<string> ExtractTextFromImageAsync(Stream imageContent, CancellationToken cancellationToken = default)
    {
        await using (var imgStream = new MemoryStream())
        {
            await imageContent.CopyToAsync(imgStream);
            imgStream.Position = 0;

            var img = imgStream.ToArray();

            // LINQ Aggregate is roughly equivalent to JS Reduce. 
            // This will iterate over the strings present in the Features defined by the appsettings and
            // try to look up each in the VisualFeatures enum. Performing bitwise OR on these allows us to select
            // multiple features for the AzureVision engine to use together.
            var options = this._features.Aggregate(VisualFeatures.None, (acc, next) =>
            {
                if (Enum.TryParse<VisualFeatures>(next, out VisualFeatures enumResult))
                {
                    return acc = acc | enumResult;
                }
                else
                {
                    return acc;
                }
            });

            var result = await this._engine.AnalyzeAsync(new System.BinaryData(img), options);
            var sb = new StringBuilder();
            if (result.Value.DenseCaptions?.Values.Count > 0)
            {
                var firstCaption = result.Value.DenseCaptions.Values.First();
                sb.AppendLine($"The summary of this image's content is the following: {firstCaption.Text}");
                sb.AppendLine($"These details are present in the image. If they are also present in the summary, do not describe them: ");
                foreach (var caption in result.Value.DenseCaptions.Values.Skip(1))
                {
                    sb.AppendLine(caption.Text);
                }
            }
            if (result.Value.Caption != null)
            {
                sb.AppendLine($"The summary of this image's content is the following: {result.Value.Caption.Text}");
            }
            if (result.Value.Read?.Blocks.Count > 0)
            {
                sb.AppendLine($"The following text elements are included in the image: ");
                foreach (var block in result.Value.Read.Blocks)
                {
                    foreach (var line in block.Lines)
                    {
                        sb.AppendLine($"{line.Text}");
                    }

                }
            }

            return sb.ToString();
        }
    }
}
