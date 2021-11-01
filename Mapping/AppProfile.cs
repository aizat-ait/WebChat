using AutoMapper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WebChat.Models;
using WebChat.ViewModels;

namespace WebChat.Mapping
{
    public class AppProfile : Profile
    {
        public AppProfile()
        {
            CreateMap<Message, MessageViewModel>()
            .ForMember(dst => dst.From, opt => opt.MapFrom(x => x.FromUser.UserName))
            .ForMember(dst => dst.Timestamp, opt => opt.MapFrom(x => x.Timestamp));
            CreateMap<MessageViewModel, Message>();

            CreateMap<AppUser, UserViewModel>()
                .ForMember(dst => dst.UserName, opt => opt.MapFrom(x => x.UserName));
            CreateMap<UserViewModel, AppUser>();
        }
    }
}
