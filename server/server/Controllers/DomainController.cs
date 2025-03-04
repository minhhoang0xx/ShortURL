using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Data;

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
	}
}
