document.getElementById('login-form').addEventListener('submit', function (event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const currentDate = new Date();
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const year = currentDate.getFullYear();
    const currentDateFormatted = `${day}.${month}.${year}`;

    if (username === 'afonin' && password === currentDateFormatted) {
        window.location.href = 'images.html';
    } else {
        document.getElementById('error-message').classList.remove('hidden');
    }
});
