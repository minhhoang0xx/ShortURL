using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using server.Data;
using server.Models;
using System.Collections.Concurrent;

namespace server.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class FormRequestController : ControllerBase
	{
		private readonly URLContext _context;
		private readonly RecaptchaService _recaptchaService;
		private static ConcurrentDictionary<string, (int Count, DateTime FirstAttempt)> submitAttempts = new();
		private static readonly TimeSpan AttemptLifetime = TimeSpan.FromHours(1);
		public FormRequestController(URLContext context, RecaptchaService recaptchaService)
		{
			_context = context;
			_recaptchaService = recaptchaService;	
		}

		[HttpPost("saveRequestBAE")]
		public async Task<IActionResult> saveRequestBAE([FromBody] FormRequestDTO request)
		{

			if (request == null)
			{
				return BadRequest(new ErrorResponse
				{
					ErrorCode = "REQUEST_NOT_FOUND",
					ErrorMessage = "Không có dữ liệu được gửi!"
				});
			}
			if (request.fullName == null || request.phoneNumber == null || request.email == null)
			{
				return NotFound(new ErrorResponse
				{
					ErrorCode = "DATA_INVALID",
					ErrorMessage = "Thiếu một hoặc nhiều những thông tin!"
				});
			}
			string clientIp = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "local";
			int attempts = Failed(clientIp);
			if (attempts >= 3)
			{
				if (string.IsNullOrEmpty(request.RecaptchaToken))
				{
					return BadRequest(new ErrorResponse
					{
						ErrorCode = "RECAPTCHA_REQUIRED",
						ErrorMessage = "Hãy thực hiện xác thực trước!"
					});

				}
				bool isRecaptchaValid = await _recaptchaService.VerifyRecaptchaAsync(request.RecaptchaToken);
				if (!isRecaptchaValid)
				{
					Increase(clientIp);
					return BadRequest(new ErrorResponse
					{
						ErrorCode = "RECAPTCHA_INVALID",
						ErrorMessage = "Chưa xác thực CAPTCHA!",
						RequiresCaptcha = true
					});
				}
			}
			try
			{
				var create = new FormRequest
				{
					projectName = request.projectName,
					fullName = request.fullName,
					email = request.email,
					phoneNumber = request.phoneNumber,
					message = request.message
				};
				_context.FormRequests.Add(create);
				await _context.SaveChangesAsync();
				Increase(clientIp);
				return Ok(new { message = "Thông tin đã được ghi nhận", attempts = Failed(clientIp) });
			}
			catch (Exception ex) 
			{
				Increase(clientIp);
				return BadRequest(new ErrorResponse
				{
					ErrorCode = "SAVE_FAILED",
					ErrorMessage = "Đã xảy ra lỗi trong quá trình lưu thông tin."
				});
			}
			
		}

		[HttpPost("saveRequestStaxi")]
		public async Task<IActionResult> saveRequestStaxi([FromBody] FormRequestDTO request)
		{

			if (request == null)
			{
				return BadRequest(new ErrorResponse
				{
					ErrorCode = "REQUEST_NOT_FOUND",
					ErrorMessage = "Không có dữ liệu được gửi!"
				});
			}
			if(request.fullName == null||request.phoneNumber ==null ||request.company == null  )
			{
				return NotFound( new ErrorResponse
				{
					ErrorCode="DATA_INVALID",
					ErrorMessage="Thiếu một hoặc nhiều những thông tin!"
				});
			}
			string clientIp = HttpContext.Request.Headers["X-Forwarded-For"].FirstOrDefault()
			?? HttpContext.Connection.RemoteIpAddress?.ToString()
			?? "local";
			int attempts = Failed(clientIp);
			if (attempts >= 3)
			{
				if (string.IsNullOrEmpty(request.RecaptchaToken))
				{
					//return BadRequest(new { message = "Hãy Thực hiện xác thực trước!", requiresCaptcha = true });
					return BadRequest(new ErrorResponse
					{
						ErrorCode = "RECAPTCHA_REQUIRED",
						ErrorMessage = "Hãy thực hiện xác thực trước!",
						RequiresCaptcha = true
					});

				}
				bool isRecaptchaValid = await _recaptchaService.VerifyRecaptchaAsync(request.RecaptchaToken);
				if (!isRecaptchaValid)
				{
					Increase(clientIp);
					return BadRequest(new ErrorResponse
					{
						ErrorCode = "RECAPTCHA_INVALID",
						ErrorMessage = "Chưa xác thực CAPTCHA!"
					});
				}
			}
			try
			{
				var create = new FormRequest
				{
					projectName = request.projectName,
					fullName = request.fullName,
					phoneNumber = request.phoneNumber,
					email = request.email,
					company = request.company,
					address = request.address
				};
				_context.FormRequests.Add(create);
				await _context.SaveChangesAsync();
				Increase(clientIp);
				return Ok(new { message = "Thông tin đã được ghi nhận", attempts = Failed(clientIp) });
			}
			catch (Exception ex)
			{
				Increase(clientIp);
				return BadRequest(new ErrorResponse
				{
					ErrorCode = "SAVE_FAILED",
					ErrorMessage = "Đã xảy ra lỗi trong quá trình lưu thông tin."
				});
			}

		}

		private void Increase(string clientIp)
		{
			var now = DateTime.UtcNow;
			submitAttempts.AddOrUpdate(
				clientIp,
				(key) => (1, now),
				(key, oldValue) =>
				{
					if (now - oldValue.FirstAttempt > AttemptLifetime)
					{
						return (1, now);
					}
					return (oldValue.Count + 1, oldValue.FirstAttempt);
				});
		}

		private void Reset(string clientIp)
		{
			submitAttempts.TryUpdate(clientIp, (0, DateTime.UtcNow), submitAttempts.GetOrAdd(clientIp, (0, DateTime.UtcNow)));
		}

		private int Failed(string clientIp)
		{
			if (submitAttempts.TryGetValue(clientIp, out var value))
			{
				if (DateTime.UtcNow - value.FirstAttempt > AttemptLifetime)
				{
					submitAttempts.TryUpdate(clientIp, (0, DateTime.UtcNow), value);
					return 0;
				}
				return value.Count;
			}
			return 0;
		}


	}
}
