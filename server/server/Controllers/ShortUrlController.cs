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
			var existingOrigianalUrl = await _context.ShortUrls.FirstOrDefaultAsync(x => x.originalUrl == request.originalUrl);
			if(existingOrigianalUrl != null)
			{
				return BadRequest(new { message = "This URL has been shortened!" });
			}
			string shortCode = request.alias;
			if (string.IsNullOrEmpty(request.alias))
			{
				shortCode = GenerateRandomURL();
			}else{
				var existingUrl = await _context.ShortUrls.FirstOrDefaultAsync(x => x.alias == shortCode);
				if (existingUrl != null)
				{
					return BadRequest(new { message = "Alias already exists!" });
				}
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

		// lay URL goc tu shortUrl
		[HttpGet("{code}")] // "code" trong domain
		public async Task<IActionResult> RedirectUrl(string code)
		{
			var url = await _context.ShortUrls.FirstOrDefaultAsync(x => x.alias == code); // search shortURL trong database
			if (url == null)
			{
				return NotFound("ShortURL not exist");
			}
			return Redirect(url.originalUrl);// tra ve URL goc 
		}
		[HttpGet]
		[Route("{domain}/{alias}")]
		public async Task<IActionResult> Redirect2(string domain, string alias)
		{
			var url = await _context.ShortUrls.FirstOrDefaultAsync(x =>
				x.domain == domain && x.alias == alias);

			if (url == null)
			{
				return NotFound("ShortURL not exist");
			}
			return Redirect(url.originalUrl);
		}
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
					return BadRequest( new { massage = "Alias already exists" });
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


		[HttpGet("download")]
		public async Task<IActionResult> ExportToExcel()
		{
			var shortUrls = await _context.ShortUrls.ToListAsync();

			using (var package = new ExcelPackage())
			{
				var worksheet = package.Workbook.Worksheets.Add("ShortUrls");

				worksheet.Cells[1, 1].Value = "STT";
				worksheet.Cells[1, 2].Value = "Dự án";
				worksheet.Cells[1, 3].Value = "Tên đường dẫn";
				worksheet.Cells[1, 4].Value = "URL gốc";
				worksheet.Cells[1, 5].Value = "ShortLink";
				worksheet.Cells[1, 6].Value = "Ngày cập nhật";
				worksheet.Cells[1, 7].Value = "Người cập nhật";
				int row = 2;
				int index = 1;
				foreach (var url in shortUrls)
				{
					
					worksheet.Cells[row, 1].Value = index; index++;
					worksheet.Cells[row, 2].Value = url.projectName;
					worksheet.Cells[row, 3].Value = url.alias;
					worksheet.Cells[row, 4].Value = url.originalUrl;
					worksheet.Cells[row, 5].Value = $"{url.domain}/{url.alias}";
					worksheet.Cells[row, 6].Value = url.CreateAt.ToString("HH:mm dd/MM/yyyy");
					worksheet.Cells[row, 7].Value = null;
					row++;
				}
				worksheet.Cells[worksheet.Dimension.Address].AutoFitColumns();
				var stream = new MemoryStream();
				package.SaveAs(stream);
				stream.Position = 0;
				return File(stream, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
			}
		}
	}

	
}
