using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.Models;
using System;

namespace server.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class ShortUrlController : ControllerBase
	{
		private readonly URLContext _context;

		public ShortUrlController(URLContext context)
		{
			_context = context;
		}

		[HttpPost("shorten")]
		public async Task<IActionResult> ShortenUrl([FromBody] ShortUrlDTO request)
		{
			if (string.IsNullOrEmpty(request.URL))
			{
				return BadRequest("URL không hợp lệ.");
			}
			
			string shortCode = GenerateRandomURL();// random
			var shortUrl = new ShortUrl
			{
				URL = request.URL,
				ShortURL = shortCode
			};

			_context.ShortUrls.Add(shortUrl); // them ca 2 vao dtbase
			await _context.SaveChangesAsync();

			var shortLink = $"{Request.Scheme}://{Request.Host}/api/shorturl/{shortCode}"; //.Scheme(http || https) .Host(domain)
			return Ok(new { shortUrl = shortLink });
		}

		// lay URL goc tu shortUrl
		[HttpGet("{code}")] // "code" trong domain
		public async Task<IActionResult> RedirectUrl(string code)
		{
			var url = await _context.ShortUrls.FirstOrDefaultAsync(x => x.ShortURL == code); // search shortURL trong database
			if (url == null)
			{
				return NotFound("Short URL not exist");
			}
			return Redirect(url.URL);// tra ve URL goc 
		}
	
		private string GenerateRandomURL(int length = 6)
		{
			const string chars = "qwertyuiopasdfghjklzxcvbnm1234567890QWERTYUIOPASDFGHJKKLZXCVBNM";
			var random = new Random();
			return new string(Enumerable.Repeat(chars, length)
										.Select(s => s[random.Next(s.Length)]).ToArray());
		}
	}

	
}
