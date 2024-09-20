using System.Threading.Tasks;
using Azure.Storage.Blobs;
using CopilotChat.WebApi.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;

namespace Copilogics.WebApi.Services
{
    [TestClass]
    public class QBlobStorageTests
    {
        [DataRow(true)]
        [DataRow(false)]
        [TestMethod]
        // Tests if the BlobExistsAsync method returns correctly when the blob exists or not
        public async Task BlobExistsAsync_TestBlobExists(bool exists)
        {
            var blobServiceClientMock = new Mock<BlobServiceClient>();
            var blobContainerClientMock = new Mock<BlobContainerClient>();
            var blobClientMock = new Mock<BlobClient>();

            blobContainerClientMock
                .Setup(mock => mock.GetBlobClient(It.IsAny<string>()))
                .Returns(blobClientMock.Object);

            blobClientMock
                .Setup(mock => mock.ExistsAsync(It.IsAny<System.Threading.CancellationToken>()))
                .Returns(Task.FromResult(Azure.Response.FromValue(exists, It.IsAny<Azure.Response>())));

            var qBlobStorage = new QBlobStorage(blobServiceClientMock.Object, blobContainerClientMock.Object);

            var blobExists = await qBlobStorage.BlobExistsAsync(new System.Uri("https://www.example.com/index.html"));

            Assert.AreEqual(blobExists, exists);
        }

        [TestMethod]
        // Tests if the BlobExistsAsync method returns false when the method throws an error
        public async Task BlobExistsAsync_TestThrownError()
        {
            var blobServiceClientMock = new Mock<BlobServiceClient>();
            var blobContainerClientMock = new Mock<BlobContainerClient>();
            var blobClientMock = new Mock<BlobClient>();

            blobContainerClientMock
                .Setup(mock => mock.GetBlobClient(It.IsAny<string>()))
                .Throws(new Azure.RequestFailedException("Blob not found"));

            var qBlobStorage = new QBlobStorage(blobServiceClientMock.Object, blobContainerClientMock.Object);

            var blobExists = await qBlobStorage.BlobExistsAsync(new System.Uri("https://www.example.com/index.html"));

            Assert.AreEqual(blobExists, false);
        }

        [TestMethod]
        // Tests if the AddBlobAsync method returns a URI
        public async Task AddBlobAsync_ReturnsURI()
        {
            var blobServiceClientMock = new Mock<BlobServiceClient>();
            var blobContainerClientMock = new Mock<BlobContainerClient>();
            var blobClientMock = new Mock<BlobClient>();

            var blobMock = new Mock<IFormFile>();

            blobMock.Setup(mock => mock.FileName).Returns("file.txt");
            blobMock.Setup(mock => mock.OpenReadStream()).Returns(new System.IO.MemoryStream());

            blobClientMock.Setup(mock => mock.Uri).Returns(new System.Uri("https://www.example.com/index.html"));

            // Validating that the blob client is created with the correct file name
            // ie: file$1000-1000-1000-1000.txt
            blobContainerClientMock
                .Setup(mock =>
                    mock.GetBlobClient(
                        It.IsRegex(
                            @"file\$\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\.txt\b"
                        )
                    )
                )
                .Returns(blobClientMock.Object);

            var qBlobStorage = new QBlobStorage(blobServiceClientMock.Object, blobContainerClientMock.Object);

            var uri = await qBlobStorage.AddBlobAsync(blobMock.Object);

            Assert.AreEqual(uri, "https://www.example.com/index.html");
        }

        [TestMethod]
        // Tests if the DeleteBlobByURIAsync method returns a URI
        public async Task DeleteBlobURIAsync_ReturnsURI()
        {
            var blobServiceClientMock = new Mock<BlobServiceClient>();
            var blobContainerClientMock = new Mock<BlobContainerClient>();
            var blobClientMock = new Mock<BlobClient>();

            blobContainerClientMock
                .Setup(mock => mock.GetBlobClient(It.IsAny<string>()))
                .Returns(blobClientMock.Object);

            try
            {
                var qBlobStorage = new QBlobStorage(blobServiceClientMock.Object, blobContainerClientMock.Object);
                await qBlobStorage.DeleteBlobByURIAsync(new System.Uri("https://www.example.com/index.html"));
            }
            catch (Azure.RequestFailedException)
            {
                Assert.Fail("DeleteBlobURIAsync_ReturnsURI: An exception should not have been thrown.");
            }
        }
    }
}
