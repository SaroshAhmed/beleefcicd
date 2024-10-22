const wa = require('@open-wa/wa-automate');

let client;

// Function to start WhatsApp Client
const startWhatsAppClient = async () => {
  if (!client) { 
    try {
      client = await wa.create({
        sessionId: 'MySession',
        multiDevice: true,
        headless: true,
        qrTimeout: 0,
        useChrome: false,
      });
      console.log("WhatsApp client started");
    } catch (error) {
      console.error("Failed to start WhatsApp client:", error);
      throw error;
    }
  }
};

// Helper function to create WhatsApp group
const createWhatsAppGroup = async (groupName, participants) => {
  console.log(`Attempting to create group: ${groupName} with participants: ${participants}`);
  await startWhatsAppClient(); 
  try {
    if (!participants || participants.length === 0) {
      throw new Error("At least one participant is required.");
    }

    const formattedParticipants = participants.map(number => `${number}@c.us`);
    const initialMember = formattedParticipants[0];
    const additionalMembers = formattedParticipants.slice(1);

    const groupInfo = await client.createGroup(groupName, [initialMember]);
    const groupId = groupInfo.gid ? groupInfo.gid._serialized : groupInfo._serialized;
    console.log(`Group ${groupName} created with ID: ${groupId}`);

  
    await Promise.all(additionalMembers.map((member, index) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          client.addParticipant(groupId, member)
            .then(result => {
              if (result) {
                console.log(`Successfully added ${member} to the group.`);
              } else {
                console.log(`Failed to add ${member} to the group.`);
              }
              resolve();
            })
            .catch(err => {
              console.error(`Error adding ${member}:`, err);
              resolve(); 
            });
        }, index * 3000); 
      });
    }));

   
    const welcomeMessage = 'Hi Team, Welcome! We have created this group to ensure smooth communication. Looking forward to achieving the maximum outcome. Regards, Sandy'; 
    await new Promise((resolve) => {
      setTimeout(() => {
        client.sendText(groupId, welcomeMessage)
          .then(() => {
            console.log('Welcome message sent successfully.');
            resolve();
          })
          .catch(err => {
            console.error('Failed to send welcome message:', err);
            resolve();
          });
      }, (additionalMembers.length * 3000) + 5000); 
    });

    return { message: "Group created successfully", groupId };
  } catch (error) {
    console.error("Error in creating WhatsApp group:", error);
    throw error;
  }
};

module.exports = { createWhatsAppGroup, startWhatsAppClient };
