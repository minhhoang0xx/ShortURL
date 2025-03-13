using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace server.Models
{
	[Table("ShortURL.Link")]
	public class ShortURL_Link
	{
		[Key]
		public int ShortId { get; set; }
		public string ProjectName {  get; set; }
		public string OriginalUrl { get; set; }
		public string Domain { get; set; }
		public string Alias { get; set; }= string.Empty;
		public string QrCode { get; set; }
		public DateTime CreateAt { get; set; }
	}
}
