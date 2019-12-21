using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HappyWayApp.Persistence;
using HappyWayApp.Persistence.Entities;
using HappyWayApp.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HappyWayApp.Controllers
{
    [Authorize]
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

        [HttpPost(nameof(Save))]
        public async Task<IActionResult> Save([FromBody]SaveLikesViewModel saveLikes)
        {
            await SyncLikes(saveLikes);

            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpPost(nameof(SaveAll))]
        public async Task<IActionResult> SaveAll([FromBody]IEnumerable<SaveLikesViewModel> likes)
        {
            foreach (var like in likes)
            {
                await SyncLikes(like);
            }

            await _context.SaveChangesAsync();

            return Ok();
        }

        private async Task SyncLikes(SaveLikesViewModel saveLikes)
        {
            var sourceMemberLikes = _context.Likes.Where(l => l.SourceMemberId == saveLikes.SourceMemberId);

            var nonExistLikes =
                sourceMemberLikes.Where(l => saveLikes.TargetMemberIds.All(tl => l.TargetMemberId != tl));
            _context.Likes.RemoveRange(nonExistLikes);

            var nonExistDbLikes =
                saveLikes.TargetMemberIds.Where(tl => sourceMemberLikes.All(l => l.TargetMemberId != tl));
            await _context.Likes.AddRangeAsync(nonExistDbLikes.Select(tl => new Like
            {
                SourceMemberId = saveLikes.SourceMemberId,
                TargetMemberId = tl
            }));
        }
    }
}