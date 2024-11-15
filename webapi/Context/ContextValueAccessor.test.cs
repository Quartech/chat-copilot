using System;
using Microsoft.AspNetCore.Http;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;

namespace CopilotChat.WebApi.Context;

[TestClass]
public class ContextValueAccessorTest
{
    private const string ID_KEY = "id";
    private Mock<IHttpContextAccessor>? mockAccessor;
    private DefaultHttpContext? context;
    private ContextValueAccessor? accessor;
    private string? id;

    [TestInitialize]
    public void Setup()
    {
        this.mockAccessor = new();
        this.context = new();

        this.id = Guid.NewGuid().ToString();
        this.context.Request.RouteValues.Add(ID_KEY, this.id);
        this.mockAccessor.Setup(m => m.HttpContext).Returns(this.context);

        this.accessor = new(this.mockAccessor.Object);
    }

    [TestMethod]
    public void GetRouteValue_ShouldRetrieveValue()
    {
        var value = this.accessor!.GetRouteValue(ID_KEY);

        Assert.AreEqual(this.id, value);
    }

    [TestMethod]
    public void GetRouteValue_ShouldRetrieveNull()
    {
        var value = this.accessor!.GetRouteValue("BardicInspiration");

        Assert.AreEqual(value, null);
    }

    [TestMethod]
    public void GetRouteValue_ShouldRetrieveNull_WhenContextNull()
    {
        this.context = null;
        this.mockAccessor!.Setup(m => m.HttpContext).Returns(this.context);

        var value = this.accessor!.GetRouteValue(ID_KEY);

        Assert.AreEqual(value, null);
    }
}
