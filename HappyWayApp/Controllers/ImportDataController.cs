﻿using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Google.Apis.Auth.OAuth2;
using Google.Apis.Services;
using Google.Apis.Sheets.v4;
using Google.Apis.Util.Store;
using HappyWayApp.Configuration;
using HappyWayApp.DTOs;
using HappyWayApp.Persistence;
using HappyWayApp.Persistence.Entities;
using HappyWayApp.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace HappyWayApp.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class ImportDataController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly GoogleSheetsSettings _googleSheetsSettings;

        public ImportDataController(AppDbContext context,
            IOptions<GoogleSheetsSettings> googleSheetsOptions)
        {
            _context = context;
            _googleSheetsSettings = googleSheetsOptions.Value;
        }

        [HttpGet("{eventId}/{spreadsheetId}")]
        public async Task<IActionResult> Get(int eventId, string spreadsheetId)
        {
            const string femaleRange = "A3:E";
            const string maleRange = "L3:P";

            var femaleMembers = await GetDocData(spreadsheetId, femaleRange);
            var maleMembers = await GetDocData(spreadsheetId, maleRange);

            await AddMembersAsync(femaleMembers, eventId, Sex.Female);
            await AddMembersAsync(maleMembers, eventId, Sex.Male);

            return Ok();
        }

        private async Task AddMembersAsync(IEnumerable<EventMemberDocInfoDto> docMembers, int eventId, Sex sex)
        {
            foreach (var docMember in docMembers)
            {
                var dbMember = await _context.EventMembers
                    .FirstOrDefaultAsync(m => m.Number == docMember.Number 
                                              && m.Sex == sex
                                              && m.EventId == eventId);
                if (dbMember != null)
                {
                    dbMember.Number = docMember.Number;
                    dbMember.Name = docMember.Name.Trim();
                    dbMember.PhoneNumber = docMember.PhoneNumber.Trim();
                }
                else
                {
                    var member = new EventMember
                    {
                        Number = docMember.Number,
                        Name = docMember.Name.Trim(),
                        Sex = sex,
                        PhoneNumber = docMember.PhoneNumber.Trim(),
                        EventId = eventId
                    };
                    await _context.EventMembers.AddAsync(member);
                }
            }
            await _context.SaveChangesAsync();
        }

        private async Task<IEnumerable<EventMemberDocInfoDto>> GetDocData(string spreadsheetId, string range)
        {
            var service = GetService(_googleSheetsSettings.ApiKey);

            var request =
                service.Spreadsheets.Values.Get(spreadsheetId, range);

            var response = await request.ExecuteAsync();
            var values = response.Values;

            var members = values.Select(row => new EventMemberDocInfoDto
            {
                Number = Convert.ToInt32(row[2]),
                Name = row[3].ToString(),
                PhoneNumber = row[4].ToString()
            });

            return members;
        }

        private SheetsService GetService(string apiKey)
        {
            try
            {
                if (string.IsNullOrEmpty(apiKey))
                {
                    throw new ArgumentNullException(nameof(apiKey));
                }

                return new SheetsService(new BaseClientService.Initializer
                {
                    ApiKey = apiKey,
                    ApplicationName = "HappyWayApp",
                });
            }
            catch (Exception ex)
            {
                throw new Exception("Failed to create new Sheets Service", ex);
            }
        }
    }
}