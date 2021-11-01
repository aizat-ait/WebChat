using Microsoft.AspNetCore.Identity;
using System.Collections.Generic;

namespace WebChat.Models
{
    public class AppUser : IdentityUser
    {
        public AppUser() : base()
        {
            Messages = new List<Message>();
        }
        public ICollection<Message> Messages { get; set; }
    }
}
