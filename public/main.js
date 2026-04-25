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
    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const user = document.getElementById('username').value;
        const pass = document.getElementById('password').value;

        // Credenciales harcodeadas
        if (user === "oswaldo" && pass === "1234") {
            alert("¡Login exitoso!");
            window.location.href = "profile/index.html";
        } else {
            alert("Usuario o contraseña no son correctos");
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
