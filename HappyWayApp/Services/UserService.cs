using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using HappyWayApp.Configuration;
using HappyWayApp.DTOs;
using HappyWayApp.Exceptions;
using HappyWayApp.Persistence.Entities;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using HappyWayApp.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace HappyWayApp.Services
{
    public interface IUserService
    {
        Task<UserDto> Authenticate(string username, string password);

        Task<bool> CheckPassword(int userId, string password);

        IEnumerable<UserDto> GetAll();

        UserDto GetById(int id);

        Task<int> AddUser(UserDto user);

        Task UpdateUser(UserDto user);

        Task DeleteUser(int id);
    }

    public class UserService : IUserService
    {
        private readonly AuthSettings _authSettings;
        private readonly AppDbContext _context;
        private readonly IPasswordHasher<User> _passwordHasher;

        public UserService(IOptions<AuthSettings> authOptions,
            AppDbContext context,
            IPasswordHasher<User> passwordHasher)
        {
            _authSettings = authOptions.Value;
            _context = context;
            _passwordHasher = passwordHasher;
        }

        public async Task<UserDto> Authenticate(string username, string password)
        {
            var user = await _context.Users
                .Include(x => x.Role)
                .SingleOrDefaultAsync(x => x.Username == username);

            if (user == null)
                throw new NotFoundException(nameof(User), username);

            var result = _passwordHasher.VerifyHashedPassword(null, user.Password, _authSettings.Salt + password);

            if (result == PasswordVerificationResult.Failed)
                throw new InvalidOperationException();

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_authSettings.Secret);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[] 
                {
                    new Claim(ClaimTypes.Name, user.Id.ToString()),
                    new Claim(ClaimTypes.Role, user.Role.Name)
                }),
                Expires = DateTime.UtcNow.AddDays(1),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            user.Token = tokenHandler.WriteToken(token);

            return user.WithoutPassword();
        }

        public async Task<bool> CheckPassword(int userId, string password)
        {
            var dbUser = await _context.Users.FindAsync(userId);
            if (dbUser == null)
            {
                throw new NotFoundException(nameof(User), userId);
            }

            var result = _passwordHasher.VerifyHashedPassword(null, dbUser.Password, _authSettings.Salt + password);
            return result != PasswordVerificationResult.Failed;
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

        public async Task<int> AddUser(UserDto user)
        {
            await ValidateUser(user);

            var dbUser = _context.Users.Add(new User
            {
                RoleId = 2,
                DisplayName = user.DisplayName,
                PhoneNumber = user.PhoneNumber,
                Password = _passwordHasher.HashPassword(null, _authSettings.Salt + user.Password),
                Username = user.Username,
            });
            await _context.SaveChangesAsync();

            return dbUser.Entity.Id;
        }

        public async Task UpdateUser(UserDto user)
        {
            await ValidateUser(user);

            var dbUser = await _context.Users.FindAsync(user.Id);
            if (dbUser == null)
            {
                throw new InvalidOperationException("User not exists");
            }

            dbUser.DisplayName = user.DisplayName;
            dbUser.PhoneNumber = user.PhoneNumber;
            if (!string.IsNullOrWhiteSpace(user.Password))
            {
                dbUser.Password = _passwordHasher.HashPassword(null, _authSettings.Salt + user.Password);
            }
            dbUser.Username = user.Username;

            _context.Users.Update(dbUser);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteUser(int id)
        {
            var dbUser = await _context.Users.FindAsync(id);
            if (dbUser == null)
            {
                throw new InvalidOperationException("User not exists");
            }

            _context.Users.Remove(dbUser);
            await _context.SaveChangesAsync();
        }

        private async Task ValidateUser(UserDto user)
        {
            if (!string.IsNullOrWhiteSpace(user.Password) && user.Password.Length < 8)
            {
                throw new InvalidOperationException("Password must be at least 8 characters");
            }

            var dbUser = await _context.Users.FirstOrDefaultAsync(u => u.Username == user.Username);
            if (dbUser != null && dbUser.Username != user.Username)
            {
                throw new InvalidOperationException("User already exists");
            }
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
                Id = user.Id,
                Username = user.Username,
                Role = user.Role.Name,
                Token = user.Token,
                DisplayName = user.DisplayName,
                PhoneNumber = user.PhoneNumber
            };
            return userDto;
        }
    }
}