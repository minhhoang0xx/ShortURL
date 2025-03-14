﻿using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OfficeOpenXml;
using server.Data;

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
		[HttpGet("download")]
		public async Task<IActionResult> ExportToExcel()
		{
			ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
			var shortUrls = await _context.ShortUrls.ToListAsync();

			using (var package = new ExcelPackage())
			{
				var worksheet = package.Workbook.Worksheets.Add("ShortUrls");

				worksheet.Cells[1, 1].Value = "STT";
				worksheet.Cells[1, 2].Value = "Dự án";
				worksheet.Cells[1, 3].Value = "Tên đường dẫn";
				worksheet.Cells[1, 4].Value = "URL gốc";
				worksheet.Cells[1, 5].Value = "ShortLink";
				worksheet.Cells[1, 6].Value = "Ngày cập nhật";
				worksheet.Cells[1, 7].Value = "Người cập nhật";
				int row = 2;
				int index = 1;
				foreach (var url in shortUrls)
				{

					worksheet.Cells[row, 1].Value = index; index++;
					worksheet.Cells[row, 2].Value = url.ProjectName;
					worksheet.Cells[row, 3].Value = url.Alias;
					worksheet.Cells[row, 4].Value = url.OriginalUrl;
					worksheet.Cells[row, 5].Value = $"{url.Domain}/{url.Alias}";
					worksheet.Cells[row, 6].Value = url.CreateAt.ToString("HH:mm dd/MM/yyyy");
					worksheet.Cells[row, 7].Value = null;
					row++;
				}
				worksheet.Cells[worksheet.Dimension.Address].AutoFitColumns();
				var stream = new MemoryStream();
				package.SaveAs(stream);
				stream.Position = 0;
				return File(stream, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
			}
		}
	}
}
