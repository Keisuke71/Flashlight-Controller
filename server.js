const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

// publicフォルダの中身（HTMLなど）を公開する
app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("ユーザーが接続しました");

  // スマホから「remote_switch」という命令が来たら
  socket.on("remote_switch", (status) => {
    // 全員に「broadcast_switch」として転送する
    io.emit("broadcast_switch", status);
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});