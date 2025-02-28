﻿using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.Models;
using System;
using System.Xml.Serialization;

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

		[HttpGet("getAll")]
		public async Task<IActionResult> getAllUrl()
		{
			var urls = await _context.ShortUrls.ToListAsync();
			var result = urls.Select(url => new {
				id = url.ID,
				projectName = url.projectName,
				originalUrl = url.originalUrl,
				domain = url.domain,
				alias = url.alias,
				shortLink = $"{url.domain}/{url.alias}",
				createAt = url.CreateAt
			});

			return Ok(result);
		}
		// Lay thong tin URL bang ID
		[HttpGet("getLink/{id}")]
		public async Task<IActionResult> GetUrlInfo(int id)
		{
			var url = await _context.ShortUrls.FindAsync(id);
			if (url == null)
			{
				return NotFound("ShortURL not exist");
			}

			var shortLink = $"{url.domain}/{url.alias}";
			return Ok(new
			{
				id = url.ID,
				projectName = url.projectName,
				originalUrl = url.originalUrl,
				domain = url.domain,
				alias = url.alias,
				shortLink,
				createAt = url.CreateAt
			});
		}


		// gan Url goc va short Url vao database
		[HttpPost("shorter")]
		public async Task<IActionResult> ShorterUrl([FromBody] ShortUrlDTO request)
		{
			if (string.IsNullOrEmpty(request.originalUrl))
			{
				return BadRequest("URL is not validate");
			}
			string shortCode = request.alias;
			if (string.IsNullOrEmpty(request.alias))
			{
				shortCode = GenerateRandomURL();
			}else{
				var existingUrl = await _context.ShortUrls.FirstOrDefaultAsync(x => x.alias == shortCode);
				if (existingUrl != null)
				{
					return BadRequest("Alias already exists");
				}
			}
			if (request.domain == "https://staxi.vn")
			{
				request.projectName = "STaxi";
			}
			if (request.domain == "https://baexpress.io")
			{
				request.projectName = "BAExpress";
			}
			var shortUrl = new ShortUrl
			{
				projectName = request.projectName,
				originalUrl = request.originalUrl,
				domain = request.domain,
				alias = shortCode,
				CreateAt = DateTime.Now,
			};
			_context.ShortUrls.Add(shortUrl); // them vao dtbase
			await _context.SaveChangesAsync();

			var shortLink = $"{request.domain}/{shortCode}";
			return Ok(new {shortLink });
		}

		//// lay URL goc tu shortUrl
		//[HttpGet("{code}")] // "code" trong domain
		//public async Task<IActionResult> RedirectUrl(string code)
		//{
		//	var url = await _context.ShortUrls.FirstOrDefaultAsync(x => x.alias == code); // search shortURL trong database
		//	if (url == null)
		//	{
		//		return NotFound("ShortURL not exist");
		//	}
		//	return Redirect(url.originalUrl);// tra ve URL goc 
		//}
		// Cap nhat URL bang ID
		[HttpPut("update/{id}")]
		public async Task<IActionResult> UpdateUrl(int id, [FromBody] ShortUrlDTO request)
		{
			var url = await _context.ShortUrls.FindAsync(id);
			if (url == null)
			{
				return NotFound("ShortURL not exist");
			}
			if (string.IsNullOrEmpty(request.originalUrl))
			{
				return BadRequest("URL is not validate");
			}
			if (request.domain == "https://staxi.vn")
			{
				request.projectName = "STaxi";
			}
			if (request.domain == "https://baexpress.io")
			{
				request.projectName = "BAExpress";
			}

			string shortCode = request.alias;
			if (string.IsNullOrEmpty(request.alias))
			{
				shortCode = GenerateRandomURL();
			}
			// Neu shortCode khac voi alias hien tai
			if (url.alias != shortCode)
			{
				// Kiem tra neu alias moi da ton tai
				var existingUrl = await _context.ShortUrls.FirstOrDefaultAsync(x => x.alias == shortCode && x.ID != id);
				if (existingUrl != null)
				{
					return BadRequest("Alias already exists");
				}
			}
			url.alias = shortCode;
			url.projectName = request.projectName;
			url.originalUrl = request.originalUrl;
			url.domain = request.domain;

			_context.ShortUrls.Update(url);
			await _context.SaveChangesAsync();

			var shortLink = $"{url.domain}/{url.alias}";
			return Ok(new { id = url.ID, shortLink });
		}

		// Xoa URL bang ID
		[HttpDelete("delete/{id}")]
		public async Task<IActionResult> DeleteUrl(int id)
		{
			var url = await _context.ShortUrls.FindAsync(id);
			if (url == null)
			{
				return NotFound("ShortURL not exist");
			}

			_context.ShortUrls.Remove(url);
			await _context.SaveChangesAsync();

			return Ok(new { message = "URL deleted successfully", id = id });
		}
		private string GenerateRandomURL(int length = 6)
		{
			const string chars = "qwertyuioplkjhgfdsazxcvbnm1234567890QWERTYUIOPASDFGHJKLZXCVBNM";
			var random = new Random();
			return new string(Enumerable.Repeat(chars, length)
										.Select(s => s[random.Next(s.Length)]).ToArray());
		}
	}

	
}
