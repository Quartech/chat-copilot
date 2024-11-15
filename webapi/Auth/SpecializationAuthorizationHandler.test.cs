using CopilotChat.WebApi.Context;
using CopilotChat.WebApi.Models.Storage;
using CopilotChat.WebApi.Storage;
using Microsoft.AspNetCore.Authorization;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;

namespace CopilotChat.WebApi.Auth;

[TestClass]
public class SpecializationAuthorizationHandlerTest
{
    const string CHAT_ID = "9845c881-0d77-4cf2-8211-85556de26c15";
    const string SPECIALIZATION_ID = "b10723df-8312-41b6-be80-703f0af2e192";
    const string GROUP_ID = "e67ecc45-b456-4109-9546-c177800d0186";

    SpecializationAuthorizationHandler? handler;
    AuthorizationHandlerContext? context;
    ChatSession? chatSession;
    Mock<IContextValueAccessor>? resource;
    Mock<IStorageContext<ChatSession>>? chatSessionContext;
    Mock<IStorageContext<Specialization>>? specializationContext;

    private AuthorizationHandlerContext BuildAuthorizationContext(IEnumerable<Claim> claims)
    {
        var requirements = new [] { new SpecializationRequirement() };

        var user = new ClaimsPrincipal(
                new ClaimsIdentity(
                    claims,
                    "auth"));

        resource = new();
        resource.Setup(r => r.GetRouteValue("chatId")).Returns(CHAT_ID);

        return new(requirements, user, resource.Object);
    }

    [TestInitialize]
    public void Setup()
    {
        chatSession = new ChatSession(
                "title",
                "description",
                SPECIALIZATION_ID,
                CHAT_ID);
        var specialization = new Specialization() { GroupMemberships = new [] { GROUP_ID } };

        specializationContext = new();
        specializationContext.Setup(s => s.ReadAsync(SPECIALIZATION_ID, SPECIALIZATION_ID)).Returns(Task.FromResult(specialization));

        chatSessionContext = new();
        chatSessionContext.Setup(c => c.ReadAsync(CHAT_ID, CHAT_ID)).Returns(Task.FromResult(chatSession));

        handler = new(
                new Mock<SpecializationRepository>(specializationContext.Object).Object,
                new Mock<ChatSessionRepository>(chatSessionContext.Object).Object);

        context = BuildAuthorizationContext(new [] { new Claim("groups", GROUP_ID) });
    }

    [TestMethod]
    public async Task UserWithGroupMembership_Should_Succeed()
    {
        await handler!.HandleAsync(context!);

        Assert.IsTrue(context!.HasSucceeded);
    }

    [TestMethod]
    public async Task UserWithoutGroupMembership_Should_NotSucceed()
    {
        var context = BuildAuthorizationContext(new Claim[0]);

        await handler!.HandleAsync(context);

        Assert.IsFalse(context.HasSucceeded);
    }

    [TestMethod]
    public async Task ChatSessionWithoutSpecialization_Should_Succeed()
    {
        chatSession!.specializationId = string.Empty;

        await handler!.HandleAsync(context!);

        Assert.IsTrue(context!.HasSucceeded);
    }

    [TestMethod]
    public async Task RequestWithoutChatId_Should_NotSucceed()
    {
        resource!.Setup(r => r.GetRouteValue("chatId")).Returns(string.Empty);

        await handler!.HandleAsync(context!);

        Assert.IsFalse(context!.HasSucceeded);
    }

    [TestMethod]
    public async Task NullChatSession_Should_NotSucceed()
    {
        chatSessionContext!.Setup(c => c.ReadAsync(CHAT_ID, CHAT_ID)).Returns(Task.FromResult<ChatSession>(null));

        await handler!.HandleAsync(context!);

        Assert.IsFalse(context!.HasSucceeded);
    }

    [TestMethod]
    public async Task NullSpecialization_Should_NotSucceed()
    {
        specializationContext!.Setup(c => c.ReadAsync(SPECIALIZATION_ID, SPECIALIZATION_ID)).Returns(Task.FromResult<Specialization>(null));

        await handler!.HandleAsync(context!);

        Assert.IsFalse(context!.HasSucceeded);
    }
}
