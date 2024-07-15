const { Op } = require('sequelize');
const sequelize = require('../config/database.js')
const Message = require('../model/message.js');
const ArchivedChat = require('../model/archiveChat.js');
const { CronJob } = require('cron');

async function archiveOldMessages() {
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);

  // Start a transaction
  const transaction = await sequelize.transaction()

  try {
    // Find messages older than one day
    const oldMessages = await Message.findAll({
      where: {
        createdAt: {
          [Op.lt]: oneDayAgo
        }
      },
      transaction
    });

    console.log('oldmessage =>  ', oldMessages)
    // Insert old messages into ArchivedChat
    await ArchivedChat.bulkCreate(
      oldMessages.map(msg => msg.toJSON()), // Convert instances to plain objects
      { transaction }
    );

    // Delete old messages from Chat
    await Message.destroy({
      where: {
        createdAt: {
          [Op.lt]: oneDayAgo
        }
      },
      transaction
    });

    // Commit the transaction
    await transaction.commit();
    console.log('Archived and deleted old messages successfully.');
  } catch (error) {
    // Rollback the transaction in case of error
    await transaction.rollback();
    console.error('Error archiving messages:', error);
  }
}

const job = new CronJob('*/1 * * * *', archiveOldMessages, null, true, 'Asia/Kolkata');

module.exports = job