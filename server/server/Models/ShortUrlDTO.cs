namespace server.Models
{
	public class ShortUrlDTO
	{
		public string projectName {  get; set; }
		public string originalUrl { get; set; }
		public string domain { get; set; }
		public string alias { get; set; } = string.Empty;
		public string qrCode { get; set; }
		public DateTime CreateAt { get; set; }
	}
}
