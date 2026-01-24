const API_URL = 'http://localhost:8800/api';

const authView = document.getElementById('auth-view')!;
const mainView = document.getElementById('main-view')!;
const loginForm = document.getElementById('login-form') as HTMLFormElement;
const bookmarkForm = document.getElementById('bookmark-form') as HTMLFormElement;
const logoutBtn = document.getElementById('logout-btn')!;

// Inputs
const urlInput = document.getElementById('bm-url') as HTMLInputElement;
const titleInput = document.getElementById('bm-title') as HTMLInputElement;
const descInput = document.getElementById('bm-desc') as HTMLTextAreaElement;
const tagsInput = document.getElementById('bm-tags') as HTMLInputElement;

// State
let token: string | null = null;

async function init() {
    const data = await chrome.storage.local.get(['token']);
    token = data.token;
    updateUI();
}

function updateUI() {
    if (token) {
        authView.classList.add('hidden');
        mainView.classList.remove('hidden');
        loadCurrentTab();
    } else {
        authView.classList.remove('hidden');
        mainView.classList.add('hidden');
    }
}

async function loadCurrentTab() {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const tab = tabs[0];
    if (tab) {
        urlInput.value = tab.url || '';
        titleInput.value = tab.title || '';
        descInput.value = ''; // TODO: Inject content script to get description if needed
    }
}

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = (document.getElementById('email') as HTMLInputElement).value;
    const password = (document.getElementById('password') as HTMLInputElement).value;

    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (res.ok) {
            token = data.token;
            await chrome.storage.local.set({ token });
            updateUI();
        } else {
            alert(data.message || 'Login failed');
        }
    } catch (err) {
        alert('Network error');
    }
});

bookmarkForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const tags = tagsInput.value.split(',').map(t => t.trim()).filter(Boolean);

    try {
        const res = await fetch(`${API_URL}/bookmarks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                url: urlInput.value,
                title: titleInput.value,
                description: descInput.value,
                tags: tags,
                savedFrom: 'extension'
            })
        });

        if (res.ok) {
            alert('Bookmark saved!');
            // clear form or close panel?
            window.close();
        } else {
            const data = await res.json();
            alert(data.message || 'Error saving');
        }
    } catch (err) {
        alert('Network error');
    }
});

logoutBtn.addEventListener('click', async () => {
    await chrome.storage.local.remove('token');
    token = null;
    updateUI();
});

init();
