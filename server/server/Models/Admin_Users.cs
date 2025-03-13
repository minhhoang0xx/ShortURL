using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace server.Models
{
	[Table("Admin.Users")]
	public class Admin_Users
	{
		[Key]
		public Guid AdminId { get; set; }
		public string? UserName { get; set; }
		public string? Password {  get; set; }
		public string? Fullname {  get; set; }
		public string? PhoneNumber { get; set; }

		public string? Email { get; set; }

		public bool? IsLock { get; set; }

		public bool? IsDeleted { get; set; }

		public Guid? CreatedByUser { get; set; }

		public DateTime? CreatedDate { get; set; }

		public Guid? UpdatedByUser { get; set; }

		public DateTime? UpdatedDate { get; set; }

		public string? IPAddress { get; set; }

		public bool IsReadOnly { get; set; }
	}
}

