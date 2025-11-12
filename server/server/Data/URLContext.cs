using server.Models;
using System.Collections.Generic;
using System;
using Microsoft.EntityFrameworkCore;
using Azure;

namespace server.Data
{
    public class URLContext : DbContext
    {
        public URLContext(DbContextOptions<URLContext> options) : base(options)
        {
        }

        public DbSet<ShortURL_Link> ShortUrls { get; set; }
        public DbSet<ShortURL_Domain> Domains { get; set; }
        public DbSet<Admin_Users> AdminUsers { get; set; }
        public DbSet<FormRequest> FormRequests { get; set; }
        public DbSet<ShortURL_Count> Counts { get; set; }
        public DbSet<ShortURL_Tags> Tags { get; set; }
        public DbSet<ShortURL_LinkTag> LinkTags { get; set; }
        public DbSet<Company_Config> CompanyConfigs { get; set; }
        public DbSet<ShortURL_Redirect> ShortURLRedirects { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<ShortURL_LinkTag>()
                .HasKey(lt => new { lt.ShortId, lt.TagId });

            modelBuilder.Entity<ShortURL_LinkTag>()
                .HasOne(lt => lt.Link)
                .WithMany(l => l.LinkTags)
                .HasForeignKey(lt => lt.ShortId);

            modelBuilder.Entity<ShortURL_LinkTag>()
                .HasOne(lt => lt.Tag)
                .WithMany(t => t.LinkTags)
                .HasForeignKey(lt => lt.TagId);
        }
    }
}