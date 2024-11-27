using System;
using System.IO;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;

namespace CopilotChat.WebApi.Context;

[TestClass]
public class ContextBodyAccessorTest
{
    private Mock<IHttpContextAccessor>? mockAccessor;
    private DefaultHttpContext? context;
    private ContextBodyAccessor? accessor;
    private Guid? id;
    private TestObject? body;

    [TestInitialize]
    public void Setup()
    {
        this.id = Guid.NewGuid();
        this.body = new() { Id = this.id };
        var stream = new MemoryStream(Encoding.BigEndianUnicode.GetBytes(JsonSerializer.Serialize(this.body)));

        this.context = new()
        {
            Request =
            {
                Body = stream,
                ContentLength = stream.Length
            }
        };

        this.mockAccessor = new();
        this.mockAccessor.Setup(m => m.HttpContext).Returns(this.context);

        this.accessor = new(this.mockAccessor.Object);
    }

    [TestMethod]
    public async Task ReadBody_ShouldRetrieveValue()
    {
        var value = await this.accessor!.ReadBody<TestObject>();

        Assert.AreEqual(this.body!.Id, value!.Id);
    }

    [TestMethod]
    public async Task ReadBody_ShouldRetrieveNull()
    {
        this.context = new();
        this.mockAccessor!.Setup(m => m.HttpContext).Returns(this.context);

        var value = await this.accessor!.ReadBody<TestObject>();

        Assert.AreEqual(null, value);
    }

    [TestMethod]
    public async Task ReadBody_ShouldRetrieveNull_WhenContextNull()
    {
        this.context = null;
        this.mockAccessor!.Setup(m => m.HttpContext).Returns(this.context);

        var value = await this.accessor!.ReadBody<TestObject>();

        Assert.AreEqual(null, value);
    }
}

class TestObject
{
    public Guid? Id { get; set; }
}
