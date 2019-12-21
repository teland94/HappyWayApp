using System.ComponentModel.DataAnnotations;

namespace HappyWayApp.ViewModels
{
    public class AuthenticateModel
    {
        [Required]
        public string Username { get; set; }

        [Required]
        public string Password { get; set; }
    }
}
