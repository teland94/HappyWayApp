﻿// <auto-generated />
using System;
using HappyWayApp.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace HappyWayApp.Persistence.Migrations
{
    [DbContext(typeof(AppDbContext))]
    [Migration("20191205135231_Initial")]
    partial class Initial
    {
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "3.1.0-preview3.19554.8");

            modelBuilder.Entity("HappyWayApp.Persistence.Entity.Event", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER");

                    b.Property<DateTime>("Date")
                        .HasColumnType("TEXT");

                    b.Property<string>("Name")
                        .HasColumnType("TEXT");

                    b.HasKey("Id");

                    b.ToTable("Events");

                    b.HasData(
                        new
                        {
                            Id = 1,
                            Date = new DateTime(2019, 12, 5, 13, 52, 31, 171, DateTimeKind.Utc).AddTicks(6167),
                            Name = "Основная группа"
                        });
                });

            modelBuilder.Entity("HappyWayApp.Persistence.Entity.EventMember", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER");

                    b.Property<int>("Age")
                        .HasColumnType("INTEGER");

                    b.Property<string>("Email")
                        .HasColumnType("TEXT");

                    b.Property<int>("EventId")
                        .HasColumnType("INTEGER");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.Property<int>("Number")
                        .HasColumnType("INTEGER");

                    b.Property<string>("PhoneNumber")
                        .HasColumnType("TEXT");

                    b.Property<int>("Sex")
                        .HasColumnType("INTEGER");

                    b.Property<string>("SocialLink")
                        .HasColumnType("TEXT");

                    b.HasKey("Id");

                    b.HasIndex("EventId");

                    b.ToTable("EventMembers");
                });

            modelBuilder.Entity("HappyWayApp.Persistence.Entity.Like", b =>
                {
                    b.Property<int>("SourceMemberId")
                        .HasColumnType("INTEGER");

                    b.Property<int>("TargetMemberId")
                        .HasColumnType("INTEGER");

                    b.HasKey("SourceMemberId", "TargetMemberId");

                    b.HasIndex("TargetMemberId");

                    b.ToTable("Likes");
                });

            modelBuilder.Entity("HappyWayApp.Persistence.Entity.EventMember", b =>
                {
                    b.HasOne("HappyWayApp.Persistence.Entity.Event", "Event")
                        .WithMany("EventMembers")
                        .HasForeignKey("EventId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("HappyWayApp.Persistence.Entity.Like", b =>
                {
                    b.HasOne("HappyWayApp.Persistence.Entity.EventMember", "SourceMember")
                        .WithMany("Likes")
                        .HasForeignKey("SourceMemberId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.HasOne("HappyWayApp.Persistence.Entity.EventMember", "TargetMember")
                        .WithMany("Liked")
                        .HasForeignKey("TargetMemberId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });
#pragma warning restore 612, 618
        }
    }
}
