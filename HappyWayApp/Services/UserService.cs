using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using HappyWayApp.Configuration;
using HappyWayApp.DTOs;
using HappyWayApp.Persistence.Helpers;
using HappyWayApp.Persistence.Entities;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using HappyWayApp.Persistence;
using HappyWayApp.ViewModels;
using Microsoft.EntityFrameworkCore;

namespace HappyWayApp.Services
{
    public interface IUserService
    {
        UserDto Authenticate(string username, string password);

        IEnumerable<UserDto> GetAll();

        UserDto GetById(int id);
    }

    public class UserService : IUserService
    {
        private readonly AuthSettings _appSettings;
        private readonly AppDbContext _context;

        public UserService(IOptions<AuthSettings> appSettings,
            AppDbContext context)
        {
            _appSettings = appSettings.Value;
            _context = context;
        }

        public UserDto Authenticate(string username, string password)
        {
            var user = _context.Users
                .Include(x => x.Role)
                .SingleOrDefault(x => x.Username == username && x.Password == password);

            // return null if user not found
            if (user == null)
                return null;

            // authentication successful so generate jwt token
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_appSettings.Secret);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new Claim[] 
                {
                    new Claim(ClaimTypes.Name, user.Id.ToString()),
                    new Claim(ClaimTypes.Role, user.Role.Name)
                }),
                Expires = DateTime.UtcNow.AddDays(7),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            user.Token = tokenHandler.WriteToken(token);

            return user.WithoutPassword();
        }

        public IEnumerable<UserDto> GetAll()
        {
            return _context.Users
                .Include(x => x.Role)
                .WithoutPasswords();
        }

        public UserDto GetById(int id) 
        {
            var user = _context.Users.FirstOrDefault(x => x.Id == id);
            return user.WithoutPassword();
        }
    }

    public static class ExtensionMethods
    {
        public static IEnumerable<UserDto> WithoutPasswords(this IEnumerable<User> users)
        {
            return users?.Select(x => x.WithoutPassword());
        }

        public static UserDto WithoutPassword(this User user)
        {
            if (user == null) return null;

            var userDto = new UserDto
            {
                DisplayName = user.DisplayName,
                City = user.City,
                Role = user.Role.Name,
                Token = user.Token,
                Username = user.Username
            };
            return userDto;
        }
    }
}