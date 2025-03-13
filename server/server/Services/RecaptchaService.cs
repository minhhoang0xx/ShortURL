using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;

public class RecaptchaService
{
	private readonly HttpClient _httpClient;
	private readonly string _recaptchaSecret;

	public RecaptchaService(IConfiguration configuration)
	{
		_httpClient = new HttpClient();
		_recaptchaSecret = configuration["RECAPTCHA_SECRET_KEY"];
	}

	public async Task<bool> VerifyRecaptchaAsync(string token)
	{
		var response = await _httpClient.PostAsync($"https://www.google.com/recaptcha/api/siteverify?secret={_recaptchaSecret}&response={token}", null);
		if (!response.IsSuccessStatusCode) return false;

		var json = await response.Content.ReadAsStringAsync();
		var result = JsonSerializer.Deserialize<RecaptchaResponse>(json);
		return result?.Success ?? false;
	}
}

public class RecaptchaResponse
{
	public bool Success { get; set; }
}
