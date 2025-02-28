using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Controllers;
using server.Data;
using System;


var builder = WebApplication.CreateBuilder(args);
// Add services to the container.
builder.Services.AddDbContext<URLContext>(options =>
	options.UseSqlServer(builder.Configuration.GetConnectionString("URLContext")));
    
builder.Services.AddControllers();
builder.Services.AddControllersWithViews();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";
builder.Services.AddControllers().AddJsonOptions(options =>
{
	options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.Preserve;
});
builder.Services.AddCors(options =>
{
	options.AddPolicy(name: MyAllowSpecificOrigins,
		policy =>
		{
			policy.WithOrigins("http://localhost:3000")
				  .AllowAnyHeader()
				  .AllowAnyMethod();
		});
});


var app = builder.Build();
app.UseCors(MyAllowSpecificOrigins);
app.MapGet("/{code}", async context =>
{
	var code = context.Request.RouteValues["code"]?.ToString();
	var host = context.Request.Host.Value; // Lấy domain từ request 
	var dbContext = context.RequestServices.GetRequiredService<URLContext>();
	var fullHost = $"https://{host}";
	var url = await dbContext.ShortUrls.FirstOrDefaultAsync(x => x.alias == code && x.domain == fullHost);
	if (url == null)
	{
		context.Response.StatusCode = 404;
		await context.Response.WriteAsync("ShortURL not exist");
		return;
	}

	context.Response.Redirect(url.originalUrl);
});

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();
app.Run();
