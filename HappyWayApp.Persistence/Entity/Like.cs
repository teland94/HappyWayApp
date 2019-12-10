namespace HappyWayApp.Persistence.Entity
{
    public class Like
    {
        public int SourceMemberId { get; set; }
        public EventMember SourceMember { get; set; }

        public int TargetMemberId { get; set; }
        public EventMember TargetMember { get; set; }
    }
}
