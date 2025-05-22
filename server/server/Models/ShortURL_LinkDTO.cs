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
		public bool CheckOS { get; set; }
		public string? IosLink { get; set; }
		public string? AndroidLink { get; set; }
		public string? CreatedByUser { get; set; }
		public DateTime? Expiry { get; set; }
		public bool Status { get; set; } = true;
	}
}
