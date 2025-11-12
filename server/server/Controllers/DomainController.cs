using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.Models;

namespace server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DomainController : ControllerBase
    {
        private readonly URLContext _context;

        public DomainController(URLContext context)
        {
            _context = context;
        }

        #region Domain hệ thống như Bagps, Staxi, Baex

        [HttpGet("getAll")]
        public async Task<IActionResult> getAllDomain()
        {
            var urls = await _context.Domains.ToListAsync();
            var result = urls.Select(url => new
            {
                id = url.ShortDomainID,
                Link = url.Link,
                name = url.Name,
            });

            return Ok(result);
        }

        [HttpPost("addDomain")]
        public async Task<IActionResult> addDomain([FromBody] ShortURL_DomainDTO domain)
        {
            var existedDomain = await _context.Domains.FirstOrDefaultAsync(x => x.Link == domain.Link);
            if (existedDomain != null)
            {
                return BadRequest(new { message = "Domain này đã tồn tại!" });
            }
            var create = new ShortURL_Domain
            {
                Link = domain.Link,
                Name = domain.Name
            };
            _context.Domains.Add(create);
            _context.SaveChanges();

            return Ok();
        }

        [HttpPut("updateDomain/{id}")]
        public async Task<IActionResult> UpdateDomain(int id, [FromBody] ShortURL_DomainDTO domain)
        {
            var data = await _context.Domains.FindAsync(id);

            if (data.Link != domain.Link)
            {
                var existedDomain = await _context.Domains.FirstOrDefaultAsync(x => x.Link == domain.Link);
                if (existedDomain != null)
                {
                    return BadRequest(new { message = "Domain này đã tồn tại!" });
                }
            }
            data.Link = domain.Link;
            data.Name = domain.Name;

            _context.Domains.Update(data);
            _context.SaveChanges();
            return Ok();
        }

        [HttpDelete("deleteDomain/{id}")]
        public async Task<IActionResult> DeleteDomain(int id)
        {
            var data = await _context.Domains.FindAsync(id);
            if (data == null) { return BadRequest(new { message = "Domain này không tồn tại." }); }

            _context.Domains.Remove(data);
            _context.SaveChanges();
            return Ok();
        }

        #endregion Domain hệ thống như Bagps, Staxi, Baex

        ///////////////////////////////////////////////////////////

        #region Domain cho urlOriginal

        [HttpGet("getAllRedirect")]
        public async Task<IActionResult> GetAllRedirect()
        {
            var urls = await _context.ShortURLRedirects.ToListAsync();
            var result = urls.Select(url => new
            {
                id = url.ShortRedirectID,
                domain = url.Domain,
                description = url.Description,
            });

            return Ok(result);
        }

        [HttpPost("createRedirect")]
        public async Task<IActionResult> AddRedirect([FromBody] ShortURL_RedirectDTO domain)
        {
            var existedDomain = await _context.ShortURLRedirects.FirstOrDefaultAsync(x => x.Domain == domain.Domain);
            if (existedDomain != null)
            {
                return BadRequest(new { message = "Domain này đã tồn tại!" });
            }
            var create = new ShortURL_Redirect
            {
                Domain = domain.Domain,
                Description = domain.Description ?? ""
            };
            _context.ShortURLRedirects.Add(create);
            _context.SaveChanges();

            return Ok("Thêm mới thành công!");
            //return Ok(new { message = "Thêm mới thành công!", id = create.ShortRedirectID });
        }

        [HttpPut("updateRedirect/{id}")]
        public async Task<IActionResult> UpdateRedirect(int id, [FromBody] ShortURL_RedirectDTO domain)
        {
            var data = await _context.ShortURLRedirects.FindAsync(id);

            if (data.Domain != domain.Domain)
            {
                var existedDomain = await _context.ShortURLRedirects.FirstOrDefaultAsync(x => x.Domain == domain.Domain);
                if (existedDomain != null)
                {
                    return BadRequest(new { message = "Domain này đã tồn tại!" });
                }
            }
            data.Domain = domain.Domain;
            data.Description = domain.Description;

            _context.ShortURLRedirects.Update(data);
            _context.SaveChanges();
            return Ok("Cập nhật thành công!");
        }

        [HttpDelete("deleteRedirect/{id}")]
        public async Task<IActionResult> DeleteDRedirect(int id)
        {
            var data = await _context.ShortURLRedirects.FindAsync(id);
            if (data == null) { return BadRequest(new { message = "Domain này không tồn tại." }); }

            _context.ShortURLRedirects.Remove(data);
            _context.SaveChanges();
            return Ok("Xóa thành công!");
        }

        #endregion Domain cho urlOriginal
    }
}