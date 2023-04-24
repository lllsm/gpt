const axios = require('axios');
const headers = {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer sk-8BUpQWyrv5zvndZS9s8ZT3BlbkFJO0AR5Z2xeTCrazyThursDayviVo50'
};
const data = {
  model: 'gpt-3.5-turbo',
  messages: [{ role: 'user', content: 'Hello!' }]
};

axios.post('https://api.openai.com/v1/chat/completions', data, { headers })
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error(error);
  });
