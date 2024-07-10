// //cron script to keep the backend running (provoke every 14 mins)

// const cJob = require('cron').CronJob;
// const { CronJob } = require('cron');
// const https = require('https');

// const backend = 'https://smmry-ext.onrender.com/summarize';

// const job = new CronJob('*/14 * * * *', function () {
//     console.log('Restarting server');

//     // Perform an HTTPS GET request to hit any backend api
//     https.get(backendUrl, (res) => {
//         if (res.statusCode === 200) {
//             console.log('Server restarted');
//         } else {
//             console.error(`Failed to restart server with status code: ${res.statusCode}`);
//         }
//     }).on('error', (err) => {
//         console.error('Error during Restart:', err.message);
//     });
// });

// job.start();

// module.exports = job;
