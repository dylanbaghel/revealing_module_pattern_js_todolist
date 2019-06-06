// Storage Controller
const StorageCtrl = (function () {
    return {
        storeTodo: function (todo) {
            let todos = [];
            const todosStr = localStorage.getItem('todos');
            if (todosStr === null) {
                todos = [];
                todos.push(todo);

                localStorage.setItem('todos', JSON.stringify(todos));
            } else {
                todos = JSON.parse(todosStr);
                todos.push(todo);
                localStorage.setItem('todos', JSON.stringify(todos));
            }
        },
        removeTodo: function (id) {
            if (localStorage.getItem('todos') !== null) {
                let todos = JSON.parse(localStorage.getItem('todos'));

                todos = todos.filter(function (todo) {
                    return todo.id !== id;
                });


                localStorage.setItem('todos', JSON.stringify(todos));
            }
        },
        updateTodo: function (updatedTodo) {
            if (localStorage.getItem('todos') !== null) {
                let todos = JSON.parse(localStorage.getItem('todos'));

                todos.forEach(function (todo) {
                    if (todo.id === updatedTodo.id) {
                        todo.title = updatedTodo.title;
                    }
                })

                localStorage.setItem('todos', JSON.stringify(todos));
            }
        },
        getTodosFromStorage: function () {
            return localStorage.getItem('todos') === null ? [] : JSON.parse(localStorage.getItem('todos'));
        }
    }
})();

// Todo Ctrl
const TodoCtrl = (function () {
    function Todo(id, title) {
        this.id = id;
        this.title = title;
    }

    const state = {
        todos: StorageCtrl.getTodosFromStorage(),
        currentTodo: null
    };


    // Public Methods
    return {
        logState: function () {
            return state;
        },
        getTodos: function () {
            return state.todos;
        },
        setCurrentTodo: function (todo) {
            state.currentTodo = todo;
        },
        getCurrentTodo: function () {
            return state.currentTodo;
        },
        getTodoById: function (id) {
            return state.todos.find(function (todo) {
                return todo.id === id;
            });
        },
        addTodo: function (title) {
            let ID = 0;
            if (state.todos.length > 0) {
                ID = state.todos[state.todos.length - 1].id + 1;
            }

            const newTodo = new Todo(ID, title);

            state.todos.push(newTodo);

            return newTodo;
        },
        deleteTodo: function (id) {
            state.todos = state.todos.filter(function (todo) {
                return todo.id !== id;
            });
        },
        updateTodo: function (title) {
            const currentTodo = state.currentTodo;

            let found = null;

            state.todos.forEach(function (todo) {
                if (todo.id === currentTodo.id) {
                    todo.title = title;
                    found = todo;
                }
            });

            return found;
        }
    };
})();

// UI Ctrl 
const UICtrl = (function () {
    const UISelectors = {
        itemList: '#item-list',
        addBtn: '.add-btn',
        todoTitleInput: '#todo-title',
        updateBtn: '.update-btn',
        clearBtn: '.clear-btn'
    };
    // Public Methods
    return {
        getSelectors: function () {
            return UISelectors;
        },
        getInputValues: function () {
            return {
                title: document.querySelector(UISelectors.todoTitleInput).value
            };
        },
        clearInputFields: function () {
            document.querySelector(UISelectors.todoTitleInput).value = '';
        },
        clearEditState: function () {
            document.querySelector(UISelectors.updateBtn).style.display = 'none';
            document.querySelector(UISelectors.clearBtn).style.display = 'none';
            document.querySelector(UISelectors.addBtn).style.display = 'inline';
            UICtrl.clearInputFields();
        },
        showEditState: function () {
            document.querySelector(UISelectors.updateBtn).style.display = 'inline';
            document.querySelector(UISelectors.clearBtn).style.display = 'inline';
            document.querySelector(UISelectors.addBtn).style.display = 'none';
        },
        addTodoToForm: function (title) {
            document.querySelector(UISelectors.todoTitleInput).value = title;
        },
        populateTodosList: function (todos) {
            let html = '';

            todos.forEach(function (todo) {
                html += `
                <li class="list-group-item" id="todo-${todo.id}">
                <strong>${todo.title}</strong>
                <span style="margin-left: 5rem"></span>
                <div class="todo-icons">
            <a href="#">
                <i class="edit-icon fa fa-pencil mr-3"></i>
            </a>
            <a href="#">
                <i class="remove-icon fa fa-trash"></i>
            </a>
            </div>
            </li>
                `;
            });

            document.querySelector(UISelectors.itemList).innerHTML = html;
        },
        addNewTodoInList: function (newTodo) {
            const li = document.createElement('li');
            li.classList.add('list-group-item');
            li.id = `todo-${newTodo.id}`;

            li.innerHTML = `
            <strong>${newTodo.title}</strong>
            <div class="todo-icons">
            <a href="#">
                <i class="edit-icon fa fa-pencil mr-3"></i>
            </a>
            <a href="#">
                <i class="remove-icon fa fa-trash"></i>
            </a>
            </div>`;
            document.querySelector(UISelectors.itemList).appendChild(li);
        },
        removeTodoFromList: function (id) {
            const liId = `#todo-${id}`;
            document.querySelector(liId).remove();
        },
        updateTodoListItem: function (todo) {
            const liId = `#todo-${todo.id}`;

            document.querySelector(liId).innerHTML = `<strong>${todo.title}</strong>
            <div class="todo-icons">
            <a href="#">
                <i class="edit-icon fa fa-pencil mr-3"></i>
            </a>
            <a href="#">
                <i class="remove-icon fa fa-trash"></i>
            </a>
            </div>`;
        }
    };
})();

const App = (function (TodoCtrl, StorageCtrl, UICtrl) {
    const loadEventListeners = function () {
        const UISelectors = UICtrl.getSelectors();


        document.querySelector(UISelectors.addBtn).addEventListener('click', todoAddSubmit);

        document.addEventListener('keypress', function (e) {
            if (e.keyCode === 13 || e.which === 13) {
                e.preventDefault();
                return false;
            }
        });

        document.querySelector(UISelectors.itemList).addEventListener('click', modifyTodos);

        document.querySelector(UISelectors.clearBtn).addEventListener('click', function (e) {
            e.preventDefault();
            UICtrl.clearEditState();
            TodoCtrl.setCurrentTodo(null);
        });

        document.querySelector(UISelectors.updateBtn).addEventListener('click', updateTodoSubmit);

    }

    const todoAddSubmit = function (e) {
        e.preventDefault();
        const input = UICtrl.getInputValues();

        if (input.title !== '') {
            const newTodo = TodoCtrl.addTodo(input.title);

            UICtrl.addNewTodoInList(newTodo);

            StorageCtrl.storeTodo(newTodo);

            UICtrl.clearInputFields();
        }
    }

    const updateTodoSubmit = function (e) {
        e.preventDefault();

        const input = UICtrl.getInputValues();

        const updatedTodo = TodoCtrl.updateTodo(input.title);

        UICtrl.updateTodoListItem(updatedTodo);

        StorageCtrl.updateTodo(updatedTodo);

        UICtrl.clearEditState();
        UICtrl.clearInputFields();
        TodoCtrl.setCurrentTodo(null);
    }

    const modifyTodos = function (e) {
        if (e.target.classList.contains('edit-icon')) {
            // Invoke The Edit State;
            const liId = e.target.parentElement.parentElement.parentElement.id;

            const liIdArr = liId.split('-');
            const todoId = parseInt(liIdArr[1]);
            const todoToUpdate = TodoCtrl.getTodoById(todoId);

            TodoCtrl.setCurrentTodo(todoToUpdate);

            UICtrl.showEditState();
            UICtrl.addTodoToForm(todoToUpdate.title);
        }

        if (e.target.classList.contains('remove-icon')) {
            const liId = e.target.parentElement.parentElement.parentElement.id;

            const liIdArr = liId.split('-');

            const todoId = parseInt(liIdArr[1]);

            TodoCtrl.deleteTodo(todoId);
            StorageCtrl.removeTodo(todoId);
            UICtrl.removeTodoFromList(todoId);
        }
    }


    // Public Methods;
    return {
        init: function () {
            UICtrl.clearEditState();
            const todos = TodoCtrl.getTodos();

            UICtrl.populateTodosList(todos);


            loadEventListeners();
        }
    };

})(TodoCtrl, StorageCtrl, UICtrl);

App.init();