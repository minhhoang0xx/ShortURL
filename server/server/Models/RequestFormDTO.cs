namespace server.Models
{
	public class RequestFormDTO
	{
		public string projectName { get; set; }
		public string? fullName { get; set; }
		public string? email { get; set; }
		public string? phoneNumber { get; set; }
		public string? message { get; set; }
		public string? status { get; set; }
		public string? RecaptchaToken { get; set; }

	}
}
