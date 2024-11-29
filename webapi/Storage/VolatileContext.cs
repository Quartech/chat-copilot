// Copyright (c) Microsoft. All rights reserved.

using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using CopilotChat.WebApi.Models.Request;
using CopilotChat.WebApi.Models.Storage;

namespace CopilotChat.WebApi.Storage;

/// <summary>
/// A storage context that stores entities in memory.
/// </summary>
[DebuggerDisplay($"{{{nameof(GetDebuggerDisplay)}(),nq}}")]
public class VolatileContext<T> : IStorageContext<T>
    where T : IStorageEntity
{
    /// <summary>
    /// Using a concurrent dictionary to store entities in memory.
    /// </summary>
#pragma warning disable CA1051 // Do not declare visible instance fields
    protected readonly ConcurrentDictionary<string, T> _entities;
#pragma warning restore CA1051 // Do not declare visible instance fields

    /// <summary>
    /// Initializes a new instance of the InMemoryContext class.
    /// </summary>
    public VolatileContext()
    {
        this._entities = new ConcurrentDictionary<string, T>();
    }

    /// <inheritdoc/>
    public Task<IEnumerable<T>> QueryEntitiesAsync(Expression<Func<T, bool>> predicate)
    {
        var compiledPredicate = predicate.Compile();
        return Task.FromResult(this._entities.Values.Where(compiledPredicate));
    }

    /// <inheritdoc/>
    public Task CreateAsync(T entity)
    {
        if (string.IsNullOrWhiteSpace(entity.Id))
        {
            throw new ArgumentOutOfRangeException(nameof(entity), "Entity Id cannot be null or empty.");
        }

        this._entities.TryAdd(entity.Id, entity);

        return Task.CompletedTask;
    }

    /// <inheritdoc/>
    public Task DeleteAsync(T entity)
    {
        if (string.IsNullOrWhiteSpace(entity.Id))
        {
            throw new ArgumentOutOfRangeException(nameof(entity), "Entity Id cannot be null or empty.");
        }

        this._entities.TryRemove(entity.Id, out _);

        return Task.CompletedTask;
    }

    /// <inheritdoc/>
    public Task DeleteAllFromPartitionAsync(string partitionKey)
    {
        if (string.IsNullOrWhiteSpace(partitionKey))
        {
            throw new ArgumentOutOfRangeException(nameof(partitionKey), "Partition key cannot be null or empty.");
        }

        foreach (var entity in this._entities.Values.Where(e => e.Partition == partitionKey))
        {
            this._entities.TryRemove(entity.Id, out _);
        }

        return Task.CompletedTask;
    }

    /// <inheritdoc/>
    public Task<T> ReadAsync(string entityId, string partitionKey)
    {
        if (string.IsNullOrWhiteSpace(entityId))
        {
            throw new ArgumentOutOfRangeException(nameof(entityId), "Entity Id cannot be null or empty.");
        }

        if (this._entities.TryGetValue(entityId, out T? entity))
        {
            return Task.FromResult(entity);
        }

        throw new KeyNotFoundException($"Entity with id {entityId} not found.");
    }

    /// <inheritdoc/>
    public Task UpsertAsync(T entity)
    {
        if (string.IsNullOrWhiteSpace(entity.Id))
        {
            throw new ArgumentOutOfRangeException(nameof(entity), "Entity Id cannot be null or empty.");
        }

        this._entities.AddOrUpdate(entity.Id, entity, (key, oldValue) => entity);

        return Task.CompletedTask;
    }

    private string GetDebuggerDisplay()
    {
        return this.ToString() ?? string.Empty;
    }
}

/// <summary>
/// Specialization of VolatileContext<T> for CopilotChatMessage.
/// </summary>
public class VolatileCopilotChatMessageContext
    : VolatileContext<CopilotChatMessage>,
        ICopilotChatMessageStorageContext,
        ICopilotChatMessageSortable
{
    /// <inheritdoc/>
    public async Task<IEnumerable<CopilotChatMessage>> QueryEntitiesAsync(
        Expression<Func<CopilotChatMessage, bool>> predicate,
        CopilotChatMessageSortOption? sortOption,
        int skip,
        int count
    )
    {
        var compiledPredicate = predicate.Compile();

        // Apply the compiled predicate
        var filteredEntities = this._entities.Values.Where(compiledPredicate);

        // Apply sorting
        var orderedEntities = this.Sort(filteredEntities.AsQueryable(), sortOption);

        // Apply pagination
        orderedEntities = orderedEntities.Skip(skip);
        if (count > 0)
        {
            orderedEntities = orderedEntities.Take(count);
        }

        return await Task.FromResult(orderedEntities);
    }

    public IQueryable<CopilotChatMessage> Sort(
        IQueryable<CopilotChatMessage> queryable,
        CopilotChatMessageSortOption? sortOption
    )
    {
        if (sortOption == null)
        {
            return queryable.OrderByDescending(m => m.Timestamp);
        }

        switch (sortOption)
        {
            default:
            case CopilotChatMessageSortOption.DateDesc:
                return queryable.OrderByDescending(m => m.Timestamp);
            case CopilotChatMessageSortOption.DateAsc:
                return queryable.OrderBy(m => m.Timestamp);
            case CopilotChatMessageSortOption.FeedbackPos:
                return queryable.OrderByDescending(m => m.UserFeedback == UserFeedback.Positive);
            case CopilotChatMessageSortOption.FeedbackNeg:
                return queryable.OrderByDescending(m => m.UserFeedback == UserFeedback.Negative);
        }
    }
}
