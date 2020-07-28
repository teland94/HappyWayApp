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
using HappyWayApp.ViewModels;
using HappyWayApp.ViewModels.Request;
using HappyWayApp.ViewModels.Response;
using Microsoft.AspNetCore.Authorization;

namespace HappyWayApp.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class EventController : ControllerBase
    {
        private readonly AppDbContext _context;

        public EventController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<EventModel>>> GetEvents()
        {
            var userId = Convert.ToInt32(User.Identity.Name);
            var events = _context.Events.AsQueryable();
            events = User.IsInRole(Constants.Strings.Roles.Admin) 
                ? events.Include(u => u.User)
                : events.Where(e => e.UserId == userId && !e.Completed);
            return await events
                .OrderByDescending(e => e.Date)
                .ThenByDescending(e => e.Id)
                .Select(e => new EventModel
                {
                    Id = e.Id,
                    Date = e.Date,
                    Name = e.Name,
                    Completed = e.Completed,
                    EventPlaceId = e.EventPlaceId,
                    User = e.User.DisplayName
                })
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Event>> GetEvent(int id)
        {
            var userId = Convert.ToInt32(User.Identity.Name);
            var @event = await _context.Events.FindAsync(id);

            if (@event == null)
            {
                return NotFound();
            }

            if (userId != @event.UserId && !User.IsInRole(Constants.Strings.Roles.Admin)
                || @event.Completed)
            {
                return Forbid();
            }

            return @event;
        }

        [HttpGet(nameof(GetLastEvent))]
        public async Task<ActionResult<Event>> GetLastEvent()
        {
            var userId = Convert.ToInt32(User.Identity.Name);

            var query = _context.Events.Where(e => !e.Completed);

            if (!User.IsInRole(Constants.Strings.Roles.Admin))
            {
                query = query.Where(e => e.UserId == userId);
            }

            var @event = await query
                .OrderByDescending(e => e.Date)
                .ThenByDescending(e => e.Id)
                .FirstOrDefaultAsync();

            if (@event == null)
            {
                return NotFound();
            }

            return @event;
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutEvent(int id, Event @event)
        {
            if (id != @event.Id)
            {
                return BadRequest();
            }

            var userId = Convert.ToInt32(User.Identity.Name);
            var eventUserId = await _context.Events
                .Select(e => e.UserId)
                .FirstOrDefaultAsync(uId => uId == userId);
            if (userId != eventUserId && !User.IsInRole(Constants.Strings.Roles.Admin))
            {
                return Forbid();
            }

            _context.Entry(@event).State = EntityState.Modified;
            _context.Entry(@event).Property(p => p.UserId).IsModified = false;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!EventExists(id))
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

        [HttpPatch("SetCompleted/{id}")]
        public async Task<IActionResult> SetCompleted(int id, SetEventCompletedModel model)
        {
            var @event = await _context.Events.FindAsync(id);
            if (@event == null)
            {
                return NotFound();
            }

            @event.Completed = model.Completed;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPost]
        public async Task<ActionResult<Event>> PostEvent(Event @event)
        {
            @event.UserId = Convert.ToInt32(User.Identity.Name);
            _context.Events.Add(@event);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetEvent", new { id = @event.Id }, @event);
        }

        [Authorize(Roles = Constants.Strings.Roles.Admin)]
        [HttpDelete("{id}")]
        public async Task<ActionResult<Event>> DeleteEvent(int id)
        {
            var @event = await _context.Events.FindAsync(id);
            if (@event == null)
            {
                return NotFound();
            }

            _context.Events.Remove(@event);
            await _context.SaveChangesAsync();

            return @event;
        }

        private bool EventExists(int id)
        {
            return _context.Events.Any(e => e.Id == id);
        }
    }
}
