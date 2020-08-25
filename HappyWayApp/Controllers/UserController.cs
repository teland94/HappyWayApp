using System;
using System.Threading.Tasks;
using HappyWayApp.DTOs;
using HappyWayApp.Exceptions;
using HappyWayApp.Persistence.Helpers;
using HappyWayApp.Services;
using HappyWayApp.ViewModels;
using HappyWayApp.ViewModels.Request;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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
        [HttpPost(nameof(Authenticate))]
        public async Task<IActionResult> Authenticate([FromBody]AuthenticateModel model)
        {
            try
            {
                var user = await _userService.Authenticate(model.Username, model.Password);

                return Ok(user);
            }
            catch (InvalidOperationException e)
            {
                Console.WriteLine(e);
                return BadRequest(new { message = "Неверный логин или пароль." });
            }
            catch (NotFoundException e)
            {
                Console.WriteLine(e);
                return NotFound(new { message = "Неверный логин или пароль." });
            }
        }

        [HttpPost(nameof(CheckPassword))]
        public async Task<IActionResult> CheckPassword([FromBody]CheckPasswordModel model)
        {
            try
            {
                var currentUserId = Convert.ToInt32(User.Identity.Name);
                var res = await _userService.CheckPassword(currentUserId, model.Password);

                if (!res)
                {
                    return BadRequest(new { message = "Неверный пароль." });
                }

                return NoContent();
            }
            catch (NotFoundException e)
            {
                Console.WriteLine(e);
                return NotFound();
            }
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