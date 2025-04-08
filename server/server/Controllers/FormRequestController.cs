﻿using Microsoft.AspNetCore.Http;
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
		private static ConcurrentDictionary<string, int> submitAttempts = new();
		private readonly RecaptchaService _recaptchaService;
		public FormRequestController(URLContext context, RecaptchaService recaptchaService)
		{
			_context = context;
			_recaptchaService = recaptchaService;	
		}

		[HttpPost("saveRequest")]
		public async Task<IActionResult> saveRequest([FromBody] RequestFormDTO request)
		{

			if (request == null)
			{
				return BadRequest(new { message = "Invalid request data" });
			}
			string clientIp = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "local";
			int attempts = Failed(clientIp);
			if (attempts >= 3)
			{
				if (string.IsNullOrEmpty(request.RecaptchaToken))
				{
					return BadRequest(new { message = "Please complete the CAPTCHA!", requiresCaptcha = true});
		
				}

				bool isRecaptchaValid = await _recaptchaService.VerifyRecaptchaAsync(request.RecaptchaToken);
				if (!isRecaptchaValid)
				{
					Increase(clientIp);
					return BadRequest(new { message = "Invalid CAPTCHA!" });
				}
			}
			try
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
				await _context.SaveChangesAsync();
				Increase(clientIp);
				return Ok(new { message = "Thông tin đã được ghi nhận", attempts = Failed(clientIp) });
			}
			catch (Exception ex) 
			{
				Increase(clientIp);
				return BadRequest( new { message = "Có lỗi xảy ra khi lưu thông tin", error = ex.Message });
			}
			
		}

		private void Increase( string clientIp)
		{
			submitAttempts.AddOrUpdate(clientIp, 1, (key, oldValue) => oldValue + 1);
		}
		private void Reset(string clientIp)
		{
			submitAttempts.TryUpdate(clientIp, 0, Failed(clientIp));
		}
		private int Failed(string clientIp)
		{
			return submitAttempts.GetOrAdd(clientIp, 0);
		}

	}
}
