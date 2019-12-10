using System.Collections.Generic;

namespace HappyWayApp.ViewModels
{
    public class LikeViewModel
    {
    }

    public class SaveLikeViewModel
    {
        public int SourceMemberId { get; set; }

        public IEnumerable<int> TargetMemberIds { get; set; }
    }
}
