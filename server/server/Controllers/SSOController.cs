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

		public SSOController(IConfiguration configuration)
		{
			_configuration = configuration;
		}
		[HttpPost("{token}")]
		public async Task<IActionResult> CheckLogin(string token)
		{
			if (string.IsNullOrEmpty(token))
			{
				return Redirect("https://admin.staxi.vn/login?returnUrl=https://staxi.vn/SSO");
			}
			try
			{		
				var handler = new JwtSecurityTokenHandler();
				var jwtToken = handler.ReadJwtToken(token);
				var username = jwtToken.Claims.FirstOrDefault(x => x.Type == "name")?.Value;
				var password = jwtToken.Claims.FirstOrDefault(x => x.Type == "password")?.Value;
				if (string.IsNullOrEmpty(username) || string.IsNullOrEmpty(password))
				{
					return Redirect("https://admin.staxi.vn/login?returnUrl=https://staxi.vn/SSO");
				}
				return Redirect($"https://staxi.vn/ShortUrl?token={token}");
			}
			catch (Exception ex)
			{
				return Redirect("https://admin.staxi.vn/login?returnUrl=https://staxi.vn/SSO");
			}

		}
	}
}
















// ----------có sử dụng key để bảo mật----------
//var secretKey = _configuration["Jwt:Key"];
//var key = Encoding.UTF8.GetBytes(secretKey);
//var tokenHandler = new JwtSecurityTokenHandler();
//var validationParameters = new TokenValidationParameters
//{
//	ValidateIssuer = false,
//	ValidateAudience = false,
//	ValidateLifetime = false, 
//	ValidateIssuerSigningKey = true,
//	IssuerSigningKey = new SymmetricSecurityKey(key)
//};
//var principal = tokenHandler.ValidateToken(token, validationParameters, out SecurityToken validatedToken);	
//var username = principal.FindFirst("username")?.Value;
//var password = principal.FindFirst("password")?.Value;