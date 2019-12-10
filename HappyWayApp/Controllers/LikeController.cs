using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HappyWayApp.Persistence;
using HappyWayApp.Persistence.Entity;
using HappyWayApp.ViewModels;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HappyWayApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LikeController : ControllerBase
    {
        private readonly AppDbContext _context;

        public LikeController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            return Ok(await _context.Likes
                .OrderBy(l => l.SourceMemberId)
                .ThenBy(l => l.TargetMemberId)
                .ToListAsync());
        }

        [HttpGet(nameof(GetByMember) + "/{memberId}")]
        public async Task<IActionResult> GetByMember(int memberId)
        {
            return Ok(await _context.Likes
                .Where(l => l.SourceMemberId == memberId)
                .OrderBy(l => l.TargetMemberId)
                .ToListAsync());
        }

        [HttpGet(nameof(GetAllByMember) + "/{memberId}")]
        public async Task<IActionResult> GetAllByMember(int memberId)
        {
            return Ok(await _context.Likes
                .Where(l => l.SourceMemberId == memberId || l.TargetMemberId == memberId)
                .OrderBy(l => l.TargetMemberId)
                .ToListAsync());
        }

        [HttpPost(nameof(SaveAll))]
        public async Task<IActionResult> SaveAll([FromBody]IEnumerable<SaveLikeViewModel> likes)
        {
            foreach (var like in likes)
            {
                var sourceMemberLikes = _context.Likes.Where(l => l.SourceMemberId == like.SourceMemberId);
                
                var nonExistLikes =
                    sourceMemberLikes.Where(l => like.TargetMemberIds.All(tl => l.TargetMemberId != tl));
                _context.Likes.RemoveRange(nonExistLikes);

                var nonExistDbLikes =
                    like.TargetMemberIds.Where(tl => sourceMemberLikes.All(l => l.TargetMemberId != tl));
                await _context.Likes.AddRangeAsync(nonExistDbLikes.Select(tl => new Like
                {
                    SourceMemberId = like.SourceMemberId,
                    TargetMemberId = tl
                }));
            }

            await _context.SaveChangesAsync();

            return Ok();
        }
    }
}