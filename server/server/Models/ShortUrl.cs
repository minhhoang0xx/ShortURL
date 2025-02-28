using System;

namespace server.Models
{
	public class ShortUrl
	{
		public int ID { get; set; }
		public string projectName {  get; set; }
		public string originalUrl { get; set; }
		public string domain { get; set; }
		public string alias { get; set; }= string.Empty;
		public DateTime CreateAt { get; set; }
	}
}
