using System;
using System.Collections.Generic;

namespace HappyWayApp.Persistence.Entity
{
    public class Event : EntityBase
    {
        public DateTime Date { get; set; }

        public string Name { get; set; }

        public List<EventMember> EventMembers { get; set; }
    }
}
