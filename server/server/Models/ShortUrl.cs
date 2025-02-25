using System;

namespace server.Models
{
	public class ShortUrl
	{
		public int ID { get; set; }
		public string URL { get; set; } = string.Empty;
		public string ShortURL { get; set; }= string.Empty;
		public DateTime? CreatedDate { get; set; }
	}
}
