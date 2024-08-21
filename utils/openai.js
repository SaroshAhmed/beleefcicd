const OpenAIApi = require("openai");
const { OPENAI_API_KEY } = require("../config");
const openai = new OpenAIApi({ apiKey: OPENAI_API_KEY });

const analyzeImagesAIUrls = async (files, prompt) => {
  const filesIsArray = Array.isArray(files);
  const filesList = filesIsArray ? files : [files];
  try {
    let messages = [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Use the three images below as a benchmark to determine the finishes to be used in the second user message.
              1. High-end finishes (1st image)
              2. Updated (2nd image)
              3. Original (3rd image)
              Check all the images and then come to conclusion. Below are the parameters to see also I have attached example images of the three finishes.
              High-end: Premium materials, custom finishes, and modern technology.
              Updated: Recently renovated with contemporary, mid-range features.
              Original: Outdated, with basic or worn finishes from the original `,
          },
          {
            type: "image_url",
            image_url: {
              url: "https://beleef-public.s3.ap-southeast-2.amazonaws.com/assets/finishesGuide/high-end.jpeg",
            },
          },
          {
            type: "image_url",
            image_url: {
              url: "https://beleef-public.s3.ap-southeast-2.amazonaws.com/assets/finishesGuide/updated.jpeg",
            },
          },
          {
            type: "image_url",
            image_url: {
              url: "https://beleef-public.s3.ap-southeast-2.amazonaws.com/assets/finishesGuide/original.jpeg",
            },
          },
        ],
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: prompt,
          },
        ],
      },
    ];

    for (const file of filesList) {
      messages[1].content.push({
        type: "image_url",
        image_url: { url: file },
      });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages, // Directly pass the messages array
      response_format: { type: "json_object" },
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

const guessBattleAxe = async (files) => {
  const filesIsArray = Array.isArray(files);
  const filesList = filesIsArray ? files : [files];
  try {
    let messages = {
      role: "user",
      content: [
        {
          type: "text",
          text: `Extract only aerial images or top view images of the property, analyze those and determine if it is a battleaxe property.

          Note: A battleaxe property is a piece of land that is located behind another property and typically accessed by a narrow driveway or accessway.

          The response should be in the json format:
          {
            "battleAxe": "[enum: No, Yes]"
          }.`,
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
      model: "gpt-4o-mini",
      messages: [messages], // Directly pass the messages array
      response_format: { type: "json_object" },
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
  guessBattleAxe,
};
