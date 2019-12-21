using System.Collections.Generic;

namespace HappyWayApp.Persistence.Entities
{
    public class User : EntityBase
    {
        public string Username { get; set; }

        public string Password { get; set; }

        public string Token { get; set; }

        public string FirstName { get; set; }

        public string LastName { get; set; }

        public int RoleId { get; set; }
        public Role Role { get; set; }

        public List<Event> Events { get; set; }
    }
}