using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace server.Models
{		
	[Table("ShortURL.RequestForm")]
	public class RequestForm
	{
		[Key]
		public int ReqId { get; set; }
		public string projectName { get; set; }
		public string? fullName { get; set; }
		public string? email { get; set; }
		public string? phoneNumber { get; set; }
		public string? message { get; set; }
	}
}
