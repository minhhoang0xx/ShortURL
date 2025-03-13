using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.Models;

namespace server.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class DomainController : ControllerBase
	{
		private readonly URLContext _context;

		public DomainController(URLContext context)
		{
			_context = context;
		}
		[HttpGet("getAll")]
		public async Task<IActionResult> getAllDomain()
		{
			var urls = await _context.Domains.ToListAsync();
			var result = urls.Select(url => new {
				id = url.ShortDomainID,
				Link = url.Link,
				name = url.Name,
			});

			return Ok(result);
		}
		[HttpPost("addDomain")]
		public async Task<IActionResult> addDomain([FromBody] ShortURL_DomainDTO domain)
		{
			var existedDomain = _context.Domains.FirstOrDefault(x => x.Link == domain.Link);
			if(existedDomain != null)
			{
				return BadRequest(new { message = "Domain này đã tồn tại!" });
			}
			var create = new ShortURL_Domain
			{
				Link = domain.Link,
				Name = domain.Name
			};
			_context.Domains.Add(create);
			_context.SaveChanges();

			return Ok();
		}
		[HttpPut("updateDomain/{id}")]
		public async Task<IActionResult> UpdateDomain(int id, [FromBody] ShortURL_DomainDTO domain)
		{
			var data = await _context.Domains.FindAsync(id);
	
			if (data.Link != domain.Link)
			{
				var existedDomain = _context.Domains.FirstOrDefault(x => x.Link == domain.Link);
				if (existedDomain != null)
				{
					return BadRequest(new { message = "Domain này đã tồn tại!" });
				}
			}
			data.Link = domain.Link;
			data.Name = domain.Name;

			_context.Domains.Update(data);
			_context.SaveChanges();
			return Ok();
		}
		[HttpDelete("deleteDomain/{id}")]
		public async Task<IActionResult> DeleteDomain(int id)
		{
			var data = await _context.Domains.FindAsync(id);
			if(data == null) { return BadRequest(new { message = "Domain này không tồn tại." }); }

			_context.Domains.Remove(data);
			_context.SaveChanges();
			return Ok();
		}
	}
}
