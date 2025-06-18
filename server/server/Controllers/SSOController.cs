using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using server.Data;
using server.Models;
using server.Services;
using System.IdentityModel.Tokens.Jwt;
using System.Text;

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
		[HttpGet("{token}")]
		public async Task<IActionResult> CheckLogin(string token)
		{
			var tokenVerify = token;
			const string callBack = "https://admin.staxi.vn/login?returnUrl=https://staxi.vn/ShortUrl";

			if (string.IsNullOrEmpty(tokenVerify))
			{
				return Ok(new { redirectUrl = callBack, error = "Token không được cung cấp!" });
			}
			try
			{
				var config = _context.CompanyConfigs.FirstOrDefault();
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
				var jwtToken = handler.ValidateToken(token, validationParameters, out SecurityToken validatedToken);
				var username = jwtToken.Claims.FirstOrDefault(x => x.Type == "unique_name")?.Value;
				var checkLogin = await _context.AdminUsers.FirstOrDefaultAsync(x => x.UserName == username);
				if (username == null)
				{
					return Ok(new { redirectUrl = callBack, error = "Token không chứa thông tin hợp lệ!" });
				}
				if (checkLogin == null)
				{
					return Ok(new { redirectUrl = callBack, error = "Người dùng không tồn tại!" });
				}
				return Ok(new { message = "Đăng nhập thành công", tokenVerify });
			}
			catch (Exception ex)
			{
				return Ok(new { redirectUrl = callBack});
			}
		}
	}
}