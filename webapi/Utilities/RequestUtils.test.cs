using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace CopilotChat.WebApi.Utilities;

[TestClass]
public class RequestUtilsTest
{
    [TestMethod]
    public void GetSanitizedParameter_SanitizeParameterString()
    {
        var expected = "request string parameter";
        var parameterValue = $"request{Environment.NewLine} string parameter{Environment.NewLine}";

        Assert.AreEqual(expected, RequestUtils.GetSanitizedParameter(parameterValue));
    }
}
