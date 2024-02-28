const express = require("express");
const app = express();
const redis = require('redis');
const routes=require('./routes/routes')

app.use(express.json());

// const redisclient = redis.createClient();

const port = 8081;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});


// redisclient.connect().then(res => {
//     console.log("connected to redis");
// }).catch(err => {
//     console.error("something went wrong");
// })

app.use('/redis', routes)


// function savetoredis(user, data) {
//     return new Promise((resolve, reject) => {
//         redisclient.set(user, JSON.stringify(data), (err, response) => {
//             if (err) {
//                 console.error("Error saving data to Redis:", err);
//                 reject(err);
//             } else {
//                 console.log("Data saved to Redis:", response);
//                 resolve(response);
//             }
//         });
//     });
// }


