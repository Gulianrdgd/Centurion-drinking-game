        //reconnecting things
        var today = new Date();
        var starttime = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        const roomName = JSON.parse(document.getElementById('room-name').textContent);
        var noShots=0;
        var index=0;

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
            add_message();
            arcMove();
            index++;
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
            var widget = Mixcloud.PlayerWidget(document.getElementById("centurion"));
            widget.ready.then(function() {
            // Put code that interacts with the widget here
                console.log("hello!")
                if(widget.seek(start)) {
                    widget.play();
                }
            });
        }

        function reconnect(starttime) {
            console.log(starttime);
            var today = new Date();
            var h_now = today.getHours();
            var m_now = today.getMinutes();
            var s_now = today.getSeconds();
            var h = starttime.slice(0,starttime.indexOf(':'));
            var m = starttime.slice(starttime.indexOf(':')+1,starttime.lastIndexOf(':'));
            var s = starttime.slice(starttime.lastIndexOf(':')+1, starttime.length);
            var sum = Math.floor(((h_now-h)*60*60)+((m_now-m)*60)+(s_now-s));
            console.log(sum);
            startcenturion(sum);
        }

        var can = document.getElementById('canvas'),
            c = can.getContext('2d');

        var posX = can.width / 2,
            posY = can.height / 2+30,
            procent = 0,
            oneProcent = 360 / 100,
            result = oneProcent * 64;

        c.lineCap = 'round';
        arcMove();

        function add_message(){
            var list=document.getElementById("centurionMessages");
            var node = document.createElement("li");
                node.innerHTML+="<div class=\"w3-card w3-center w3-round-large\" style='background: white; margin-top: 10px'>" +
                    "<div class=\"w3-cell-row w3-center\" style='padding: 10px'>" +
                        "<div class=\"w3-container w3-center w3-cell w3-third\"><p style=\" font-family: 'Oswald'; font-size: 20px\" class='w3-center'>"+messages[index].text+"</p></div>" +
                        "<div class=\"w3-container w3-center w3-cell w3-third\">" +
                            "<img class=\"w3-center\" style=\"max-width: 80px\" src=\"/static/media/"+messages[index].emoji+"\"></div>" +
                        "<div class=\"w3-container w3-center w3-cell w3-third\"><p style=\" font-family: 'Oswald'; font-size: 20px\"  class=\"w3-center\">"+messages[index].text2+"</p></div>" +
                    "</div>" +
                "</div>";
            list.insertBefore(node,list.firstChild);
        }

        function arcMove(){
            var deegres = noShots;
                c.clearRect( 0, 0, can.width, can.height );
                procent = deegres / oneProcent;

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
                if( deegres >= result ) clearInterval(acrInterval);

                c.textAlign="center";
                c.fillStyle='white';
                c.font = '30px Arial';
                c.fillText("Number of shots taken", can.width/2, 30);

                c.textAlign="center";
                c.fillStyle='#e62272';
                c.font = '30px Arial';
                c.fillText(noShots+"/100", posX, posY+10);
                noShots++;

        }

