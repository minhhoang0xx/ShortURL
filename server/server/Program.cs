using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.EntityFrameworkCore;
using server.Controllers;
using server.Data;
using System;
using server.Services;
using Microsoft.AspNetCore.HttpOverrides;



var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<URLContext>(options =>
	options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddControllers();
builder.Services.AddHttpClient("RecaptchaClient");
builder.Services.AddScoped<RecaptchaService>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddScoped<JwtService>();


string jwtSecretKey = null;
using (var scope = builder.Services.BuildServiceProvider().CreateScope())
{
	var context = scope.ServiceProvider.GetRequiredService<URLContext>();
	jwtSecretKey = context.CompanyConfigs.FirstOrDefault()?.JWTSecretKey;
}
if (string.IsNullOrEmpty(jwtSecretKey))
{
	throw new InvalidOperationException("JWTSecretKey không tồn tại hoặc rỗng trong bảng Company.Config.");
}

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options =>
{
	options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = false,
        ValidateAudience = false,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(jwtSecretKey))

    };
});

var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>();
builder.Services.AddCors(options =>
{
	options.AddPolicy(name: MyAllowSpecificOrigins,
		policy =>
		{
			policy.WithOrigins(allowedOrigins)
				  .AllowAnyHeader()
				  .AllowAnyMethod()
                  .AllowCredentials();
		});
});
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
	options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
	options.KnownNetworks.Clear(); 
	options.KnownProxies.Clear();
});

var app = builder.Build();
app.UseForwardedHeaders();
app.UseSwagger();
app.UseSwaggerUI();
app.UseHttpsRedirection();
app.UseRouting();
app.UseCors(MyAllowSpecificOrigins);
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();