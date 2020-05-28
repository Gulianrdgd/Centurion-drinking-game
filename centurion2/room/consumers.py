import json
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer

users = []
rooms = []
startArray = []


class ChatConsumer(WebsocketConsumer):

    def remove(self):
        del startarray[rooms.index(self.room_group_name)]
        del users[rooms.index(self.room_group_name)]
        rooms.remove(self.room_group_name)

    def connect(self):
        global rooms
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = 'room_%s' % self.room_name
        # Join room group
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )
        if self.room_group_name not in rooms:
            rooms.append(self.room_group_name)
            users.append([])
            startarray.append([])
        self.accept()

    def disconnect(self, close_code):
        # Leave room group
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from WebSocket

    def receive(self, text_data):
        global startarray
        global started
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        username = text_data_json['username']
        if message == "/start centurion":
            startarray[rooms.index(self.room_group_name)].append(text_data_json['starttime'])
        elif message.startswith("/set user"):
            if username in users[rooms.index(self.room_group_name)]:
                users[rooms.index(self.room_group_name)].remove(username)

            if message.split("/set user", 1)[1] in users[rooms.index(self.room_group_name)]:
                message="/set user" + message.split("/set user", 1)[1] + " - Doppleganger"
                users[rooms.index(self.room_group_name)].append(message.split("/set user", 1)[1] + " - Doppleganger")
            else:
                if message.split("/set user", 1)[1] != " closing_screen":
                    users[rooms.index(self.room_group_name)].append(message.split("/set user", 1)[1])

        # Send message to room group
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'username': username,
            }
        )

    # Receive message from room group
    def chat_message(self, event):
        message = event['message']
        username = event['username']
        if message == "/reconnect":
            for time in startarray[rooms.index(self.room_group_name)]:
                self.send(text_data=json.dumps({
                    'message': "/connecttime" + time,
                    'username': "Server"
                }))
        else:
            # Send message to WebSocket
            self.send(text_data=json.dumps({
                'message': message,
                'username': username
            }))