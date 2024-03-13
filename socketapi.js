const userModel = require("./routes/users");
const msgModel = require("./routes/message");
const postModel = require("./routes/post");
const io = require( "socket.io" )();
const socketapi = {
    io: io
};

// Add your socket.io logic here!
io.on( "connection", function( socket ) {
    console.log( "A user connected" );
    socket.on('join-server',async userdetails=>{
        const user = await userModel.findOneAndUpdate(
            { username: userdetails.username },
            { socketId: socket.id },
            { new: true }
          );
    })
    socket.on("disconnect",async ()=>{
        const user = await userModel.findOneAndUpdate(
            {socketId: socket.id},
            {socketId: ""},
            { new: true }
        )
    })
    socket.on("private-msg", async msgobj=>{
        
        if (msgobj.msgpost) {
            const msgs = await msgModel.create({
                post : msgobj.msgpost,
                sender : msgobj.sender,
                receiver : msgobj.receiver
            })
            // const msg = await msgModel.findOne({ post: msgobj.msgpost }).populate({ path: 'post', populate: { path: 'user' } });
            // console.log(msg);
        } else {
            const msg = await msgModel.create({
                message : msgobj.msg,
                sender : msgobj.sender,
                receiver : msgobj.receiver
            })
        }

        const receiver = await userModel.findOne({
            username: msgobj.receiver
        })

       socket.to(receiver.socketId).emit("receive-private-msg",
        msgobj
       )
    })
    socket.on("fetch-conversation", async conversationDetails =>{
        const allmsg = await msgModel.find({
            $or:[
                {
                    sender:conversationDetails.sender,
                    receiver:conversationDetails.receiver
                },
                {
                    sender:conversationDetails.receiver,
                    receiver:conversationDetails.sender
                }
            ]
        }).populate({ path: 'post', populate: { path: 'user' } });
        socket.emit('send-conversation',allmsg)
    })



});
// end of socket.io logic

module.exports = socketapi;