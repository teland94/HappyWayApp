using System.Collections.Generic;

namespace HappyWayApp.Persistence.Entities
{
    public class Role : EntityBase
    {
        public string Name { get; set; }

        public List<User> Users { get; set; }
    }
}
