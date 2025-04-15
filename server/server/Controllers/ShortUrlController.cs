using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OfficeOpenXml;
using server.Data;
using server.Models;
using System;
using System.Xml.Serialization;
using Microsoft.AspNetCore.Authorization;
using System.Reflection.Metadata.Ecma335;
using System.Security.Claims;

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
		[Authorize]
		[HttpGet("getAll")]
		public async Task<IActionResult> getAllUrl()
		{
			var urls = await _context.ShortUrls.ToListAsync();
			var result = urls.Select(url => new
			{
				id = url.ShortId,
				projectName = url.ProjectName,
				originalUrl = url.OriginalUrl,
				domain = url.Domain,
				alias = url.Alias,
				shortLink = $"{url.Domain}/{url.Alias}",
				createAt = url.CreateAt,
				qrCode = url.QrCode,
				checkOS = url.CheckOS,
				iosLink = url.IosLink,
				androidLink = url.AndroidLink,
				userName = url.CreatedByUser ?? "unknow"
			});

			return Ok(result);
		}
		// Lay thong tin URL bang ID
		[Authorize]
		[HttpGet("getLink/{id}")]
		public async Task<IActionResult> GetUrlInfo(int id)
		{
			var url = await _context.ShortUrls.FindAsync(id);
			if (url == null)
			{
				return NotFound(new ErrorResponse
				{
					ErrorCode = "SHORTURL_NOT_FOUND",
					ErrorMessage = "ShortURL không tồn tại."
				});
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
				checkOS = url.CheckOS,
				iosLink = url.IosLink,
				androidLink = url.AndroidLink,
				createdByUser = url.CreatedByUser
			});
		}

		[Authorize]
		[HttpPost("shorter")]
		public async Task<IActionResult> ShorterUrl([FromBody] ShortURL_LinkDTO request)
		{
			if (string.IsNullOrEmpty(request.OriginalUrl))
			{
				return BadRequest( new ErrorResponse
				{
					ErrorCode = "ORIGINALURL_NOT_FOUND",
					ErrorMessage = "Link Không hợp lệ!"
				});
			}
			var existingOrigianalUrl = await _context.ShortUrls.FirstOrDefaultAsync(x => x.OriginalUrl == request.OriginalUrl);
			if(existingOrigianalUrl != null)
			{
				return BadRequest(new ErrorResponse
				{
					ErrorCode = "URL_EXISTED",
					ErrorMessage = "URL này đã được rút gọn!"
				});
			}
			string shortCode = request.Alias;
			if (string.IsNullOrEmpty(request.Alias))
			{
				shortCode = GenerateRandomURL();
			}else{
				var existingUrl = await _context.ShortUrls.FirstOrDefaultAsync(x => x.Alias == shortCode);
				if (existingUrl != null)
				{
					return BadRequest(new ErrorResponse
					{
						ErrorCode = "ALIAS_EXISTED",
						ErrorMessage = "Alias này đã được sử dụng trước đó!"
					});
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
				CheckOS = request.CheckOS,
				IosLink = request.IosLink,
				AndroidLink = request.AndroidLink,
				CreatedByUser = request.CreatedByUser
			};
			_context.ShortUrls.Add(shortUrl);
			await _context.SaveChangesAsync();

			var shortLink = $"{request.Domain}/{shortCode}";
			return Ok(new {shortLink });
		}

		[AllowAnonymous]
		[HttpGet("{code}")] // "code" trong domain
		public async Task<IActionResult> RedirectUrl(string code)
		{
			
			var url = await _context.ShortUrls.FirstOrDefaultAsync(x => x.Alias == code); // search shortURL trong database
			if (url == null)
			{
				return NotFound(new ErrorResponse 
				{ 
					ErrorCode = "URL_NOT_EXISTED!",
					ErrorMessage = "URL không tồn tại!"
				});

			}
			if (url.CheckOS)
			{
				string UserAgent = Request.Headers["User-Agent"].ToString().ToUpper();
				if (UserAgent.Contains("IPHONE") || UserAgent.Contains("IPAD") || UserAgent.Contains("MACINTOSH") 
					|| UserAgent.Contains("WATCH"))
				{
					return Ok(url.IosLink);
				}
				else if (UserAgent.Contains("ANDROID"))
				{
					return Ok(url.AndroidLink) ;
				}
			}
			return Ok(url.OriginalUrl);
		}

		[Authorize] 
		[HttpPut("update/{id}")]
		public async Task<IActionResult> UpdateUrl(int id, [FromBody] ShortURL_LinkDTO request)
		{
			var url = await _context.ShortUrls.FindAsync(id);
			if (url == null)
			{
				return NotFound(new ErrorResponse
				{
					ErrorCode = "URL_NOT_EXISTED!",
					ErrorMessage = "URL không tồn tại!"
				}); 
			}
			if (string.IsNullOrEmpty(request.OriginalUrl))
			{
				return BadRequest(new ErrorResponse
				{
					ErrorCode = "ORIGINALURL_NOT_EXISTED!",
					ErrorMessage = "URL gốc không tồn tại!"
				});
			}
			if (url.OriginalUrl != request.OriginalUrl) // neu original thay doi thi moi can ktra 
			{
				var existingOriginalUrl = await _context.ShortUrls.FirstOrDefaultAsync(x => x.OriginalUrl == request.OriginalUrl);
				if (existingOriginalUrl != null)
				{
					return BadRequest(new ErrorResponse
					{
						ErrorCode = "URL_EXISTED",
						ErrorMessage = "URL này đã được rút gọn!"
					});
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
					return BadRequest(new ErrorResponse
					{
						ErrorCode = "ALIAS_EXISTED",
						ErrorMessage = "Alias này đã được sử dụng trước đó!"
					});
				}
			}

			url.Alias = shortCode;
			url.ProjectName = request.ProjectName;
			url.OriginalUrl = request.OriginalUrl;
			url.Domain = request.Domain;
			url.QrCode = request.QrCode;
			url.CreatedByUser = request.CreatedByUser;
			url.CheckOS = request.CheckOS;
			url.AndroidLink = request.AndroidLink;
			url.IosLink = request.IosLink;

			_context.ShortUrls.Update(url);
			await _context.SaveChangesAsync();

			var shortLink = $"{url.Domain}/{url.Alias}";
			return Ok(new { id = url.ShortId, shortLink });
		}
		
		[Authorize] 
		[HttpDelete("delete/{id}")]
		public async Task<IActionResult> DeleteUrl(int id)
		{
			var url = await _context.ShortUrls.FindAsync(id);
			if (url == null)
			{
				return NotFound(new ErrorResponse
				{
					ErrorCode = "URL_NOT_EXISTED!",
					ErrorMessage = "URL không tồn tại!"
				});
			}
			_context.ShortUrls.Remove(url);
			await _context.SaveChangesAsync();

			return Ok(new { message = "URL deleted successfully", id = id });
		}
		private string GenerateRandomURL(int length = 10)
		{
			const string chars = "qwertyuioplkjhgfdsazxcvbnm1234567890QWERTYUIOPASDFGHJKLZXCVBNM";
			var random = new Random();
			return new string(Enumerable.Repeat(chars, length)
										.Select(s => s[random.Next(s.Length)]).ToArray());
		}
	


	}


}
