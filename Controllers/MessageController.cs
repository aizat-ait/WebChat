using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using WebChat.Data;
using WebChat.Hubs;
using WebChat.Models;
using WebChat.ViewModels;

namespace WebChat.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class MessageController : Controller
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;
        private readonly IHubContext<ChatHub> _hubContext;

        public MessageController(AppDbContext context,
            IMapper mapper,
            IHubContext<ChatHub> hubContext)
        {
            _context = context;
            _mapper = mapper;
            _hubContext = hubContext;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult> Get(int id)
        {
            var message = await _context.Messages.FindAsync(id);
            if (message == null)
                return NotFound();

            var messageViewModel = _mapper.Map<Message, MessageViewModel>(message);
            return Ok(messageViewModel);
        }


        [HttpGet]
        public IActionResult GetMessages()
        {
            var messages = _context.Messages
                .Include(m => m.FromUser)
                .OrderByDescending(m => m.Timestamp)
                .Take(20)
                .AsEnumerable()
                .Reverse()
                .ToList();

            var messagesViewModel = _mapper.Map<IEnumerable<Message>, IEnumerable<MessageViewModel>>(messages);

            return Ok(messagesViewModel);
        }

        [HttpGet("Search")]
        public IActionResult GetMessages([FromQuery] SearchViewModel model)
        {
            var messagesQuery = from m in _context.Messages
                                select m;

            if (!string.IsNullOrEmpty(model.Name))
            {
                messagesQuery = messagesQuery.Where(m => m.FromUser.UserName.Contains(model.Name));
            }
            if (model.StartDate.HasValue && model.EndDate.HasValue)
            {
                messagesQuery = messagesQuery.Where(m => m.Timestamp > model.StartDate && m.Timestamp < model.EndDate);
            }

            var messages = messagesQuery
                .Include(m => m.FromUser)
                .OrderByDescending(m => m.Timestamp)
                .Take(20)
                .AsEnumerable()
                .Reverse()
                .ToList();

            var messagesViewModel = _mapper.Map<IEnumerable<Message>, IEnumerable<MessageViewModel>>(messages);

            return Ok(messagesViewModel);
        }

        [HttpPost]
        public async Task<ActionResult<Message>> Create(MessageViewModel messageViewModel)
        {
            var user = _context.Users.FirstOrDefault(u => u.UserName == User.Identity.Name);

            var msg = new Message()
            {
                Content = Regex.Replace(messageViewModel.Content, @"<.*?>", string.Empty),
                FromUser = user,
                Timestamp = DateTime.Now
            };

            _context.Messages.Add(msg);
            await _context.SaveChangesAsync();

            var createdMessage = _mapper.Map<Message, MessageViewModel>(msg);
            await _hubContext.Clients.All.SendAsync("newMessage", createdMessage);

            return CreatedAtAction(nameof(Get), new { id = msg.Id }, createdMessage);
        }
    }
}
