
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
		private void Increase(string username)
		{
			failedAttempts.AddOrUpdate(username, 1, (key, oldValue) => oldValue + 1);
		}

		private void Reset(string username)
		{
			failedAttempts.TryUpdate(username, 0, failedAttempts.GetValueOrDefault(username));
		}

		private int Failed(string username)
		{
			return failedAttempts.GetValueOrDefault(username);
		}



		[HttpPost("Login")]
		public async Task<IActionResult> Login([FromBody] Admin_UserDTO account)
		{
		 
			var checkLogin = await _context.AdminUsers.FirstOrDefaultAsync(x => x.UserName == account.UserName);
			if (checkLogin == null)
			{
				Increase(account.UserName);
				return BadRequest(new { message="This Username is not exist!" });
			}
			int attempts = Failed(account.UserName);
			if (attempts >= 3)
			{
				if (string.IsNullOrEmpty(account.RecaptchaToken))
				{
					return BadRequest(new { message = "Please complete the CAPTCHA!" , requiresCaptcha = true });
				}

				bool isRecaptchaValid = await _recaptchaService.VerifyRecaptchaAsync(account.RecaptchaToken);
				if (!isRecaptchaValid)
				{
					return BadRequest(new { message = "Invalid CAPTCHA!" });
				}
			}
			var checkPassword = HashToMD5(account.Password).ToUpper();
			if(checkLogin.Password != checkPassword)
			{
				Increase(account.UserName);
				return BadRequest(new { message = "Your Password is incorrect!" });
			}

			Reset(account.UserName);
			var token = _jwtService.GenerateToken(checkLogin.UserName.ToString());
            return Ok(new { message = "Login successfully!", token });
		}

}
