using System.Collections.Generic;

namespace HappyWayApp.Persistence.Entity
{
    public class EventMember : EntityBase
    {
        public int Number { get; set; }

        public string Name { get; set; }

        public int Age { get; set; }

        public Sex Sex { get; set; }

        public string PhoneNumber { get; set; }

        public string Email { get; set; }

        public string SocialLink { get; set; }

        public int EventId { get; set; }
        public Event Event { get; set; }

        public List<Like> Liked { get; set; }

        public List<Like> Likes { get; set; }
    }

    public enum Sex
    {
        Male,
        Female
    }
}
