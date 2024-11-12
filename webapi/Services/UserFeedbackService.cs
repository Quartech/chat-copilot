using System.Collections.Generic;
using System.Threading.Tasks;
using CopilotChat.WebApi.Models.Request;
using CopilotChat.WebApi.Models.Storage;
using CopilotChat.WebApi.Storage;

namespace CopilotChat.WebApi.Services;

public class UserFeedbackService : IUserFeedbackService
{
    private ChatMessageRepository _messageRepository;

    public UserFeedbackService(ChatMessageRepository messageRepository)
    {
        this._messageRepository = messageRepository;
    }

    public Task<IEnumerable<CopilotChatMessage>> Search(UserFeedbackFilter filter)
    {
        return this._messageRepository.QueryEntitiesAsync(m => m.UserFeedback != null);
    }
}
