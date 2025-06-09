using Azure;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace server.Models
{
	[Table("ShortURL.Links")]
	public class ShortURL_Link
	{
		[Key]
		public int ShortId { get; set; }
		public string ProjectName { get; set; }
		public string OriginalUrl { get; set; }
		public string Domain { get; set; }
		public string Alias { get; set; } = string.Empty;
		public string QrCode { get; set; }
		public DateTime CreateAt { get; set; }
		public bool? CheckOS { get; set; }
		public string? IosLink { get; set; }
		public string? AndroidLink { get; set; }
		public string? CreatedByUser { get; set; }
		public DateTime? Expiry {  get; set; }
		public bool? Status { get; set; } = true;
		public int? ClickCount { get; set; }

		public ICollection<ShortURL_LinkTag> LinkTags { get; set; }
	}
}
