const History = require('../models/History')

const buildNewRecord = async (roomid, userid, history) => {
  let newRecord = History.buildNewRecord(roomid, userid, history)
  await newRecord.save();
}

module.exports = buildNewRecord;