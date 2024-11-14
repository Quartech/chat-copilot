using Microsoft.AspNetCore.Http;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using System;

namespace CopilotChat.WebApi.Context;

[TestClass]
public class ContextValueAccessorTest
{
    private const string ID_KEY = "id";

    Mock<IHttpContextAccessor>? mockAccessor;
    DefaultHttpContext? context;
    ContextValueAccessor? accessor;
    string? id;

    [TestInitialize]
    public void Setup()
    {
        mockAccessor = new();
        context = new();

        id = Guid.NewGuid().ToString();
        context.Request.RouteValues.Add(ID_KEY, id);
        mockAccessor.Setup(m => m.HttpContext).Returns(context);

        accessor = new(mockAccessor.Object);
    }

    [TestMethod]
    public void GetRouteValue_ShouldRetrieveValue()
    {
        var value = accessor!.GetRouteValue(ID_KEY);

        Assert.AreEqual(id, value);
    }

    [TestMethod]
    public void GetRouteValue_ShouldRetrieveNull()
    {
        var value = accessor!.GetRouteValue("BardicInspiration");

        Assert.AreEqual(value, null);
    }

    [TestMethod]
    public void GetRouteValue_ShouldRetrieveNull_WhenContextNull()
    {
        context = null;
        mockAccessor!.Setup(m => m.HttpContext).Returns(context);

        var value = accessor!.GetRouteValue(ID_KEY);

        Assert.AreEqual(value, null);
    }
}
