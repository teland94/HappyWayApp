﻿using System;
using System.Collections.Generic;

namespace HappyWayApp.Persistence.Entities
{
    public class Event : EntityBase
    {
        public DateTime Date { get; set; }

        public string Name { get; set; }

        public bool Completed { get; set; }

        public List<EventMember> EventMembers { get; set; }

        public int UserId { get; set; }
        public User User { get; set; }

        public int EventPlaceId { get; set; }
        public EventPlace EventPlace { get; set; }
    }
}
