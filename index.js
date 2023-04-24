const WebSocket = require('ws');
const axios = require('axios');

// OpenAI API 认证信息
const apiKey = 'sk-8BUpQWyrv5zvndZS9s8ZT3BlbkFJO0AR5Z2xeTCrazyThursDayviVo50';
const apiEndpoint = 'https://api.openai.com/v1/chat/completions';

// 创建WebSocket服务器
const server = new WebSocket.Server({ port: 8989 });

server.on('connection', (socket) => {
    console.log('Client connected.');

    socket.on('message', async (message) => {
        let messages = JSON.parse(message);
        console.log(messages)
        try {

            // 设置请求参数
            const options = {
                url: 'https://api.gptbot.cc/v1',
                method: 'POST',
headers: {
    'Content-Type': 'application/json',
    'Authorization': apiKey 
},
                data: {
                    model: 'gpt-3.5-turbo',
                    stream: true,
                    messages: messages
                },
                responseType: 'stream' // 设置响应类型为流
            };

            // 发送请求并处理响应
            axios(options)
                .then(response => {
                    console.log('Response downloaded successfully.');

                    let data = ''; // 保存响应数据的变量

                    response.data.on('data', (chunk) => {
                         data += chunk.toString('utf-8'); // 将每个块附加到响应字符串中
                        // 将响应数据发送回客户端
                        const responseTextRepace = data.replace(/^\s*$(?:\r\n?|\n)/gm, '@').replace(/[DONE]/g, '').replace(/data:/g, '').slice(0, -1).replace(/[DONE]/g, '');
                        const responseTextRepaceArr = responseTextRepace.split('@');
                        let content = '';
                        responseTextRepaceArr.pop();
                        responseTextRepaceArr.forEach((item) => {
                            if (JSON.parse(item).choices[0].delta.content) {
                                content = content + JSON.parse(item).choices[0].delta.content;
                            }
                        });
                        socket.send(content); 

                    });

                    response.data.on('end', () => {
                        console.log(data); // 输出响应字符串
                        socket.close();
                    });
                })
                .catch(error => {
                    console.error(`Request error: ${error}`);
                    socket.close();
                });

        } catch (error) {
            console.error(error);
            socket.send('An error occurred while requesting the OpenAI API.');
            socket.close();
        }
    });
});
