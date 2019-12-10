using HappyWayApp.Persistence.Entity;
using Microsoft.EntityFrameworkCore;

namespace HappyWayApp.Persistence
{
    public partial class AppDbContext : DbContext
    {
        public DbSet<Event> Events { get; set; }

        public DbSet<EventMember> EventMembers { get; set; }

        public DbSet<Like> Likes { get; set; }
    }
}
