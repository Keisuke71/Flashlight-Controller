const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

// 環境変数からパスワードを読み込む（設定がなければデフォルトで1234）
const SYSTEM_PASSWORD = process.env.ADMIN_PASSWORD || "1234";
let connectionCount = 0;

io.on("connection", (socket) => {
  connectionCount++;
  io.emit("update_count", connectionCount);
  console.log("接続数:", connectionCount);

  // ★最初は「一般人」として扱う
  socket.isAdmin = false;

  socket.on("disconnect", () => {
    connectionCount--;
    io.emit("update_count", connectionCount);
  });

  // --- 1. ログイン処理 ---
  socket.on("admin_login", (inputPassword) => {
    // 送られてきたパスワードと、設定されたパスワードを比較
    if (inputPassword === SYSTEM_PASSWORD) {
      socket.isAdmin = true; // ★合格なら「管理者」のタグをつける
      socket.emit("login_result", true); // 「成功したよ」と返す
    } else {
      socket.emit("login_result", false); // 「失敗したよ」と返す
    }
  });

  // --- 2. 命令処理（ガード付き） ---
  socket.on("remote_switch", (status) => {
    // ★管理者タグを持っている人からの命令しか聞かない！
    if (socket.isAdmin) {
      io.emit("broadcast_switch", status);
    }
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});