// Copyright (c) Quartech. All rights reserved.

using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using Azure.Storage.Blobs;
using CopilotChat.WebApi.Models.Request;
using CopilotChat.WebApi.Models.Storage;
using CopilotChat.WebApi.Plugins.Chat.Ext;
using CopilotChat.WebApi.Storage;
using CopilotChat.WebApi.Utilities;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;

namespace CopilotChat.WebApi.Services;

/// <summary>
/// The implementation class for specialization service.
/// </summary>
public class QSpecializationService : IQSpecializationService
{
    private SpecializationRepository _specializationSourceRepository;

    private QAzureOpenAIChatOptions _qAzureOpenAIChatOptions;

    private QBlobStorage _qBlobStorage;

    public QSpecializationService(
        SpecializationRepository specializationSourceRepository,
        QAzureOpenAIChatOptions qAzureOpenAIChatOptions
    )
    {
        this._specializationSourceRepository = specializationSourceRepository;
        this._qAzureOpenAIChatOptions = qAzureOpenAIChatOptions;

        BlobServiceClient blobServiceClient = new(qAzureOpenAIChatOptions.BlobStorage.ConnectionString);

        BlobContainerClient blobContainerClient = blobServiceClient.GetBlobContainerClient(
            qAzureOpenAIChatOptions.BlobStorage.SpecializationContainerName
        );

        this._qBlobStorage = new QBlobStorage(blobContainerClient);
    }

    /// <summary>
    /// Retrieve all specializations.
    /// </summary>
    /// <returns>The task result contains all specializations</returns>
    public Task<IEnumerable<Specialization>> GetAllSpecializations()
    {
        return this._specializationSourceRepository.GetAllSpecializationsAsync();
    }

    /// <summary>
    /// Retrieve a specialization based on key.
    /// </summary>
    /// <param name="key">Specialization key</param>
    /// <returns>Returns the specialization source</returns>
    public Task<Specialization> GetSpecializationAsync(string id)
    {
        return this._specializationSourceRepository.GetSpecializationAsync(id);
    }

    /// <summary>
    /// Creates new specialization.
    /// </summary>
    /// <param name="qSpecializationMutate">Specialization mutate payload</param>
    /// <returns>The task result contains the specialization source</returns>
    public async Task<Specialization> SaveSpecialization(QSpecializationMutate qSpecializationMutate)
    {
        // Add the image to the blob storage or use the default image
        var imageFilePath =
            qSpecializationMutate.ImageFile == null
                ? ResourceUtils.GetImageAsDataUri(this._qAzureOpenAIChatOptions.DefaultSpecializationImage)
                : await this._qBlobStorage.AddBlobAsync(qSpecializationMutate.ImageFile);

        // Add the icon to the blob storage or use the default icon
        var iconFilePath =
            qSpecializationMutate.IconFile == null
                ? ResourceUtils.GetImageAsDataUri(this._qAzureOpenAIChatOptions.DefaultSpecializationIcon)
                : await this._qBlobStorage.AddBlobAsync(qSpecializationMutate.IconFile);

        var deserializedSuggestions = JsonConvert.DeserializeObject<List<string>>(qSpecializationMutate.Suggestions);

        Specialization specializationSource =
            new(
                Label: qSpecializationMutate.Label,
                Name: qSpecializationMutate.Name,
                Description: qSpecializationMutate.Description,
                RoleInformation: qSpecializationMutate.RoleInformation,
                InitialChatMessage: qSpecializationMutate.InitialChatMessage,
                Deployment: qSpecializationMutate.Deployment,
                IndexId: qSpecializationMutate.IndexId,
                IsDefault: qSpecializationMutate.IsDefault,
                RestrictResultScope: qSpecializationMutate.IndexId != null
                    ? qSpecializationMutate.RestrictResultScope
                    : null,
                Strictness: qSpecializationMutate.IndexId != null ? qSpecializationMutate.Strictness : null,
                DocumentCount: qSpecializationMutate.IndexId != null ? qSpecializationMutate.DocumentCount : null,
                PastMessagesIncludedCount: qSpecializationMutate.IndexId != null
                    ? qSpecializationMutate.PastMessagesIncludedCount
                    : null,
                MaxResponseTokenLimit: qSpecializationMutate.IndexId != null
                    ? qSpecializationMutate.MaxResponseTokenLimit
                    : null,
                ImageFilePath: imageFilePath,
                IconFilePath: iconFilePath,
                GroupMemberships: qSpecializationMutate.GroupMemberships.Split(','),
                Order: qSpecializationMutate.Order,
                Suggestions: deserializedSuggestions != null ? deserializedSuggestions : new List<string>(),
                CanGenImages: qSpecializationMutate.CanGenImages
            );

        await this._specializationSourceRepository.CreateAsync(specializationSource);

        return specializationSource;
    }

    /// <summary>
    /// Updates an existing specialization.
    /// </summary>
    /// <param name="specializationId">Identifier of the specialization to update.</param>
    /// <param name="qSpecializationMutate">Contains updated details for the specialization.</param>
    /// <returns>The updated or newly created specialization.</returns>
    /// <exception cref="ArgumentException">
    /// Thrown if the specialization does not exist and is not of type General.
    /// </exception>
    public async Task<Specialization?> UpdateSpecialization(
        Guid specializationId,
        QSpecializationMutate qSpecializationMutate
    )
    {
        Specialization? specializationToUpdate = await this._specializationSourceRepository.FindByIdAsync(
            specializationId.ToString()
        );

        if (specializationToUpdate == null)
        {
            return null;
        }

        // Update the image file and set the file path
        specializationToUpdate.ImageFilePath = await this.UpsertSpecializationBlobAsync(
            qSpecializationMutate.ImageFile,
            specializationToUpdate.ImageFilePath,
            Convert.ToBoolean(qSpecializationMutate.DeleteImageFile, CultureInfo.InvariantCulture),
            ResourceUtils.GetImageAsDataUri(this._qAzureOpenAIChatOptions.DefaultSpecializationImage)
        );

        // Update the icon file and set the file path
        specializationToUpdate.IconFilePath = await this.UpsertSpecializationBlobAsync(
            qSpecializationMutate.IconFile,
            specializationToUpdate.IconFilePath,
            Convert.ToBoolean(qSpecializationMutate.DeleteIconFile, CultureInfo.InvariantCulture),
            ResourceUtils.GetImageAsDataUri(this._qAzureOpenAIChatOptions.DefaultSpecializationIcon)
        );

        specializationToUpdate.IsActive = Convert.ToBoolean(
            qSpecializationMutate.isActive,
            CultureInfo.InvariantCulture
        );

        var deserializedSuggestions = JsonConvert.DeserializeObject<List<string>>(qSpecializationMutate.Suggestions);

        specializationToUpdate.Name = qSpecializationMutate.Name ?? specializationToUpdate.Name;

        specializationToUpdate.Label = qSpecializationMutate.Label ?? specializationToUpdate.Label;

        specializationToUpdate.Description = qSpecializationMutate.Description ?? specializationToUpdate.Description;

        specializationToUpdate.RoleInformation =
            qSpecializationMutate.RoleInformation ?? specializationToUpdate.RoleInformation;

        specializationToUpdate.InitialChatMessage =
            qSpecializationMutate.InitialChatMessage ?? specializationToUpdate.InitialChatMessage;

        specializationToUpdate.Deployment = qSpecializationMutate.Deployment ?? specializationToUpdate.Deployment;

        if (qSpecializationMutate.IsIndexIdSet)
        {
            // IndexName was explicitly set
            specializationToUpdate.IndexId = qSpecializationMutate.IndexId;

            if (specializationToUpdate.IndexId == null)
            {
                // If IndexName is explicitly set to null, set related properties to null
                specializationToUpdate.RestrictResultScope = null;
                specializationToUpdate.Strictness = null;
                specializationToUpdate.DocumentCount = null;
                specializationToUpdate.PastMessagesIncludedCount = null;
                specializationToUpdate.MaxResponseTokenLimit = null;
            }
            else
            {
                // If IndexName is not null, update related properties
                specializationToUpdate.RestrictResultScope =
                    qSpecializationMutate.RestrictResultScope ?? specializationToUpdate.RestrictResultScope;
                specializationToUpdate.Strictness =
                    qSpecializationMutate.Strictness ?? specializationToUpdate.Strictness;
                specializationToUpdate.DocumentCount =
                    qSpecializationMutate.DocumentCount ?? specializationToUpdate.DocumentCount;
                specializationToUpdate.PastMessagesIncludedCount =
                    qSpecializationMutate.PastMessagesIncludedCount ?? specializationToUpdate.PastMessagesIncludedCount;
                specializationToUpdate.MaxResponseTokenLimit =
                    qSpecializationMutate.MaxResponseTokenLimit ?? specializationToUpdate.MaxResponseTokenLimit;
            }
        }
        else
        {
            // IndexName was not specified, retain existing values
            specializationToUpdate.RestrictResultScope = specializationToUpdate.RestrictResultScope;
            specializationToUpdate.Strictness = specializationToUpdate.Strictness;
            specializationToUpdate.DocumentCount = specializationToUpdate.DocumentCount;
            specializationToUpdate.PastMessagesIncludedCount = specializationToUpdate.PastMessagesIncludedCount;
            specializationToUpdate.MaxResponseTokenLimit = specializationToUpdate.MaxResponseTokenLimit;
        }
        specializationToUpdate.IsDefault = qSpecializationMutate.IsDefault ?? specializationToUpdate.IsDefault;

        // Group memberships (mutate payload) are a comma separated list of UUIDs.
        specializationToUpdate.GroupMemberships = !string.IsNullOrEmpty(qSpecializationMutate.GroupMemberships)
            ? qSpecializationMutate.GroupMemberships.Split(',')
            : specializationToUpdate.GroupMemberships;

        specializationToUpdate.Suggestions =
            deserializedSuggestions != null ? deserializedSuggestions : specializationToUpdate.Suggestions;
        specializationToUpdate.CanGenImages = qSpecializationMutate.CanGenImages;

        await this._specializationSourceRepository.UpsertAsync(specializationToUpdate);

        return specializationToUpdate;
    }

    /// <summary>
    /// Deletes the specialization.
    /// </summary>
    /// <param name="specializationId">Unique identifier of the specialization</param>
    /// <returns>The task result contains the delete state</returns>
    public async Task<bool> DeleteSpecialization(Guid specializationId)
    {
        Specialization? specializationToDelete = await this._specializationSourceRepository.FindByIdAsync(
            specializationId.ToString()
        );

        await this._specializationSourceRepository.DeleteAsync(specializationToDelete);

        // Attempt to create URIs for image and icon
        if (
            Uri.TryCreate(specializationToDelete.ImageFilePath, UriKind.Absolute, out var imageFileUri)
            && Uri.TryCreate(specializationToDelete.IconFilePath, UriKind.Absolute, out var iconFileUri)
        )
        {
            // Delete image file from blob storage if it exists
            if (await this._qBlobStorage.BlobExistsAsync(imageFileUri))
            {
                await this._qBlobStorage.DeleteBlobByURIAsync(imageFileUri);
            }

            // Delete icon file from blob storage if it exists
            if (await this._qBlobStorage.BlobExistsAsync(iconFileUri))
            {
                await this._qBlobStorage.DeleteBlobByURIAsync(iconFileUri);
            }
        }
        return true;
    }

    /// <summary>
    /// Reorders specializations based on the provided ordering information. This method updates the order of existing specializations
    /// in the database asynchronously, utilizing concurrent task execution for efficiency.
    /// </summary>
    /// <param name="specializationOrder">A QSpecializationOrder object containing the new order for specializations, where each key is a specialization ID and each value is the intended order.</param>
    /// <returns>A Task representing the asynchronous operation of updating all relevant specializations.</returns>
    /// <exception cref="ArgumentNullException">Thrown when the <paramref name="specializationOrder"/> is null.</exception>
    public async Task OrderSpecializations(OrderMapGuidToInt specializationOrder)
    {
        if (specializationOrder == null)
        {
            throw new ArgumentNullException(nameof(specializationOrder), "QSpecializationOrder must be provided.");
        }

        var specializations = (await this.GetAllSpecializations()).ToList();

        var upsertTasks = new List<Task>();

        foreach (var order in specializationOrder.Ordering)
        {
            string specId = order.Key;
            int newOrder = order.Value;

            var specialization = specializations.FirstOrDefault(s => s.Id == specId);
            if (specialization != null)
            {
                // Update the order
                specialization.Order = newOrder;
                upsertTasks.Add(this._specializationSourceRepository.UpsertAsync(specialization));
            }
        }
        await Task.WhenAll(upsertTasks);
    }

    /// <summary>
    /// Upsert the specialization blob and return filepath or blob storage URI.
    /// </summary>
    /// <param name="file">File to store in blob storage</param>
    /// <param name="fileUriString">File path URI</param>
    /// <param name="delete">Flag to delete the file from the blob storage</param>
    /// <param name="filePathDefault">File path default value</param>
    /// <returns>FilePath or Blob Storage URI</returns>
    private async Task<string> UpsertSpecializationBlobAsync(
        IFormFile? file,
        string fileUriString,
        bool delete = false,
        string filePathDefault = ""
    )
    {
        bool uriIsValid = Uri.TryCreate(fileUriString, UriKind.Absolute, out Uri? fileUri);

        // If the URI is not valid, return the default path immediately
        if (!uriIsValid || fileUri == null)
        {
            return filePathDefault;
        }

        var blobExists = await this._qBlobStorage.BlobExistsAsync(fileUri);

        // 1. File provided and a default file path is stored in the DB
        if (file != null && !blobExists)
        {
            return await this._qBlobStorage.AddBlobAsync(file);
        }

        // 2. File provided and a Blob Storage URI is stored in the DB
        if (file != null && blobExists)
        {
            await this._qBlobStorage.DeleteBlobByURIAsync(fileUri);
            return await this._qBlobStorage.AddBlobAsync(file);
        }

        // 3. File not provided and a default file path is stored in the DB and delete flag is set
        if (file == null && blobExists && delete)
        {
            await this._qBlobStorage.DeleteBlobByURIAsync(fileUri);

            return filePathDefault;
        }

        return fileUriString;
    }
}
