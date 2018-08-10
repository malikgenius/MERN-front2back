const moment = require('moment');

const nowDate = moment(new Date()).format('MM/DD/YYYY');
// console.log(currentDate);
// const unix2time = moment(new Date(1533813292 * 1000)).format('MM/DD/YYYY');
// console.log(unix2time);
const unixTime = parseInt((new Date(nowDate).getTime() / 1000).toFixed(0));

// how to get unixtimestamp only for MM/DD/YYYY and not the HH/MM/SS
const dateTime = new Date('2018-08-09');
const timeStamp = Math.floor(dateTime / 1000);

//
// current date in human readable format.
const currentDate = moment(new Date()).format('MM/DD/YYYY');
// Change Unixtime into human Readable
var dateString = moment.unix(1533847707).format('MM/DD/YYYY');

//
console.log(unixTime);
console.log(dateString);
console.log(currentDate);
