using server.Models;
using System.Collections.Generic;
using System;
using Microsoft.EntityFrameworkCore;


namespace server.Data
{
	public class URLContext : DbContext
	{	
		public URLContext(DbContextOptions<URLContext> options) : base(options) { }
		public DbSet<ShortURL_Link> ShortUrls { get; set; }
		public DbSet<ShortURL_Domain> Domains { get; set; }
		public DbSet<Admin_Users> AdminUsers { get; set; }
		public DbSet<RequestForm> FormRequests { get; set; }
	}
}
