using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.Models;

namespace server.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class TagController: ControllerBase
	{
		private readonly URLContext _context;

		public TagController(URLContext context)
		{
			_context = context;
		}
		[HttpGet("tags")]
		public async Task<IActionResult> GetAllTags()
		{
			var tags = await _context.Tags.ToListAsync();
			var result = tags.Select(url => new {
				id = url.Id,
				name = url.Name,
			});

			return Ok(tags);
		}
	}
}
