using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace server.Models
{		
	[Table("ShortURL.FormRequest")]
	public class FormRequest
	{
		[Key]
		public int reqId { get; set; }
		public string projectName { get; set; }
		public string? fullName { get; set; }
		public string? email { get; set; }
		public string? phoneNumber { get; set; }
		public string? message { get; set; }
		public string? company {  get; set; }
		public string? address { get; set; }
		public string? status { get; set; }
	}
}
