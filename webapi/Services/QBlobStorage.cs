using System;
using System.Threading.Tasks;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Microsoft.AspNetCore.Http;

namespace CopilotChat.WebApi.Services;

/// <summary>
/// The implementation class for Blob Storage.
/// </summary>
public class QBlobStorage
{
    // BlobServiceClient which is used to create a container client
    private readonly BlobServiceClient _blobServiceClient;

    // BlobContainerClient which is used to interact with the container's blobs
    private BlobContainerClient _blobContainerClient;

    public QBlobStorage(string connectionString, string containerName)
    {
        BlobServiceClient blobServiceClient = new BlobServiceClient(connectionString);
        BlobContainerClient blobContainerClient = blobServiceClient.GetBlobContainerClient(
            containerName
        );

        // Create a new container only if it does not exist
        blobContainerClient.CreateIfNotExists(PublicAccessType.Blob);

        this._blobServiceClient = blobServiceClient;
        this._blobContainerClient = blobContainerClient;
    }

    // TODO: Add validation for the blob file. ie: size, type, etc.

    /// <summary>
    /// Add a blob to the storage container
    /// </summary>
    /// <param name="blob">Blob file</param>
    /// <returns>Blob Storage URI identifier</returns>
    public async Task<string> AddBlobAsync(IFormFile blob)
    {
        var blobClient = this._blobContainerClient.GetBlobClient(
            blob.FileName.Insert(blob.FileName.LastIndexOf('.'), "$" + Guid.NewGuid().ToString())
        );

        await blobClient.UploadAsync(blob.OpenReadStream(), true);
        return blobClient.Uri.ToString();
    }

    /// <summary>
    /// Remove a blob from the storage container
    /// </summary>
    /// <returns>Deleted blob URI</returns>
    public async Task DeleteBlobAsync(string uri)
    {
        BlobUriBuilder blobUriBuilder = new BlobUriBuilder(new Uri(uri));

        var blobName = blobUriBuilder.BlobName;

        var blobClient = this._blobContainerClient.GetBlobClient(blobUriBuilder.BlobName);

        await blobClient.DeleteIfExistsAsync();
    }
}
