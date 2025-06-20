using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using OfficeOpenXml.FormulaParsing.LexicalAnalysis;
using server.Data;
using server.Models;
using server.Services;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using System.Text.RegularExpressions;

namespace server.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class SSOController : ControllerBase
	{
		private readonly IConfiguration _configuration;
		private readonly URLContext _context;

		public SSOController(IConfiguration configuration, URLContext context)
		{
			_configuration = configuration;
			_context = context;
		}
		[HttpPost("CheckLogin")]
		public async Task<IActionResult> CheckLogin([FromBody] string tokenVerify)
		{
			const string callBack = "https://admin.staxi.vn/home/Login?returnUrl=https://staxi.vn/ShortUrl";

			if (string.IsNullOrEmpty(tokenVerify))
			{
				return Ok(new { redirectUrl = callBack, error = "Token không được cung cấp!" });
			}
			if (!Regex.IsMatch(tokenVerify, @"^[A-Za-z0-9._-]+$"))
			{
				return Ok(new { redirectUrl = callBack, error = "Token chứa ký tự không hợp lệ!" });
			}
			try
			{
				var config = await _context.CompanyConfigs.FirstOrDefaultAsync();
				if (config == null || string.IsNullOrEmpty(config.JWTSecretKey))
				{
					throw new InvalidOperationException("JWTSecretKey không tồn tại hoặc rỗng trong bảng Company.Config.");
				}
				var key = Encoding.UTF8.GetBytes(config.JWTSecretKey);
				var secretKey = new SymmetricSecurityKey(key);
				var handler = new JwtSecurityTokenHandler();
				var validationParameters = new TokenValidationParameters
				{
					ValidateIssuer = false,
					ValidateAudience = false,
					ValidateLifetime = true,
					ValidateIssuerSigningKey = true,
					IssuerSigningKey = secretKey,
				};

				var principal = handler.ValidateToken(tokenVerify, validationParameters, out SecurityToken validatedToken);
				var username = principal.Claims.FirstOrDefault(c => c.Type == "name")?.Value;
				if (username == null)
				{
					return Ok(new { redirectUrl = callBack, error = "Token không chứa thông tin hợp lệ!" });
				}
				var checkLogin = await _context.AdminUsers.FirstOrDefaultAsync(x => x.UserName == username);
				if (checkLogin == null)
				{
					return Ok(new { redirectUrl = callBack, error = "Người dùng không tồn tại!" });
				}
				return Ok(new { message = "Đăng nhập thành công", tokenVerify });
			}
			catch (Exception ex)
			{
				return Ok(new { redirectUrl = callBack, error ="Có lỗi xảy ra"});
			}
		}
	}
}