function TodoModel() {
  this.todos = JSON.parse(localStorage.getItem('todos')) || [];
  this.filters = ['All', 'Active', 'Completed'];
  this.activeFilter = this.filters[1];
}

TodoModel.prototype._updateLocalStorage = function() {
  localStorage.setItem('todos', JSON.stringify(this.todos));
};

TodoModel.prototype.toggleTodo = function(id) {
  this.todos = this.todos.map(function(todo) {
    return todo.id === id
      ? {
          value: todo.value,
          done: !todo.done,
          id: todo.id
        }
      : todo;
  });

  this._updateLocalStorage();
};

TodoModel.prototype.removeTodo = function(id) {
  this.todos = this.todos.filter(function(todo) {
    return todo.id !== id;
  });

  this._updateLocalStorage();
};

TodoModel.prototype.addTodo = function(todoValue) {
  if (todoValue !== '') {
    var todo = {
      value: todoValue.trim(),
      done: false,
      id: this.todos.length > 0 ? this.todos[this.todos.length - 1].id + 1 : 1
    };

    this.todos.push(todo);

    this._updateLocalStorage();
  }
};

TodoModel.prototype.changeFilter = function(filterName) {
  this.activeFilter = filterName;
};

TodoModel.prototype.getVisibleTodos = function() {
  switch (this.activeFilter) {
    case 'Active':
      return this.todos.filter(function(todo) {
        return !todo.done;
      });
    case 'Completed':
      return this.todos.filter(function(todo) {
        return todo.done;
      });
    default:
      return this.todos;
  }
};

function TodoView(todosModel) {
  this.todosModel = todosModel;

  this.app = this.getElement('#root');
  this.form = this.createElement('form', 'todo-form');
  this.input = this.createElement('input', 'todo-form__input');
  this.input.type = 'text';
  this.input.placeholder = 'Add todo';
  this.input.name = 'todo';
  this.submitButton = this.createElement('button', 'button');
  this.submitButton.classList.add('btn-success');
  this.submitButton.textContent = 'Submit';
  this.form.append(this.input, this.submitButton);
  this.title = this.createElement('h1');
  this.title.textContent = 'Todos';
  this.todoList = this.createElement('ul', 'todo-list');

  this.filtersBlock = this.createElement('div', 'filters-list');
  this.filterText = this.createElement('span');
  this.filterText.textContent = 'Show: ';
  this.filtersBlock.append(this.filterText);

  var self = this;
  this.todosModel.filters.forEach(function(filter) {
    var label = self.createElement('label');
    var button = self.createElement('input');
    var activeFilter = self.todosModel.activeFilter;
    button.type = 'radio';
    button.id = filter;
    button.name = 'status';

    if (filter === activeFilter) {
      button.checked = true;
    }

    var span = self.createElement('span');
    span.textContent = filter;
    label.append(button, span);
    self.filtersBlock.append(label);
  });

  this.app.append(this.title, this.form, this.filtersBlock, this.todoList);

  this.form.addEventListener('submit', function(event) {
    event.preventDefault();
    self.handleAddTodo(self._todoText());
  });

  this.todoList.addEventListener('click', function(event) {
    if (event.target.className === 'button btn-danger') {
      var id = parseInt(event.target.parentElement.id);
      self.handleDeleteTodo(id);
    }
  });

  this.todoList.addEventListener('change', function(event) {
    if (event.target.type === 'checkbox') {
      var id = parseInt(event.target.parentElement.id);
      self.handleToggleTodo(id);
    }
  });

  this.filtersBlock.addEventListener('change', function(event) {
    if (event.target.type === 'radio') {
      self.handleChangeFilter(event.target.id);
    }
  });

  this.renderList();
}

TodoView.prototype._resetInput = function() {
  this.input.value = '';
};

TodoView.prototype._todoText = function() {
  return this.input.value;
};

TodoView.prototype.handleAddTodo = function(value) {
  this.todosModel.addTodo(value);
  this._resetInput();
  this.renderList();
};

TodoView.prototype.handleDeleteTodo = function(id) {
  this.todosModel.removeTodo(id);
  this.renderList();
};

TodoView.prototype.handleToggleTodo = function(id) {
  this.todosModel.toggleTodo(id);
  this.renderList();
};

TodoView.prototype.handleChangeFilter = function(filter) {
  this.todosModel.changeFilter(filter);
  this.renderList();
};

TodoView.prototype.createElement = function(tag, className) {
  var element = document.createElement(tag);

  if (className) {
    element.classList.add(className);
  }

  return element;
};

TodoView.prototype.getElement = function(selector) {
  var element = document.querySelector(selector);

  return element;
};

TodoView.prototype.renderList = function() {
  while (this.todoList.firstChild) {
    this.todoList.removeChild(this.todoList.firstChild);
  }

  var todos = this.todosModel.getVisibleTodos();
  var self = this;

  todos.forEach(function(todo) {
    var li = self.createElement('li', 'todo-list__item');
    li.id = todo.id;

    var checkbox = self.createElement('input', 'todol-list__checkbox');
    checkbox.type = 'checkbox';
    checkbox.checked = todo.done;

    var span = self.createElement('span');

    if (todo.done) {
      var strike = self.createElement('s');
      strike.textContent = todo.value;
      span.append(strike);
    } else {
      span.textContent = todo.value;
    }

    var deleteButton = self.createElement('button', 'button');
    deleteButton.textContent = '×';
    deleteButton.classList.add('btn-danger');
    li.append(checkbox, span, deleteButton);

    return self.todoList.append(li);
  });
};

var todosModel = new TodoModel();
var todosView = new TodoView(todosModel);
