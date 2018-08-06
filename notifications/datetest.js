const moment = require("moment");
const currentDate = moment(new Date()).format("MM/DD/YYYY");
const unixTime = parseInt((new Date(currentDate).getTime() / 1000).toFixed(0));
const oneDayEarlier = moment()
  .add(-1, "days")
  .format("MM/DD/YYYY");
console.log(oneDayEarlier);
console.log(unixTime);
