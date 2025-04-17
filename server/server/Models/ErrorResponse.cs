namespace server.Models
{	
	public class ErrorResponse
	{
		
		public string ErrorCode { get; set; }
		public string ErrorMessage { get; set; }
		public int attempts { get; set; }
		public bool RequiresCaptcha { get; set; } = false;
	}
}
