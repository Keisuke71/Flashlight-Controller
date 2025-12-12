const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

// 接続人数を数える変数
let connectionCount = 0;

io.on("connection", (socket) => {
  // 1. 誰かが来たらカウントアップ
  connectionCount++;
  // 全員に「今の人数」を知らせる
  io.emit("update_count", connectionCount);
  console.log("接続数:", connectionCount);

  // 2. 誰かがいなくなったらカウントダウン
  socket.on("disconnect", () => {
    connectionCount--;
    // 減った人数を全員に知らせる
    io.emit("update_count", connectionCount);
  });

  // 3. ライト操作の命令（今までと同じ）
  socket.on("remote_switch", (status) => {
    io.emit("broadcast_switch", status);
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});