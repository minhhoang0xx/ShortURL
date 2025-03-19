using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OfficeOpenXml;
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
			//var context = HttpContext.Request.HttpContext.Session
			var urls = await _context.ShortUrls.ToListAsync();
			var result = urls.Select(url => new {
				id = url.ShortId,
				projectName = url.ProjectName,
				originalUrl = url.OriginalUrl,
				domain = url.Domain,
				alias = url.Alias,
				shortLink = $"{url.Domain}/{url.Alias}",
				createAt = url.CreateAt,
				qrCode = url.QrCode,
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

			var shortLink = $"{url.Domain}/{url.Alias}";
			return Ok(new
			{
				id = url.ShortId,
				projectName = url.ProjectName,
				originalUrl = url.OriginalUrl,
				domain = url.Domain,
				alias = url.Alias,
				shortLink,
				createAt = url.CreateAt,
				qrCode = url.QrCode,
			});
		}


		// gan Url goc va short Url vao database
		[HttpPost("shorter")]
		public async Task<IActionResult> ShorterUrl([FromBody] ShortURL_LinkDTO request)
		{
			if (string.IsNullOrEmpty(request.OriginalUrl))
			{
				return BadRequest("URL is not validate");
			}
			var existingOrigianalUrl = await _context.ShortUrls.FirstOrDefaultAsync(x => x.OriginalUrl == request.OriginalUrl);
			if(existingOrigianalUrl != null)
			{
				return BadRequest(new { message = "This URL has been shortened!" });
			}
			string shortCode = request.Alias;
			if (string.IsNullOrEmpty(request.Alias))
			{
				shortCode = GenerateRandomURL();
			}else{
				var existingUrl = await _context.ShortUrls.FirstOrDefaultAsync(x => x.Alias == shortCode);
				if (existingUrl != null)
				{
					return BadRequest(new { message = "Alias already exists!" });
				}
			}
			var shortUrl = new ShortURL_Link
			{
				ProjectName = request.ProjectName,
				OriginalUrl = request.OriginalUrl,
				Domain = request.Domain,
				Alias = shortCode,
				CreateAt = DateTime.Now,
				QrCode = request.QrCode,
			};
			_context.ShortUrls.Add(shortUrl); // them vao dtbase
			await _context.SaveChangesAsync();

			var shortLink = $"{request.Domain}/{shortCode}";
			return Ok(new {shortLink });
		}

		// lay URL goc tu shortUrl
		[HttpGet("{code}")] // "code" trong domain
		public async Task<IActionResult> RedirectUrl(string code)
		{
			// string UserAgent = Request.Headers["User-Agent"].ToString().ToUpper();
			var url = await _context.ShortUrls.FirstOrDefaultAsync(x => x.Alias == code); // search shortURL trong database
			if (url == null)
			{
				return NotFound("ShortURL not exist");
			}
			return Ok(url.OriginalUrl);// tra ve URL goc 
		}
	
		// Cap nhat URL bang ID
		[HttpPut("update/{id}")]
		public async Task<IActionResult> UpdateUrl(int id, [FromBody] ShortURL_LinkDTO request)
		{
			var url = await _context.ShortUrls.FindAsync(id);
			if (url == null)
			{
				return NotFound("ShortURL not exist");
			}
			if (string.IsNullOrEmpty(request.OriginalUrl))
			{
				return BadRequest("URL is not validate");
			}
			if (url.OriginalUrl != request.OriginalUrl) // neu original thay doi thi moi can ktra 
			{
				var existingOriginalUrl = await _context.ShortUrls.FirstOrDefaultAsync(x => x.OriginalUrl == request.OriginalUrl);
				if (existingOriginalUrl != null)
				{
					return BadRequest(new { message = "This URL has been shortened!" });
				}
			}
			string shortCode = request.Alias;
			if (string.IsNullOrEmpty(request.Alias))
			{
				shortCode = GenerateRandomURL();
			}
			// Neu shortCode khac voi alias hien tai
			if (url.Alias != shortCode)
			{
				// Kiem tra neu alias moi da ton tai
				var existingUrl = await _context.ShortUrls.FirstOrDefaultAsync(x => x.Alias == shortCode );
				if (existingUrl != null)
				{
					return BadRequest( new { massage = "Alias already exists" });
				}
			}
			url.Alias = shortCode;
			url.ProjectName = request.ProjectName;
			url.OriginalUrl = request.OriginalUrl;
			url.Domain = request.Domain;
			url.QrCode = request.QrCode;

			_context.ShortUrls.Update(url);
			await _context.SaveChangesAsync();

			var shortLink = $"{url.Domain}/{url.Alias}";
			return Ok(new { id = url.ShortId, shortLink });
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
