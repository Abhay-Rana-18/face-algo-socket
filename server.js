const io = require("socket.io")(3001, {
  cors: {
    origin: "https://face-algo.vercel.app",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("setup", (userData) => {
    socket.join(userData?._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User joined Room: " + room);
  });

  socket.on("typing", (room, msg) => {
    socket.in(room).emit("typing", msg);
    console.log(msg);
  });
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (msg) => {
    const chat = msg.chat;
    if (!chat?.users) {
      return console.log("Chat users not defined.");
    }

    chat.users.forEach((user) => {
      if (user === msg.sender) return;
      console.log("message sending to: " + user + ", msg: " + msg?.content);
      io.to(user).emit("message received", msg);
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

console.log("server");
