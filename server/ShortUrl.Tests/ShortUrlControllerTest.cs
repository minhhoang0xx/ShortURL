using Microsoft.EntityFrameworkCore;
using Xunit;
using Moq;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using server.Controllers;
using server.Data;
using server.Models;
using System.Dynamic;
using System.Text.Json;
using System.Collections.Generic;
using Microsoft.AspNetCore.Http;


namespace ShortUrl.Tests
{
	public class ShortUrlControllerTest
	{
		private readonly ShortUrlController _controller;
		private readonly URLContext _context;
		public ShortUrlControllerTest()
		{
			// tao database InMemory de test
			var options = new DbContextOptionsBuilder<URLContext>()
				.UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString()).Options;
			_context = new URLContext(options);

			_context.ShortUrls.Add(new ShortURL_Link { ShortId = 1, ProjectName = "Project 1", OriginalUrl = "https://example1.com", Domain = "https://short1", Alias = "abc1", QrCode ="qrcode1"});
			_context.ShortUrls.Add(new ShortURL_Link { ShortId = 2, ProjectName = "Project 2", OriginalUrl = "https://example2.com", Domain = "https://short2", Alias = "abc2", QrCode = "qrcode2" });
			_context.SaveChanges();

			_controller = new ShortUrlController(_context);
		}
		[Fact]
		public async Task GetAllUrls_ReturnsListOfUrls()
		{
			var result = await _controller.getAllUrl();

			var okResult = Assert.IsType<OkObjectResult>(result);
			var urls = Assert.IsAssignableFrom<IEnumerable<object>>(okResult.Value);
			Assert.Equal(2, urls.Count());
		}

		[Fact]
		public async Task GetUrlInfo_ReturnsUrls()
		{
			var result = await _controller.GetUrlInfo(1);

			var okResult = Assert.IsType<OkObjectResult>(result);
			var json = JsonSerializer.Serialize(okResult.Value); // Convert sang JSON
			var response = JsonSerializer.Deserialize<Dictionary<string, object>>(json); 

			Assert.NotNull(response);
			Assert.Equal("https://short1", response["domain"].ToString());
			Assert.Equal("abc1", response["alias"].ToString());
		}
		[Fact]
		public async Task ShortOriginalUrl_ToShorterUrl()
		{
			var newUrl = new ShortURL_LinkDTO
			{
				ProjectName = "Project C",
				OriginalUrl = "https://example3.com",
				Domain = "https://short3",
				Alias = "abc3",
				QrCode ="qrCode3"
			};
			var result = await _controller.ShorterUrl(newUrl);
			var okResult = Assert.IsType<OkObjectResult>(result);
			var json = JsonSerializer.Serialize(okResult.Value); // Convert sang JSON
			var response = JsonSerializer.Deserialize<Dictionary<string, object>>(json);

			Assert.Equal("https://short3/abc3", response["shortLink"].ToString().Trim());
		}
		[Fact]
		public async Task getOriginalUrl_FromShorterUrl()
		{
			var code = "abc1";
			var result = await _controller.RedirectUrl(code);
			var OkObjectResult = Assert.IsType<OkObjectResult>(result);
			Assert.Equal("https://example1.com", OkObjectResult.Value);
		}
		[Fact]
		public async Task Update_ShortUrl()
		{
			var newUrl = new ShortURL_LinkDTO
			{
				ProjectName = "Project 1",
				OriginalUrl = "https://example1ed",
				Domain = "https://edited",
				Alias = "1ed"
			};
			var result = await _controller.UpdateUrl(1, newUrl);
			var okResult = Assert.IsType<OkObjectResult>(result);
			var json = JsonSerializer.Serialize(okResult.Value); // Convert sang JSON
			var response = JsonSerializer.Deserialize<Dictionary<string, object>>(json);
			Assert.Equal("https://edited/1ed", response["shortLink"].ToString().Trim());
		}
		[Fact]
		public async Task Delete_ShortUrl()
		{
			var result = await _controller.DeleteUrl(1);
			var okResul = Assert.IsType<OkObjectResult>(result);
			var deletedUrl = await _context.ShortUrls.FindAsync(1);
			Assert.Null(deletedUrl);
			var count = await _context.ShortUrls.CountAsync();
			Assert.Equal(1, count);
		}
	}
}