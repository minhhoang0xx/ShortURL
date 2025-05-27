
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OfficeOpenXml;
using server.Data;
using server.Models;
using OfficeOpenXml.Style;
using System.Collections.Generic;
using System.IO;
using System.Drawing;
using Microsoft.AspNetCore.Authorization;

namespace server.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class DownloadController : ControllerBase
	{
		private readonly URLContext _context;

		public DownloadController(URLContext context)
		{
			_context = context;
		}
		[Authorize]
		[HttpPost("download")]
		public async Task<IActionResult> ExportToExcel([FromBody] List<ShortURL_LinkDTO> shortUrls)
		{
			if (shortUrls == null || shortUrls.Count == 0)
			{
				return BadRequest("Dữ liệu rỗng hoặc không hợp lệ.");
			}
			try
			{
				ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

				using (var package = new ExcelPackage())
				{
					var worksheet = package.Workbook.Worksheets.Add("ShortUrls");
					// Tiêu đề Form
					worksheet.Cells[1, 1].Value = "SHORT URLs";
					worksheet.Cells[1, 1, 1, 13].Merge = true; 
					worksheet.Cells[1, 1].Style.Font.Name = "Times New Roman";
					worksheet.Cells[1, 1].Style.Font.Size = 16;
					worksheet.Cells[1, 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
					worksheet.Cells[1, 1].Style.Font.Bold = true;
					worksheet.Cells[1, 1].Style.Fill.PatternType = ExcelFillStyle.Solid;
					worksheet.Cells[1, 1].Style.Fill.BackgroundColor.SetColor(Color.FromArgb(167, 200, 250));
					worksheet.Cells[1, 1].Style.Border.BorderAround(ExcelBorderStyle.Medium);

					worksheet.Cells[2, 1].Value = "STT";
					worksheet.Cells[2, 2].Value = "Dự án";
					worksheet.Cells[2, 3].Value = "Tên đường dẫn";
					worksheet.Cells[2, 4].Value = "URL gốc";
					worksheet.Cells[2, 5].Value = "ShortLink";
					worksheet.Cells[2, 6].Value = "QrCode";
					worksheet.Cells[2, 7].Value = "Ngày cập nhật";
					worksheet.Cells[2, 8].Value = "Ngày hết hạn";
					worksheet.Cells[2, 9].Value = "Người cập nhật";
					worksheet.Cells[2, 10].Value = "Trạng thái";
					worksheet.Cells[2, 11].Value = "Kiểm tra OS"; 
					worksheet.Cells[2, 12].Value = "iOS Link"; 
					worksheet.Cells[2, 13].Value = "Android Link";


					var headerRange = worksheet.Cells[2, 1, 2, 13];
					headerRange.Style.Font.Name = "Times New Roman";
					headerRange.Style.Font.Size = 12;
					headerRange.Style.Font.Bold = true;
					headerRange.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
					headerRange.Style.VerticalAlignment = ExcelVerticalAlignment.Center;
					headerRange.Style.Border.BorderAround(ExcelBorderStyle.Thin);
					headerRange.Style.Border.Top.Style = ExcelBorderStyle.Thin;
					headerRange.Style.Border.Left.Style = ExcelBorderStyle.Thin;
					headerRange.Style.Border.Right.Style = ExcelBorderStyle.Thin;
					headerRange.Style.Border.Bottom.Style = ExcelBorderStyle.Thin;

					worksheet.Column(4).Width = 50;
					worksheet.Column(5).Width = 50;
					worksheet.Column(6).Width = 20;
					worksheet.Column(7).Width = 20;
					worksheet.Column(8).Width = 20;
					worksheet.Column(12).Width = 20; 
					worksheet.Column(13).Width = 20;

					int row = 3;
					int index = 1;
					foreach (var url in shortUrls)
					{
						worksheet.Cells[row, 1].Value = index; index++;
						worksheet.Cells[row, 2].Value = url.ProjectName;
						worksheet.Cells[row, 3].Value = url.Alias;
						worksheet.Cells[row, 4].Value = url.OriginalUrl;
						worksheet.Cells[row, 5].Value = $"{url.Domain}/{url.Alias}";
						worksheet.Cells[row, 6].Value = url.QrCode;
						worksheet.Cells[row, 7].Value = url.CreateAt.ToString("HH:mm dd/MM/yyyy");
						worksheet.Cells[row, 8].Value = url.Expiry?.ToString("00:00 dd/MM/yyyy") ?? "Vô thời hạn";
						worksheet.Cells[row, 9].Value = url.CreatedByUser;
						worksheet.Cells[row, 10].Value = url.Status.HasValue ? (url.Status.Value ? "Hoạt động" : "Quá Hạn") : "Không xác định";
						worksheet.Cells[row, 11].Value = url.CheckOS.HasValue ? (url.CheckOS.Value ? "Có" : "Không") : "Không xác định"; 
						worksheet.Cells[row, 12].Value = url.IosLink ?? "Không có"; 
						worksheet.Cells[row, 13].Value = url.AndroidLink ?? "Không có"; 


						// căn chỉnh thông tin
						worksheet.Cells[row, 2].Style.HorizontalAlignment = ExcelHorizontalAlignment.Left;
						worksheet.Cells[row, 3].Style.HorizontalAlignment = ExcelHorizontalAlignment.Left;
						worksheet.Cells[row, 4].Style.HorizontalAlignment = ExcelHorizontalAlignment.Left;
						worksheet.Cells[row, 5].Style.HorizontalAlignment = ExcelHorizontalAlignment.Left;
						worksheet.Cells[row, 6].Style.HorizontalAlignment = ExcelHorizontalAlignment.Left;
						worksheet.Cells[row, 7].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
						worksheet.Cells[row, 8].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
						worksheet.Cells[row, 9].Style.HorizontalAlignment = ExcelHorizontalAlignment.Left;
						worksheet.Cells[row, 10].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
						worksheet.Cells[row, 11].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
						worksheet.Cells[row, 12].Style.HorizontalAlignment = ExcelHorizontalAlignment.Left;
						worksheet.Cells[row, 13].Style.HorizontalAlignment = ExcelHorizontalAlignment.Left;

						if (url.Status.HasValue && !url.Status.Value)
						{
							worksheet.Cells[row, 10].Style.Font.Color.SetColor(System.Drawing.Color.Red);
						}

						// Đặt font cho dữ liệu
						worksheet.Cells[row, 1, row, 13].Style.Font.Name = "Times New Roman";
						worksheet.Cells[row, 1, row, 13].Style.Font.Size = 10;
						worksheet.Cells[row, 1, row, 13].Style.Border.BorderAround(ExcelBorderStyle.Thin);
						worksheet.Cells[row, 1, row, 13].Style.Border.Left.Style = ExcelBorderStyle.Thin;
						worksheet.Cells[row, 1, row, 13].Style.Border.Right.Style = ExcelBorderStyle.Thin;

						row++;
					}

				
					for (int col = 1; col <= 13; col++)
					{
						if (col != 4 && col != 6 && col != 5 && col != 12 && col != 13 && col != 8 && col != 7) 
							worksheet.Column(col).AutoFit();
					}
					var dataRange = worksheet.Cells[2, 1, row - 1, 13];
					dataRange.Style.Border.Top.Style = ExcelBorderStyle.Thin;
					dataRange.Style.Border.Left.Style = ExcelBorderStyle.Thin;
					dataRange.Style.Border.Right.Style = ExcelBorderStyle.Thin;
					dataRange.Style.Border.Bottom.Style = ExcelBorderStyle.Thin;

					string timestamp = DateTime.Now.ToString("yyyy_M_d_HH_mm_ss");
					string fileName = $"ShortURL_{timestamp}.xlsx";

					var stream = new MemoryStream();
					package.SaveAs(stream);
					stream.Position = 0;
					return File(stream, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
				}
			}	
            catch (Exception ex)
            {
                Console.WriteLine($"Lỗi khi tạo file Excel: {ex.Message}");
                return StatusCode(500, "Đã xảy ra lỗi khi tạo file Excel.");
			}

		}
	}
}
