        //reconnecting things
        var today = new Date();
        var starttime = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        const roomName = JSON.parse(document.getElementById('room-name').textContent);
        var noShots=0;
        var index=0;
        var username=" No_user_name";
        var tryingReconnect=false;
        var tryingUsername=false;
        var widget;
        var time=0;
        var t;

        const chatSocket = new ReconnectingWebSocket(
            'wss://'
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
                if(tryingReconnect) {
                    reconnect(data.message.substring(12));
                    tryingReconnect=false;
                }
            }
            else if(data.message.startsWith("/set user")){
                if(tryingUsername) {
                    username=" " + data.message.substring(10);
                    tryingUsername=false;
                }
            }
            else {
                var chatLog= document.querySelector('#chat-log')
                chatLog.value += (data.username + ": " + data.message + '\n');
                chatLog.scrollTop = chatLog.scrollHeight;
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
                    'username': "Server",
                    'starttime' : starttime,
            }));
            messageInputDom.value = '';
            }
            else if(message==="/reconnect"){
                tryingReconnect=true;
                chatSocket.send(JSON.stringify({
                    'message': message,
                    'username': username
                }));
                messageInputDom.value = '';
                }
            else if(message.startsWith("/set user")){
                    tryingUsername=true;
                    chatSocket.send(JSON.stringify({
                        'message': message,
                        'username': username
                    }));
                    messageInputDom.value = '';
                }
            else {
            chatSocket.send(JSON.stringify({
                'message': message,
                'username': username
            }));
            messageInputDom.value = '';
            }
        };
        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        async function lets_go() {
            document.getElementById("countdown").innerHTML = "Okay let's go!" ;
            await sleep(1000);
            for (let i = 3; i >= 0; i--) {
                document.getElementById("countdown").innerHTML = i ;
                await sleep(1000);
            }
            var today = new Date();
            starttime=today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
            document.getElementById("countdown").innerHTML = '';
            startcenturion(0);
        }


        function startcenturion(start){
            widget = Mixcloud.PlayerWidget(document.getElementById("centurion"));
            widget.ready.then(function() {
            // Put code that interacts with the widget here
                if(start===0){
                    widget.play();
                    t=setInterval(checkShot,1000);
                }else {
                        widget.seek(start);
                        widget.play();
                        t=setInterval(checkShot,1000);
                    }
            });
        }

        function checkShot(){
            widget.getPosition().then(function(position) {
                time=Math.round(position);
            });
            if(time===times[index]||time>times[index]){
                add_message();
                index++;
            }
        }


        function reconnect(starttime) {
            var today = new Date();
            var h_now = today.getHours();
            var m_now = today.getMinutes();
            var s_now = today.getSeconds();
            var h = starttime.slice(0,starttime.indexOf(':'));
            var m = starttime.slice(starttime.indexOf(':')+1,starttime.lastIndexOf(':'));
            var s = starttime.slice(starttime.lastIndexOf(':')+1, starttime.length);
            var sum = Math.floor(((h_now-h)*60*60)+((m_now-m)*60)+(s_now-s));
            for(var i=0; i<times.length; i++){
                if (times[i]<sum){
                    if (messages[i].emoji === "shot.png") {
                        arcMove();
                    }
                }
                else{
                    index=i;
                    i=times.length;
                }
            }
            startcenturion(sum);
        }

        var can = document.getElementById('canvas'),
            c = can.getContext('2d');

        var posX = can.width / 2,
            posY = can.height / 2+30,
            procent = 0,
            oneProcent = 360 / 100,
            result = oneProcent * 100;

        c.lineCap = 'round';
        arcMove();

        function add_message(){
            var list=document.getElementById("centurionMessages");
            var node = document.createElement("li");
                node.innerHTML+="<div class=\"w3-card w3-center w3-round-large\" style='background: white; margin-top: 10px'>" +
                    "<div class=\"w3-cell-row w3-center\" style='padding: 10px'>" +
                        "<div class=\"w3-container w3-center w3-cell w3-third\"><p style=\" font-family: sans-serif; font-size: 20px\" class='w3-center'>"+messages[index].text+"</p></div>" +
                        "<div class=\"w3-container w3-center w3-cell w3-third\">" +
                            "<img class=\"w3-center\" style=\"max-width: 80px\" src=\"/static/media/"+messages[index].emoji+"\"></div>" +
                        "<div class=\"w3-container w3-center w3-cell w3-third\"><p style=\" font-family: sans-serif; font-size: 20px\"  class=\"w3-center\">"+messages[index].text2+"</p></div>" +
                    "</div>" +
                "</div>";
            list.insertBefore(node,list.firstChild);
            if(messages[index].emoji==="shot.png"){
                arcMove();
            }
        }

        document.querySelector('#chat-log').value += "Welcome to centurion! \n\n" +
                                            "If you want to start the game just type '/start centurion'. \n\n" +
                                            "If you want to change your username type '/set user ' Followed by your chosen username. \n\n"+
                                            "If that name is already taken, then everyone knows you are a doppelganger\n\n"+
                                            "If you got disconnect you can come back to the room and type '/reconnect'\n\n"+
                                            "Centurion will skip forward to where everyone else is\n\n"+
                                            "Have fun!\n"
        function arcMove(){
            var deegres = noShots*3.6;
                c.clearRect( 0, 0, can.width, can.height );
                procent = deegres / 100;

                c.beginPath();
                c.arc( posX, posY, 85, (Math.PI/180) * 270, (Math.PI/180) * (270 + 360) );
                c.fillStyle = 'white';
                c.fill();

                c.beginPath();
                c.arc( posX, posY, 70, (Math.PI/180) * 270, (Math.PI/180) * (270 + 360) );
                c.strokeStyle = '#b1b1b1';
                c.lineWidth = '10';
                c.stroke();

                c.beginPath();
                c.strokeStyle = '#e62272';
                c.lineWidth = '10';
                c.arc( posX, posY, 70, (Math.PI/180) * 270, (Math.PI/180) * (270 + deegres) );
                c.stroke();

                c.textAlign="center";
                c.fillStyle='white';
                c.font = '30px Arial';
                c.fillText("Number of shots taken", can.width/2+5, 40);

                c.textAlign="center";
                c.fillStyle='#e62272';
                c.font = '30px Arial';
                c.fillText(noShots+"/100", posX, posY+10);
                if(noShots===100){
                    confetti.start();
                }
                noShots++;

        }

