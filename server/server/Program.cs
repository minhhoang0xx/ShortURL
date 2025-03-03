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

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();

app.UseRouting();

app.UseEndpoints(endpoints =>
{
	endpoints.MapControllerRoute(
		name: "shortUrl",
		pattern: "{domain}/{alias}",
		defaults: new { controller = "ShortUrl", action = "Redirect2" }
	);
	endpoints.MapControllers();
});
//app.MapControllers();
app.Run();
