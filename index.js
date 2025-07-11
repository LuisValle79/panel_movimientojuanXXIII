document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const loginMessage = document.getElementById('loginMessage');

    // Simple hardcoded credentials for demonstration
    if (username === 'admin' && password === 'admin123') {
        Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: 'Inicio de sesión exitoso. Redirigiendo...',
            timer: 1500,
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading();
            },
        }).then(() => {
            window.location.href = 'admin_panel.html'; // Redirect to admin panel
        });
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Usuario o contraseña inválidos.',
            confirmButtonColor: '#1b396a',
        });
    }
});