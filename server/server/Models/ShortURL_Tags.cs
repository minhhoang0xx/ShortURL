using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace server.Models
{
	[Table("ShortURL.Tags")]
	public class ShortURL_Tags
	{
		[Key]
		public int Id { get; set; }

		public string Name { get; set; } = string.Empty;
		public ICollection<ShortURL_LinkTag> LinkTags { get; set; }
	}
}
