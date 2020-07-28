using System;
using System.Collections.Generic;
using System.Text;

namespace HappyWayApp.Persistence.Entities
{
    public class EventPlace : EntityBase
    {
        public string Name { get; set; }

        public string GoogleUrl { get; set; }

        public string FacebookUrl { get; set; }

        public string InstagramUrl { get; set; }

        public int CityId { get; set; }
        public City City { get; set; }

        public List<Event> Events { get; set; }
    }
}
