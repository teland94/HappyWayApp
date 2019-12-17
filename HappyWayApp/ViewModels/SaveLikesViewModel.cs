using System.Collections.Generic;

namespace HappyWayApp.ViewModels
{
    public class SaveLikesViewModel
    {
        public int SourceMemberId { get; set; }

        public IEnumerable<int> TargetMemberIds { get; set; }
    }
}
