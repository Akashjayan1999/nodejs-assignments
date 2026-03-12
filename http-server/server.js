import http from "http";

const todos = [];
let nextId = 1;

const sendJSON = (res, statusCode, data) => {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
};

const parseBody = (req) =>
  new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
  });

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;
  const rawId = url.searchParams.get("id");
  const id = parseInt(rawId);
  const validId = rawId !== null && !isNaN(id);

 
  if (req.method === "GET" && pathname === "/") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    return res.end("Hello World");
  }

  
  if (req.method === "POST" && pathname === "/create/todo") {
    try {
      const { title, description } = await parseBody(req);
      const todo = { id: nextId++, title, description };
      todos.push(todo);
      return sendJSON(res, 200, todos);
    } catch {
      return sendJSON(res, 400, { error: "Invalid JSON body" });
    }
  }


  if (req.method === "GET" && pathname === "/todos") {
    return sendJSON(res, 200, todos);
  }

 
  if (req.method === "GET" && pathname === "/todo") {
    if (!validId) return sendJSON(res, 404, { error: "Todo not found" });
    const todo = todos.find((t) => t.id === id);
    if (!todo) return sendJSON(res, 404, { error: "Todo not found" });
    return sendJSON(res, 200, todo);
  }

  
  if (req.method === "DELETE" && pathname === "/todo") {
    if (!validId) return sendJSON(res, 404, { error: "Todo not found" });
    const index = todos.findIndex((t) => t.id === id);
    if (index === -1) return sendJSON(res, 404, { error: "Todo not found" });
    todos.splice(index, 1);
    return sendJSON(res, 200, { message: "Todo deleted" });
  }

  sendJSON(res, 404, { error: "Route not found" });
});

const PORT = 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));