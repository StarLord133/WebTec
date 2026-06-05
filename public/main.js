const fetchCountries = async () => {
    const response = await fetch("/api/countries");
    return await response.json();
}

const populateSelect = (countries) => {
    const select = document.getElementById("paises");
    const fragment = document.createDocumentFragment();
    countries.forEach(country => {
        const option = document.createElement('option');
        option.textContent = country.nameES;
        fragment.appendChild(option);
    });
    select.appendChild(fragment);
}

document.addEventListener('DOMContentLoaded', async () => {
    const data = await fetchCountries();
    populateSelect(data);
});


const fetchRegions = async () => {
    const response = await fetch("/api/countries");
    return await response.json();
}

const populateRegions = (regions) => {
    const select = document.getElementById("regiones");
    const fragment = document.createDocumentFragment();
    regions.forEach(region => {
        const option = document.createElement('option');
        option.textContent = region.iso3;
        fragment.appendChild(option);
    });
    select.appendChild(fragment);
}

document.addEventListener('DOMContentLoaded', async () => {
    const data = await fetchRegions();
    populateRegions(data);
});


//Login
const loginForm = document.getElementById('loginForm');

if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const user = document.getElementById('username').value;
        const pass = document.getElementById('password').value;

        try {
            // Pegamos a la API. Como la página la sirve el mismo Express,
            // usamos una ruta relativa.
            const response = await fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: user, password: pass })
            });

            if (!response.ok) {
                alert('Usuario o contraseña no son correctos');
                return;
            }

            const data = await response.json(); // { id, username, puntos }

            // Guardamos el id y el nombre para que otras páginas de la web
            // (ej. el perfil) puedan consultar el score desde la BD.
            localStorage.setItem('userId', data.id);
            localStorage.setItem('username', data.username);

            // Redirigimos al PERFIL pasando el ID en la URL.
            // El perfil embebe el juego (iframe) y le reenvía este userId,
            // que Unity leerá con Application.absoluteURL.
            window.location.href = `profile/index.html?userId=${data.id}`;
        } catch (err) {
            console.error('Error al iniciar sesión:', err);
            alert('No se pudo conectar con el servidor. ¿Está corriendo la API?');
        }
    });
}

//habilitar boton enviar
const radios = document.getElementsByName('opcion');
const btnEnviar = document.getElementById('btn-enviar');

if (btnEnviar) {
    for (let i = 0; i < radios.length; i++) {
        radios[i].addEventListener('change', function () {
            btnEnviar.disabled = false;
        });
    }
}

// Habilitar botón finalizar si ambos checkboxes están marcados
const btnFinalizar = document.getElementById('Finalizar');
const terminos = document.getElementById('terms');
const email = document.getElementById('email');

if (btnFinalizar && terminos && email) {
    function validarCheckboxes() {
        if (terminos.checked && email.checked) {
            btnFinalizar.disabled = false;
        } else {
            btnFinalizar.disabled = true;
        }
    }

    terminos.addEventListener('change', validarCheckboxes);
    email.addEventListener('change', validarCheckboxes);
}
