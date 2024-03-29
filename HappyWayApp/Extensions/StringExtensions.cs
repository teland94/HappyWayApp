﻿using System;
using System.Linq;

namespace HappyWayApp.Extensions
{
    public static class StringExtensions
    {
        public static string FirstCharToLower(this string input) =>
            input switch
            {
                null => throw new ArgumentNullException(nameof(input)),
                "" => throw new ArgumentException($"{nameof(input)} cannot be empty", nameof(input)),
                _ => input.First().ToString().ToLower() + input.Substring(1)
            };
    }
}
