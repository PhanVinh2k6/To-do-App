```eof
```javascript:main.js
// --- Initial Theme Setup ---
if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
} else {
    document.documentElement.classList.remove('dark');
}

document.addEventListener('DOMContentLoaded', () => {
    // --- Element Selectors ---
    const form = document.getElementById('todo-form');
    const input = document.getElementById('todo-input');
    const todoList = document.getElementById('todo-list');
    const emptyState = document.getElementById('empty-state');
    const streakCountSpan = document.getElementById('streak-count');
    const streakCounterDiv = document.getElementById('streak-counter');
    const errorMessage = document.getElementById('error-message');
    const themeToggleBtn = document.getElementById('theme-toggle');
    const lightIcon = document.getElementById('theme-toggle-light-icon');
    const darkIcon = document.getElementById('theme-toggle-dark-icon');
    const filterButtonsContainer = document.getElementById('filter-buttons');
    const statsToggleBtn = document.getElementById('stats-toggle');
    const statsModal = document.getElementById('stats-modal');
    const statsModalContent = document.getElementById('stats-modal-content');
    const statsModalCloseBtn = document.getElementById('stats-modal-close');
    const geminiBtn = document.getElementById('gemini-btn');
    const geminiIcon = document.getElementById('gemini-icon');
    const geminiSpinner = document.getElementById('gemini-spinner');

    // --- State Variables ---
    let errorTimeout;
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let streakData = JSON.parse(localStorage.getItem('streakData')) || { count: 0, lastCheckIn: null, longestStreak: 0 };
    let currentFilter = 'all';

    // --- Utility Functions ---
    const getTodayDateString = () => new Date().toISOString().split('T')[0];
    const saveTasks = () => localStorage.setItem('tasks', JSON.stringify(tasks));
    const saveStreak = () => localStorage.setItem('streakData', JSON.stringify(streakData));
    const escapeHTML = (str) => { const p = document.createElement('p'); p.textContent = str; return p.innerHTML; };

    const showError = (message) => {
        clearTimeout(errorTimeout);
        errorMessage.textContent = message;
        errorMessage.classList.remove('opacity-0');
        input.classList.add('input-error', 'shake-animation');
        errorTimeout = setTimeout(() => {
            input.classList.remove('input-error', 'shake-animation');
            errorMessage.classList.add('opacity-0');
        }, 3000);
    };

    // --- Gemini API Logic ---
    const handleGeminiSplit = async () => {
        const userQuery = input.value.trim();
        if (!userQuery) {
            showError('Hãy nhập một dự án hoặc công việc lớn để AI phân tích!');
            return;
        }

        // IMPORTANT: Access the Environment Variable from Vite
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey) {
            showError("API Key chưa được cấu hình. Hãy xem file README.md.");
            return;
        }

        geminiIcon.classList.add('hidden');
        geminiSpinner.classList.remove('hidden');
        geminiBtn.disabled = true;
        form.querySelector('button[type="submit"]').disabled = true;
        input.disabled = true;

        try {
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
            const systemPrompt = "Bạn là một trợ lý quản lý dự án xuất sắc. Khi nhận được một công việc hoặc dự án lớn, hãy chia nhỏ nó thành các công việc con cụ thể, có thể hành động ngay. Chỉ trả về một đối tượng JSON có chứa một mảng các chuỗi ký tự (string) với key là 'tasks'.";

            const payload = {
                contents: [{ parts: [{ text: userQuery }] }],
                systemInstruction: { parts: [{ text: systemPrompt }] },
                generationConfig: {
                    responseMimeType: "application/json",
                }
            };
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
            
            const result = await response.json();
            const jsonText = result.candidates?.[0]?.content?.parts?.[0]?.text;
            
            if (jsonText) {
                const parsedJson = JSON.parse(jsonText);
                const subtasks = parsedJson.tasks || [];
                if (subtasks.length > 0) {
                    subtasks.reverse().forEach(taskText => {
                        tasks.unshift({ 
                            id: Date.now(), text: taskText, completed: false, 
                            priority: 'medium', dueDate: null, completionDate: null 
                        });
                    });
                    saveTasks(); renderTasks(); input.value = ''; updateStreak();
                } else {
                    showError("AI không thể chia nhỏ công việc này. Hãy thử lại.");
                }
            } else {
                 throw new Error("Phản hồi từ AI không hợp lệ.");
            }
        } catch (error) {
            console.error('Gemini API call failed:', error);
            showError("Đã có lỗi xảy ra với trợ lý AI. Vui lòng thử lại sau.");
        } finally {
            geminiIcon.classList.remove('hidden');
            geminiSpinner.classList.add('hidden');
            geminiBtn.disabled = false;
            form.querySelector('button[type="submit"]').disabled = false;
            input.disabled = false;
        }
    };
    geminiBtn.addEventListener('click', handleGeminiSplit);

    // --- Dark Mode, Streak, and other logics remain the same ---
    const updateThemeIcons = () => {
        if (document.documentElement.classList.contains('dark')) {
            lightIcon.classList.add('hidden'); darkIcon.classList.remove('hidden');
        } else {
            lightIcon.classList.remove('hidden'); darkIcon.classList.add('hidden');
        }
    };
    themeToggleBtn.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark');
        localStorage.theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
        updateThemeIcons();
    });

    const renderStreak = () => { streakCountSpan.textContent = streakData.count; };
    const triggerStreakAnimation = () => {
        streakCounterDiv.classList.remove('pop-animation');
        void streakCounterDiv.offsetWidth;
        streakCounterDiv.classList.add('pop-animation');
        streakCounterDiv.addEventListener('animationend', () => streakCounterDiv.classList.remove('pop-animation'), { once: true });
    };
    const updateStreak = () => {
        const today = getTodayDateString();
        if (streakData.lastCheckIn !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];
            streakData.count = streakData.lastCheckIn === yesterdayStr ? streakData.count + 1 : 1;
            if (streakData.count > (streakData.longestStreak || 0)) {
                streakData.longestStreak = streakData.count;
            }
            streakData.lastCheckIn = today;
            saveStreak(); renderStreak(); triggerStreakAnimation();
        }
    };
    const checkStreakOnLoad = () => {
        if (!streakData.lastCheckIn) return;
        const today = getTodayDateString();
        const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
        if (streakData.lastCheckIn !== today && streakData.lastCheckIn !== yesterday.toISOString().split('T')[0]) {
            streakData.count = 0;
            saveStreak();
        }
    };
    
    const renderTasks = () => {
        let filteredTasks = tasks;
        if (currentFilter === 'active') filteredTasks = tasks.filter(t => !t.completed);
        else if (currentFilter === 'completed') filteredTasks = tasks.filter(t => t.completed);

        todoList.innerHTML = '';
        emptyState.classList.toggle('hidden', filteredTasks.length > 0);

        filteredTasks.forEach(task => {
            const taskItem = document.createElement('div');
            const priorityClass = `task-p-${task.priority || 'medium'}`;
            taskItem.className = `task-item flex items-center justify-between p-3 pl-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-l-4 dark:border-gray-700 transition-all duration-300 ${task.completed ? 'completed' : ''} ${priorityClass}`;
            taskItem.dataset.id = task.id;

            let dueDateHTML = '';
            if (task.dueDate) {
                const today = new Date(getTodayDateString());
                const dueDate = new Date(task.dueDate);
                let dateClass = 'text-gray-400 dark:text-gray-500';
                if (dueDate < today) dateClass = 'due-date-overdue';
                else if (dueDate.getTime() === today.getTime()) dateClass = 'due-date-today';
                dueDateHTML = `<span class="due-date text-xs font-medium ${dateClass}">${task.dueDate}</span>`;
            }

            taskItem.innerHTML = `
                <div class="flex items-center gap-3 flex-grow min-w-0">
                    <input type="checkbox" ${task.completed ? 'checked' : ''} class="w-5 h-5 text-blue-500 rounded border-gray-300 dark:border-gray-500 focus:ring-blue-500 dark:bg-gray-600 cursor-pointer flex-shrink-0">
                    <div class="flex-grow">
                        <span class="text-gray-700 dark:text-gray-200" data-action="edit">${escapeHTML(task.text)}</span>
                        ${dueDateHTML}
                    </div>
                </div>
                <div class="flex items-center gap-2 ml-2 flex-shrink-0">
                    <button class="task-action-btn" data-action="priority">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" class="${priorityClass === 'task-p-high' ? 'text-red-500' : (priorityClass === 'task-p-medium' ? 'text-amber-500' : 'text-green-500')}"><path d="M14.4 6 14 4H5v17h2v-7h5.6l.4 2h7V6z"/></svg>
                    </button>
                     <button class="task-action-btn relative" data-action="date">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-400 hover:text-blue-500"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        <input type="date" class="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer" data-action="date-input" value="${task.dueDate || ''}"/>
                    </button>
                    <button class="delete-btn text-gray-400 hover:text-red-500 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6m4-6v6"/></svg>
                    </button>
                </div>`;
            todoList.appendChild(taskItem);
        });
    };
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (input.value.trim()) {
            tasks.unshift({ id: Date.now(), text: input.value.trim(), completed: false, priority: 'medium', dueDate: null, completionDate: null });
            saveTasks(); renderTasks();
            const firstTaskElement = todoList.querySelector('.task-item');
            if (firstTaskElement) firstTaskElement.classList.add('new');
            input.value = ''; updateStreak();
        } else {
            showError('Hãy viết gì đó trước đã!');
        }
    });

    todoList.addEventListener('click', (e) => {
        const taskItem = e.target.closest('.task-item');
        if (!taskItem) return;
        const taskId = Number(taskItem.dataset.id);
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        if (e.target.type === 'checkbox') {
            task.completed = e.target.checked;
            task.completionDate = task.completed ? getTodayDateString() : null;
            if (task.completed) updateStreak();
            saveTasks(); renderTasks();
        } else if (e.target.closest('.delete-btn')) {
            taskItem.classList.add('deleting');
            setTimeout(() => { tasks = tasks.filter(t => t.id !== taskId); saveTasks(); renderTasks(); }, 300);
        } else if (e.target.closest('[data-action="priority"]')) {
            const priorities = ['medium', 'high', 'low'];
            const currentPriorityIndex = priorities.indexOf(task.priority || 'medium');
            task.priority = priorities[(currentPriorityIndex + 1) % priorities.length];
            saveTasks(); renderTasks();
        }
    });
    
    todoList.addEventListener('change', (e) => {
         if (e.target.matches('[data-action="date-input"]')) {
            const taskItem = e.target.closest('.task-item');
            const taskId = Number(taskItem.dataset.id);
            const task = tasks.find(t => t.id === taskId);
            if (task) {
                task.dueDate = e.target.value || null;
                saveTasks();
                renderTasks();
            }
        }
    });

    todoList.addEventListener('dblclick', (e) => {
        if (e.target.dataset.action === 'edit') {
            const taskSpan = e.target;
            const taskItem = taskSpan.closest('.task-item');
            const taskId = Number(taskItem.dataset.id);
            const task = tasks.find(t => t.id === taskId);
            const inputEl = document.createElement('input');
            inputEl.type = 'text'; inputEl.value = task.text; inputEl.className = 'edit-input';
            taskSpan.parentElement.replaceChild(inputEl, taskSpan);
            inputEl.focus(); inputEl.select();
            const saveEdit = () => { if (inputEl.value.trim()) task.text = inputEl.value.trim(); saveTasks(); renderTasks(); };
            inputEl.addEventListener('blur', saveEdit);
            inputEl.addEventListener('keydown', (e) => { if (e.key === 'Enter') inputEl.blur(); if (e.key === 'Escape') renderTasks(); });
        }
    });

    filterButtonsContainer.addEventListener('click', (e) => {
        if(e.target.tagName === 'BUTTON') {
            currentFilter = e.target.dataset.filter;
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            renderTasks();
        }
    });

    const renderStats = () => {
        document.getElementById('stats-completed').textContent = tasks.filter(t => t.completed).length;
        document.getElementById('stats-current-streak').textContent = `${streakData.count} ngày`;
        document.getElementById('stats-longest-streak').textContent = `${streakData.longestStreak || 0} ngày`;
        
        const chart = document.getElementById('stats-chart');
        chart.innerHTML = '';
        const weeklyData = [];
        for(let i = 6; i >= 0; i--) {
            const date = new Date(); date.setDate(date.getDate() - i);
            const dateString = date.toISOString().split('T')[0];
            const day = date.toLocaleDateString('vi-VN', { weekday: 'short' });
            const count = tasks.filter(t => t.completionDate === dateString).length;
            weeklyData.push({ day, count });
        }
        const maxCount = Math.max(...weeklyData.map(d => d.count), 1);
        weeklyData.forEach(data => {
            const barHeight = (data.count / maxCount * 100) + '%';
            chart.innerHTML += `<div class="flex flex-col items-center justify-end h-full w-full"><div class="text-xs font-bold text-gray-700 dark:text-gray-200">${data.count}</div><div class="w-3/4 bg-blue-300 dark:bg-blue-600 rounded-t-sm" style="height: ${barHeight}"></div><div class="text-xs text-gray-500 dark:text-gray-400 mt-1">${data.day}</div></div>`;
        });
    };

    statsToggleBtn.addEventListener('click', () => {
        renderStats();
        statsModal.classList.remove('hidden');
        statsModal.classList.add('modal-enter');
        statsModalContent.classList.add('modal-content-enter');
    });
    statsModalCloseBtn.addEventListener('click', () => {
        statsModal.classList.add('modal-leave');
        setTimeout(() => {
            statsModal.classList.add('hidden');
            statsModal.classList.remove('modal-enter', 'modal-leave');
            statsModalContent.classList.remove('modal-content-enter');
        }, 300);
    });
    statsModal.addEventListener('click', (e) => { if(e.target === statsModal) statsModalCloseBtn.click() });

    // --- App Initialization ---
    updateThemeIcons();
    checkStreakOnLoad();
    renderStreak();
    renderTasks();
});
