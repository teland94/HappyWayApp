using System;

namespace HappyWayApp.ViewModels.Response
{
    public class EventModel
    {
        public int Id { get; set; }

        public DateTime Date { get; set; }

        public string Name { get; set; }

        public bool Completed { get; set; }

        public int EventPlaceId { get; set; }

        public string User { get; set; }
    }
}
