using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace server.Models
{
	[Table("Company.Config")]
	public class Company_Config
	{
		[Key]
		public int PK_ConfigId { get; set; }
		public string? ConfigCode { get; set; }
		public DateTime? UpdatedDate { get; set; }
		public string? JWTSecretKey { get; set; }


	}
}
