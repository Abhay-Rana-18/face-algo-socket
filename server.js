const io = require("socket.io")(3001, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Track online users with a Set to ensure uniqueness
const onlineUsers = new Set();

io.on("connection", (socket) => {
  // console.log("New connection:", socket.id);

  socket.on("setup", (userData) => {
    if (userData && userData._id) {
      socket.join(userData._id);
      socket.userId = userData._id;
      // console.log("User connected with ID:", userData._id);
      
      onlineUsers.add(userData._id);
      socket.emit("connected");
      // console.log("Online users:", Array.from(onlineUsers));

      io.emit("online-users", Array.from(onlineUsers));
    } else {
      // console.log("User data or ID is missing.");
    }
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User joined Room:", room);
  });

  socket.on("typing", (room, msg) => {
    socket.in(room).emit("typing", msg);
    // console.log("Typing message:", msg);
  });

  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (msg) => {
    const chat = msg.chat;
    if (!chat?.users) {
      return console.log("Chat users not defined.");
    }

    chat.users.forEach((user) => {
      if (user === msg.sender) return;
      // console.log("Message sending to:", user, "Message content:", msg.content);
      io.to(user).emit("message received", msg);
    });
  });

  socket.on("disconnect", () => {
    const userId = socket.userId;

    if (userId) {
      onlineUsers.delete(userId);
      // console.log("User disconnected with ID:", userId);
    } else {
      // console.log("Disconnect event but userId is not set.");
    }

    // console.log("Updated online users:", Array.from(onlineUsers));
    io.emit("online-users", Array.from(onlineUsers));
  });
});

console.log("Server is running on port 3001");
