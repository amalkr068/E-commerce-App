//const { app } = require("../../app")
const Chat = require("../../model/chatSchema"); 
//const socketIo = require('socket.io');

const { io } = require("../../controllers/user/socket")
const User = require("../../model/userSchema")

//const io = socketIo(app);





const getUserHelp = async(req,res)=>{

    const userId = req.session.user
    const userfind = await User.findOne({_id:userId})
    //console.log("User =",user)
    res.render("user/user-chat",{user:userfind.email})
}

//const user = req.session.user
const getAdminHelp = async (req,res)=>{
   const users = await User.find({isAdmin:false})
    res.render("admin/admin-chat",{users})
}

// Function to fetch chat history between user and admin
async function getChatHistory(userId) {
    const messages = await Chat.find({
      $or: [
        { senderId: userId, receiverId: 'admin' },
        { senderId: 'admin', receiverId: userId }
      ]
    }).sort({ timestamp: 1 }); // Sort by timestamp in ascending order
  
    return messages;
  }
  














io.on('connection', (socket) => {
  console.log('a user connected');

  // Handle user joining a chat (user-side)
  socket.on('join_chat', (userId) => {
    socket.join(userId);  // Join room named after userId
    console.log(`${userId} joined the chat`);
  });

  // Handle chat history request from user
socket.on('get_chat_history', async (userId) => {
    const messages = await getChatHistory(userId);
    socket.emit('chat_history', messages);
  });
  

  // Handle messages from users
  socket.on('send_message', async (data) => {
    const { userId, message } = data;
    
    if (!message || message.trim() === '') {
        return; // Don't process empty messages
    }

    // Save the message to MongoDB
    const chatMessage = new Chat({
      senderId: userId,
      receiverId: 'admin',  // Messages from user are sent to admin
      message: message
    });
    await chatMessage.save();

    console.log(`Message from ${userId}: ${message}`);

    // Broadcast message to the admin for this user
    io.to('admin').emit('receive_message', { userId, message });
  });

  // Handle admin sending a message to a user
  socket.on('admin_send_message', async (data) => {
    const { userId, message } = data;

    if (!message || message.trim() === '') {
        return; // Don't process empty messages
    }

    // Save the admin's message to MongoDB
    const chatMessage = new Chat({
      senderId: 'admin',  // Messages from admin
      receiverId: userId,  // Sent to the user
      message: message
    });
    await chatMessage.save();

    // Send the message to the user
    io.to(userId).emit('receive_message', { userId: 'admin', message });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});



module.exports = { getUserHelp,getAdminHelp}