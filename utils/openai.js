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

const chatCompletion = async (systemPrompt, userInput, jsonFormat = false) => {
  try {
    // Build the messages array
    const messages = [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: userInput,
      },
    ];

    // Build the options object, conditionally adding response_format if jsonFormat is true
    const options = {
      model: "gpt-4o",
      messages,
      n: 1,
      temperature: 0,
      ...(jsonFormat && { response_format: { type: "json_object" } }), // Conditionally add response_format
    };

    // Call the OpenAI API
    const response = await openai.chat.completions.create(options);

    const jsonString = response.choices[0].message.content;

    // Parse the JSON response if jsonFormat is true, otherwise return raw string
    return jsonFormat ? JSON.parse(jsonString) : jsonString;
  } catch (error) {
    console.error("Error in chatCompletion: ", error.message);
    throw error;
  }
};

const imageCompletion = async (
  files,
  systemPrompt,
  userInput,
  jsonFormat = false
) => {
  console.log(systemPrompt, userInput);
  const filesIsArray = Array.isArray(files);
  const filesList = filesIsArray ? files : [files];
  try {
    let messages = {
      role: "user",
      content: [
        {
          type: "text",
          text: systemPrompt + userInput,
        },
      ],
    };

    // If files are provided, process them, otherwise just handle the text
    if (files) {
      const filesIsArray = Array.isArray(files);
      const filesList = filesIsArray ? files : [files];

      for (const file of filesList) {
        const base64Image = `data:image/jpeg;base64,${file.buffer.toString("base64")}`;

        messages.content.push({
          type: "image_url",
          image_url: { url: base64Image },
        });
      }
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [messages],
      n: 1,
      temperature: 0,
      ...(jsonFormat && { response_format: { type: "json_object" } }), // Conditionally add response_format
    });

    const jsonString = response.choices[0].message.content;
    console.log(jsonString);
    return jsonFormat ? JSON.parse(jsonString) : jsonString;
  } catch (error) {
    console.error("Error analyzing file: ", error.message);
    throw error;
  }
};

// const guessBattleAxe = async (files) => {
//   const filesIsArray = Array.isArray(files);
//   const filesList = filesIsArray ? files : [files];
//   try {
//     let messages = {
//       role: "user",
//       content: [
//         {
//           type: "text",
//           text: `Analyze each image_url. See if the top view of the property is visible in it. Now gather description whats is inside the top view images only of the property. Empty land properties are not considered as battleAxe remember that. Determine if that property is a battleaxe or not.

//           [[Important Note: A Battleaxe property is typically located behind another property with a narrow driveway or access path leading to it from the street]]

//           The response should be in the json format:
//           {
//             "battleAxe": "[enum: No, Yes]"
//           }.`,
//         },
//       ],
//     };

//     for (const file of filesList) {
//       messages.content.push({
//         type: "image_url",
//         image_url: { url: file },
//       });
//     }

//     const response = await openai.chat.completions.create({
//       model: "gpt-4o-mini",
//       messages: [messages], // Directly pass the messages array
//       response_format: { type: "json_object" },
//       n: 1,
//       temperature: 0,
//     });

//     const jsonString = response.choices[0].message.content;

//     return JSON.parse(jsonString);
//   } catch (error) {
//     console.error("Error analyzing file: ", error.message);
//     throw error;
//   }
// };

const guessBattleAxe = async (imageBuffer) => {
  try {
    // let messages = {
    //   role: "user",
    //   content: [
    //     {
    //       type: "text",
    //       text: `You need to determine whether the property marked with a red pin in the image is a Battleaxe property.

    //   A Battleaxe property is defined as a property located behind another property, with its only access to the street being a narrow driveway or path. For a property to be a Battleaxe:
    //   - There must be another property in front of it that blocks direct access to the street.
    //   - The marked property should only be accessible via a narrow path or driveway that runs alongside or between other properties.

    //   Ignore properties to the left, right, above, or below the marked property unless they block its direct access to the street.

    //   Analyze the image and provide a JSON response indicating whether the marked property is a Battleaxe property. Use this format:

    //   {
    //     "battleAxe": "Yes" or "No"
    //   }`,
    //     },
    //     {
    //       type: "image_url",
    //       image_url: { url: imageBuffer.toString("base64") },
    //     },
    //   ],
    // };

    let messages = {
      role: "user",
      content: [
        {
          type: "text",
          text: `You need to determine if the property marked with a red pin in the image is a Battleaxe property. Follow these specific and clear instructions to decide.
    
    ### Key Characteristics of a Battleaxe Property:
    1. **Position Relative to Street:**
       - A Battleaxe property is positioned behind another property that is closer to the street, blocking its direct access to the street.
       - If the marked property is at the same level as other properties with no blocking property in front, it is NOT a Battleaxe.
    
    2. **Access Path:**
       - The only access to a Battleaxe property is via a narrow driveway or path that runs alongside or between other properties. This driveway or path is usually shared or not directly connected to the street.
       - If the property has direct access to the street via its own driveway without obstruction, it is NOT a Battleaxe.
    
    3. **Street Frontage:**
       - A Battleaxe property generally lacks significant street frontage. It is set back from the street, with its front obstructed by another property.
    
    ### Detailed Steps to Determine:
    1. **Check Street Access:** Look closely to see if the marked property has any part touching the street, such as a direct driveway or frontage. If so, it is NOT a Battleaxe.
    2. **Identify Any Blocking Property:** Is there another property directly between the marked property and the street, blocking direct access? If not, the property is NOT a Battleaxe.
    3. **Evaluate the Driveway:** If the marked property is accessed by a narrow driveway/path that runs between or alongside other properties, it might be a Battleaxe. If it has its own direct, clear driveway to the street, it is NOT a Battleaxe.
    
    ### Decision Guide:
    - **Battleaxe (Yes):** The property is hidden behind another property, does not touch the street directly, and is accessed by a narrow driveway/path shared with other properties.
    - **Not Battleaxe (No):** The property has its own driveway, directly touches the street, or has no other property blocking its street access.
    
    ### Expected Response:
    After carefully analyzing the image, provide your decision in the following JSON format:
    
    {
      "battleAxe": "Yes" or "No"
    }`,
        },
        {
          type: "image_url",
          image_url: { url: imageBuffer.toString("base64") },
        },
      ],
    };

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [messages],
      response_format: { type: "json_object" },
      n: 1,
      temperature: 0,
    });

    const analysis = response.choices[0].message.content;
    return analysis;
  } catch (error) {
    console.error("Error analyzing image with OpenAI:", error.message);
    throw error;
  }
};

module.exports = {
  analyzeImagesAIUrls,
  guessBattleAxe,
  chatCompletion,
  imageCompletion,
};
