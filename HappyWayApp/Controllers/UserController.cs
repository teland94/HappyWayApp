using System;
using System.Threading.Tasks;
using HappyWayApp.DTOs;
using HappyWayApp.Persistence.Entities;
using HappyWayApp.Persistence.Helpers;
using HappyWayApp.Services;
using HappyWayApp.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HappyWayApp.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        [AllowAnonymous]
        [HttpPost("authenticate")]
        public async Task<IActionResult> Authenticate([FromBody]AuthenticateModel model)
        {
            var user = await _userService.Authenticate(model.Username, model.Password);

            if (user == null)
            {
                return BadRequest(new { message = "Username or password is incorrect" });
            }

            return Ok(user);
        }

        [Authorize(Roles = Constants.Strings.Roles.Admin)]
        [HttpGet]
        public IActionResult GetAll()
        {
            var users = _userService.GetAll();
            return Ok(users);
        }

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var currentUserId = int.Parse(User.Identity.Name);
            if (id != currentUserId && !User.IsInRole(Constants.Strings.Roles.Admin))
            {
                return Forbid();
            }

            var user = _userService.GetById(id);

            if (user == null)
            {
                return NotFound();
            }

            return Ok(user);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutUser(int id, UserDto userDto)
        {
            if (id != userDto.Id)
            {
                return BadRequest();
            }

            await _userService.UpdateUser(userDto);

            return NoContent();
        }

        [HttpPost]
        public async Task<IActionResult> PostUser(UserDto userDto)
        {
            var userId = await _userService.AddUser(userDto);

            return CreatedAtAction("GetById", new { id = userId });
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteUser(int id)
        {
            await _userService.DeleteUser(id);

            return NoContent();
        }
    }
}