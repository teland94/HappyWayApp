using System;
using HappyWayApp.Persistence.Configuration;
using HappyWayApp.Persistence.Entity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace HappyWayApp.Persistence
{
    public partial class AppDbContext : DbContext
    {
        private IOptions<DatabaseSettings> DatabaseSettings { get; }

        public AppDbContext(IOptions<DatabaseSettings> databaseSettings)
        {
            DatabaseSettings = databaseSettings;
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseSqlite(DatabaseSettings.Value.ConnectionString);
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<EventMember>()
                .HasOne(pt => pt.Event)
                .WithMany(p => p.EventMembers)
                .HasForeignKey(pt => pt.EventId);

            modelBuilder.Entity<EventMember>().Property(p => p.Name).IsRequired();

            modelBuilder.Entity<Like>().HasKey(pc => new { pc.SourceMemberId, pc.TargetMemberId });

            modelBuilder.Entity<Like>()
                .HasOne(pt => pt.SourceMember)
                .WithMany(p => p.Likes)
                .HasForeignKey(pt => pt.SourceMemberId);

            modelBuilder.Entity<Like>()
                .HasOne(pt => pt.TargetMember)
                .WithMany(t => t.Liked)
                .HasForeignKey(pt => pt.TargetMemberId);

            SetSampleData(modelBuilder);
        }

        private void SetSampleData(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Event>()
                .HasData(new Event
                {
                    Id = 1,
                    Date = DateTime.UtcNow,
                    Name = "Основная группа"
                });
        }
    }
}
