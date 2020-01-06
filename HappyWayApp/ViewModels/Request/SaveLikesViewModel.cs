using System.Collections.Generic;

namespace HappyWayApp.ViewModels.Request
{
    public class SaveLikesViewModel
    {
        public int SourceMemberId { get; set; }

        public IEnumerable<int> TargetMemberIds { get; set; }
    }
}
