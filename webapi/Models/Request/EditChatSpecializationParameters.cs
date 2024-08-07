// Copyright (c) Microsoft. All rights reserved.

namespace CopilotChat.WebApi.Models.Request;

/// <summary>
/// Parameters for editing chat session.
/// </summary>
public class EditChatSpecializationParameters
{
    /// <summary>
    /// Specialization of the chat that is used to generate responses.
    /// </summary>
    public string SpecializationKey { get; set; } = "general";

}
