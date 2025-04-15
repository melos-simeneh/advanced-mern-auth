const dayjs = require("dayjs");

exports.timestamp = () => dayjs().format("YYYY-MM-DD h:mm:s A");
