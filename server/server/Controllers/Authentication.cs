
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.Models;
using System.Security.Cryptography;
namespace server.Controllers;
using Microsoft.AspNetCore.Authorization;
using server.Services;
using System.Collections.Concurrent;
using System.Text;
using Novell.Directory.Ldap;
using System.Net.Http;
using System.Text.Json.Nodes;
using Newtonsoft.Json;
using Microsoft.Extensions.Hosting;

[Route("api/[controller]")]
[ApiController]
public class Authentication : ControllerBase
{
	private readonly JwtService _jwtService;
	private readonly URLContext _context;
	private readonly RecaptchaService _recaptchaService;
	private readonly IConfiguration _configuration;
	private readonly IHttpClientFactory _httpClientFactory;
	private static ConcurrentDictionary<string, (int Count, DateTime FirstAttempt)> submitAttempts = new();
	private static readonly TimeSpan AttemptLifetime = TimeSpan.FromHours(1);
	public Authentication(URLContext context, RecaptchaService recaptchaService, JwtService jwtService, IConfiguration configuration, IHttpClientFactory httpClientFactory)
	{
		_context = context;
		_recaptchaService = recaptchaService;
		_jwtService = jwtService;
		_configuration = configuration;
		_httpClientFactory = httpClientFactory;
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
		submitAttempts.TryUpdate(clientIp, (0, DateTime.UtcNow), submitAttempts.GetValueOrDefault(clientIp));
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



	[HttpPost("Login")]
	public async Task<IActionResult> Login([FromBody] Admin_UserDTO account)
	{
		string clientIp = HttpContext.Request.Headers["X-Forwarded-For"].FirstOrDefault()
		?? HttpContext.Connection.RemoteIpAddress?.ToString()
		?? "local";

		int attempts = Failed(clientIp);
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
		string usernameOnly = account.UserName;
		string domain = string.Empty;
		if (account.UserName.Contains("@"))
		{
			var part = account.UserName.Split('@');	
			usernameOnly = part[0];
			domain = part[1];
		}
		var checkLogin = await _context.AdminUsers.FirstOrDefaultAsync(x => x.UserName == usernameOnly);
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
		if (domain.Equals("bagroup.vn", StringComparison.OrdinalIgnoreCase) ||
			domain.Equals("bagps.vn", StringComparison.OrdinalIgnoreCase))
		{

			var ldapOk = await AuthenLDAP(usernameOnly, account.Password, domain);
			if (!ldapOk)
			{
				Increase(clientIp);
				return BadRequest(new ErrorResponse
				{
					ErrorCode = "LDAP_FAIL",
					ErrorMessage = "Đăng nhập bằng tài khoản @bagroup.vn thất bại!",
					attempts = Failed(clientIp),
					RequiresCaptcha = Failed(clientIp) >= 3
				});
			}
		}
		else
		{
			var checkPassword = HashToMD5(account.Password).ToUpper();
			if (checkLogin.Password != checkPassword)
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

		}
		Reset(clientIp);
		var token = _jwtService.GenerateToken(account.UserName.ToString());
		return Ok(new { message = "Đăng nhập thành công", token, attempts = Failed(clientIp) });
		
	    }

    [HttpPost("LoginForBagps")]
    public async Task<IActionResult> LoginForBagps([FromBody] Admin_UserDTO account)
    {
        string clientIp = HttpContext.Request.Headers["X-Forwarded-For"].FirstOrDefault()
            ?? HttpContext.Connection.RemoteIpAddress?.ToString()
            ?? "local";

        int attempts = Failed(clientIp);
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

        string usernameOnly = account.UserName;
        string domain = string.Empty;
        if (account.UserName.Contains("@"))
        {
            var part = account.UserName.Split('@');
            usernameOnly = part[0];
            domain = part[1];
        }

        // Đọc cờ IsAllBAGroup từ configuration
        bool isAllBAGroup = _configuration["IsAllBAGroup"] == "1";

        if (domain.Equals("bagroup.vn", StringComparison.OrdinalIgnoreCase) && isAllBAGroup)
        {
            var ldapOk = await AuthenLDAP(usernameOnly, account.Password, domain);
            if (!ldapOk)
            {
                Increase(clientIp);
                return BadRequest(new ErrorResponse
                {
                    ErrorCode = "LDAP_FAIL",
                    ErrorMessage = "Đăng nhập bằng tài khoản @bagroup.vn thất bại!",
                    attempts = Failed(clientIp),
                    RequiresCaptcha = Failed(clientIp) >= 3
                });
            }
        }
        else
        {
            var checkLogin = await _context.AdminUsers.FirstOrDefaultAsync(x => x.UserName == usernameOnly);
            if (checkLogin == null)
            {
                Increase(clientIp);
                return BadRequest(new ErrorResponse
                {
                    ErrorCode = "USERNAME_NOT_EXISTED",
                    ErrorMessage = "Tài khoản hoặc mật khẩu không đúng!",
                    attempts = Failed(clientIp),
                    RequiresCaptcha = Failed(clientIp) >= 3
                });
            }

            if (domain.Equals("bagroup.vn", StringComparison.OrdinalIgnoreCase) ||
                domain.Equals("bagps.vn", StringComparison.OrdinalIgnoreCase))
            {
                var ldapOk = await AuthenLDAP(usernameOnly, account.Password, domain);
                if (!ldapOk)
                {
                    Increase(clientIp);
                    return BadRequest(new ErrorResponse
                    {
                        ErrorCode = "LDAP_FAIL",
                        ErrorMessage = "Đăng nhập bằng tài khoản @bagroup.vn hoặc @bagps.vn thất bại!",
                        attempts = Failed(clientIp),
                        RequiresCaptcha = Failed(clientIp) >= 3
                    });
                }
            }
            else
            {
                var checkPassword = HashToMD5(account.Password).ToUpper();
                if (checkLogin.Password != checkPassword)
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
            }
        }

        Reset(clientIp);
        var token = _jwtService.GenerateToken(account.UserName.ToString());
        return Ok(new { message = "Đăng nhập thành công", token, attempts = Failed(clientIp) });
    }
   
	[Authorize]
	[HttpPost("logout")]
	public async Task<IActionResult> Logout()
	{
		return Ok(new { message = "Đăng xuất thành công" });
	}


	private async Task<bool> AuthenLDAP(string username , string password , string domain)
	{
		var Config = _configuration.GetSection($"LDAP:Domains:{domain}");
		var host = Config["Host"];
		var port = int.Parse(Config["Port"]);
		var userDN = Config["UserDn"];
		var serviceUsername = Config["ServiceUser"];
		var servicePassword = Config["ServicePassword"];

		string userLoginName = string.Format(userDN, username);

		try
		{
			using (var connection = new LdapConnection() )
			{
				connection.SecureSocketLayer = false;
				await connection.ConnectAsync(host, port);
				await connection.BindAsync(serviceUsername, servicePassword); // bind với tài khoản xác thực LDAP
				await connection.BindAsync(userLoginName, password); // bind với tài khoản từ client
				return connection.Bound;
			}
		}
		catch (LdapException)
		{
			return false;
		}

	}

}

