using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.Models;

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
			if (!urls.Any())
			{
				return NotFound(new ErrorResponse
				{
					ErrorCode = "NO_DATA!",
					ErrorMessage = $"Hệ thống chưa có dữ liệu"
				});
			}
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
				checkOS = url.CheckOS ?? false,
				iosLink = url.IosLink,
				androidLink = url.AndroidLink,
				CreatedByUser = url.CreatedByUser ?? "unknow",
				expiry = url.Expiry,
				status = url.Expiry.HasValue && url.Expiry < DateTime.Now ? false : (url.Status ?? true) 

			});

			return Ok(result);
		}

		[Authorize]
		[HttpGet("getAllByUser")]
		public async Task<IActionResult> getAllByUser(string user)
		{
			if (string.IsNullOrWhiteSpace(user))
			{
				return BadRequest(new ErrorResponse
				{
					ErrorCode = "USER_INVALID!",
					ErrorMessage = "User không có."
				});
			}
			var urls = await _context.ShortUrls
				.Where(url => url.CreatedByUser == user)
				.ToListAsync();
			if (!urls.Any())
			{
				return NotFound(new ErrorResponse
				{
					ErrorCode = "NO_DATA_FOR_USER!",
					ErrorMessage = $"Tài khoản: [{user}] chưa có dữ liệu"
				});

			}
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
				checkOS = url.CheckOS ?? false,
				iosLink = url.IosLink,
				androidLink = url.AndroidLink,
				CreatedByUser = url.CreatedByUser ?? "unknow",
				expiry = url.Expiry,
				status = url.Expiry.HasValue && url.Expiry < DateTime.Now ? false : (url.Status ?? true)

			});

			return Ok(result);
			
		}

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

			if (url.Expiry.HasValue && url.Expiry < DateTime.Now)
			{
				url.Status = false;
				await _context.SaveChangesAsync();
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
				checkOS = url.CheckOS ?? false,
				iosLink = url.IosLink,
				androidLink = url.AndroidLink,
				createdByUser = url.CreatedByUser,
				expiry = url.Expiry,
				status = url.Status ?? true
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

			var existingOG = await _context.ShortUrls
				.Where(url => url.CreatedByUser == request.CreatedByUser && url.OriginalUrl == request.OriginalUrl )
				.FirstOrDefaultAsync();
			//var existingOG = urls.FirstOrDefault(x => x.OriginalUrl == request.OriginalUrl);
			if (existingOG != null)
			{
				return BadRequest(new ErrorResponse
				{
					ErrorCode = "URL_EXISTED",
					ErrorMessage = $"URL này đã được rút gọn với alias: {existingOG.Alias} "
				});
			}

			string shortCode = request.Alias;
			if (string.IsNullOrEmpty(request.Alias))
			{
				shortCode = GenerateRandomURL();
			}else{
				var existingAlias = await _context.ShortUrls.FirstOrDefaultAsync(x => x.Alias == shortCode && x.Domain == request.Domain);
				if (existingAlias != null  ) 
				{
					return BadRequest(new ErrorResponse
					{
						ErrorCode = "ALIAS_EXISTED",
						ErrorMessage = $"{shortCode} đã được {existingAlias.CreatedByUser} sử dụng trước đó cho {existingAlias.ProjectName} "
					});
				}
			}
			if (request.Expiry.HasValue && request.Expiry < DateTime.Now)
			{
				return BadRequest(new ErrorResponse
				{
					ErrorCode = "INVALID_EXPIRY_DATE",
					ErrorMessage = "Ngày hết hạn không được nhỏ hơn ngày hiện tại!"
				});
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
				CreatedByUser = request.CreatedByUser,
				Expiry = request.Expiry,
				Status = true
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
			string domainFromHeader = Request.Headers["Domain"].ToString();
			Console.WriteLine($"Base URL: {domainFromHeader}");
			var urls = await _context.ShortUrls.Where(x => x.Alias == code).ToListAsync();
			var url = urls.FirstOrDefault(x => x.Domain == domainFromHeader);
			if (url == null)
			{
				return NotFound(new ErrorResponse 
				{ 
					ErrorCode = "URL_NOT_EXISTED!",
					ErrorMessage = "URL không tồn tại!"
				});

			}
			if (url.Expiry.HasValue && url.Expiry < DateTime.Now)
			{
				url.Status = false;
				await _context.SaveChangesAsync();
				return BadRequest(new ErrorResponse
				{
					ErrorCode = "URL_EXPIRED",
					ErrorMessage = "Shortlink đã hết hạn!"
				});
			}
			if (url.Status == false)
			{
				return BadRequest(new ErrorResponse
				{
					ErrorCode = "URL_INACTIVE",
					ErrorMessage = "Shortlink không còn hoạt động!"
				});
			}
			if (url.CheckOS == true)
			{
				string UserAgent = Request.Headers["User-Agent"].ToString().ToUpper();
				if (UserAgent.Contains("IPHONE") || UserAgent.Contains("IPAD") || UserAgent.Contains("MACINTOSH") 
					|| UserAgent.Contains("WATCH"))
				{
					return Ok(url.IosLink ?? url.OriginalUrl);
				}
				else if (UserAgent.Contains("ANDROID"))
				{
					return Ok(url.AndroidLink ?? url.OriginalUrl) ;
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
			if (string.IsNullOrEmpty(request.Domain))
			{
				return BadRequest(new ErrorResponse
				{
					ErrorCode = "DOMAIN_REQUIRED",
					ErrorMessage = "Domain không được để trống!"
				});
			}


			if (url.OriginalUrl != request.OriginalUrl) // neu original thay doi thi moi can ktra 
			{
				var existingOG = await _context.ShortUrls
				.Where(x => x.CreatedByUser == request.CreatedByUser && x.OriginalUrl == request.OriginalUrl)
				.FirstOrDefaultAsync();
				if (existingOG != null)
				{
					return BadRequest(new ErrorResponse
					{
						ErrorCode = "URL_EXISTED",
						ErrorMessage = $"URL này đã được rút gọn với alias: {existingOG.Alias} "
					});
				}
			}
			string shortCode = request.Alias;
			if (string.IsNullOrEmpty(request.Alias))
			{	
				shortCode = GenerateRandomURL();
			}
			// Neu shortCode khac voi alias hien tai
			// Kiem tra neu alias moi da ton tai
			var existingUrl = await _context.ShortUrls.FirstOrDefaultAsync(x => x.Alias == shortCode && x.Domain == request.Domain && x.ShortId != id);
			if (existingUrl != null)
			{
				return BadRequest(new ErrorResponse
					{
					ErrorCode = "ALIAS_EXISTED",
					ErrorMessage = $"{shortCode} đã được {existingUrl.CreatedByUser} sử dụng trước đó cho {existingUrl.ProjectName} "
				});
			}
			url.Alias = shortCode;
			url.ProjectName = request.ProjectName;
			url.OriginalUrl = request.OriginalUrl;
			url.Domain = request.Domain;
			url.QrCode = request.QrCode;
			url.CreateAt = DateTime.Now;
			url.CreatedByUser = request.CreatedByUser;
			url.CheckOS = request.CheckOS;
			url.AndroidLink = request.AndroidLink;
			url.IosLink = request.IosLink;
			url.Expiry = request.Expiry;
			url.Status = request.Expiry.HasValue && request.Expiry < DateTime.Now ? false : (request.Status ?? true);


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

		[Authorize]
		[HttpDelete("deleteMany")]
		public async Task<IActionResult> DeleteManyUrls([FromBody] List<int> ids)
		{
			try
			{
				if (ids == null || !ids.Any())
				{
					return BadRequest(new ErrorResponse
					{
						ErrorCode = "INVALID_IDS",
						ErrorMessage = "Danh sách ID không được để trống."
					});
				}

				var temp = string.Join(",", ids);
				var lstTemp = _context.ShortUrls.FromSqlRaw($"SELECT * FROM [ShortURL.Links] WHERE ShortId IN ({temp})");

				var deletedIds = new List<int>();
				_context.ShortUrls.RemoveRange(lstTemp);
				await _context.SaveChangesAsync();

				return Ok(new
				{
					message = "Các URL đã được xóa thành công.",
					deletedIds
				});

			}
			catch (Exception ex)
			{
				return BadRequest(new
				{
					message = string.Format("Lỗi: {0}", ex.Message)
				});
			}
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
