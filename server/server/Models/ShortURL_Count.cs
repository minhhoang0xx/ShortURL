using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace server.Models
{
	[Table("ShortURL.Counts")]
	public class ShortURL_Count
	{
		[Key]
		public int Id { get; set; }
		public int ShortId { get; set; }

		[ForeignKey("ShortId")]
		public ShortURL_Link ShortURL { get; set; }
		public string? Source { get; set; }
		public string? IP { get; set; }
		public string? UserAgent { get; set; }
		public string? Device { get; set; }
		public string? OS { get; set; }
		public string? Browser { get; set; }
		public string? Referrer { get; set; }
		public DateTime ClickedAt { get; set; }
	}
}
