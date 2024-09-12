// Copyright (c) Quartech. All rights reserved.

using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CopilotChat.WebApi.Models.Request;
using CopilotChat.WebApi.Models.Storage;
using CopilotChat.WebApi.Plugins.Chat.Ext;
using CopilotChat.WebApi.Storage;

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
        this._qBlobStorage = new QBlobStorage(
            qAzureOpenAIChatOptions.AzureConfig.BlobStorage.ConnectionString,
            qAzureOpenAIChatOptions.AzureConfig.BlobStorage.SpecializationContainerName
        );
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
    /// <param name="qSpecializationParameters">Specialization parameters</param>
    /// <returns>The task result contains the specialization source</returns>
    public async Task<Specialization> SaveSpecialization(
        QSpecializationMutate qSpecializationMutate
    )
    {
        // Add the image to the blob storage or use the default image
        var imageFilePath =
            qSpecializationMutate.ImageFile == null
                ? this._qAzureOpenAIChatOptions.DefaultSpecializationImage
                : await this._qBlobStorage.AddBlobAsync(qSpecializationMutate.ImageFile);

        // Add the icon to the blob storage or use the default icon
        var iconFilePath =
            qSpecializationMutate.IconFile == null
                ? this._qAzureOpenAIChatOptions.DefaultSpecializationIcon
                : await this._qBlobStorage.AddBlobAsync(qSpecializationMutate.IconFile);

        Specialization specializationSource =
            new(
                qSpecializationMutate.label,
                qSpecializationMutate.Name,
                qSpecializationMutate.Description,
                qSpecializationMutate.RoleInformation,
                qSpecializationMutate.IndexName,
                imageFilePath,
                iconFilePath,
                qSpecializationMutate.GroupMemberships.Split(',')
            );
        await this._specializationSourceRepository.CreateAsync(specializationSource);

        return specializationSource;
    }

    /// <summary>
    /// Updates the specialization.
    /// </summary>
    /// <param name="specializationId">Unique identifier of the specialization</param>
    /// <param name="qSpecializationParameters">Specialization parameters</param>
    /// <returns>The task result contains the specialization source</returns>
    public async Task<Specialization?> UpdateSpecialization(
        Guid specializationId,
        QSpecializationParameters qSpecializationParameters
    )
    {
        Specialization? specializationToUpdate =
            await this._specializationSourceRepository.FindByIdAsync(specializationId.ToString());

        if (specializationToUpdate != null)
        {
            specializationToUpdate!.IsActive = qSpecializationParameters.isActive;
            specializationToUpdate!.Name = !string.IsNullOrEmpty(qSpecializationParameters.Name)
                ? qSpecializationParameters.Name
                : specializationToUpdate!.Name;
            specializationToUpdate!.Description = !string.IsNullOrEmpty(
                qSpecializationParameters.Description
            )
                ? qSpecializationParameters.Description
                : specializationToUpdate!.Description;
            specializationToUpdate!.RoleInformation = !string.IsNullOrEmpty(
                qSpecializationParameters.RoleInformation
            )
                ? qSpecializationParameters.RoleInformation
                : specializationToUpdate!.RoleInformation;
            specializationToUpdate!.IndexName =
                qSpecializationParameters.IndexName != null
                    ? qSpecializationParameters.IndexName
                    : specializationToUpdate!.IndexName;
            specializationToUpdate!.ImageFilePath =
                qSpecializationParameters.ImageFilePath != null
                    ? qSpecializationParameters.ImageFilePath
                    : specializationToUpdate!.ImageFilePath;
            specializationToUpdate!.IconFilePath =
                qSpecializationParameters.IconFilePath != null
                    ? qSpecializationParameters.IconFilePath
                    : specializationToUpdate!.IconFilePath;
            specializationToUpdate!.GroupMemberships =
                qSpecializationParameters.GroupMemberships != null
                    ? qSpecializationParameters.GroupMemberships
                    : specializationToUpdate!.GroupMemberships;

            await this._specializationSourceRepository.UpsertAsync(specializationToUpdate);
            return specializationToUpdate;
        }
        return null;
    }

    /// <summary>
    /// Deletes the specialization.
    /// </summary>
    /// <param name="specializationId">Unique identifier of the specialization</param>
    /// <returns>The task result contains the delete state</returns>
    public async Task<bool> DeleteSpecialization(Guid specializationId)
    {
        try
        {
            Specialization? specializationToDelete =
                await this._specializationSourceRepository.FindByIdAsync(
                    specializationId.ToString()
                );

            await this._specializationSourceRepository.DeleteAsync(specializationToDelete);

            // Remove the image file from the blob storage if it is not the default image
            if (!this.IsDefaultFilePath(specializationToDelete!.ImageFilePath))
            {
                await this._qBlobStorage.DeleteBlobByURIAsync(
                    specializationToDelete!.ImageFilePath
                );
            }

            // Remove the icon file from the blob storage if it is not the default icon
            if (!this.IsDefaultFilePath(specializationToDelete!.IconFilePath))
            {
                await this._qBlobStorage.DeleteBlobByURIAsync(specializationToDelete!.IconFilePath);
            }

            return true;
        }
        catch (Exception ex) when (ex is ArgumentOutOfRangeException)
        {
            return false;
        }
    }

    private bool IsDefaultFilePath(string? filePath)
    {
        return filePath == this._qAzureOpenAIChatOptions.DefaultSpecializationImage
            || filePath == this._qAzureOpenAIChatOptions.DefaultSpecializationIcon;
    }
}
