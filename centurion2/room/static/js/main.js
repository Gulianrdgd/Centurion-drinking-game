        //reconnecting things
        var today = new Date();
        var starttime = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        const roomName = JSON.parse(document.getElementById('room-name').textContent);

        const chatSocket = new ReconnectingWebSocket(
            'ws://'
            + window.location.host
            + '/ws/room/'
            + roomName
            + '/'
        );

        chatSocket.onmessage = function(e) {
            const data = JSON.parse(e.data);
            if(data.message==="/start centurion"){
                lets_go();
            }
            else if(data.message.startsWith("/connecttime")){
                reconnect(data.message.substring(12))
            }
            else{
            document.querySelector('#chat-log').value += (data.message + '\n');
            }
        };

        chatSocket.onclose = function(e) {
            console.error('Chat socket closed unexpectedly');
        };

        document.querySelector('#chat-message-input').focus();
        document.querySelector('#chat-message-input').onkeyup = function(e) {
            if (e.keyCode === 13) {  // enter, return
                document.querySelector('#chat-message-submit').click();
            }
        };

        document.querySelector('#chat-message-submit').onclick = function(e) {
            const messageInputDom = document.querySelector('#chat-message-input');
            const message = messageInputDom.value;
            if (message === "/start centurion") {
                var today = new Date();
                var starttime = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
                chatSocket.send(JSON.stringify({
                    'message': message,
                    'starttime' : starttime,
            }));
            messageInputDom.value = '';
            }
            else if(message==="/reconnect"){
                trying=true;
                chatSocket.send(JSON.stringify({
                'message': message
                }));
                messageInputDom.value = '';
                }
            else {
            chatSocket.send(JSON.stringify({
                'message': message
            }));
            messageInputDom.value = '';
            }
        };
        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        async function lets_go() {
            document.getElementById("countdown").innerHTML = "Okay let's go!" ;
            await sleep(2000);
            for (let i = 3; i >= 0; i--) {
                document.getElementById("countdown").innerHTML = i ;
                await sleep(1000);
            }
            var today = new Date();
            starttime=today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
            document.getElementById("countdown").innerHTML = ''
            startcenturion(0);
        }
        function startcenturion(start){
            var scooter = document.getElementById("centurion");
            scooter.currentTime=start;
            scooter.play();
        }
        function reconnect(starttime) {
            console.log(starttime);
            var today = new Date();
            var h = today.getHours();
            var m = today.getMinutes();
            var s = today.getSeconds();
            var h_now = starttime.slice(0,starttime.indexOf(':'));
            var m_now = starttime.slice(starttime.indexOf(':'),starttime.lastIndexOf(':'));
            var s_now = starttime.slice(starttime.lastIndexOf(':'), starttime.length);
            var sum = ((h_now-h)*60*60)+((m_now-m)*60)+(s_now-s);
            startcenturion(sum);
        }