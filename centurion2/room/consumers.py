import json
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer

started = False
starttime=0
users=[]

class ChatConsumer(WebsocketConsumer):

    def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = 'room_%s' % self.room_name
        # Join room group
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )

        self.accept()

    def disconnect(self, close_code):
        # Leave room group
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from WebSocket
    def receive(self, text_data):
        global starttime
        global started
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        username = text_data_json['username']
        if message == "/start centurion":
            starttime = text_data_json['starttime']
            started = True
        elif message.startswith("/set user"):
            if username in users:
                users.remove(username)

            if message.split("/set user", 1)[1] in users:
                message="/set user" + message.split("/set user", 1)[1] + " - Doppleganger"
                users.append(message.split("/set user", 1)[1] + " - Doppleganger")
            else:
                users.append(message.split("/set user", 1)[1])

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
        if message == "/reconnect" and started:
            self.send(text_data=json.dumps({
                'message': "/connecttime" + starttime,
                'username': "Server"
            }))
        else:
            # Send message to WebSocket
            self.send(text_data=json.dumps({
                'message': message,
                'username': username
            }))