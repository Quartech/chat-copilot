using System.Security.Claims;
using System.Threading.Tasks;
using CopilotChat.WebApi.Auth.Specializations.Models;
using CopilotChat.WebApi.Context;
using CopilotChat.WebApi.Models.Storage;
using CopilotChat.WebApi.Storage;
using Microsoft.AspNetCore.Authorization;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;

namespace CopilotChat.WebApi.Auth.Specializations;

[TestClass]
public class AuthorizationHandlerTest
{
    private const string SPECIALIZATION_ID = "ce2a1f91-09a2-41c0-9017-f0fc88c588a2";
    private const string GROUP_ID = "7d5a7972-9d8f-48b1-9248-fdb38967a427";
    private AuthorizationHandler? handler;
    private AuthorizationHandlerContext? context;
    private Mock<IStorageContext<Specialization>>? specializationContext;
    private Mock<IContextBodyAccessor>? contextBodyAccessor;

    [TestInitialize]
    public void Setup()
    {
        var specializationBody = new SpecializationBody() { SpecializationId = SPECIALIZATION_ID };
        var specialization = new Specialization() { GroupMemberships = new[] { GROUP_ID } };

        this.specializationContext = new();
        this.specializationContext.Setup(m => m.ReadAsync(SPECIALIZATION_ID, SPECIALIZATION_ID))
            .Returns(Task.FromResult(specialization));

        this.contextBodyAccessor = new();
        this.contextBodyAccessor.Setup(m => m.ReadBody<SpecializationBody>())
            .Returns(Task.FromResult<SpecializationBody?>(specializationBody));

        this.handler = new(
            new Mock<SpecializationRepository>(this.specializationContext.Object).Object,
            this.contextBodyAccessor.Object
        );

        this.context = AuthorizationTestContext.BuildAuthorizationContext(new[] { new Claim("groups", GROUP_ID) });
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
        var context = AuthorizationTestContext.BuildAuthorizationContext(new Claim[0]);

        await this.handler!.HandleAsync(context);

        Assert.IsFalse(context.HasSucceeded);
    }

    [TestMethod]
    public async Task NullContextBody_Should_NotSucceed()
    {
        this.contextBodyAccessor!.Setup(m => m.ReadBody<SpecializationBody>())
            .Returns(Task.FromResult<SpecializationBody?>(null));

        await this.handler!.HandleAsync(this.context!);

        Assert.IsFalse(this.context!.HasSucceeded);
    }

    [TestMethod]
    [DataRow(null)]
    [DataRow("")]
    public async Task NullSpecializationId_Should_NotSucceed(string? specializationId)
    {
        var specializationBody = new SpecializationBody() { SpecializationId = specializationId };
        this.contextBodyAccessor!.Setup(m => m.ReadBody<SpecializationBody>())
            .Returns(Task.FromResult<SpecializationBody?>(specializationBody));

        await this.handler!.HandleAsync(this.context!);

        Assert.IsFalse(this.context!.HasSucceeded);
    }

    [TestMethod]
    public async Task NullSpecialization_Should_NotSucceed()
    {
        this.specializationContext!.Setup(m => m.ReadAsync(SPECIALIZATION_ID, SPECIALIZATION_ID))
            .Returns(Task.FromResult((Specialization?)null));

        await this.handler!.HandleAsync(this.context!);

        Assert.IsFalse(this.context!.HasSucceeded);
    }

    [TestMethod]
    public async Task SpecializationWithoutGroupMembership_Should_NotSucceed()
    {
        var specialization = new Specialization();
        this.specializationContext!.Setup(m => m.ReadAsync(SPECIALIZATION_ID, SPECIALIZATION_ID))
            .Returns(Task.FromResult(specialization));

        await this.handler!.HandleAsync(this.context!);

        Assert.IsFalse(this.context!.HasSucceeded);
    }
}
