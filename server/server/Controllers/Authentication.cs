
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.Models;
using System.Security.Cryptography;
namespace server.Controllers;
using server.Services;
using System.Collections.Concurrent;
using System.Text;

[Route("api/[controller]")]
[ApiController]
public class Authentication : ControllerBase
	{
		private readonly JwtService _jwtService;
		private readonly URLContext _context;
		private readonly RecaptchaService _recaptchaService;
		private static ConcurrentDictionary<string, int> failedAttempts = new();
		public	Authentication(URLContext context, RecaptchaService recaptchaService, JwtService jwtService)
		{
			_context = context;
			_recaptchaService = recaptchaService;
			_jwtService = jwtService;
		}
		private string HashToMD5(string input)
		{
			using (MD5 md5 = MD5.Create())
			{
				byte[] inputBytes = Encoding.UTF8.GetBytes(input);
				byte[] hashBytes = md5.ComputeHash(inputBytes);
				// => sang chuoi hexadecimal
				StringBuilder sb = new StringBuilder();
				foreach (byte b in hashBytes)
				{
					sb.Append(b.ToString("x2"));
				}
				return sb.ToString(); //"x2" formats the byte as a two - digit hexadecimal
			}
		}
		private void Increase(string clientIp)
		{
			failedAttempts.AddOrUpdate(clientIp, 1, (key, oldValue) => oldValue + 1);
		}

		private void Reset(string clientIp)
		{
			failedAttempts.TryUpdate(clientIp, 0, failedAttempts.GetValueOrDefault(clientIp));
		}

		private int Failed(string clientIp)
		{
			return failedAttempts.GetValueOrDefault(clientIp);
		}



		[HttpPost("Login")]
		public async Task<IActionResult> Login([FromBody] Admin_UserDTO account)
		{
			
			string clientIp = HttpContext.Request.Headers["X-Forwarded-For"].FirstOrDefault()
			?? HttpContext.Connection.RemoteIpAddress?.ToString()
			?? "local";
	
			int attempts = Failed(clientIp);
			if (attempts >= 3 && account.RecaptchaToken == null)
			{
				return BadRequest(new ErrorResponse
				{
					ErrorCode = "CAPTCHA_INVALID",
					ErrorMessage = "CAPTCHA chưa được xác thực!",
					attempts = Failed(clientIp),
					RequiresCaptcha = Failed(clientIp) >= 3
				});

		}
		if (attempts >= 3)
			{
				if (string.IsNullOrEmpty(account.RecaptchaToken))
				{
				return BadRequest(new ErrorResponse
				{
					ErrorCode = "CAPTCHA_NOT_FOUND",
					ErrorMessage = "Hãy thực hiện CAPTCHA trước!",
					attempts = Failed(clientIp),
					RequiresCaptcha = true

				});
			}

				bool isRecaptchaValid = await _recaptchaService.VerifyRecaptchaAsync(account.RecaptchaToken);
				if (!isRecaptchaValid)
				{
					return BadRequest(new ErrorResponse
					{
						ErrorCode = "CAPTCHA_INVALID",
						ErrorMessage = "CAPTCHA chưa được xác thực!",
						attempts = Failed(clientIp),
						RequiresCaptcha = Failed(clientIp) >= 3
					});
			}
			}
		var checkLogin = await _context.AdminUsers.FirstOrDefaultAsync(x => x.UserName == account.UserName);
		if (checkLogin == null)
		{
			Increase(clientIp);
			return BadRequest(new ErrorResponse
			{
				ErrorCode = "USERNAME_NOT EXISTED",
				ErrorMessage = "Tài khoản hoặc mật khẩu không đúng!",
				attempts = Failed(clientIp),
				RequiresCaptcha = Failed(clientIp) >= 3
			});

		}
		var checkPassword = HashToMD5(account.Password).ToUpper();
			if(checkLogin.Password != checkPassword)
			{
				Increase(clientIp);
				return BadRequest(new ErrorResponse
				{
					ErrorCode = "PASSWORD_INCORRECT",
					ErrorMessage = "Tài khoản hoặc mật khẩu không đúng!",
					attempts = Failed(clientIp),
					RequiresCaptcha = Failed(clientIp) >= 3
				});
			}
			Reset(clientIp);
			var token = _jwtService.GenerateToken(checkLogin.UserName.ToString());
            return Ok(new { message = "Login successfully!", token, attempts = Failed(clientIp) });
		}

}
