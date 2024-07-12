const { Sequelize, Op } = require('sequelize');
const Message = require('../model/message.js');
const ArchivedChat = require('../model/archivedChat.js');
const { CronJob } = require('cron');

async function archiveOldMessages() {
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);

  // Start a transaction
  const transaction = await Sequelize.transaction();

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
    await Chat.destroy({
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

const job = new CronJob('5 0 0 * * *', archiveOldMessages, null, true, 'Asia/Kolkata');

job.start();