using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Threading.Tasks;
using CsvHelper;
using HappyWayApp.Persistence.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace HappyWayApp.Persistence
{
    public static class SampleData
    {
        public static IList<City> SampleCities = new List<City>
        {
            new City
            {
                Id = 1,
                Name = "Харьков",
                LocativeName = "Харькове"
            },
            new City
            {
                Id = 2,
                Name = "Днепр",
                LocativeName = "Днепре"
            }
        };

        public static async Task Initialize(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            using (var reader = new StreamReader("cities_db.csv"))
            {
                using var csv = new CsvReader(reader, CultureInfo.InvariantCulture);
                var city = new
                {
                    Name = string.Empty,
                    LocativeName = string.Empty,
                    Region = string.Empty
                };
                var cityRecords = csv.GetRecords(city);

                var citiesCount = await context.Cities.CountAsync();
                if (citiesCount <= SampleCities.Count)
                {
                    foreach (var cityRecord in cityRecords)
                    {
                        if (!await context.Cities.AnyAsync(c => c.Name == cityRecord.Name))
                        {
                            await context.AddAsync(new City
                            {
                                Name = cityRecord.Name,
                                LocativeName = cityRecord.LocativeName,
                                Region = cityRecord.Region
                            });
                        }
                    }
                }
            }

            context.SaveChanges();
        }
    }
}
