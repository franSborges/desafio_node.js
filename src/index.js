const express = require('express');
const cors = require('cors');

 const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];
const id = uuidv4();

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);
  
  if (!user) {
    return response.status(404).json({ error: "User does not exists"});
  }

  request.user = user;
  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;
  
  const userExists = users.find(user => user.username === username);

  if (userExists) {
    return response.status(400).json({ error: "Username Already exists"})
  }
  const user = {
    id: id,
    name,
    username,
    todos: []
  }

  users.push(user);

  return response.status(201).json(user);
});


app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});


app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  
  const todo = {
    id: id,
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo);

   return response.status(201).json(todo);
});


app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;
  

  const task = user.todos.find(task => task.id === id);
  
  if (!task) {
    return response.status(404).json({ error: "Todo not found" });
  }

  task.title = title;
  task.deadline = new Date(deadline);
  
  return response.json(task);
});


app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const task = user.todos.find(task => task.id === id);

  if (!task) {
    return response.status(404).json({ error: "Todo not found" });
  }

  task.done = true;
  
  return response.json(task);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const taskIndex = user.todos.findIndex(task => task.id === id);

  if (taskIndex === -1) {
    return response.status(404).json({ error: "Todo not found" });
  }

  user.todos.splice(taskIndex, 1);

  return response.status(204).json();
});



module.exports = app;