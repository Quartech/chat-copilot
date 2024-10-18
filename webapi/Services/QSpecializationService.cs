// Copyright (c) Quartech. All rights reserved.

using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Azure.Storage.Blobs;
using CopilotChat.WebApi.Models.Request;
using CopilotChat.WebApi.Models.Storage;
using CopilotChat.WebApi.Plugins.Chat.Ext;
using CopilotChat.WebApi.Storage;
using CopilotChat.WebApi.Utilities;
using Microsoft.AspNetCore.Http;

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

        Specialization specializationSource =
            new(
                qSpecializationMutate.Label,
                qSpecializationMutate.Name,
                qSpecializationMutate.Description,
                qSpecializationMutate.RoleInformation,
                qSpecializationMutate.InitialChatMessage,
                qSpecializationMutate.IndexName,
                qSpecializationMutate.Deployment,
                qSpecializationMutate.RestrictResultScope,
                qSpecializationMutate.Strictness,
                qSpecializationMutate.DocumentCount,
                imageFilePath,
                iconFilePath,
                qSpecializationMutate.GroupMemberships.Split(','),
                qSpecializationMutate.Order
            );

        await this._specializationSourceRepository.CreateAsync(specializationSource);

        return specializationSource;
    }

    /// <summary>
    /// Updates the specialization.
    /// </summary>
    /// <param name="specializationId">Unique identifier of the specialization</param>
    /// <param name="qSpecializationMutate">Specialization mutate payload</param>
    /// <returns>The task result contains the specialization source</returns>
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
            // Handle the case where no Specialization was found
            return null;
        }

        // Update the image file and set the file path
        specializationToUpdate.ImageFilePath = await this.UpsertSpecializationBlobAsync(
            qSpecializationMutate.ImageFile,
            specializationToUpdate.ImageFilePath,
            Convert.ToBoolean(qSpecializationMutate.DeleteImageFile),
            ResourceUtils.GetImageAsDataUri(this._qAzureOpenAIChatOptions.DefaultSpecializationImage)
        );

        // Update the icon file and set the file path
        specializationToUpdate.IconFilePath = await this.UpsertSpecializationBlobAsync(
            qSpecializationMutate.IconFile,
            specializationToUpdate.IconFilePath,
            Convert.ToBoolean(qSpecializationMutate.DeleteIconFile),
            ResourceUtils.GetImageAsDataUri(this._qAzureOpenAIChatOptions.DefaultSpecializationIcon)
        );

        specializationToUpdate.IsActive = Convert.ToBoolean(qSpecializationMutate.isActive);
        specializationToUpdate.Name = !string.IsNullOrEmpty(qSpecializationMutate.Name)
            ? qSpecializationMutate.Name
            : specializationToUpdate.Name;
        specializationToUpdate.Label = !string.IsNullOrEmpty(qSpecializationMutate.Label)
            ? qSpecializationMutate.Label
            : specializationToUpdate.Label;
        specializationToUpdate.Description = !string.IsNullOrEmpty(qSpecializationMutate.Description)
            ? qSpecializationMutate.Description
            : specializationToUpdate.Description;
        specializationToUpdate.RoleInformation = !string.IsNullOrEmpty(qSpecializationMutate.RoleInformation)
            ? qSpecializationMutate.RoleInformation
            : specializationToUpdate.RoleInformation;
        specializationToUpdate.InitialChatMessage = !string.IsNullOrEmpty(qSpecializationMutate.InitialChatMessage)
            ? qSpecializationMutate.InitialChatMessage
            : specializationToUpdate.InitialChatMessage;
        specializationToUpdate.IndexName = qSpecializationMutate.IndexName ?? specializationToUpdate.IndexName;

        // Group memberships (mutate payload) are a comma separated list of UUIDs.
        specializationToUpdate.GroupMemberships = !string.IsNullOrEmpty(qSpecializationMutate.GroupMemberships)
            ? qSpecializationMutate.GroupMemberships.Split(',')
            : specializationToUpdate.GroupMemberships;

        specializationToUpdate.Deployment = qSpecializationMutate.Deployment ?? specializationToUpdate.Deployment;
        specializationToUpdate.RestrictResultScope =
            qSpecializationMutate.RestrictResultScope ?? specializationToUpdate.RestrictResultScope;
        specializationToUpdate.Strictness = qSpecializationMutate.Strictness ?? specializationToUpdate.Strictness;
        specializationToUpdate.DocumentCount =
            qSpecializationMutate.DocumentCount ?? specializationToUpdate.DocumentCount;

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
    /// Swaps the order of two specializations identified by their IDs. This method first retrieves
    /// both specializations, then updates their orders in an atomic manner. If either specialization
    /// is not found or if the input model is null, appropriate exceptions are thrown. This operation
    /// maintains all other properties of the specializations unchanged except for their order.
    /// </summary>
    /// <param name="swapOrderModel">The model containing the IDs of the specializations to swap and their new orders.</param>
    /// <returns>A Task representing the asynchronous operation of swapping the specialization orders.</returns>
    /// <exception cref="ArgumentNullException">Thrown when swapOrderModel is null.</exception>
    /// <exception cref="InvalidOperationException">Thrown when one or both specializations could not be found.</exception>
    public async Task SwapSpecializationOrder(QSpecializationSwapOrder swapOrderModel)
    {
        if (swapOrderModel == null)
        {
            throw new ArgumentNullException(nameof(swapOrderModel), "QSpecializationSwapOrder must be provided.");
        }

        var fromSpecTask = this._specializationSourceRepository.FindByIdAsync(swapOrderModel.FromId.ToString());
        var toSpecTask = this._specializationSourceRepository.FindByIdAsync(swapOrderModel.ToId.ToString());

        await Task.WhenAll(fromSpecTask, toSpecTask);

        var fromSpec = await fromSpecTask;
        var toSpec = await toSpecTask;

        if (fromSpec == null || toSpec == null)
        {
            throw new InvalidOperationException("One or both specializations were not found.");
        }

        // Swap the orders
        fromSpec.Order = swapOrderModel.ToOrder;
        toSpec.Order = swapOrderModel.FromOrder;

        await Task.WhenAll(
            this._specializationSourceRepository.UpsertAsync(fromSpec),
            this._specializationSourceRepository.UpsertAsync(toSpec)
        );
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
