using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace CopilotChat.WebApi.Utilities;

[TestClass]
public class RequestUtilsTest
{
    [TestMethod]
    public void GetSanitizedParameter_SanitizeParameterString()
    {
        var expected = "ca138d45-9785-4ff3-9119-e77c5341ba95";
        var parameterValue = $"ca138d45{Environment.NewLine}-9785-4ff3-9119-e77c5341ba95{Environment.NewLine}";

        Assert.AreEqual(expected, RequestUtils.GetSanitizedParameter(parameterValue));
    }
}

