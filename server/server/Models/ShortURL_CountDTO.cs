using System.ComponentModel.DataAnnotations.Schema;

namespace server.Models
{
	public class ShortURL_CountDTO
	{
		public string? IP { get; set; }
		public string? UserAgent { get; set; }
		public string? Device { get; set; }
		public string? OS { get; set; }
		public string? Browser { get; set; }
		public string? Referrer { get; set; }
		public DateTime ClickedAt { get; set; }
	}
}
