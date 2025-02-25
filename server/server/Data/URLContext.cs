using server.Models;
using System.Collections.Generic;
using System;
using Microsoft.EntityFrameworkCore;

namespace server.Data
{
	public class URLContext : DbContext
	{	
		public URLContext(DbContextOptions<URLContext> options) : base(options) { }
		public DbSet<ShortUrl> ShortUrls { get; set; }
	}
}
