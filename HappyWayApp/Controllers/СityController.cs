using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HappyWayApp.Persistence;
using HappyWayApp.Persistence.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HappyWayApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CityController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CityController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<City>>> GetCities([FromQuery]string query)
        {
            if (!string.IsNullOrEmpty(query) && !char.IsUpper(query[0]))
            {
                var firstChar = query[0];
                var firstCharUpper = char.ToUpper(firstChar);
                query = query.Replace(firstChar, firstCharUpper);
            }

            return await _context.Cities
                .Where(c => c.Name.StartsWith(query))
                .OrderBy(c => c.Name)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<City>> GetCityById(int id)
        {
            return await _context.Cities
                .Where(c => c.Id == id)
                .FirstOrDefaultAsync();
        }

        [HttpGet(nameof(GetCitiesById))]
        public async Task<ActionResult<IEnumerable<City>>> GetCitiesById([FromQuery]IEnumerable<int> ids)
        {
            return await _context.Cities
                .Where(c => ids.Any(id => id == c.Id))
                .ToListAsync();
        }
    }
}
