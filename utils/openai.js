const OpenAIApi = require("openai");
const { OPENAI_API_KEY } = require("../config");
const openai = new OpenAIApi({ apiKey: OPENAI_API_KEY });


const analyzeImagesAIUrls = async (files, prompt) => {
  const filesIsArray = Array.isArray(files);
  const filesList = filesIsArray ? files : [files];
  try {
    let messages = {
      role: "user",
      content: [
        {
          type: "text",
          text: prompt,
        },
      ],
    };
    for (const file of filesList) {
      messages.content.push({
        type: "image_url",
        image_url: { url: file },
      });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [messages],
      n: 1,
      temperature: 0,
    });

    const jsonString = response.choices[0].message.content;

    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error analyzing file: ", error.message);
    throw error;
  }
};

module.exports = {
  analyzeImagesAIUrls,
};
