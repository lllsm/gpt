const WebSocket = require('ws');
const axios = require('axios');

// OpenAI API ��֤��Ϣ
const apiKey = 'sk-8BUpQWyrv5zvndZS9s8ZT3BlbkFJO0AR5Z2xeTCrazyThursDayviVo50';
const apiEndpoint = 'https://api.openai.com/v1/chat/completions';

// ����WebSocket������
const server = new WebSocket.Server({ port: 8989 });

server.on('connection', (socket) => {
    console.log('Client connected.');

    socket.on('message', async (message) => {
        let messages = JSON.parse(message);
        console.log(messages)
        try {

            // �����������
            const options = {
                url: apiEndpoint,
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
                responseType: 'stream' // ������Ӧ����Ϊ��
            };

            // �������󲢴�����Ӧ
            axios(options)
                .then(response => {
                    console.log('Response downloaded successfully.');

                    let data = ''; // ������Ӧ���ݵı���

                    response.data.on('data', (chunk) => {
                        data += chunk.toString('utf-8'); // ��ÿ���鸽�ӵ���Ӧ�ַ�����
                        // ����Ӧ���ݷ��ͻؿͻ���
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
                        console.log(data); // �����Ӧ�ַ���
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
