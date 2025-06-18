using Microsoft.IdentityModel.Tokens;
using server.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace server.Services
{
    public class JwtService
    {
        private readonly IConfiguration _configuration;
		private readonly URLContext _context;
		public JwtService(IConfiguration configuration, URLContext context)
        {
            _configuration = configuration;
			_context = context;
		}

        public string GenerateToken(string UserName)
        {
            var config = _context.CompanyConfigs.FirstOrDefault();
            if (config == null || string.IsNullOrEmpty(config.JWTSecretKey))
			{
				throw new InvalidOperationException("JWTSecretKey không tồn tại hoặc rỗng trong bảng Company.Config.");
			}
			var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config.JWTSecretKey));
			var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

			var claims = new[]
			{
			   new Claim("name", UserName)
			};

			var token = new JwtSecurityToken(

				claims: claims,
				expires: DateTime.Now.AddDays(1),
				signingCredentials: credentials
			);

			return new JwtSecurityTokenHandler().WriteToken(token);
		}
    }
}