const mongoose = require("mongoose");
const { MONGO_URI } = require("../config");
const Suburb = require("../models/Suburb");
const { chatCompletion } = require("../utils/openai"); // Assuming this service handles GPT-4 chat API requests

const generateStatement = async (suburb) => {
  const systemPrompt = `I will give you a suburb and then I want one conversational-like statement that highlights why a suburb is undervalued compared to nearby areas. The statement should clearly show what makes the suburb special, demonstrating why its value should be higher. For example, you can say something like, 'Oatley is the only waterfront suburb in St George that has a train station; yet it’s undervalued compared to nearby suburbs like Connells Point.' The statement should evoke a response from a person who lives in the suburb of 'that’s right!' Mention unique features like access to transportation, land size, or waterfront views, and explain why these aspects make the suburb undervalued. Ensure you add wording at the end of each statement to the effect of 'prices are still lower' or 'it’s undervalued,' or 'more growth should be present.'`;

  const userInput = `Suburb is: ${suburb}`;
  const result = await chatCompletion(systemPrompt, userInput); // true for JSON format if needed

  return result;
};

async function runMigration() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const suburbs = await Suburb.find({ description: null });

    for (const suburb of suburbs) {
      const statement = await generateStatement(suburb.suburb);

      // Update the suburb with the generated statement
      await Suburb.updateOne(
        { _id: suburb._id },
        { $set: { description: statement } }
      );

      console.log(`Updated suburb: ${suburb.suburb}`);
    }

    console.log("Migration completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    mongoose.connection.close();
  }
}

runMigration();
