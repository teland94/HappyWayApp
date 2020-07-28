using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HappyWayApp.Persistence;
using HappyWayApp.Persistence.Entities;
using HappyWayApp.Persistence.Helpers;
using Microsoft.AspNetCore.Authorization;

namespace HappyWayApp.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class EventPlaceController : ControllerBase
    {
        private readonly AppDbContext _context;

        public EventPlaceController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/EventPlace
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EventPlace>>> GetEventPlaces()
        {
            return await _context.EventPlaces.ToListAsync();
        }

        // GET: api/EventPlace/5
        [HttpGet("{id}")]
        public async Task<ActionResult<EventPlace>> GetEventPlace(int id)
        {
            var eventPlace = await _context.EventPlaces.FindAsync(id);

            if (eventPlace == null)
            {
                return NotFound();
            }

            return eventPlace;
        }

        [Authorize(Roles = Constants.Strings.Roles.Admin)]
        [HttpPut("{id}")]
        public async Task<IActionResult> PutEventPlace(int id, EventPlace eventPlace)
        {
            if (id != eventPlace.Id)
            {
                return BadRequest();
            }

            _context.Entry(eventPlace).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!EventPlaceExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        [Authorize(Roles = Constants.Strings.Roles.Admin)]
        [HttpPost]
        public async Task<ActionResult<EventPlace>> PostEventPlace(EventPlace eventPlace)
        {
            _context.EventPlaces.Add(eventPlace);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetEventPlace", new { id = eventPlace.Id }, eventPlace);
        }

        [Authorize(Roles = Constants.Strings.Roles.Admin)]
        [HttpDelete("{id}")]
        public async Task<ActionResult<EventPlace>> DeleteEventPlace(int id)
        {
            var eventPlace = await _context.EventPlaces.FindAsync(id);
            if (eventPlace == null)
            {
                return NotFound();
            }

            _context.EventPlaces.Remove(eventPlace);
            await _context.SaveChangesAsync();

            return eventPlace;
        }

        private bool EventPlaceExists(int id)
        {
            return _context.EventPlaces.Any(e => e.Id == id);
        }
    }
}
