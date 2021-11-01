$(document).ready(function () {
    var connection = new signalR.HubConnectionBuilder().withUrl("/chatHub").build();

    connection.start().then(function () {
        console.log('SignalR Started...')
        viewModel.userList();
        viewModel.messageHistory();
    }).catch(function (err) {
        return console.error(err);
    });

    connection.on("newMessage", function (messageView) {
        var isMine = messageView.from === viewModel.myName();
        var message = new ChatMessage(messageView.content, messageView.timestamp, messageView.from, isMine);
        viewModel.chatMessages.push(message);
        $(".chat-body").animate({ scrollTop: $(".chat-body")[0].scrollHeight }, 1000);
    });

    connection.on("getProfileInfo", function (displayName) {
        viewModel.myName(displayName);
        viewModel.isLoading(false);
    });

    connection.on("addUser", function (user) {
        viewModel.userAdded(new ChatUser(user.userName));
    });

    connection.on("removeUser", function (user) {
        viewModel.userRemoved(user.userName);
    });

    connection.on("onError", function (message) {
        viewModel.serverInfoMessage(message);
        $("#errorAlert").removeClass("d-none").show().delay(5000).fadeOut(500);
    });

    function AppViewModel() {
        var self = this;

        self.message = ko.observable("");
        self.chatUsers = ko.observableArray([]);
        self.chatMessages = ko.observableArray([]);
        self.chatMessagesSearch = ko.observableArray([]);
        self.searchByUser = ko.observable("");
        self.searchByDateRange = ko.observable("");
        self.serverInfoMessage = ko.observable("");
        self.myName = ko.observable("");
        self.isLoading = ko.observable(true);

        self.onEnter = function (d, e) {
            if (e.keyCode === 13) {
                self.sendNewMessage();
            }
            return true;
        }
        self.filter = ko.observable("");
        self.filteredChatUsers = ko.computed(function () {
            if (!self.filter()) {
                return self.chatUsers();
            } else {
                return ko.utils.arrayFilter(self.chatUsers(), function (user) {
                    var displayName = user.userName().toLowerCase();
                    return displayName.includes(self.filter().toLowerCase());
                });
            }
        });

        self.sendNewMessage = function () {
            self.sendToChat(self.message());
            self.message("");
        }

        self.sendToChat = function (message) {
            if (message.length > 0) {
                fetch('/api/Message/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content: message })
                });
            }
        }

        self.userList = function () {
            connection.invoke("GetUsers").then(function (result) {
                self.chatUsers.removeAll();
                for (var i = 0; i < result.length; i++) {
                    self.chatUsers.push(new ChatUser(result[i].userName))
                }
            });
        }

        self.messageHistory = function () {
            fetch('/api/Message/')
                .then(response => response.json())
                .then(data => {
                    self.chatMessages.removeAll();
                    for (var i = 0; i < data.length; i++) {
                        var isMine = data[i].from == self.myName();
                        self.chatMessages.push(new ChatMessage(data[i].content,
                            data[i].timestamp,
                            data[i].from,
                            isMine))
                    }
                    $(".chat-body").animate({ scrollTop: $(".chat-body")[0].scrollHeight }, 1000);
                });
        }

        self.messageHistorySearch = function () {
            if (self.searchByUser().toString() !== '' || self.searchByDateRange().toString() !== '') {
                self.url = ko.observable("");
                self.url = '/api/Message/Search?';
                if (self.searchByUser().toString() !== '') {
                    self.url = self.url + 'Name=' + viewModel.searchByUser() + '&';
                }
                if (self.searchByDateRange().toString() !== '') {
                    self.url = self.url + 'StartDate=' + self.searchByDateRange().toString().substring(0, 16);
                    self.url = self.url + '&EndDate=' + self.searchByDateRange().toString().substring(17, 33);
                }
                fetch(self.url).then(response => response.json())
                    .then(data => {
                        self.chatMessagesSearch.removeAll();
                        for (var i = 0; i < data.length; i++) {
                            self.chatMessagesSearch.push(new ChatMessageSearch(data[i].content,
                                data[i].timestamp,
                                data[i].from))
                        }
                    });
            }
        }

        self.userAdded = function (user) {
            self.chatUsers.push(user);
        }

        self.userRemoved = function (id) {
            var temp;
            ko.utils.arrayForEach(self.chatUsers(), function (user) {
                if (user.userName() == id)
                    temp = user;
            });
            self.chatUsers.remove(temp);
        }
    }

    function ChatUser(userName, displayName) {
        var self = this;
        self.userName = ko.observable(userName);
        self.displayName = ko.observable(displayName);
    }

    function ChatMessage(content, timestamp, from, isMine) {
        var self = this;
        self.content = ko.observable(content);
        self.timestamp = ko.observable(timestamp);
        self.from = ko.observable(from);
        self.isMine = ko.observable(isMine);
    }

    function ChatMessageSearch(content, timestamp, from) {
        var self = this;
        self.content = ko.observable(content);
        self.timestamp = ko.observable(timestamp);
        self.from = ko.observable(from);
    }

    var viewModel = new AppViewModel();
    ko.applyBindings(viewModel);
});