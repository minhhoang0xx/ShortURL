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
				id = url.ID,
				link = url.link,
				name = url.name,
			});

			return Ok(result);
		}
		[HttpPost("addDomain")]
		public async Task<IActionResult> addDomain([FromBody] DomainDTO domain)
		{
			var existedDomain = _context.Domains.FirstOrDefault(x => x.link == domain.link);
			if(existedDomain != null)
			{
				return BadRequest(new { message = "Domain này đã tồn tại!" });
			}
			var create = new Domain
			{
				link = domain.link,
				name = domain.name
			};
			_context.Domains.Add(create);
			_context.SaveChanges();

			return Ok();
		}
		[HttpPut("updateDomain/{id}")]
		public async Task<IActionResult> UpdateDomain(int id, [FromBody] DomainDTO domain)
		{
			var data = await _context.Domains.FindAsync(id);
	
			if (data.link != domain.link)
			{
				var existedDomain = _context.Domains.FirstOrDefault(x => x.link == domain.link);
				if (existedDomain != null)
				{
					return BadRequest(new { message = "Domain này đã tồn tại!" });
				}
			}
			data.link = domain.link;
			data.name = domain.name;

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
