using Microsoft.Identity.Client;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace server.Models
{
	[Table("ShortURL.Domain")]
	public class ShortURL_Domain
	{
		[Key]
		public int ShortDomainID { get; set; }
		public string Link {  get; set; } 
		public string Name {  get; set; }
	}
}
