using System;
using System.Net.Http;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

public class RecaptchaService
{
	private readonly IHttpClientFactory _httpClientFactory;
	private readonly string _recaptchaSecret;
	private readonly ILogger<RecaptchaService> _logger;

	public RecaptchaService(
		IHttpClientFactory httpClientFactory,
		IConfiguration configuration,
		ILogger<RecaptchaService> logger)
	{
		_httpClientFactory = httpClientFactory;
		_recaptchaSecret = configuration["RECAPTCHA_SECRET_KEY"];
		_logger = logger;
	}

	public async Task<bool> VerifyRecaptchaAsync(string token)
	{
		if (string.IsNullOrEmpty(token))
		{
			_logger.LogWarning("reCAPTCHA token không tồn tại");
			return false;
		}

		try
		{
			var httpClient = _httpClientFactory.CreateClient("RecaptchaClient");
			var url = $"https://www.google.com/recaptcha/api/siteverify?secret={_recaptchaSecret}&response={token}";
			var response = await httpClient.PostAsync(url, null);

			if (!response.IsSuccessStatusCode)
			{
				_logger.LogWarning("reCAPTCHA xác thực thất bại: {StatusCode}", response.StatusCode);
				return false;
			}

			var json = await response.Content.ReadAsStringAsync();
			var result = JsonSerializer.Deserialize<RecaptchaResponse>(json);

			if (!result.Success)
			{
				_logger.LogWarning("reCAPTCHA xác thực thất bại. Error codes: {ErrorCodes}", string.Join(", ", result.ErrorCodes ?? Array.Empty<string>()));
			}

			return result.Success;
		}
		catch (Exception ex)
		{
			_logger.LogError(ex, "xảy ra lỗi trong khi xác thực reCAPTCHA ");
			return false;
		}
	}
}

public class RecaptchaResponse
{
	[JsonPropertyName("success")]	
	public bool Success { get; set; }

	[JsonPropertyName("error-codes")]
	public string[]? ErrorCodes { get; set; }
}
