using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace WebChat.ViewModels
{
    public class MessageViewModel
    {
        [Required]
        public string Content { get; set; }
        public string Timestamp { get; set; }
        public string From { get; set; }
    }
}
