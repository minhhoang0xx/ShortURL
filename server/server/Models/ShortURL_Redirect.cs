using Microsoft.Identity.Client;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace server.Models
{
    [Table("ShortURL.Redirects")]
    public class ShortURL_Redirect
    {
        [Key]
        public int ShortRedirectID { get; set; }

        public string Domain { get; set; }
        public string? Description { get; set; }
    }
}