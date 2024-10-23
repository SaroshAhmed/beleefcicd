const mongoose = require("mongoose");
const databaseConnect = require("../config/database"); // Adjust the path as necessary
const UserProperty = require("../models/UserProperty"); // Adjust the path as necessary
const PostList = require("../models/PostList");

// Connect to the database
databaseConnect();

const updatePostListWithPropertyId = async () => {
  try {
    // Find all postList entries

    const postLists = await PostList.find({
      propertyId: null,
    });

    for (const postList of postLists) {
      const { address, userId } = postList;

      // Find the UserProperty based on address and userId
      const userProperty = await UserProperty.findOne({ address, userId });

      if (userProperty) {
        const propertyId = userProperty._id;

        // Update the PostList with the found propertyId
        await PostList.updateOne(
          { _id: postList._id }, // filter by the current postList document
          { $set: { propertyId: new mongoose.Types.ObjectId(propertyId) } } // update with propertyId
        );

        console.log(
          `Updated PostList ID ${postList._id} with propertyId ${propertyId}`
        );
      } else {
        console.log(
          `No matching UserProperty found for PostList ID ${postList._id}`
        );
      }
    }

    console.log("Migration completed successfully.");
  } catch (error) {
    console.error("Error occurred during migration:", error);
  } finally {
    // Close the database connection
    mongoose.connection.close();
  }
};

updatePostListWithPropertyId();
