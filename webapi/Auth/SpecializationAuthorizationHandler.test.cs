using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using CopilotChat.WebApi.Context;
using CopilotChat.WebApi.Models.Storage;
using CopilotChat.WebApi.Storage;
using Microsoft.AspNetCore.Authorization;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;

namespace CopilotChat.WebApi.Auth;

[TestClass]
public class SpecializationAuthorizationHandlerTest
{
    private const string CHAT_ID = "9845c881-0d77-4cf2-8211-85556de26c15";
    private const string SPECIALIZATION_ID = "b10723df-8312-41b6-be80-703f0af2e192";
    private const string GROUP_ID = "e67ecc45-b456-4109-9546-c177800d0186";
    private SpecializationAuthorizationHandler? handler;
    private AuthorizationHandlerContext? context;
    private ChatSession? chatSession;
    private Mock<IContextValueAccessor>? resource;
    private Mock<IStorageContext<ChatSession>>? chatSessionContext;
    private Mock<IStorageContext<Specialization>>? specializationContext;

    private AuthorizationHandlerContext BuildAuthorizationContext(IEnumerable<Claim> claims)
    {
        var requirements = new[] { new SpecializationRequirement() };

        var user = new ClaimsPrincipal(
                new ClaimsIdentity(
                    claims,
                    "auth"));

        this.resource = new();
        this.resource.Setup(r => r.GetRouteValue("chatId")).Returns(CHAT_ID);

        return new(requirements, user, this.resource.Object);
    }

    [TestInitialize]
    public void Setup()
    {
        this.chatSession = new ChatSession(
                "title",
                "description",
                SPECIALIZATION_ID,
                CHAT_ID);
        var specialization = new Specialization() { GroupMemberships = new[] { GROUP_ID } };

        this.specializationContext = new();
        this.specializationContext.Setup(s => s.ReadAsync(SPECIALIZATION_ID, SPECIALIZATION_ID)).Returns(Task.FromResult(specialization));

        this.chatSessionContext = new();
        this.chatSessionContext.Setup(c => c.ReadAsync(CHAT_ID, CHAT_ID)).Returns(Task.FromResult(this.chatSession));

        this.handler = new(
                new Mock<SpecializationRepository>(this.specializationContext.Object).Object,
                new Mock<ChatSessionRepository>(this.chatSessionContext.Object).Object);

        this.context = this.BuildAuthorizationContext(new[] { new Claim("groups", GROUP_ID) });
    }

    [TestMethod]
    public async Task UserWithGroupMembership_Should_Succeed()
    {
        await this.handler!.HandleAsync(this.context!);

        Assert.IsTrue(this.context!.HasSucceeded);
    }

    [TestMethod]
    public async Task UserWithoutGroupMembership_Should_NotSucceed()
    {
        var context = this.BuildAuthorizationContext(new Claim[0]);

        await this.handler!.HandleAsync(context);

        Assert.IsFalse(context.HasSucceeded);
    }

    [TestMethod]
    public async Task ChatSessionWithoutSpecialization_Should_Succeed()
    {
        this.chatSession!.specializationId = string.Empty;

        await this.handler!.HandleAsync(this.context!);

        Assert.IsTrue(this.context!.HasSucceeded);
    }

    [TestMethod]
    public async Task RequestWithoutChatId_Should_NotSucceed()
    {
        this.resource!.Setup(r => r.GetRouteValue("chatId")).Returns(string.Empty);

        await this.handler!.HandleAsync(this.context!);

        Assert.IsFalse(this.context!.HasSucceeded);
    }

    [TestMethod]
    public async Task NullChatSession_Should_NotSucceed()
    {
        this.chatSessionContext!.Setup(c => c.ReadAsync(CHAT_ID, CHAT_ID)).Returns(Task.FromResult<ChatSession>(null));

        await this.handler!.HandleAsync(this.context!);

        Assert.IsFalse(this.context!.HasSucceeded);
    }

    [TestMethod]
    public async Task NullSpecialization_Should_NotSucceed()
    {
        this.specializationContext!.Setup(c => c.ReadAsync(SPECIALIZATION_ID, SPECIALIZATION_ID)).Returns(Task.FromResult<Specialization>(null));

        await this.handler!.HandleAsync(this.context!);

        Assert.IsFalse(this.context!.HasSucceeded);
    }
}
