// Copyright (c) Microsoft. All rights reserved.

using System;
using System.Collections.Frozen;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Linq.Expressions;
using System.Net;
using System.Threading.Tasks;
using CopilotChat.WebApi.Extensions;
using CopilotChat.WebApi.Models.Storage;
using Microsoft.Azure.Cosmos;
using Microsoft.Azure.Cosmos.Linq;

namespace CopilotChat.WebApi.Storage;

/// <summary>
/// A storage context that stores entities in a CosmosDB container.
/// </summary>
public class CosmosDbContext<T> : IStorageContext<T>, IDisposable
    where T : IStorageEntity
{
    /// <summary>
    /// The CosmosDB client.
    /// </summary>
    private readonly CosmosClient _client;

    /// <summary>
    /// CosmosDB container.
    /// </summary>
#pragma warning disable CA1051 // Do not declare visible instance fields
    protected readonly Container _container;
#pragma warning restore CA1051 // Do not declare visible instance fields

    /// <summary>
    /// Initializes a new instance of the CosmosDbContext class.
    /// </summary>
    /// <param name="connectionString">The CosmosDB connection string.</param>
    /// <param name="database">The CosmosDB database name.</param>
    /// <param name="container">The CosmosDB container name.</param>
    public CosmosDbContext(string connectionString, string database, string container)
    {
        // Configure JsonSerializerOptions
        var options = new CosmosClientOptions
        {
            SerializerOptions = new CosmosSerializationOptions
            {
                PropertyNamingPolicy = CosmosPropertyNamingPolicy.CamelCase,
            },
        };
        this._client = new CosmosClient(connectionString, options);
        this._container = this._client.GetContainer(database, container);
    }

    /// <inheritdoc/>
    public async Task<IEnumerable<T>> QueryEntitiesAsync(Expression<Func<T, bool>> predicate)
    {
        var results = new List<T>();
        var queryable = this._container.GetItemLinqQueryable<T>(true).Where(predicate);
        var iterator = queryable.ToFeedIterator();
        while (iterator.HasMoreResults)
        {
            var response = await iterator.ReadNextAsync();
            results.AddRange(response);
        }
        return results;
    }

    /// <inheritdoc/>
    public async Task CreateAsync(T entity)
    {
        if (string.IsNullOrWhiteSpace(entity.Id))
        {
            throw new ArgumentOutOfRangeException(nameof(entity), "Entity Id cannot be null or empty.");
        }

        await this._container.CreateItemAsync(entity, new PartitionKey(entity.Partition));
    }

    /// <inheritdoc/>
    public async Task DeleteAsync(T entity)
    {
        if (string.IsNullOrWhiteSpace(entity.Id))
        {
            throw new ArgumentOutOfRangeException(nameof(entity), "Entity Id cannot be null or empty.");
        }

        await this._container.DeleteItemAsync<T>(entity.Id, new PartitionKey(entity.Partition));
    }

    /// <inheritdoc/>
    public async Task<T> ReadAsync(string entityId, string partitionKey)
    {
        if (string.IsNullOrWhiteSpace(entityId))
        {
            throw new ArgumentOutOfRangeException(nameof(entityId), "Entity Id cannot be null or empty.");
        }

        try
        {
            var response = await this._container.ReadItemAsync<T>(entityId, new PartitionKey(partitionKey));
            return response.Resource;
        }
        catch (CosmosException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
        {
            throw new KeyNotFoundException($"Entity with id {entityId} not found.");
        }
    }

    /// <inheritdoc/>
    public async Task UpsertAsync(T entity)
    {
        if (string.IsNullOrWhiteSpace(entity.Id))
        {
            throw new ArgumentOutOfRangeException(nameof(entity), "Entity Id cannot be null or empty.");
        }

        await this._container.UpsertItemAsync(entity, new PartitionKey(entity.Partition));
    }

    public void Dispose()
    {
        this.Dispose(true);
        GC.SuppressFinalize(this);
    }

    protected virtual void Dispose(bool disposing)
    {
        if (disposing)
        {
            this._client.Dispose();
        }
    }
}

/// <summary>
/// Specialization of CosmosDbContext<T> for CopilotChatMessage.
/// </summary>
public class CosmosDbCopilotChatMessageContext : CosmosDbContext<CopilotChatMessage>, ICopilotChatMessageStorageContext
{
    /// <summary>
    /// Initializes a new instance of the CosmosDbCopilotChatMessageContext class.
    /// </summary>
    /// <param name="connectionString">The CosmosDB connection string.</param>
    /// <param name="database">The CosmosDB database name.</param>
    /// <param name="container">The CosmosDB container name.</param>
    public CosmosDbCopilotChatMessageContext(string connectionString, string database, string container)
        : base(connectionString, database, container) { }

    /// <inheritdoc/>
    public async Task<IEnumerable<CopilotChatMessage>> QueryEntitiesAsync(
        Expression<Func<CopilotChatMessage, bool>> predicate,
        int skip,
        int count
    )
    {
        var results = new List<CopilotChatMessage>();
        var queryable = this._container.GetItemLinqQueryable<CopilotChatMessage>(true).Where(predicate).OrderByDescending(m => m.Timestamp).Skip(skip);
        if (count > 0)
        {
            queryable = queryable.Take(count);
        }
        var iterator = queryable.ToFeedIterator();
        while (iterator.HasMoreResults)
        {
            var response = await iterator.ReadNextAsync();
            results.AddRange(response);
        }

        return results;
    }
}
