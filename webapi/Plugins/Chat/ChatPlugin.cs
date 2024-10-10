// Copyright (c) Microsoft. All rights reserved.

using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using Azure.AI.OpenAI;
using CopilotChat.WebApi.Hubs;
using CopilotChat.WebApi.Models.Response;
using CopilotChat.WebApi.Models.Storage;
using CopilotChat.WebApi.Options;
using CopilotChat.WebApi.Plugins.Chat.Ext;
using CopilotChat.WebApi.Plugins.Utils;
using CopilotChat.WebApi.Services;
using CopilotChat.WebApi.Storage;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.KernelMemory;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;
using Microsoft.SemanticKernel.Connectors.OpenAI;

namespace CopilotChat.WebApi.Plugins.Chat;

/// <summary>
/// ChatPlugin offers a more coherent chat experience by using memories
/// to extract conversation history and user intentions.
/// Note: This class has been modified to support chat specialization.
/// </summary>
public class ChatPlugin
{
    /// <summary>
    /// A kernel instance to create a completion function since each invocation
    /// of the <see cref="ChatAsync"/> function will generate a new prompt dynamically.
    /// </summary>
    private readonly Kernel _kernel;

    /// <summary>
    /// Client for the kernel memory service.
    /// </summary>
    private readonly IKernelMemory _memoryClient;

    /// <summary>
    /// A logger instance to log events.
    /// </summary>
    private ILogger _logger;

    /// <summary>
    /// A repository to save and retrieve chat messages.
    /// </summary>
    private readonly ChatMessageRepository _chatMessageRepository;

    /// <summary>
    /// A repository to save and retrieve chat sessions.
    /// </summary>
    private readonly ChatSessionRepository _chatSessionRepository;

    /// <summary>
    /// A SignalR hub context to broadcast updates of the execution.
    /// </summary>
    private readonly IHubContext<MessageRelayHub> _messageRelayHubContext;

    /// <summary>
    /// The QSpecializationService used for managing specializations.
    /// </summary>
    private readonly QSpecializationService _qSpecializationService;

    /// <summary>
    /// The current specialization in use, may be null if not yet set or if no specialization applies.
    /// </summary>
    private Specialization? _qSpecialization = null;

    /// <summary>
    /// Settings containing prompt texts.
    /// </summary>
    private readonly PromptsOptions _promptOptions;

    /// <summary>
    /// A kernel memory retriever instance to query semantic memories.
    /// </summary>
    private readonly SemanticMemoryRetriever _semanticMemoryRetriever;

    /// <summary>
    /// Azure content safety moderator.
    /// </summary>
    private readonly AzureContentSafety? _contentSafety = null;

    /// <summary>
    /// Extension: AzureOpenAI Extension handler
    /// </summary>
    private QAzureOpenAIChatExtension _qAzureOpenAIChatExtension;

    // feature flag for user intent extraction
    private readonly bool _isUserIntentExtractionEnabled;

    /// <summary>
    /// Create a new instance of <see cref="ChatPlugin"/>.
    /// </summary>
    public ChatPlugin(
        Kernel kernel,
        IKernelMemory memoryClient,
        ChatMessageRepository chatMessageRepository,
        ChatSessionRepository chatSessionRepository,
        QSpecializationService qSpecializationService,
        SpecializationRepository specializationSourceRepository,
        IHubContext<MessageRelayHub> messageRelayHubContext,
        IOptions<PromptsOptions> promptOptions,
        IOptions<DocumentMemoryOptions> documentImportOptions,
        IOptions<QAzureOpenAIChatOptions> qAzureOpenAIChatOptions,
        ILogger logger,
        AzureContentSafety? contentSafety = null,
        bool isUserIntentExtractionEnabled = false
    ) // Parameter for feature flag
    {
        this._logger = logger;
        this._kernel = kernel;
        this._memoryClient = memoryClient;
        this._chatMessageRepository = chatMessageRepository;
        this._chatSessionRepository = chatSessionRepository;
        this._messageRelayHubContext = messageRelayHubContext;
        // Clone the prompt options to avoid modifying the original prompt options.
        this._promptOptions = promptOptions.Value.Copy();
        this._qSpecializationService = new QSpecializationService(
            specializationSourceRepository,
            qAzureOpenAIChatOptions.Value
        );
        this._semanticMemoryRetriever = new SemanticMemoryRetriever(
            promptOptions,
            chatSessionRepository,
            memoryClient,
            logger
        );
        this._qAzureOpenAIChatExtension = new QAzureOpenAIChatExtension(
            qAzureOpenAIChatOptions.Value,
            specializationSourceRepository
        );
        this._contentSafety = contentSafety;
        this._isUserIntentExtractionEnabled = isUserIntentExtractionEnabled; // Initialize feature flag
    }

    /// <summary>
    /// This is the entry point for getting a chat response. It manages the token limit, saves
    /// messages to memory, and fills in the necessary context variables for completing the
    /// prompt that will be rendered by the template engine.
    /// </summary>
    /// <param name="cancellationToken">The cancellation token.</param>
    [KernelFunction, Description("Get chat response")]
    public async Task<KernelArguments> ChatAsync(
        [Description("The new message")] string message,
        [Description("Unique and persistent identifier for the user")] string userId,
        [Description("Name of the user")] string userName,
        [Description("Unique and persistent identifier for the chat")] string chatId,
        [Description("Type of the message")] string messageType,
        KernelArguments context,
        CancellationToken cancellationToken = default
    )
    {
        // Set the system description in the prompt options
        await this.SetSystemDescriptionAsync(chatId, cancellationToken);

        // Save this new message to memory such that subsequent chat responses can use it
        await this.UpdateBotResponseStatusOnClientAsync(chatId, "Generating bot response", cancellationToken);

        this._logger.LogInformation("Saving user message to chat history");
        var newUserMessage = await this.SaveNewMessageAsync(
            message,
            userId,
            userName,
            chatId,
            messageType,
            cancellationToken
        );

        // Clone the context to avoid modifying the original context variables.
        KernelArguments chatContext = new(context);
        chatContext["knowledgeCutoff"] = this._promptOptions.KnowledgeCutoffDate;

        // Retrieve the specialization key or default to the predefined default specialization key
        var specializationKey =
            context[this._qAzureOpenAIChatExtension.ContextKey]?.ToString()
            ?? this._qAzureOpenAIChatExtension.DefaultSpecialization;
        // Fetch specialization only if the context key differs from the default
        if (specializationKey != this._qAzureOpenAIChatExtension.DefaultSpecialization)
        {
            this._qSpecialization = await this._qSpecializationService.GetSpecializationAsync(specializationKey);
        }

        this._logger.LogInformation("Getting chat response");

        CopilotChatMessage chatMessage = await this.GetChatResponseAsync(
            chatId,
            userId,
            chatContext,
            newUserMessage,
            cancellationToken
        );
        context["input"] = chatMessage.Content;

        if (chatMessage.TokenUsage != null)
        {
            context["tokenUsage"] = JsonSerializer.Serialize(chatMessage.TokenUsage);
        }
        else
        {
            this._logger.LogWarning(
                "ChatPlugin.ChatAsync token usage unknown. Ensure token management has been implemented correctly."
            );
        }

        return context;
    }

    /// <summary>
    /// Generate the necessary chat context to create a prompt then invoke the model to get a response.
    /// </summary>
    /// <param name="chatId">The chat ID</param>
    /// <param name="userId">The user ID</param>
    /// <param name="chatContext">The KernelArguments.</param>
    /// <param name="userMessage">ChatMessage object representing new user message.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The created chat message containing the model-generated response.</returns>
    private async Task<CopilotChatMessage> GetChatResponseAsync(
        string chatId,
        string userId,
        KernelArguments chatContext,
        CopilotChatMessage userMessage,
        CancellationToken cancellationToken
    )
    {
        // Render system instruction components and create the meta-prompt template
        var systemInstructions = await AsyncUtils.SafeInvokeAsync(
            () => this.RenderSystemInstructions(chatId, chatContext, cancellationToken),
            nameof(RenderSystemInstructions)
        );
        ChatHistory metaPrompt = new(systemInstructions);

        // Get the audience
        var audience = await AsyncUtils.SafeInvokeAsync(
            () => this.GetAudienceAsync(chatContext, cancellationToken),
            nameof(GetAudienceAsync)
        );
        metaPrompt.AddSystemMessage(audience);

        var userIntent = string.Empty;
        if (this._isUserIntentExtractionEnabled)
        {
            // Extract user intent from the conversation history.
            userIntent = await AsyncUtils.SafeInvokeAsync(
                () => this.GetUserIntentAsync(chatContext, cancellationToken),
                nameof(GetUserIntentAsync)
            );
            metaPrompt.AddSystemMessage(userIntent);
        }

        // Calculate tokens used for memories
        int maxRequestTokenBudget = this.GetMaxRequestTokenBudget();
        // Calculate tokens used so far: system instructions, audience extraction and user intent
        int tokensUsed = TokenUtils.GetContextMessagesTokenCount(metaPrompt);
        int chatMemoryTokenBudget =
            maxRequestTokenBudget
            - tokensUsed
            - TokenUtils.GetContextMessageTokenCount(AuthorRole.User, userMessage.ToFormattedString());
        chatMemoryTokenBudget = (int)(chatMemoryTokenBudget * this._promptOptions.MemoriesResponseContextWeight);

        // Query relevant semantic and document memories
        (var memoryText, var citationMap) = await this._semanticMemoryRetriever.QueryMemoriesAsync(
            userIntent,
            chatId,
            chatMemoryTokenBudget
        );
        if (!string.IsNullOrWhiteSpace(memoryText))
        {
            metaPrompt.AddSystemMessage(memoryText);
            tokensUsed += TokenUtils.GetContextMessageTokenCount(AuthorRole.System, memoryText);
        }

        // Add as many chat history messages to meta-prompt as the token budget will allow, or based on the count of messages to add specified in the specialization
        string allowedChatHistory = await this.GetAllowedChatHistoryAsync(
            chatId,
            maxRequestTokenBudget - tokensUsed,
            metaPrompt,
            cancellationToken
        );

        // Store token usage of prompt template
        chatContext[TokenUtils.GetFunctionKey("SystemMetaPrompt")] = TokenUtils
            .GetContextMessagesTokenCount(metaPrompt)
            .ToString(CultureInfo.CurrentCulture);

        // Stream the response to the client
        var botPrompt = new BotResponsePrompt(
            systemInstructions,
            audience,
            userIntent,
            memoryText,
            allowedChatHistory,
            metaPrompt
        );

        return await this.StreamBotResponseAsync(
            chatId,
            userId,
            chatContext,
            botPrompt,
            citationMap.Values.AsEnumerable(),
            cancellationToken
        );
    }

    /// <summary>
    /// This is the entry point for getting a chat response. It manages the token limit, saves
    /// messages to memory, and fills in the necessary context variables for completing the
    /// prompt that will be rendered by the template engine.
    /// </summary>
    /// <param name="cancellationToken">The cancellation token.</param>
    [KernelFunction, Description("Get chat response")]
    public async Task<KernelArguments> ChatSilentAsync(
        [Description("The new message")] string message,
        [Description("Unique and persistent identifier for the user")] string userId,
        [Description("Name of the user")] string userName,
        [Description("Unique and persistent identifier for the chat")] string chatId,
        [Description("Type of the message")] string messageType,
        KernelArguments context,
        CancellationToken cancellationToken = default
    )
    {
        // Set the system description in the prompt options
        await this.SetSystemDescriptionAsync(chatId, cancellationToken);

        var newUserMessage = new CopilotChatMessage(
            userId,
            userName,
            chatId,
            message,
            string.Empty,
            null,
            CopilotChatMessage.AuthorRoles.User,
            // Default to a standard message if the `type` is not recognized
            Enum.TryParse(messageType, out CopilotChatMessage.ChatMessageType typeAsEnum)
            && Enum.IsDefined(typeof(CopilotChatMessage.ChatMessageType), typeAsEnum)
                ? typeAsEnum
                : CopilotChatMessage.ChatMessageType.Message
        );

        // Clone the context to avoid modifying the original context variables.
        KernelArguments chatContext = new(context);
        chatContext["knowledgeCutoff"] = this._promptOptions.KnowledgeCutoffDate;

        this._logger.LogInformation("Getting chat response! Silent version.");
        // Directly get the chat response without extracting user intent
        CopilotChatMessage chatMessage = await this.GetChatResponseSilentAsync(
            chatId,
            userId,
            chatContext,
            newUserMessage,
            cancellationToken
        );
        context["input"] = chatMessage.Content;

        if (chatMessage.TokenUsage != null)
        {
            context["tokenUsage"] = JsonSerializer.Serialize(chatMessage.TokenUsage);
        }
        else
        {
            this._logger.LogWarning(
                "ChatPlugin.ChatAsync token usage unknown. Ensure token management has been implemented correctly."
            );
        }

        return context;
    }

    /// <summary>
    /// Will generate a response from the bot that will reference conversation
    /// history but not include this exchange in that history or stream the response back to the client.
    /// </summary>
    /// <param name="chatId"></param>
    /// <param name="userId"></param>
    /// <param name="chatContext"></param>
    /// <param name="userMessage"></param>
    /// <param name="cancellationToken"></param>
    private async Task<CopilotChatMessage> GetChatResponseSilentAsync(
        string chatId,
        string userId,
        KernelArguments chatContext,
        CopilotChatMessage userMessage,
        CancellationToken cancellationToken
    )
    {
        var promptConfig = await this.GetPromptConfig(chatId, chatContext, cancellationToken);
        var (memoryText, citationMap) = await this.GetAndInjectSemanticMemories(chatId, 0, chatContext, promptConfig);
        var botPrompt = await this.GetBotResponsePromptAsync(
            userId,
            chatId,
            memoryText,
            promptConfig,
            userMessage,
            cancellationToken
        );

        return await this.OneOffBotResponseAsync(
            chatId,
            userId,
            chatContext,
            botPrompt,
            citationMap.Values.AsEnumerable(),
            cancellationToken
        );
    }

    /// <summary>
    /// PromptConfig struct, helper for easily passing around common prompt components
    /// when constructing prompts and responses for the chatbot.
    /// </summary>
    private struct PromptConfig
    {
        public string Audience; //Participants from relevant chat context.
        public string UserIntent; //User intent extract from chat history.
        public string SystemInstructions; //General system instructions to be included with every prompt.
        public ChatHistory MetaPrompt; //Chat history that can be appended with further details such as semantic memories.
    }

    /// <summary>
    /// Constructs a PromptConfig object by extracting details from the current chat context.
    /// </summary>
    /// <param name="chatId"> Current chat guid </param>
    /// <param name="chatContext"> Current chat context, which will determine the prompt config struct. </param>
    /// <param name="cancellationToken"> Cancellation token. </param>
    private async Task<PromptConfig> GetPromptConfig(
        string chatId,
        KernelArguments chatContext,
        CancellationToken cancellationToken
    )
    {
        // Start rendering system instructions
        var systemInstructionsTask = AsyncUtils.SafeInvokeAsync(
            () => this.RenderSystemInstructions(chatId, chatContext, cancellationToken),
            nameof(RenderSystemInstructions)
        );

        // Start extracting audience if the user is not a default user
        Task<string> audienceTask = Task.FromResult(string.Empty);

        audienceTask = AsyncUtils.SafeInvokeAsync(
            () => this.GetAudienceAsync(chatContext, cancellationToken),
            nameof(GetAudienceAsync)
        );
        // Conditionally start extracting user intent based on feature flag
        Task<string> userIntentTask = Task.FromResult(string.Empty);
        if (this._isUserIntentExtractionEnabled)
        {
            userIntentTask = AsyncUtils.SafeInvokeAsync(
                () => this.GetUserIntentAsync(chatContext, cancellationToken),
                nameof(GetUserIntentAsync)
            );
        }

        // Wait for system instructions to complete
        var systemInstructions = await systemInstructionsTask;
        ChatHistory metaPrompt = new(systemInstructions);
        // Wait for audience task to complete
        var audience = await audienceTask;
        var userIntent = await userIntentTask;

        if (!string.IsNullOrEmpty(audience))
        {
            metaPrompt.AddSystemMessage(audience);
        }
        if (this._isUserIntentExtractionEnabled && !string.IsNullOrEmpty(userIntent))
        {
            metaPrompt.AddSystemMessage(userIntent);
        }

        return new PromptConfig
        {
            Audience = audience,
            UserIntent = userIntent,
            MetaPrompt = metaPrompt,
            SystemInstructions = systemInstructions,
        };
    }

    /// <summary>
    /// This will query the chat for semantic memories from the chat history and uploaded documents.
    /// It will return text spawned from these memories and a citation map for relating documents to generated text.
    /// The generated text will be inserted into the current chat context.
    /// </summary>
    /// <param name="chatId">The current chat guid.</param>
    /// <param name="tokenBudget">Amount of tokens to consume while querying memories.</param>
    /// <param name="chatContext">Current chat context.</param>
    /// <param name="promptConfig">Prompt configuration to guide querying.</param>
    private async Task<(string, IDictionary<string, CitationSource>)> GetAndInjectSemanticMemories(
        string chatId,
        int tokenBudget,
        KernelArguments chatContext,
        PromptConfig promptConfig
    )
    {
        var memoryQueryTask = this._semanticMemoryRetriever.QueryMemoriesAsync(
            this._promptOptions.DocumentMemoryName,
            chatId,
            tokenBudget
        );
        var (memoryText, citationMap) = await memoryQueryTask;
        chatContext["knowledgeBase"] = memoryText;
        // Store token usage of prompt template
        chatContext[TokenUtils.GetFunctionKey("SystemMetaPrompt")] = TokenUtils
            .GetContextMessagesTokenCount(promptConfig.MetaPrompt)
            .ToString(CultureInfo.CurrentCulture);
        return (memoryText, citationMap);
    }

    /// <summary>
    /// Helper function to handle final steps of bot response generation, including streaming to client,
    /// generating semantic text memory, calculating final token usages, and saving to chat history.
    /// </summary>
    /// <param name="chatId">The chat ID</param>
    /// <param name="userId">The user ID</param>
    /// <param name="chatContext">Chat context.</param>
    /// <param name="promptView">The prompt view.</param>
    /// <param name="citations">Citation sources.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    private async Task<CopilotChatMessage> StreamBotResponseAsync(
        string chatId,
        string userId,
        KernelArguments chatContext,
        BotResponsePrompt promptView,
        IEnumerable<CitationSource>? citations,
        CancellationToken cancellationToken
    )
    {
        CopilotChatMessage chatMessage = await AsyncUtils.SafeInvokeAsync(
            () =>
                this.StreamResponseToClientAsync(chatId, userId, promptView, chatContext, cancellationToken, citations),
            nameof(StreamResponseToClientAsync)
        );

        // Save the message into chat history
        this._logger.LogInformation("Saving message to chat history");
        await this._chatMessageRepository.UpsertAsync(chatMessage);

        // Extract semantic chat memory
        this._logger.LogInformation("Generating semantic chat memory");
        await AsyncUtils.SafeInvokeAsync(
            () =>
                SemanticChatMemoryExtractor.ExtractSemanticChatMemoryAsync(
                    chatId,
                    this.GetResponseTokenLimit(),
                    this._memoryClient,
                    this._kernel,
                    chatContext,
                    this._promptOptions,
                    this._logger,
                    cancellationToken
                ),
            nameof(SemanticChatMemoryExtractor.ExtractSemanticChatMemoryAsync)
        );

        // Calculate total token usage for dependency functions and prompt template
        this._logger.LogInformation("Saving token usage");
        chatMessage.TokenUsage = this.GetTokenUsages(chatContext, chatMessage.Content);

        // Update the message on client and in chat history with final completion token usage
        await this.UpdateMessageOnClient(chatMessage, cancellationToken);
        await this._chatMessageRepository.UpsertAsync(chatMessage);

        return chatMessage;
    }

    /// <summary>
    /// Helper function to handle final steps of bot response generation, including streaming to client,
    /// generating semantic text memory, calculating final token usages, and saving to chat history.
    /// </summary>
    /// <param name="chatId">The chat ID</param>
    /// <param name="userId">The user ID</param>
    /// <param name="chatContext">Chat context.</param>
    /// <param name="promptView">The prompt view.</param>
    /// <param name="citations">Citation sources.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    private async Task<CopilotChatMessage> OneOffBotResponseAsync(
        string chatId,
        string userId,
        KernelArguments chatContext,
        BotResponsePrompt promptView,
        IEnumerable<CitationSource>? citations,
        CancellationToken cancellationToken
    )
    {
        string speckey = (string)chatContext[this._qAzureOpenAIChatExtension.ContextKey]!;
        string serializedContext = JsonSerializer.Serialize(chatContext);

        // Combine the context with the main prompt
        string combinedPrompt = $"{promptView.MetaPromptTemplate}\n\nContext: {serializedContext}";
        var chatHistory = new ChatHistory();
        chatHistory.AddUserMessage(combinedPrompt);

        var chatCompletion = this._kernel.GetRequiredService<IChatCompletionService>();
        var stream = await chatCompletion.GetChatMessageContentAsync(
            chatHistory,
            this.CreateChatRequestSettings(),
            this._kernel,
            cancellationToken
        );
        // Return the constructed message without saving to chat history.
        var chatmessage = new CopilotChatMessage(
            userId,
            "Bot",
            chatId,
            stream.Content ?? "No message returned",
            combinedPrompt,
            citations
        );
        return chatmessage;
    }

    /// <summary>
    /// Get a prompt to ask the chat bot with.
    /// This will be constructed using a prompt configuration containing some standard system and audience information
    /// as well as memories specific to the current conversation.
    /// </summary>
    /// <param name="userId">Current user guid.</param>
    /// <param name="chatId">Current chat guid.</param>
    /// <param name="memoryText">Memory information to refine the prompt.</param>
    /// <param name="promptConfig">Prompt configuration struct containing some standard prompt info.</param>
    /// <param name="userMessage">The user's specific query.</param>
    /// <param name="cancellationToken">For cancelling the request.</param>
    private async Task<BotResponsePrompt> GetBotResponsePromptAsync(
        string userId,
        string chatId,
        string memoryText,
        PromptConfig promptConfig,
        CopilotChatMessage userMessage,
        CancellationToken cancellationToken
    )
    {
        // Calculate max amount of tokens to use for memories
        int maxRequestTokenBudget = this.GetMaxRequestTokenBudget();
        int tokensUsed = TokenUtils.GetContextMessagesTokenCount(promptConfig.MetaPrompt);
        int chatMemoryTokenBudget =
            maxRequestTokenBudget
            - tokensUsed
            - TokenUtils.GetContextMessageTokenCount(AuthorRole.User, userMessage.ToFormattedString());
        chatMemoryTokenBudget = (int)(chatMemoryTokenBudget * this._promptOptions.MemoriesResponseContextWeight);

        // Start extracting chat history
        var chatHistoryTask = this.GetAllowedChatHistoryAsync(
            chatId,
            maxRequestTokenBudget - tokensUsed,
            promptConfig.MetaPrompt,
            cancellationToken
        );

        if (!string.IsNullOrWhiteSpace(memoryText))
        {
            promptConfig.MetaPrompt.AddSystemMessage(memoryText);
            tokensUsed += TokenUtils.GetContextMessageTokenCount(AuthorRole.System, memoryText);
        }

        var allowedChatHistory = await chatHistoryTask;

        // Stream the response to the client
        return new BotResponsePrompt(
            promptConfig.SystemInstructions,
            promptConfig.Audience,
            this._isUserIntentExtractionEnabled ? promptConfig.UserIntent : string.Empty, // Include user intent if the flag is enabled
            memoryText,
            allowedChatHistory,
            promptConfig.MetaPrompt
        );
    }

    /// <summary>
    /// Helper function to render system instruction components.
    /// </summary>
    /// <param name="chatId">The chat ID</param>
    /// <param name="context">The KernelArguments.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    private async Task<string> RenderSystemInstructions(
        string chatId,
        KernelArguments context,
        CancellationToken cancellationToken
    )
    {
        // Render system instruction components
        //await this.UpdateBotResponseStatusOnClientAsync(chatId, "Initializing prompt", cancellationToken);

        var promptTemplateFactory = new KernelPromptTemplateFactory();
        var promptTemplate = promptTemplateFactory.Create(new PromptTemplateConfig(this._promptOptions.SystemPersona));
        return await promptTemplate.RenderAsync(this._kernel, context, cancellationToken);
    }

    /// <summary>
    /// Extract the list of participants from the conversation history.
    /// Note that only those who have spoken will be included.
    /// </summary>
    /// <param name="context">Kernel context variables.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    private async Task<string> GetAudienceAsync(KernelArguments context, CancellationToken cancellationToken)
    {
        // Clone the context to avoid modifying the original context variables
        KernelArguments audienceContext = new(context);
        int historyTokenBudget =
            this._promptOptions.CompletionTokenLimit
            - this.GetResponseTokenLimit()
            - TokenUtils.TokenCount(
                string.Join(
                    "\n\n",
                    new string[] { this._promptOptions.SystemAudience, this._promptOptions.SystemAudienceContinuation }
                )
            );

        audienceContext["tokenLimit"] = historyTokenBudget.ToString(new NumberFormatInfo());
        var completionFunction = this._kernel.CreateFunctionFromPrompt(
            this._promptOptions.SystemAudienceExtraction,
            this.CreateIntentCompletionSettings(),
            functionName: "SystemAudienceExtraction",
            description: "Extract audience"
        );

        var result = await completionFunction.InvokeAsync(this._kernel, audienceContext, cancellationToken);

        // Get token usage from ChatCompletion result and add to original context
        string? tokenUsage = TokenUtils.GetFunctionTokenUsage(result, this._logger);
        if (tokenUsage is not null)
        {
            context[TokenUtils.GetFunctionKey("SystemAudienceExtraction")] = tokenUsage;
        }
        else
        {
            this._logger.LogError("Unable to determine token usage for audienceExtraction");
        }

        return $"List of participants: {result}";
    }

    /// <summary>
    /// Extract user intent from the conversation history.
    /// </summary>
    /// <param name="context">Kernel context.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    private async Task<string> GetUserIntentAsync(KernelArguments context, CancellationToken cancellationToken)
    {
        this._logger.LogInformation("Extracting user intent");
        // Clone the context to avoid modifying the original context variables
        KernelArguments intentContext = new(context);

        int tokenBudget =
            this._promptOptions.CompletionTokenLimit
            - this.GetResponseTokenLimit()
            - TokenUtils.TokenCount(
                string.Join(
                    "\n",
                    new string[]
                    {
                        this._promptOptions.SystemPersona,
                        this._promptOptions.SystemIntent,
                        this._promptOptions.SystemIntentContinuation,
                    }
                )
            );

        intentContext["tokenLimit"] = tokenBudget.ToString(new NumberFormatInfo());
        intentContext["knowledgeCutoff"] = this._promptOptions.KnowledgeCutoffDate;
        var completionFunction = this._kernel.CreateFunctionFromPrompt(
            this._promptOptions.SystemIntentExtraction,
            this.CreateIntentCompletionSettings(),
            functionName: "UserIntentExtraction",
            description: "Extract user intent"
        );

        var result = await completionFunction.InvokeAsync(this._kernel, intentContext, cancellationToken);

        // Get token usage from ChatCompletion result and add to original context
        string? tokenUsage = TokenUtils.GetFunctionTokenUsage(result, this._logger);
        if (tokenUsage is not null)
        {
            context[TokenUtils.GetFunctionKey("SystemIntentExtraction")] = tokenUsage;
        }
        else
        {
            this._logger.LogError("Unable to determine token usage for userIntentExtraction");
        }

        return $"User intent: {result}";
    }

    /// <summary>
    /// Method that wraps GetAllowedChatHistoryAsync to get allotted history messages as one string.
    /// GetAllowedChatHistoryAsync optionally updates a ChatHistory object with the allotted messages,
    /// but the ChatHistory type is not supported when calling from a rendered prompt, so this wrapper bypasses the chatHistory parameter.
    /// </summary>
    /// <param name="cancellationToken">The cancellation token.</param>
    [KernelFunction, Description("Extract chat history")]
    public Task<string> ExtractChatHistory(
        [Description("Chat ID to extract history from")] string chatId,
        [Description("Maximum number of tokens")] int tokenLimit,
        CancellationToken cancellationToken = default
    )
    {
        return this.GetAllowedChatHistoryAsync(chatId, tokenLimit, cancellationToken: cancellationToken);
    }

    /// <summary>
    /// Extract chat history within token limit as a formatted string and optionally update the ChatHistory object with the allotted messages
    /// </summary>
    /// <param name="chatId">Chat ID to extract history from.</param>
    /// <param name="tokenLimit">Maximum number of tokens.</param>
    /// <param name="chatHistory">Optional ChatHistory object tracking allotted messages.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>Chat history as a string.</returns>
    private async Task<string> GetAllowedChatHistoryAsync(
        string chatId,
        int tokenLimit,
        ChatHistory? chatHistory = null,
        CancellationToken cancellationToken = default
    )
    {
        int count = this._qSpecialization?.PastMessagesIncludedCount ?? 100;
        var sortedMessages = await this._chatMessageRepository.FindByChatIdAsync(chatId, 0, count);

        ChatHistory allottedChatHistory = new();
        var remainingToken = tokenLimit;
        string historyText = string.Empty;

        foreach (var chatMessage in sortedMessages)
        {
            var formattedMessage = chatMessage.ToFormattedString();

            if (chatMessage.Type == CopilotChatMessage.ChatMessageType.Document)
            {
                continue;
            }

            var promptRole =
                chatMessage.AuthorRole == CopilotChatMessage.AuthorRoles.Bot ? AuthorRole.System : AuthorRole.User;
            int tokenCount = chatHistory is not null
                ? TokenUtils.GetContextMessageTokenCount(promptRole, formattedMessage)
                : TokenUtils.TokenCount(formattedMessage);

            if (remainingToken - tokenCount >= 0)
            {
                historyText = $"{formattedMessage}\n{historyText}";
                if (chatMessage.AuthorRole == CopilotChatMessage.AuthorRoles.Bot)
                {
                    // Message doesn't have to be formatted for bot. This helps with asserting a natural language response from the LLM (no date or author preamble).
                    allottedChatHistory.AddAssistantMessage(chatMessage.Content.Trim());
                }
                else
                {
                    allottedChatHistory.AddUserMessage(formattedMessage.Trim());
                }

                remainingToken -= tokenCount;
            }
            else
            {
                break;
            }
        }

        chatHistory?.AddRange(allottedChatHistory.Reverse());

        return $"Chat history:\n{historyText.Trim()}";
    }

    /// <summary>
    /// Save a new message to the chat history.
    /// </summary>
    /// <param name="message">The message</param>
    /// <param name="userId">The user ID</param>
    /// <param name="userName"></param>
    /// <param name="chatId">The chat ID</param>
    /// <param name="type">Type of the message</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    private async Task<CopilotChatMessage> SaveNewMessageAsync(
        string message,
        string userId,
        string userName,
        string chatId,
        string type,
        CancellationToken cancellationToken
    )
    {
        // Make sure the chat exists.
        if (!await this._chatSessionRepository.TryFindByIdAsync(chatId))
        {
            throw new ArgumentException("Chat session does not exist.");
        }

        var chatMessage = new CopilotChatMessage(
            userId,
            userName,
            chatId,
            message,
            string.Empty,
            null,
            CopilotChatMessage.AuthorRoles.User,
            // Default to a standard message if the `type` is not recognized
            Enum.TryParse(type, out CopilotChatMessage.ChatMessageType typeAsEnum)
            && Enum.IsDefined(typeof(CopilotChatMessage.ChatMessageType), typeAsEnum)
                ? typeAsEnum
                : CopilotChatMessage.ChatMessageType.Message
        );

        await this._chatMessageRepository.CreateAsync(chatMessage);
        return chatMessage;
    }

    /// <summary>
    /// Save a new response to the chat history.
    /// </summary>
    /// <param name="response">Response from the chat.</param>
    /// <param name="prompt">Prompt used to generate the response.</param>
    /// <param name="chatId">The chat ID</param>
    /// <param name="userId">The user ID</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <param name="tokenUsage">Total token usage of response completion</param>
    /// <param name="citations">Citations for the message</param>
    /// <returns>The created chat message.</returns>
    private async Task<CopilotChatMessage> SaveNewResponseAsync(
        string response,
        string prompt,
        string chatId,
        string userId,
        CancellationToken cancellationToken,
        Dictionary<string, int>? tokenUsage = null,
        IEnumerable<CitationSource>? citations = null
    )
    {
        // Make sure the chat exists.
        if (!await this._chatSessionRepository.TryFindByIdAsync(chatId))
        {
            throw new ArgumentException("Chat session does not exist.");
        }

        // Save message to chat history
        var chatMessage = await this.CreateBotMessageOnClient(
            chatId,
            userId,
            prompt,
            response,
            cancellationToken,
            citations,
            tokenUsage
        );
        await this._chatMessageRepository.UpsertAsync(chatMessage);

        return chatMessage;
    }

    /// <summary>
    /// Updates previously saved response in the chat history.
    /// </summary>
    /// <param name="updatedResponse">Updated response from the chat.</param>
    /// <param name="messageId">The chat message ID.</param>
    /// <param name="chatId">The chat ID that's used as the partition Id.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    private async Task UpdateChatMessageContentAsync(
        string updatedResponse,
        string messageId,
        string chatId,
        CancellationToken cancellationToken
    )
    {
        CopilotChatMessage? chatMessage = null;
        if (!await this._chatMessageRepository.TryFindByIdAsync(messageId, chatId, callback: v => chatMessage = v))
        {
            throw new ArgumentException($"Chat message {messageId} does not exist.");
        }

        chatMessage!.Content = updatedResponse;
        await this._chatMessageRepository.UpsertAsync(chatMessage);
    }

    /// <summary>
    /// Create `OpenAIPromptExecutionSettings` for chat response. Parameters are read from the PromptSettings class.
    /// </summary>
    private OpenAIPromptExecutionSettings CreateChatRequestSettings()
    {
#pragma warning disable SKEXP0010 // Type is for evaluation purposes only and is subject to change or removal in future updates. Suppress this diagnostic to proceed.
        return new OpenAIPromptExecutionSettings
        {
            MaxTokens = this.GetResponseTokenLimit(),
            Temperature = this._promptOptions.ResponseTemperature,
            TopP = this._promptOptions.ResponseTopP,
            FrequencyPenalty = this._promptOptions.ResponseFrequencyPenalty,
            PresencePenalty = this._promptOptions.ResponsePresencePenalty,
            ToolCallBehavior = ToolCallBehavior.AutoInvokeKernelFunctions,
            AzureChatExtensionsOptions = this._qAzureOpenAIChatExtension.GetAzureChatExtensionsOptions(
                this._qSpecialization
            ),
        };
#pragma warning restore SKEXP0010 //Type is for evaluation purposes only and is subject to change or removal in future updates. Suppress this diagnostic to proceed.
    }

    /// <summary>
    /// Create `OpenAIPromptExecutionSettings` for intent response. Parameters are read from the PromptSettings class.
    /// </summary>
    private OpenAIPromptExecutionSettings CreateIntentCompletionSettings()
    {
#pragma warning disable SKEXP0010 // Type is for evaluation purposes only and is subject to change or removal in future updates. Suppress this diagnostic to proceed.
        return new OpenAIPromptExecutionSettings
        {
            MaxTokens = this.GetResponseTokenLimit(),
            Temperature = this._promptOptions.IntentTemperature,
            TopP = this._promptOptions.IntentTopP,
            FrequencyPenalty = this._promptOptions.IntentFrequencyPenalty,
            PresencePenalty = this._promptOptions.IntentPresencePenalty,
            StopSequences = new string[] { "] bot:" },
            AzureChatExtensionsOptions = this._qAzureOpenAIChatExtension.GetAzureChatExtensionsOptions(
                this._qSpecialization
            ),
        };
#pragma warning restore SKEXP0010 //Type is for evaluation purposes only and is subject to change or removal in future updates. Suppress this diagnostic to proceed.
    }

    /// <summary>
    /// Calculate the maximum number of tokens that can be sent in a request
    /// </summary>
    private int GetMaxRequestTokenBudget()
    {
        // OpenAI inserts a message under the hood:
        // "content": "Assistant is a large language model.","role": "system"
        // This burns just under 20 tokens which need to be accounted for.
        const int ExtraOpenAiMessageTokens = 20;
        return this._promptOptions.CompletionTokenLimit // Total token limit
            - ExtraOpenAiMessageTokens
            // Token count reserved for model to generate a response
            - this.GetResponseTokenLimit()
            // Buffer for Tool Calls
            - this._promptOptions.FunctionCallingTokenLimit;
    }

    /// <summary>
    /// Retrieves the token limit for responses.
    /// This method first checks if a specialization exists and has a maximum response token limit set.
    /// If so, it returns that limit; otherwise, it falls back to the default response token limit specified in the prompt options.
    /// </summary>
    /// <returns>The applicable response token limit as an integer.</returns>
    private int GetResponseTokenLimit()
    {
        return this._qSpecialization?.MaxResponseTokenLimit ?? this._promptOptions.ResponseTokenLimit;
    }

    /// <summary>
    /// Gets token usage totals for each semantic function if not undefined.
    /// </summary>
    /// <param name="kernelArguments">Context maintained during response generation.</param>
    /// <param name="content">String representing bot response. If null, response is still being generated or was hardcoded.</param>
    /// <returns>Dictionary containing function to token usage mapping for each total that's defined.</returns>
    private Dictionary<string, int> GetTokenUsages(KernelArguments kernelArguments, string? content = null)
    {
        var tokenUsageDict = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);

        // Total token usage of each semantic function
        foreach (string function in TokenUtils.semanticFunctions.Values)
        {
            if (kernelArguments.TryGetValue($"{function}TokenUsage", out object? tokenUsage))
            {
                if (tokenUsage is string tokenUsageString)
                {
                    tokenUsageDict.Add(function, int.Parse(tokenUsageString, CultureInfo.InvariantCulture));
                }
            }
        }

        if (content != null)
        {
            tokenUsageDict.Add(TokenUtils.semanticFunctions["SystemCompletion"]!, TokenUtils.TokenCount(content));
        }

        return tokenUsageDict;
    }

    /// <summary>
    /// Stream the response to the client.
    /// </summary>
    /// <param name="chatId">The chat ID</param>
    /// <param name="userId">The user ID</param>
    /// <param name="prompt">Prompt used to generate the response</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <param name="citations">Citations for the message</param>
    /// <returns>The created chat message</returns>
    private async Task<CopilotChatMessage> StreamResponseToClientAsync(
        string chatId,
        string userId,
        BotResponsePrompt prompt,
        KernelArguments chatContext,
        CancellationToken cancellationToken,
        IEnumerable<CitationSource>? citations = null
    )
    {
        // Create the stream
        var chatCompletion = this._kernel.GetRequiredService<IChatCompletionService>();
        var stream = chatCompletion.GetStreamingChatMessageContentsAsync(
            prompt.MetaPromptTemplate,
            this.CreateChatRequestSettings(),
            this._kernel,
            cancellationToken
        );

        // Create message on client
        var chatMessage = await this.CreateBotMessageOnClient(
            chatId,
            userId,
            JsonSerializer.Serialize(prompt),
            string.Empty,
            cancellationToken,
            citations
        );

        var responseCitations = new List<CitationSource>();
        var citationCountMap = new Dictionary<string, int>();
        var citationIndexMap = new Dictionary<string, int>();
        var citationPattern = new Regex(@"\[(doc\d+)\](,)?");
        var accumulatedContent = new StringBuilder();

        // Determine the citations based on whether the current specialization matches the default
        var citationsToUse =
            this._qSpecialization?.Id == this._qAzureOpenAIChatExtension.DefaultSpecialization
                ? citations
                : new List<CitationSource>();

        // Stream the message to the client
        await foreach (var contentPiece in stream)
        {
            accumulatedContent.Append(contentPiece.ToString());
            if (contentPiece.InnerContent is not null)
            {
                Azure.AI.OpenAI.StreamingChatCompletionsUpdate actx = (Azure.AI.OpenAI.StreamingChatCompletionsUpdate)
                    contentPiece.InnerContent;
                if (actx.AzureExtensionsContext != null && actx.AzureExtensionsContext.Citations != null)
                {
                    foreach (
                        AzureChatExtensionDataSourceResponseCitation citation in actx.AzureExtensionsContext.Citations
                    )
                    {
                        var sourceName = citation.Filepath;
                        var link = citation.Filepath;
                        if (citationCountMap.TryGetValue(sourceName, out int count))
                        {
                            citationCountMap[sourceName]++;
                            sourceName = $"{sourceName} - Part {citationCountMap[sourceName]}";
                        }
                        else
                        {
                            citationCountMap[sourceName] = 1;
                            // Check if this is the only occurrence
                            if (actx.AzureExtensionsContext.Citations.Count(c => c.Filepath == citation.Filepath) > 1)
                            {
                                sourceName = $"{sourceName} - Part 1";
                            }
                        }
                        // Collect citation here
                        string fileExtension = Path.GetExtension(link).TrimStart('.').ToLower(); // Extract and normalize the file extension
                        string contentType = fileExtension switch
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

                        responseCitations.Add(
                            new CitationSource
                            {
                                Link = link,
                                SourceName = sourceName,
                                Snippet = citation.Content,
                                SourceContentType = contentType, // Use the dynamically determined content type
                            }
                        );
                    }
                }
            }

            // Filter citations to include only those referenced in the current content piece
            var referencedCitations = new HashSet<string>();
            var matches = citationPattern.Matches(accumulatedContent.ToString());
            foreach (Match match in matches)
            {
                if (match.Groups.Count > 1)
                {
                    var referenceIndex = int.Parse(match.Groups[1].Value.AsSpan(3), CultureInfo.InvariantCulture) - 1; // Extract the index from "docX"
                    if (referenceIndex >= 0 && referenceIndex < responseCitations.Count)
                    {
                        referencedCitations.Add(responseCitations[referenceIndex].SourceName);
                    }
                }
            }

            var filteredCitations = responseCitations
                .Where(citation => referencedCitations.Contains(citation.SourceName))
                .ToList();

            // Replace citations with superscript numbers in the current content piece
            var processedContentPiece = citationPattern.Replace(
                contentPiece.ToString(),
                match =>
                {
                    var citationKey = match.Groups[1].Value;
                    if (!citationIndexMap.TryGetValue(citationKey, out int value))
                    {
                        value = citationIndexMap.Count + 1;
                        citationIndexMap[citationKey] = value;
                    }
                    return $"^{value}^";
                }
            );

            // Update the message content and citations on the client
            chatMessage.Content += processedContentPiece;

            // Determine citations based on specialization
            if (this._qSpecialization?.Id != this._qAzureOpenAIChatExtension.DefaultSpecialization)
            {
                chatMessage.Citations = filteredCitations;
            }

            // Update the message on the client with the new content and possibly updated citations
            await this.UpdateMessageOnClient(chatMessage, cancellationToken);
        }

        return chatMessage;
    }

    /// <summary>
    /// Create an empty message on the client to begin the response.
    /// </summary>
    /// <param name="chatId">The chat ID</param>
    /// <param name="userId">The user ID</param>
    /// <param name="prompt">Prompt used to generate the message</param>
    /// <param name="content">Content of the message</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <param name="citations">Citations for the message</param>
    /// <param name="tokenUsage">Total token usage of response completion</param>
    /// <returns>The created chat message</returns>
    private async Task<CopilotChatMessage> CreateBotMessageOnClient(
        string chatId,
        string userId,
        string prompt,
        string content,
        CancellationToken cancellationToken,
        IEnumerable<CitationSource>? citations = null,
        Dictionary<string, int>? tokenUsage = null
    )
    {
        var chatMessage = CopilotChatMessage.CreateBotResponseMessage(chatId, content, prompt, citations, tokenUsage);
        await this
            ._messageRelayHubContext.Clients.Group(chatId)
            .SendAsync("ReceiveMessage", chatId, userId, chatMessage, cancellationToken);
        return chatMessage;
    }

    /// <summary>
    /// Update the response on the client.
    /// </summary>
    /// <param name="message">The message</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    private async Task UpdateMessageOnClient(CopilotChatMessage message, CancellationToken cancellationToken)
    {
        await this
            ._messageRelayHubContext.Clients.Group(message.ChatId)
            .SendAsync("ReceiveMessageUpdate", message, cancellationToken);
    }

    /// <summary>
    /// Update the status of the response on the client.
    /// </summary>
    /// <param name="chatId">The chat ID</param>
    /// <param name="status">Current status of the response</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    private async Task UpdateBotResponseStatusOnClientAsync(
        string chatId,
        string status,
        CancellationToken cancellationToken
    )
    {
        await this
            ._messageRelayHubContext.Clients.Group(chatId)
            .SendAsync("ReceiveBotResponseStatus", chatId, status, cancellationToken);
    }

    /// <summary>
    /// Set the system description in the prompt options.
    /// </summary>
    /// <param name="chatId">Id of the chat session</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <exception cref="ArgumentException">Throw if the chat session does not exist.</exception>
    private async Task SetSystemDescriptionAsync(string chatId, CancellationToken cancellationToken)
    {
        ChatSession? chatSession = null;
        if (!await this._chatSessionRepository.TryFindByIdAsync(chatId, callback: v => chatSession = v))
        {
            throw new ArgumentException("Chat session does not exist.");
        }

        this._promptOptions.SystemDescription = chatSession!.SafeSystemDescription;
    }
}
