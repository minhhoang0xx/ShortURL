
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.Models;
using System.Security.Cryptography;
namespace server.Controllers;
using System.Text;

[Route("api/[controller]")]
[ApiController]
public class Authentication : ControllerBase
	{
		private readonly URLContext _context;
		public	Authentication(URLContext context)
		{
			_context = context;
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


		[HttpPost("Login")]
		public async Task<IActionResult> Login([FromBody] Admin_UserDTO account)
		{
		 
			var checkLogin = await _context.AdminUsers.FirstOrDefaultAsync(x => x.UserName == account.UserName);
			if (checkLogin == null)
			{
				return BadRequest(new { message="This Username is not exist!" });
			}
			var checkPassword = HashToMD5(account.Password);
			if(checkLogin.Password != checkPassword)
			{
				return BadRequest(new { message = "Your Password is incorrect!" });
			}

			return Ok(new {message="Login successfully!"});
		}

}
