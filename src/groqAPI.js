var { Groq } = require('groq-sdk');
var groq = new Groq({
    apiKey: "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",
});

async function makeGroqReqest(message) {
    var reqest = "Наразі будь-які рекомендації відсутні.";
    var response = await groq.chat.completions.create({
        messages: [{ role: 'user', content: message}],
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
    });

    if (response?.choices[0]?.message?.content == null) {
        reqest = "Наразі будь-які рекомендації відсутні."
    } else {
        reqest = response?.choices[0]?.message?.content
    }
    return reqest;
}

module.exports = { makeGroqReqest };