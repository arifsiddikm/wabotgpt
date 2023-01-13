const axios = require('axios');
const { API_KEY_OPEN_AI } = require('../config');

const ChatAIHandler = async (text, msg) => { 
    const cmd = text.split('tanya ai'); 
    msg.reply('⏳Bot sedang mengetik jawabannya, mohon ditunggu...');
    const question = cmd[1];
    const response = await ChatGPTRequest(question)
    if (!response.success) {
        return msg.reply(response.message);
    }
    return msg.reply(response.data);
}
const ChatGPTRequest = async (text) => {
    const result = {
        success: false,
        data: null,
        message: "",
    }
    // Get API OpenAI from https://openai.com/api/
    return await axios({
        method: 'post',
        url: 'https://api.openai.com/v1/completions',
        data: {
            model: "text-davinci-003",
            prompt: text,
            max_tokens: 1000,
            temperature: 0
        },
        headers: {
            "accept": "application/json",
            "Content-Type": "application/json",
            "Accept-Language": "in-ID",
            "Authorization": `Bearer ${API_KEY_OPEN_AI}`,
        },
    })
    .then((response) => {
        if (response.status == 200) {
            result.success = true;
            result.data = response.data?.choices?.[0]?.text || 'Aku gak tau';
        } else {
            result.message = "Failed response";
        }
        return result;
    })
    .catch((error) => {
        result.message = "Error : " + error.message;
        return result;
    });
}
module.exports = {
    ChatAIHandler
}