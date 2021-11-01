using System;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace WebChat.Models
{
    public class Message
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(250)]
        public string Content { get; set; }

        public DateTime Timestamp { get; set; }

        public AppUser FromUser { get; set; }
    }
}
