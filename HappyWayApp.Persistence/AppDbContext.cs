using HappyWayApp.Persistence.Entities;
using Microsoft.EntityFrameworkCore;

namespace HappyWayApp.Persistence
{
    public partial class AppDbContext : DbContext
    {
        public DbSet<Role> Roles { get; set; }

        public DbSet<User> Users { get; set; }

        public DbSet<Event> Events { get; set; }

        public DbSet<EventMember> EventMembers { get; set; }

        public DbSet<City> Cities { get; set; }

        public DbSet<EventPlace> EventPlaces { get; set; }

        public DbSet<Like> Likes { get; set; }
    }
}
