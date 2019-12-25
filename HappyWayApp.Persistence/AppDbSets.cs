﻿using System;
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
                        Password = "ALBUWwYxK+q96msCYfUWP9gOPcnIc8l6B44F24o/pjsvF2cfiTFE+aui/FRTSNFjZA==",
                        RoleId = 1
                    },
                    new User
                    {
                        Id = 2,
                        DisplayName = "Normal", 
                        City = "Харьков",
                        PhoneNumber = "095 777 22 22",
                        Username = "user", 
                        Password = "AA4f7YH1rTdfWS5I0ec3M9keQwh8oL3pGzGu0vmQe2oodRHPRX1PP6aNssc2Ttz0XA==",
                        RoleId = 2
                    }
                );

            modelBuilder.Entity<Event>()
                .HasData(
                    new Event
                    {
                        Id = 1,
                        Date = DateTime.UtcNow,
                        Name = "Основная группа",
                        UserId = 1
                    }
                );
        }
    }
}
