using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using server.Data;
using server.Models;

namespace server.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class FormRequestController : ControllerBase
	{
		private readonly URLContext _context;

		public FormRequestController(URLContext context)
		{
			_context = context;
		}

		[HttpPost("saveRequest")]
		public async Task<IActionResult> saveRequest([FromBody] RequestFormDTO request)
		{
			var create = new RequestForm
			{
				projectName = request.projectName,
				fullName = request.fullName,
				email = request.email,
				phoneNumber = request.phoneNumber,
				message = request.message
			};
			_context.FormRequests.Add(create);
			_context.SaveChanges();
			return Ok("Thông tin đã được ghi nhận");
		}
	}
}
