using System.Collections.Generic;

namespace HappyWayApp.Persistence.Entities
{
    public class City : EntityBase
    {
        public string Name { get; set; }

        public string NameGenitive { get; set; }

        public List<EventPlace> EventPlaces { get; set; }
    }
}
