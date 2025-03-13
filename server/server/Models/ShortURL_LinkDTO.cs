namespace server.Models
{
	public class ShortURL_LinkDTO
	{
		public string ProjectName {  get; set; }
		public string OriginalUrl { get; set; }
		public string Domain { get; set; }
		public string Alias { get; set; } = string.Empty;
		public string QrCode { get; set; }
		public DateTime CreateAt { get; set; }
	}
}
