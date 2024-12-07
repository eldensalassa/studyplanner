document.addEventListener('DOMContentLoaded', function () {
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const dueDateInput = document.getElementById('due-date');
    const priorityInput = document.getElementById('priority');
    const categoryInput = document.getElementById('category');
    const reminderTimeInput = document.getElementById('reminder-time');
    const taskNotesInput = document.getElementById('task-notes');
    const taskProgressInput = document.getElementById('task-progress'); // Slider untuk progres
    const taskList = document.getElementById('task-list');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const exportBtn = document.getElementById('export-btn');
    const importInput = document.getElementById('import-input');
    const progressValue = document.getElementById('progress-value'); // Tempat untuk menampilkan persentase

    let currentTaskId = null; // Menyimpan ID task yang sedang diedit

    // Update nilai persentase saat slider digerakkan
    function updateProgressValue() {
        progressValue.textContent = `${taskProgressInput.value}%`; // Menampilkan nilai slider dalam persen
    }

    // Event listener untuk menangani perubahan slider
    taskProgressInput.addEventListener('input', updateProgressValue);

    // Fetch and render tasks from server
    function fetchTasks() {
        fetch('http://localhost:3000/tasks')
            .then(response => response.json())
            .then(data => renderTasks(data))
            .catch(error => console.error('Error fetching tasks:', error));
    }

    // Render tasks
    function renderTasks(tasks) {
        taskList.innerHTML = '';
        tasks.forEach((task) => {
            const li = document.createElement('li');
            li.classList.add(getPriorityClass(task.priority)); // Menambahkan kelas prioritas berdasarkan task
            li.innerHTML = `
                <div>
                    <strong>${task.text}</strong><br>
                    <small>Due: ${task.dueDate}</small><br>
                    <small>Priority: ${task.priority}</small><br>
                    <small>Category: ${task.category}</small><br>
                    <small>Reminder Time: ${task.reminderTime}</small><br>
                    <small>Progress: ${task.progress}%</small><br>
                    <small>Notes: ${task.notes || 'None'}</small>
                </div>
                <div>
                    <button class="edit-btn" onclick="editTask(${task.id})">Edit</button>
                    <button class="delete-btn" onclick="deleteTask(${task.id})">Delete</button>
                </div>
            `;
            taskList.appendChild(li);
        });
    }

    // Add new task
    taskForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const newTask = {
            text: taskInput.value.trim(),
            dueDate: dueDateInput.value,
            priority: priorityInput.value,
            category: categoryInput.value.trim(),
            reminderTime: reminderTimeInput.value,
            progress: taskProgressInput.value,
            notes: taskNotesInput.value.trim()
        };

        if (currentTaskId) { // Jika sedang mengedit task yang sudah ada
            fetch(`http://localhost:3000/tasks/${currentTaskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newTask),
            })
                .then(() => {
                    currentTaskId = null; // Reset ID task setelah disimpan
                    fetchTasks(); // Perbarui daftar task
                    resetForm(); // Reset form input
                })
                .catch(error => console.error('Error updating task:', error));
        } else { // Menambah task baru
            fetch('http://localhost:3000/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newTask),
            })
                .then(() => {
                    fetchTasks();
                    resetForm();
                })
                .catch(error => console.error('Error adding task:', error));
        }
    });

    // Delete task
    window.deleteTask = function (id) {
        fetch(`http://localhost:3000/tasks/${id}`, { method: 'DELETE' })
            .then(() => fetchTasks())
            .catch(error => console.error('Error deleting task:', error));
    };

    // Edit task
    window.editTask = function (id) {
        fetch(`http://localhost:3000/tasks/${id}`)
            .then(response => response.json())
            .then(task => {
                // Isi form dengan data task yang akan diedit
                taskInput.value = task.text;
                dueDateInput.value = task.dueDate;
                priorityInput.value = task.priority;
                categoryInput.value = task.category;
                reminderTimeInput.value = task.reminderTime;
                taskNotesInput.value = task.notes;
                taskProgressInput.value = task.progress;

                // Simpan ID task yang sedang diedit
                currentTaskId = id;
            })
            .catch(error => console.error('Error fetching task:', error));
    };

    // Reset form input
    function resetForm() {
        taskInput.value = '';
        dueDateInput.value = '';
        priorityInput.value = '';
        categoryInput.value = '';
        reminderTimeInput.value = '';
        taskNotesInput.value = '';
        taskProgressInput.value = 0;
        progressValue.textContent = '0%';
    }

    // Dark mode toggle
    darkModeToggle.addEventListener('click', function () {
        document.body.classList.toggle('dark-mode');
    });

    // Export tasks
    exportBtn.addEventListener('click', function () {
        fetch('http://localhost:3000/tasks')
            .then(response => response.json())
            .then(data => {
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'tasks.json';
                a.click();
                URL.revokeObjectURL(url);
            })
            .catch(error => console.error('Error exporting tasks:', error));
    });

    // Import tasks
    importInput.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (event) {
                const tasks = JSON.parse(event.target.result);
                tasks.forEach(task => {
                    fetch('http://localhost:3000/tasks', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(task),
                    })
                        .catch(error => console.error('Error importing task:', error));
                });
                fetchTasks();
            };
            reader.readAsText(file);
        }
    });

    // Get CSS class based on priority
    function getPriorityClass(priority) {
        switch (priority) {
            case 'High':
                return 'priority-high';
            case 'Medium':
                return 'priority-medium';
            case 'Low':
                return 'priority-low';
            default:
                return '';
        }
    }

    // Initial fetching of tasks
    fetchTasks();

    // Update progress value on page load
    updateProgressValue();
});
