const router = require("express").Router();
const redis = require('redis');
const redisclient = redis.createClient();
const axios=require('axios')
console.log("hrlloe")

redisclient.connect().then(res => {
    console.log("connected to redis");
}).catch(err => {
    console.error("something went wrong");
})

async function savetoredis(user, data) {
    
    console.log(user)
    try {
        redisclient.SETEX(user,15,JSON.stringify)
        a = redisclient.get(user)
        if (a) {
            return true
        }
        else {
            throw new Error("something went wrong")
        }

    } catch (error) {
        throw new Error("error")
    }
}

async function getFromRedis(userId) {
    console.log(userId)
     try{
         a = await redisclient.get(userId)
         console.log("a hello ",a)
            if (a) {
               return a
            } else {
                return "no data found"
            }
     } catch (e) {
         return err.message
        }
}




router.get('/:userId/get', async (req, res) => {
    console.log("in get route")
    const userId = req.params.userId;
    console.log(userId)
    getFromRedis(userId).then(data => {
            if (data) {
                res.status(200).json({ data });
            } else {
                res.status(404).json({ message: `Data not found for user ${userId}` });
            }
        })
        .catch(err => {
            res.status(500).json({ error: "Internal Server Error" });
        });
});

router.post('/:userId/set', async (req, res) => {
    const userId = req.params.userId;
    const data = req.body;

    try {
        await savetoredis(userId, data);
        res.status(200).json({ message: `Data set in Redis for ${userId}` });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
});
router.get('/:conversationId', function (req, res) {
    console.log(req.params.conversationId)
    var mergedHeaders = {
        "auth": `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6ImNzLWJmODFmMzE5LTRmODQtNWZlOC1iZjkwLTAwMDU4NTFlZDYwMyJ9.Ro_B0Ps0Bo32Vk9j0dqx2Z-YPd7kH1w-2NIyKm7ay10`,//req.headers.auth,
        'Content-Type': 'application/json',
        'accountId': `63872c0d169ee6fdeef4684e`//req.headers.accountId
    }

    var options = {
        method: 'GET',
        url: `https://smartassist.kore.ai/agentassist/api/v1/public/st-9086dbe5-9e1f-54fd-a4f6-ed60a561f40a/conversations/`+ req.params.conversationId,
        headers: mergedHeaders
    }

    try {
        axios(options).then(response => {
            // console.log(response.data)
            if (response.data && response.status == 200) {
                var participant = response.data.participants.slice(-1)[0]; // Get the latest agent
                var participantAId = participant.aId;
                console.log(participantAId)

                //  second API call with participantAId for customerId
                var secondOptions = {
                    method: 'GET',
                    url: `https://smartassist.kore.ai/agentassist/api/v1/public/st-9086dbe5-9e1f-54fd-a4f6-ed60a561f40a/agents/`+ participantAId,
                    headers: mergedHeaders
                };

                axios(secondOptions).then(secondResponse => {
                    console.log(secondResponse)
                    if (secondResponse.data && secondResponse.status == 200) {
                        // Get the last partipnt from the first API response
                        var lastParticipantIndex = response.data.participants.length - 1;
                        var lastParticipant = response.data.participants[lastParticipantIndex];

                        //  customId from the second API , last participant object
                        lastParticipant.customId = secondResponse.data.customId;

                        // the modified response
                        res.header("Access-Control-Allow-Origin", "*");
                        res.status(response.status)
                        res.send(response.data);
                    } else {
                        res.header("Access-Control-Allow-Origin", "*");
                        res.send({ "error": "Error in second API call" });
                    }
                }).catch(error => {
                    // logger.error("Second API call error - " + error);
                    res.header("Access-Control-Allow-Origin", "*");
                    res.send({ "error": "Error in second API call" });
                });
            } else {
                res.header("Access-Control-Allow-Origin", "*");
                res.send({ "result": "ConversationID is invalid" });
            }
        }).catch(error => {
            // logger.error("First API call error - " + error);
            res.header("Access-Control-Allow-Origin", "*");
            res.send({ "error": error.toString() });
        });
    } catch (error) {
        // logger.error("Conversations API Error - " + error);
        throw new Error(error);
    }
}
)


module.exports=router