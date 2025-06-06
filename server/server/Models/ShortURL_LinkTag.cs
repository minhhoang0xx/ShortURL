using Azure;
using System.ComponentModel.DataAnnotations.Schema;

namespace server.Models
{
	[Table("ShortURL.LinkTags")]
	public class ShortURL_LinkTag
	{
		public int ShortId { get; set; }
		public ShortURL_Link Link { get; set; }

		public int TagId { get; set; }
		public ShortURL_Tags Tag { get; set; }
	}
}
