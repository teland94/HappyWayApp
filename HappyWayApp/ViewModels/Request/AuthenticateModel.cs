using System.ComponentModel.DataAnnotations;

namespace HappyWayApp.ViewModels.Request
{
    public class AuthenticateModel
    {
        [Required]
        public string Username { get; set; }

        [Required]
        public string Password { get; set; }
    }
}
