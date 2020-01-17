using System;
using HappyWayApp.Persistence.Configuration;
using HappyWayApp.Persistence.Entities;
using HappyWayApp.Persistence.Helpers;
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
            modelBuilder.Entity<User>().Property(p => p.Username).IsRequired();
            modelBuilder.Entity<User>().Property(p => p.Password).IsRequired();

            modelBuilder.Entity<User>()
                .HasOne(pt => pt.Role)
                .WithMany(p => p.Users)
                .HasForeignKey(pt => pt.RoleId);

            modelBuilder.Entity<Role>().Property(p => p.Name).IsRequired();

            modelBuilder.Entity<Event>()
                .HasOne(pt => pt.User)
                .WithMany(p => p.Events)
                .HasForeignKey(pt => pt.UserId);

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

            SetInitialData(modelBuilder);
        }

        private void SetInitialData(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Role>()
                .HasData(
                    new Role
                    {
                        Id = 1,
                        Name = Constants.Strings.Roles.Admin
                    },
                    new Role
                    {
                        Id = 2,
                        Name = Constants.Strings.Roles.User
                    }
                );

            modelBuilder.Entity<User>()
                .HasData(
                    new User
                    {
                        Id = 1, 
                        DisplayName = "Admin", 
                        City = "Харьков",
                        PhoneNumber = "095 214 51 32",
                        Username = "admin",
                        Password = "AQAAAAEAACcQAAAAEDC0aBikkZoMAQ9jtYq7ByukhA9ydl1YN0K6sIvHN9HYg09X1qxMUO+jjQhgxImCAg==",
                        RoleId = 1
                    },
                    new User
                    {
                        Id = 2,
                        DisplayName = "Normal", 
                        City = "Харьков",
                        PhoneNumber = "095 777 22 22",
                        Username = "user", 
                        Password = "AQAAAAEAACcQAAAAEF2b5WTrHeYD99KTYodsb3E44gNLhSAvYOfEoVIxnxmUkmotABVzHbrnfXqDRB+4rg==",
                        RoleId = 2
                    }
                );
        }
    }
}
