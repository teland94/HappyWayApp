using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HappyWayApp.Persistence;
using HappyWayApp.Persistence.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.HttpOverrides;

namespace HappyWayApp.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class EventMemberController : ControllerBase
    {
        private readonly AppDbContext _context;

        public EventMemberController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/EventMember
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EventMember>>> GetEventMembers(int? eventId)
        {
            int eId;
            if (eventId != null)
            {
                eId = eventId.Value;
            }
            else
            {
                var lastEvent = await _context.Events
                    .OrderByDescending(e => e.Date)
                    .FirstOrDefaultAsync();
                eId = lastEvent.Id;
            }

            var members = await _context.EventMembers
                .Where(m => m.EventId == eId)
                .OrderBy(m => m.Number)
                .ToListAsync();

            foreach (var eventMember in members)
            {
                eventMember.Event = null;
            }

            return members;
        }

        // GET: api/EventMember/5
        [HttpGet("{id}")]
        public async Task<ActionResult<EventMember>> GetEventMember(int id)
        {
            var eventMember = await _context.EventMembers.FindAsync(id);

            if (eventMember == null)
            {
                return NotFound();
            }

            return eventMember;
        }

        // PUT: api/EventMember/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutEventMember(int id, EventMember eventMember)
        {
            if (id != eventMember.Id)
            {
                return BadRequest();
            }

            _context.Entry(eventMember).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!EventMemberExists(id))
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

        // POST: api/EventMember
        [HttpPost]
        public async Task<ActionResult<EventMember>> PostEventMember(EventMember eventMember)
        {
            _context.EventMembers.Add(eventMember);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetEventMember", new { id = eventMember.Id }, eventMember);
        }

        // DELETE: api/EventMember/5
        [HttpDelete("{id}")]
        public async Task<ActionResult<EventMember>> DeleteEventMember(int id)
        {
            var eventMember = await _context.EventMembers.FindAsync(id);
            if (eventMember == null)
            {
                return NotFound();
            }

            try
            {
                var sourceMemberLikes = _context.Likes.Where(l => l.SourceMemberId == eventMember.Id);
                _context.Likes.RemoveRange(sourceMemberLikes);

                _context.EventMembers.Remove(eventMember);
                await _context.SaveChangesAsync();
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                throw;
            }

            eventMember.Likes = null;
            eventMember.Liked = null;
            
            return eventMember;
        }

        private bool EventMemberExists(int id)
        {
            return _context.EventMembers.Any(e => e.Id == id);
        }
    }
}
