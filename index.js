let datosClima = null;
let datosClimaDaily=null;
async function obtenerUbi() {
    const ciudadBuscada = document.getElementById('searchInput').value || 'miami';

    const errorPrevio = document.getElementById('error-msg');
    if (errorPrevio) errorPrevio.remove();

    if (!ciudadBuscada) {
        alert('Por favor ingrese el nombre de una ciudad');
        return;
    }
    try {
        const Ubi = await fetch('https://geocoding-api.open-meteo.com/v1/search?name=' + ciudadBuscada + '&count=1&language=es&format=json');
        const datosUbi = await Ubi.json();
        console.log('Datos de ubicación:', datosUbi);
        const contenedor = document.getElementById('mainContainer');

        if (!datosUbi.results || datosUbi.results.length === 0) {

            contenedor.classList.add('hidden');

            //mostrar texto
            const nuevaLinea = document.createElement('h1');
            nuevaLinea.id = 'error-msg';
            nuevaLinea.textContent = 'No search result found!';
            nuevaLinea.style.color = "White";

            const error = document.getElementById('errormessage');
            error.append(nuevaLinea);
            return;
        }

        contenedor.classList.remove('hidden');

        const lat = datosUbi.results[0].latitude;
        const lon = datosUbi.results[0].longitude;
        const nombreCiudad = datosUbi.results[0].name;

        console.log('Latitud:', lat, 'Longitud:', lon, 'Ciudad:', nombreCiudad);

        obtenerClima(lat, lon, nombreCiudad);
    } catch (error) {
        console.log('Error al obtener la ubicación o el clima:', error);
    }
}


async function obtenerClima(lat, lon, nombreCiudad) {
    const clima = await fetch('https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lon + '&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto');
    const datosClima = await clima.json();
    console.log('Datos del clima:', datosClima);

    if (!datosClima) {
        alert('No se pudieron obtener los datos del clima.');
        return;
    }

    const temperaturaC = datosClima.current.temperature_2m;
    const windC = datosClima.current.wind_speed_10m;
    const precipitationC = datosClima.current.apparent_temperature;

    datosClimaNuevo = {
        temperaturaC, 
        windC, 
        precipitationC,
        daily: datosClima.daily, 
        hourly: datosClima.hourly
    };

    const hourly = datosClima.hourly;
    const daily = datosClima.daily;
    const current = datosClima.current;


    //functions
    pintarClimaActual(current, nombreCiudad);
    PintarDaily(datosClima.daily);
    pintarHourly(datosClima.hourly, 0);
    llenarDropdown(datosClima.daily, datosClima.hourly);
    


    console.log('Datos hourly:', hourly, 'Datos daily:', daily, 'Datos current:', current);



}


function obtenerInfoClima(codigo) {
    const climas = {
        0: { desc: "Soleado", icono: "./assets/images/icon-sunny.webp" },
        3: { desc: "Nublado", icono: "./assets/images/icon-overcast.webp" },
        45: { desc: "Niebla", icono: "./assets/images/icon-fog.webp" },
        61: { desc: "Lluvia", icono: "./assets/images/icon-rain.webp" },
        71: { desc: "Nieve", icono: "./assets/images/icon-snow.webp" },
        95: { desc: "Tormenta", icono: "./assets/images/icon-storm.webp" }
    };

    return climas[codigo] || { desc: "Nublado", icono: "./assets/images/icon-partly-cloudy.webp" };
}


function pintarClimaActual(current, nombreCiudad) {
    const ciudad = document.querySelector('.ciudad');
    ciudad.textContent = nombreCiudad;

    const temperaturaActual = document.querySelector('#gradosC');
    const temp = Math.round(current.temperature_2m);

    if (!temp) {
        alert('No se han cargado datos de la temperatura')
        return;
    }

    temperaturaActual.textContent = `${temp}°`;

    const fecha = document.querySelector('.fecha');
    //fecha larga
    const dateNew = new Date(current.time);

    const opciones = {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    };
    const fechaLarga = dateNew.toLocaleDateString('es-ES', opciones);

    fecha.textContent = fechaLarga.charAt(0).toUpperCase() + fechaLarga.slice(1);

    //icono
    const info = obtenerInfoClima(current.weather_code);
    const icono = document.getElementById('IconState');
    if (icono) {
        icono.src = info.icono;
        icono.alt = info.desc;
    }
    console.log(info)

    const feels = document.getElementById('gradoFeels');
    feelsRound = Math.round(current.apparent_temperature);
    feels.textContent = `${feelsRound}°`;

    const humidity = document.getElementById('gradoHumidity');
    const humedad = Math.round(current.relative_humidity_2m);
    humidity.textContent = `${humedad}%`;

    const wind = document.getElementById('gradoWind');
    const windR = Math.round(current.wind_speed_10m);
    wind.textContent = `${windR} km/h`;

    const precipitation = document.getElementById('gradoPrecipitation');
    const preci = Math.round(current.precipitation);
    precipitation.textContent = `${preci} mm`;



}

function PintarDaily(daily, esFahrenheit = false) {

    const contenedor = document.querySelector('.contenedorDia');
    contenedor.innerHTML = '';

    daily.time.forEach((fechaRaw, index) => {
        const fecha = new Date(fechaRaw + "T00:00:00");
        const nombreDia = fecha.toLocaleDateString('es-ES', { weekday: 'short' });

        const info = obtenerInfoClima(daily.weather_code[index]);

        let max = Math.round(daily.temperature_2m_max[index]);
        let min = Math.round(daily.temperature_2m_min[index]);

        if (esFahrenheit) {
            max =Math.round( (max * 1.8) + 32);
            min =Math.round((min * 1.8) + 32) ;
        }

        const card = document.createElement('div');
        card.classList.add('cardDay');

        card.innerHTML = `
            <p class="dia-nombre">${nombreDia.charAt(0).toUpperCase() + nombreDia.slice(1)}</p>
            <img src="${info.icono}" alt="${info.descripcion}" class="dia-icono">
            <div class="dia-temps">
                <span class="max">${max}°</span>
                <span class="min">${min}°</span>
            </div>
        `;
        contenedor.appendChild(card);
    });

}


function obtener24Horas(datosHourly, diaIndex) {
    const inicio = diaIndex * 24;
    const fin = inicio + 24;

    return {
        horas: datosHourly.time.slice(inicio, fin),
        temperaturas: datosHourly.temperature_2m.slice(inicio, fin),
        codigos: datosHourly.weather_code.slice(inicio, fin)
    };
}
function pintarHourly(datosHourly, diaIndex = 0, esFahrenheit=false) {
    const contenedor = document.querySelector('.hourlyDays');

    contenedor.innerHTML = '';

    const bloqueDia = obtener24Horas(datosHourly, diaIndex);

    bloqueDia.horas.forEach((horaRaw, i) => {
        const fecha = new Date(horaRaw);
        const horaFormateada = fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        const info = obtenerInfoClima(bloqueDia.codigos[i]);
        let temp = Math.round(bloqueDia.temperaturas[i]);


        const itemHora = document.createElement('div');
        itemHora.classList.add('hourly-item');

         if (esFahrenheit) {
            temp=Math.round((temp * 1.8 )+32);
        }


        itemHora.innerHTML = `
            <img id="logoStates" src="${info.icono}" alt="${info.desc}">
            <div class="hour">${horaFormateada}</div>
            <div class="tempHour">${temp}°</div>
        `;


        contenedor.appendChild(itemHora);
    });
}
function llenarDropdown(daily, hourly) {
    // Función para manejar el despliegue del menú
    const botonDropdown = document.getElementById('DayHourly');
    const menu = document.getElementById('dropdownMenu');

    botonDropdown.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.toggle('show');
    });

    // Cerrar el menú si toca fuera de él
    window.onclick = function (event) {
        if (!event.target.matches('#DayHourly') && !event.target.closest('#DayHourly')) {
            if (menu.classList.contains('show')) {
                menu.classList.remove('show');
            }
        }
    }



    const selectedDayText = document.getElementById('selectedDay');

    menu.innerHTML = '';

    daily.time.forEach((fechaRaw, index) => {
        const fecha = new Date(fechaRaw + "T00:00:00");
        const nombreDia = fecha.toLocaleDateString('es-ES', { weekday: 'long' });

        const link = document.createElement('a');
        link.href = "#";
        link.classList.add('day-option');
        link.textContent = nombreDia.charAt(0).toUpperCase() + nombreDia.slice(1);


        link.addEventListener('click', (e) => {
            e.preventDefault();
            selectedDayText.textContent = link.textContent;
            menu.classList.remove('show');
            pintarHourly(hourly, index);
        });

        menu.appendChild(link);


        if (index === 0) selectedDayText.textContent = link.textContent;
    });
}
function dropdownMenuUnits() {
    const btn = document.getElementById('btnUnits');
    const menu = document.getElementById('dropdownMenuHeader');

    btn.addEventListener('click', (event) => {
        event.stopPropagation();
        menu.classList.toggle('show');
    });



}

function seleccionUnits() {
    const opciones = document.querySelectorAll('.unit-option');

    opciones.forEach(opcion => {
        opcion.addEventListener('click', (e) => {
            e.preventDefault();

            if (!datosClimaNuevo) return;

            const seccion = opcion.closest('.menu-section');

            seccion.querySelectorAll('.unit-option').forEach(el => {
                el.classList.remove('active');
            });

            if (datosClimaNuevo) {
                opcion.classList.add('active');
                const unidad = opcion.dataset.unit;

                const grados = document.getElementById('gradosC');
                const gradosWind = document.getElementById('gradoWind');
                const precipitationG = document.getElementById('gradoPrecipitation');

                if (unidad === 'fahrenheit') {
                    const temperaturaF = Math.round((datosClimaNuevo.temperaturaC * 1.8) + 32);
                    grados.textContent = `${temperaturaF}°`;
                    PintarDaily(datosClimaNuevo.daily, true);
                    pintarHourly(datosClimaNuevo.hourly,0, true);
                    console.log("Cambiando a Fahrenheit:", temperaturaF);
                } else if (unidad === 'celsius') {
                    grados.textContent = `${Math.round(datosClimaNuevo.temperaturaC)}°`;

                    PintarDaily(datosClimaNuevo.daily, false);
                    pintarHourly(datosClimaNuevo.hourly,0,false);
                    console.log("Volviendo a Celsius:", datosClimaNuevo.temperaturaC);
                }




                if (unidad === 'mph') {
                    const windF = Math.round((datosClimaNuevo.windC * 0.621371));
                    gradosWind.textContent = `${windF} mph`;
                    console.log('Cambiando a mph', windF);
                } else if (unidad === 'kmh') {
                    gradosWind.textContent = `${Math.round(datosClimaNuevo.windC)} km/p`
                    console.log('volviendo a km/p', datosClimaNuevo.windC)
                }



                if (unidad === 'inch') {
                    const inch = Math.round(datosClimaNuevo.precipitationC / 25.4);
                    precipitationG.textContent = `${inch} "`;

                    console.log('Cambiando a inch', inch)
                } else if (unidad === 'mm') {
                    precipitationG.textContent = `${Math.round(datosClimaNuevo.precipitationC)} mm`;
                    console.log('Volviendo a mm', datosClimaNuevo.precipitationC);
                }
            }




        })
    })

}


function inicializarApp() {
    dropdownMenuUnits(); 
    seleccionUnits();   
    ObtenerDatos();     
}

document.addEventListener('DOMContentLoaded', inicializarApp);



async function ObtenerDatos() {
    obtenerUbi();
}
ObtenerDatos();

const btnSend = document.getElementById('searchBtn');
const input = document.getElementById('searchInput');
btnSend.addEventListener('click', ObtenerDatos);

input.addEventListener('keydown', (event) => {
    const errorPrevio = document.getElementById('error-msg');
    if (errorPrevio) errorPrevio.remove();

    if (event.key === 'Enter') {
        ObtenerDatos();

    }

})