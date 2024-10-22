// whatsappService.js
const wa = require('@open-wa/wa-automate');

let client;

const startWhatsAppClient = async () => {
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
  }
};

const createWhatsAppGroup = async (groupName = 'Sandy Test', participants = []) => {
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

 
    setTimeout(() => {
      additionalMembers.forEach((member, index) => {
        setTimeout(() => {
          client.addParticipant(groupId, member)
            .then(result => {
              if (result) {
                console.log(`Successfully added ${member} to the group.`);
              } else {
                console.log(`Failed to add ${member} to the group.`);
              }
            })
            .catch(err => {
              console.error(`Error adding ${member}:`, err);
            });
        }, index * 3000); 
      });

    
      setTimeout(() => {
        const welcomeMessage = 'Hi Team, Welcome, We have created this group to ensure smooth and live communication throughout the campaign. What happens next: We will send through a calendar of events confirming all future events such as marketing. Looking forward to achieving the maximum outcome. Regards, Sandy.';
        client.sendText(groupId, welcomeMessage)
          .then(() => {
            console.log('Welcome message sent successfully.');
          })
          .catch(err => {
            console.error('Failed to send welcome message:', err);
          });
      }, (additionalMembers.length * 3000) + 5000); // Adjust delay to ensure all members are added before sending
    }, 5000); // Delay before starting to add participants

    return { message: "Group created successfully", groupId };
  } catch (error) {
    console.error("Error in creating WhatsApp group:", error);
    throw error;
  }
};

module.exports = { startWhatsAppClient, createWhatsAppGroup };
