/******************************
 * Variables globales
 *
 ******************************/
let map = null;
let posUsu = null;
// API
const urlBase = ' https://envios.develotion.com/';
const urlImagenes = 'https://envios.develotion.com/imgs/';
// Sesión
let usuarioLogueado = false;
let tokenGuardado;
const ciudades = [];// ciudades
const departamentos = [];//departamentos
const envios = [];//envios
let envio;
const categorias = []; //categorias
// Elementos del DOM

//menu
const menu = document.querySelector("#menu");


setTimeout(function () {
    todoCargado();
}, 500);

document.querySelector("#btnCalcular").addEventListener('click', calculoDistancia);

/******************************
 * Inicialización
 ******************************/

//#region iniciar sistema


// Agrego evento a los botones del menú y de las pantallas.
function suscribirseAEventos() {
    // Router
    document.querySelector("#router").addEventListener('ionRouteDidChange', navegacion);
    // Menu
    document.querySelector("#btnMenuLogout").addEventListener('click', menuLogoutHandler);
    // Registro
    document.querySelector("#btnRegistro").addEventListener('click', registrarse);
    // Login
    document.querySelector("#btnLogin").addEventListener('click', loginIniciarSesionHandler);
    //Calculadora
    document.querySelector("#btnMenuCalculadoraDistancia").addEventListener('click', mostrarCalculadora);
    //gastos totales envio
    document.querySelector("#btnMenuGastoTotalEnvio").addEventListener('click', totalEnvio);
    //ciudad sercana
    document.querySelector("#btnMenuciudadCercana").addEventListener('click', ciudadCercana);
    //lista  envios
    document.querySelector("#btnMenuListaEnvio").addEventListener('click', verListaEnvios);
    //agregar envios
    document.querySelector("#btnMenuagregarEnvio").addEventListener('click', verAgregarEnvios);
    document.querySelector("#btnEnviar").addEventListener('click', agregarEnvios);

}

function verAgregarEnvios() {
    navegar("pantalla-agregarEnvio");
    //cargar los select de categoria y ciudad
    mostrarSelectEnvio(ciudades, categorias);
}
function verListaEnvios() {
    navegar("pantalla-listaEnvios");
}
function navegar(pantalla) {
    document.querySelector('ion-nav').push(pantalla);
}
//navegacion entre pantallas
function navegacion(event) {
    const pantalla = event.detail.to;
    ocultarPantallas();
    vaciarTodosLosCampos();
    if (pantalla === '/login') {
        mostrarLogin();
    } else if (pantalla === '/') {
        mostrarHome();
    } else if (pantalla === '/registro') {
        mostrarRegistro();
    } else if (pantalla === '/calculadora') {
        mostrarCalculadora();
    } else if (pantalla === '/agregarEnvio') {
        mostrarAgregarEnvios();
    } else if (pantalla === '/listaEnvios') {
        mostrarLista();
    } else if (pantalla === '/GastoTotalEnvio') {
        mostrarGastoTotalEnvio();
    } else if (pantalla === '/ciudadCercana') {
        mostrarCiudadesCercanas();
    } else if (pantalla === '/detalles') {
        mostrarDetalle();
    }

}

// Oculto todo y muestro lo que corresponda.
function inicializar() {
    // Oculto todo.
    // Chequeo si en el localStorage hay token guardado.
    // Muestro lo que corresponda en base a si hay o no usuario logueado.

    chequearSesion(function () {
        // Muestro lo que corresponda en base a si hay o no usuario logueado.
        navegar("pantalla-home");
        if (!usuarioLogueado) {
            ocultarOpcionesMenuParaInvitado();
            mostrarMenuInvitado();
        } else {
            cargaciudades();
            cargacategorias();
            CargarlistadoEnvios();
            cargarDepartamentos();
            mostrarMenuUsuarioAutenticado();
        }
    });
}



function chequearSesion(despuesDeChequearSesion) {
    // Asumo que no hay usuario logueado y en caso de que si, lo actualizo.
    usuarioLogueado = null;

    if (tokenGuardado) {
        // Hago la llamada usando el endpoint de validación de token que me retorna el usuario.
        fetch(urlBase + 'login.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': tokenGuardado
            }
        })
            .then(function (response) {
                /*if (response.status != 200) {
                    throw "Error en el registro.";
                }*/
                return response.json();
            })
            .then(function (data) {
                if (data && data.error) {
                    throw data.error;
                } else {
                    usuarioLogueado = true;
                    despuesDeChequearSesion();
                }
            })
            .catch(errorCallback);
    } else {
        // Si no tengo token guardado, el usuarioLogueado no se actualiza (queda null) y sigo de largo.
        despuesDeChequearSesion();
    }
}
//#endregion

/******************************
 * Funcionalidades del sistema
 ******************************/
//#region funcionalidades
function agregarEnvios() {

    let ciudadOrigen = Number(document.querySelector("#sCiudadOrigen").value);//ciudad origen
    let ciudadDestino = Number(document.querySelector("#sCiudadDestino").value);//ciudad destino

    let categoriaEnvio = Number(document.querySelector("#sCategoria").value);//categoria
    let pesoEnvio = Number(document.querySelector("#txtPeso").value);//peso
    let idusu = Number(window.localStorage.getItem("idUsuario"));//id del usuario logueado
    let ciudadOrigenObj = buscarCiudadporID(ciudadOrigen);//objeto ciudad origen
    let ciudadDestinoObj = buscarCiudadporID(ciudadDestino);//objeto ciudad destino
    inicializarMapa(ciudadOrigenObj.latitud, ciudadOrigenObj.longitud, "contenedorEnvios");//inicializo mapa
    let distancia = calcularDistancia([ciudadOrigenObj.latitud, ciudadOrigenObj.longitud], [ciudadDestinoObj.latitud, ciudadDestinoObj.longitud]);//distancia
    let pre = calcularPrecio(pesoEnvio, distancia);//precio
    if (categoriaEnvio > 0 && pesoEnvio > 0 && ciudadOrigen != "" && ciudadDestino != "" && distancia > 0 && pre > 0) {

        const datosEnvio = {//datos del envio
            idUsuario: idusu,
            idCiudadOrigen: ciudadOrigen,
            idCiudadDestino: ciudadDestino,
            peso: pesoEnvio,
            distancia: distancia,
            precio: pre,//calcullar pecio
            idCategoria: categoriaEnvio
        };

        fetch(`${urlBase}envios.php`, {
            method: 'POST',
            headers: {
                'apikey': tokenGuardado,//tokenGuardado   
                'Content-Type': 'application/json'

            },
            body: JSON.stringify(datosEnvio)
        })
            .then(function (response) {
                console.log(response);
                return response.json();
            })
            .then(function (data) {
                if (data && data.error) {
                    throw data.error;
                } else {
                    //falta actualizar lista de envios
                    CargarlistadoEnvios();
                    alert("El envio ha sido creado correctamente");
                    navegar('pantalla-home');

                }
            })
            .catch(errorCallback);
    }
    else {
        alert("Debe completar todos los campos");
    }

}
//CALCULAR PRECIO
function calcularPrecio(peso, distancia) {
    //Precio base ($50) + $10 por kilo + $50 por cada 100 km.
    let precio = 50;
    if (distancia > 100) {  //calcular precio por cada 100km se agrega $50 y por cada kilo se agrega $10
        distancia = distancia / 100;
        precio = (peso * 10) + (distancia * 50);
    } else {
        precio = (peso * 10);//+ $10 por kilo
    }
    return precio;
}
//gasto total envio
function gastoTotalEnvio() {

    let MontoTotal = 0;
    let idusu = Number(window.localStorage.getItem("idUsuario"));//Id del usuario logueado
    for (let i = 0; i < envios.length; i++) {
        const element = envios[i];
        if (element.idUsuario == idusu) {
            MontoTotal += element.precio;
        }
    }
    document.querySelector("#pMensajeMontoTotal").innerHTML = MontoTotal;
}
/*se deberá crear una tabla con la lista de los 5 departamentos con más envíos realizados
 por el usuario (para esto, tenemos en cuenta las ciudades de destino). 
 En la lista se deberá indicar, nombre del departamento y el total de envíos al mismo. */





//CARGA MAPA


function cargarPosicionUsuario() {
    if (Capacitor.isNativePlatform()) {//si es nativo
        const loadCurrentPosition = async () => {//cargar posicion actual
            const resultado = await Capacitor.Plugins.Geolocation.getCurrentPosition({ timeout: 5000 });//timeout 3 segundos

            if (resultado.coords.latitude) {//si hay latitud
                posUsu = {
                    latitude: resultado.coords.latitude,
                    longitude: resultado.coords.longitude
                }//posicion usuario
                inicializarMapa(posUsu.latitude, posUsu.longitude, "contenedorMapa1");//inicializo mapa
                mostrarCiudadCercana();//mostrar ciudad cercana
            } else {//si no hay latitud
                posUsu = {
                    latitude: -34.903816878014354,
                    longitude: -56.19059048108193
                };//posicion por defecto
                inicializarMapa(posUsu.latitude, posUsu.longitude, "contenedorMapa1");//inicializo mapa
                mostrarCiudadCercana();//mostrar ciudad cercana
            }
        };
        loadCurrentPosition();//cargar posicion actual
                
    } else {
        window.navigator.geolocation.getCurrentPosition(//si no es nativo
            // Callback de éxito.
            function (pos) {//posicion usuario
                posUsu = {
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude
                };
                inicializarMapa(posUsu.latitude, posUsu.longitude, "contenedorMapa1");//inicializo mapa
                mostrarCiudadCercana();//mostrar ciudad cercana
            },
            // Callback de error.
            function () {
                posUsu = {
                    latitude: -34.903816878014354,
                    longitude: -56.19059048108193
                };
                inicializarMapa(posUsu.latitude, posUsu.longitude, "contenedorMapa1");
                mostrarCiudadCercana();
            }
        );
    }
    
}

function inicializarMapa(lat, long, id) {

    if (map != null) {//si ya hay un mapa
        map.remove();//remuevo el mapa
    }//inicializo el mapa de nuevo
    map = L.map(`${id}`).setView([lat, long], 13);
    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWNhaWFmYSIsImEiOiJjanh4cThybXgwMjl6M2RvemNjNjI1MDJ5In0.BKUxkp2V210uiAM4Pd2YWw', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox/streets-v11',
        accessToken: 'your.mapbox.access.token'
    }).addTo(map);

    // dibujarPosicionUsuario();
}

function dibujarPosicion(lat, long) {
    L.marker([lat, long]).addTo(map).bindPopup("Posición ");

    /*if (posUsu.accuracy && posUsu.accuracy > 50) {
        L.circle([posUsu.latitude, posUsu.longitude], {
            color: 'red',
            fillColor: '#f03',
            fillOpacity: 0.5,
            radius: posUsu.accuracy
        }).addTo(map);
    }*/
}

//calcular distancia entre dos puntos
function calcularDistancia(puntoInicial, puntoFinal) {
    // Dividimos entre 1000 para pasar de m a km.
    let distancia = Number(map.distance(puntoInicial, puntoFinal) / 1000).toFixed(2);
    return distancia;
}
//dibujar distancia entre dos puntos
function dibujarDistanciaEntreDosPuntos(puntoInicial, puntoFinal, id) {
    
    let mje = "";
    let distancia = calcularDistancia(puntoInicial, puntoFinal);
    if (distancia > 0) {// Dividimos entre 1000 para pasar de m a km.
        //let distancia = Number(map.distance([ciudadOrigenObj.latitud, ciudadOrigenObj.longitud],[ciudadDestinoObj.latitud, ciudadDestinoObj.longitud] ) / 1000).toFixed(2);//calculo la distancia entre las ciudades
        L.polyline([puntoInicial, puntoFinal]).addTo(map).bindPopup(`Distancia: ${distancia} km.`).openPopup();

        mje = `la distancia es de ${distancia} km`;//retorno
    }
    else {
        mje = "error debe seleccionar dos ciudade pra calcular distancia";
    }
    document.querySelector(`#${id}`).innerHTML = mje;
}
//FIN MAPA
function compartir() {
    navegar("pantalla-compartir");
}

function totalEnvio() {
    navegar("pantalla-GastoTotalEnvio");
}
function ciudadCercana() {
    navegar("pantalla-ciudadCercana");
}
//CIUDADA SERCANA
/* 
se deberá poder visualizar un mapa con la ciudad más cercana
al punto en el que se encuentra el usuario. En el mapa se deberá ver la ubicación del
usuario, la ubicación de la ciudad y la distancia entre ambos puntos.
*/
function mostrarCiudadCercana() {
    let distanciaMenor = 1000000000;//valor minimo
    let ciudadCercana = null;
    //cargar posicion del usuario
    if (posUsu != null) {//si la posicion del usuario no es nula
        ciudades.forEach(ciudad => {//recorro cada ciudad
            let distancia = calcularDistancia([posUsu.latitude, posUsu.longitude], [ciudad.latitud, ciudad.longitud]);//calculo la distancia entre las ciudades
            if (distancia < distanciaMenor) {//si la distancia es menor que la distancia menor
                distanciaMenor = distancia;//la distancia menor es la distancia
                ciudadCercana = ciudad;//la ciudad cercana es la ciudad
            }
        });

    }
    inicializarMapa(ciudadCercana.latitud, ciudadCercana.longitud, "contenedorMapa1");
    dibujarPosicion(ciudadCercana.latitud, ciudadCercana.longitud);
    dibujarPosicion(posUsu.latitude, posUsu.longitude);
    dibujarDistanciaEntreDosPuntos([posUsu.latitude, posUsu.longitude], [ciudadCercana.latitud, ciudadCercana.longitud], "pciudadCercana");
    document.querySelector("#pciudadCercana").innerHTML = `La Ciudad Mas Cercana es ${ciudadCercana.nombre} con ${distanciaMenor} km`;

}

//#endregion
/* Menu */
//#region menu
function cerrarMenu() {
    document.querySelector("#menu").close();
}
function menuLogoutHandler() {
    ocultarPantallas();
    cerrarSesion();
}
//#endregion

//#region mostrar y coultaR PANTALLAS
function ocultarPantallas() {
    document.querySelector("#pantalla-registro").style.display = 'none';
    document.querySelector("#pantalla-login").style.display = 'none';
    document.querySelector("#pantalla-logout").style.display = 'none';
    document.querySelector("#pantalla-home").style.display = 'none';
    document.querySelector("#pantalla-Detalles").style.display = 'none';
    document.querySelector("#pantalla-calculadora").style.display = 'none';
    document.querySelector("#pantalla-agregarEnvio").style.display = 'none';
    document.querySelector("#pantalla-ListaEnvios").style.display = 'none';
    document.querySelector("#pantalla-compartir").style.display = 'none';
    document.querySelector("#pantalla-GastoTotalEnvio").style.display = 'none';
    document.querySelector("#pantalla-ciudadCercana").style.display = 'none';

}
function ocultarOpcionesMenuParaInvitado() {
    document.querySelector("#btnMenuLogout").style.display = 'none';
    document.querySelector("#btnMenuCalculadoraDistancia").style.display = 'none';
    document.querySelector("#btnMenuagregarEnvio").style.display = 'none';
    document.querySelector("#btnMenuListaEnvio").style.display = 'none';
    document.querySelector("#btnMenuGastoTotalEnvio").style.display = 'none';
    document.querySelector("#btnMenuciudadCercana").style.display = 'none';
}
function ocultarOpcionesMenuParaLogueado() {
    document.querySelector("#btnMenuLogin").style.display = 'none';
    document.querySelector("#btnMenuRegistro").style.display = 'none';
}
function mostrarMenuInvitado() {
    navegar("pantalla-home");
    ocultarOpcionesMenuParaInvitado();
    document.querySelector("#btnMenuLogin").style.display = 'block';
    document.querySelector("#btnMenuRegistro").style.display = 'block';
    document.querySelector("#btnMenuHome").style.display = 'block';

}
function mostrarMenuUsuarioAutenticado() {
    ocultarOpcionesMenuParaLogueado();
    document.querySelector("#btnMenuLogout").style.display = 'block';
    document.querySelector("#btnMenuHome").style.display = 'block';
    document.querySelector("#btnMenuCalculadoraDistancia").style.display = 'block';
    document.querySelector("#btnMenuagregarEnvio").style.display = 'block';
    document.querySelector("#btnMenuListaEnvio").style.display = 'block';
    document.querySelector("#btnMenuGastoTotalEnvio").style.display = 'block';
    document.querySelector("#btnMenuciudadCercana").style.display = 'block';

}
function vaciarTodosLosCampos() {
    // Registro
    document.querySelector("#txtRegistroUsuario").value = ("");
    document.querySelector("#txtRegistroPassword").value = ("");
    document.querySelector("#pRegistroMensajes").innerHTML = ("");
    // Login
    document.querySelector("#txtLoginUsuario").value = ("");
    document.querySelector("#txtLoginPassword").value = ("");
    document.querySelector("#pMensajeLoguin").innerHTML = ("");
    // calculadora
    //document.querySelector("#pMensajecalculadora").innerHTML = ("");
    //agregar envios
    // document.querySelector("#pMensajeAgrgarenvios").innerHTML = ("");
    //listadoEnvios
    //document.querySelector("#pMensajeLista".innerHTML = "");
    //detalles
    //document.querySelector("#pMensajedetalle".innerHTML = "");
    //compartir
    //document.querySelector("#pMensajeCompartir".innerHTML = "");
    //gastoenvios
    //document.querySelector("#pMensajeMontoTotal".innerHTML = "");
    //deptos con mas envios
    // document.querySelector("#pMensajeTopDepartamentos".innerHTML = "");
    //ciudad cercana
}
//muestras de pantallas
function mostrarHome() {
    document.querySelector("#pantalla-home").style.display = 'block';
}
function registroRegistrarseHandler() {
    mostrarRegistro();
}
function mostrarRegistro() {
    document.querySelector("#pantalla-registro").style.display = 'block';
}
function mostrarCalculadora() {
    mostrarSelects();
    //cargarPosicionUsuario();
    //inicializarMapa("contenedorMapa");
    //document.querySelector("#calcular").addEventListener('click', calcularDistancia);
    document.querySelector("#pantalla-calculadora").style.display = 'block';

}
function buscarCiudadporID(id) {
    for (i = 0; i < ciudades.length; i++) {

        if (ciudades[i].id == id) {
            return ciudades[i];
        }
    }

}
//calculo distancia
function calculoDistancia() {

    ciudadOrigen = Number(document.querySelector(".slcCiudadOrigen").value);//guardo la latuitud y longitud ciudad origen
    ciudadDestino = Number(document.querySelector(".slcCiudadDestino").value);//guardo la latitud y longitud de ciudad destino
    let ciudadOrigenObj = buscarCiudadporID(ciudadOrigen);//guardo la ciudad origen
    let ciudadDestinoObj = buscarCiudadporID(ciudadDestino); //guardo la ciudad destino
    inicializarMapa(ciudadOrigenObj.latitud, ciudadOrigenObj.longitud, "contenedorMapa");
    dibujarDistanciaEntreDosPuntos([ciudadOrigenObj.latitud, ciudadOrigenObj.longitud], [ciudadDestinoObj.latitud, ciudadDestinoObj.longitud], "pMensajecalculadora");

    //distancia = Dist(ciudadOrigenObj.latitud, ciudadOrigenObj.longitud, ciudadDestinoObj.latitud, ciudadDestinoObj.longitud);

}


//fin calcular distncia
function mostrarLista() {
    listadoEnvios();
    document.querySelector("#pantalla-ListaEnvios").style.display = 'block';
}
function mostrarLogin() {
    document.querySelector("#pantalla-login").style.display = 'block';
}
function mostrarGastoTotalEnvio() {
    calcularMostrarGastoTotal();
    document.querySelector("#pantalla-GastoTotalEnvio").style.display = 'block';
}
function calcularMostrarGastoTotal() {
    let total = 0;
    envios.forEach(element => total += element.precio);//guardo en total el costo de todos los envios
    document.querySelector("#pMensajeMontoTotal").innerHTML = `El monto total gastado es de: ${total}`;
}
function mostrarTopCiudades() {
    departamentosMasEnvios();
    document.querySelector("#pantalla-top").style.display = 'block';
}
function mostrarCiudadesCercanas() {
    cargarPosicionUsuario();
    document.querySelector("#pantalla-ciudadCercana").style.display = 'block';
}
function mostrarAgregarEnvios() {
    document.querySelector("#pantalla-agregarEnvio").style.display = 'block';
}
function mostrarLogout() {
    document.querySelector("#pantalla-logout").style.display = 'block';
}
function mostrarDetalle() {
    // Le paso 2 parámetros, el id del detalle que quiero mostrar y una función de callback
    document.querySelector("#pantalla-Detalles").style.display = 'block';

}
//#endregion

//#region iniciar session
function cerrarSesion() {
    window.localStorage.clear();

    // Oculto todo.
    ocultarOpcionesMenuParaInvitado();

    navegar('pantalla-logout');
    document.querySelector('ion-nav').popToRoot();//vuelve a loguin
    mostrarMenuInvitado();
}
/* Login */
function loginIniciarSesionHandler() {
    document.querySelector("#pMensajeLoguin").innerHTML = ("");

    let usuarioIngresado = document.querySelector("#txtLoginUsuario").value;
    let passwordIngresado = document.querySelector("#txtLoginPassword").value;
    if (usuarioIngresado.length >= 6 && passwordIngresado.length >= 6) {

        const datosUsuario = {
            usuario: usuarioIngresado,
            password: passwordIngresado
        };

        fetch(urlBase + 'login.php', {//la url a la cual se acede 
            method: 'POST',//metodo que se usa
            headers: {
                'Content-Type': 'application/json'//el tipo de contenido siemore usamos json
            },
            body: JSON.stringify(datosUsuario)
        })
            .then(function (response) {
                console.log(response);
                if (response.status != 200) {
                    throw "Error en el loguin intente de nuevo por favor!!.";
                }
                return response.json();
            })
            .then(function (data) {
                if (data && data.error) {
                    throw data.error;
                } else {
                    window.localStorage.setItem('tokenUsuario', data.apiKey);
                    window.localStorage.setItem('idUsuario', data.id);
                    console.log(data);
                    iniciarSesion(data);
                }
            })
            .catch(errorCallback);

    } else {
        document.querySelector("#pMensajeLoguin").innerHTML = "ERROR- Usuario y password incorrectos";
    }

}
function iniciarSesion(usu) {
    tokenGuardado = usu.apiKey;
    inicializar();

    // usuarioLogueado = new Usuario(usu._id, usu.usuario, usu.password);
    //ocultarOpcionesMenuParaLogueado();
    //mostrarMenuUsuarioAutenticado();
    navegar("pantalla-home");

}
//#endregion

//#region registro

/* Registro */

function registrarse() {
    document.querySelector("#pRegistroMensajes").innerHTML = ("");

    let usuIngresado = document.querySelector("#txtRegistroUsuario").value;
    let passwordIngresado = document.querySelector("#txtRegistroPassword").value;

    if (usuIngresado.length >= 6 && passwordIngresado.length >= 8) {

        const datosUsuario = {
            usuario: usuIngresado,
            password: passwordIngresado
        };

        fetch(`${urlBase}/usuarios.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datosUsuario)
        })
            .then(function (response) {
                console.log(response);
                return response.json();
            })
            .then(function (data) {
                if (data && data.error) {
                    throw data.error;
                } else {
                    alert("El usuario ha sido creado correctamente");
                    navegar("pantalla-login");
                }
            })
            .catch(errorCallback);

    } else {
        document.querySelector("#pRegistroMensajes").innerHTML = " ERROR- registro usuario debe tener minimo 6 caracteres contrasenia 8 cracteres"
    }
}
//#endregion

//#region listas
/* carga listados */
function todoCargado() {
    suscribirseAEventos();
    inicializar();
}
function cargaciudades() {

    if (tokenGuardado) {
        fetch(urlBase + 'ciudades.php', {
            method: 'GET',
            headers: {
                'apikey': tokenGuardado,//tokenGuardado   
                'Content-Type': 'application/json'

            }
        })
            .then(function (response) {
                console.log(response);
                return response.json();
            })
            .then(function (data) {
                if (data && data.error) {
                    throw data.error;

                } else {
                    CargarCiudadesArray(data);
                }
            })
            .catch(errorCallback);
    }


}
function CargarCiudadesArray(data) {
    ciudades.splice(0, ciudades.length);//limpio el array
    data.ciudades.forEach(element => {
        if (ciudades.indexOf(element) <0) {
            ciudades.push(element);
        }
    });
    //alert("cargadas ciudades");
}
function eliminarEnvio(idEnvio) {
    //alert(idEnvio);
    if (tokenGuardado) {
        fetch(urlBase + 'envios.php', {
            method: 'DELETE',
            headers: {
                'apikey': tokenGuardado,//tokenGuardado   
                'Content-Type': 'application/json'
            },

            body: JSON.stringify(idEnvio)//idEnvio que viene por parametro
        })
            .then(function (response) {
                console.log(response);
                return response.json();
            })
            .then(function (data) {
                if (data && data.error) {
                    console.log(data);
                    throw data.error;

                } else {
                    let env = obtenerEnvioDetallePorID(idEnvio);//obtiene el envio que se va a eliminar
                    envios.splice(envios.indexOf(env), 1);//elimina el envio del array
                    alert("El envio ha sido eliminado correctamente");
                    navegar('pantalla-home');
                }
            })
            .catch(errorCallback);
    }
}
function cargacategorias() {
    if (tokenGuardado) {
        fetch(urlBase + 'categorias.php', {
            method: 'GET',
            headers: {
                'apikey': tokenGuardado,//tokenGuardado   
                'Content-Type': 'application/json'
            }
        })
            .then(function (response) {
                console.log(response);
                return response.json();
            })
            .then(function (data) {
                if (data && data.error) {
                    console.log(data);
                    throw data.error;

                } else {
                    CargarCategoria(data);
                    //alert("carga de categorias completada");
                }
            })
            .catch(errorCallback);
    }
}
function CargarCategoria(data) {
    categorias.splice(0, categorias.length);//limpia el array
    data.categorias.forEach(element => { if (categorias.indexOf(element) < 0) { categorias.push(element); } });
}
function CargarlistadoEnvios() {
    document.querySelector("#pMensajeLista").innerHTML = ("");
    let idUsuario = Number(window.localStorage.getItem('idUsuario'));


    fetch(urlBase + `envios.php?idUsuario=${idUsuario}`, {
        method: 'GET',
        headers: {
            'apikey': tokenGuardado,//tokenGuardado    no se si es el token o es esa api key que nos dan
            'Content-Type': 'application/json'

        }
    })
        .then(function (response) {
            console.log(response);
            return response.json();
        })
        .then(function (data) {
            if (data && data.error) {
                throw data.error;
            } else {
                cargarListadoEnviosArray(data);
            }
        })
        .catch(errorCallback);
}
function mostrarSelectEnvio(ciudad, categ) {
    //cargar los option de los select
    let optionCiudad = '';
    let optionCategoria = '';
    //ciudad
    ciudad.forEach(element => {
        optionCiudad += `<option    value="${element.id}"  >${element.nombre}</option><br>`;

    });
    //categroia
    categ.forEach(element => {
        optionCategoria += `<option    value="${element.id}"  >${element.nombre}</option><br>`;
    });
    //cargociudades

    document.querySelector(".sCiudadOrigen").innerHTML = optionCiudad;
    document.querySelector(".sCiudadDestino").innerHTML = optionCiudad;
    //cargo categoria
    document.querySelector(".sCategoria").innerHTML = optionCategoria;

}
function mostrarSelects() {
    //cargar los option de los select
    let option = '';
    ciudades.forEach(element => {
        option += `<option    value="${element.id}"  >${element.nombre}</option><br>`;
    });
    document.querySelector(".slcCiudadOrigen").innerHTML = option;
    document.querySelector(".slcCiudadDestino").innerHTML = option;
}
function cargarDepartamentos() {

    if (tokenGuardado) {
        fetch(urlBase + `departamentos.php`, {
            method: 'GET',
            headers: {
                'apikey': tokenGuardado,//tokenGuardado   
                'Content-Type': 'application/json'

            }
        })
            .then(function (response) {
                console.log(response);
                return response.json();
            })
            .then(function (data) {
                if (data && data.error) {
                    throw data.error;
                } else {
                    cargarListadoDepartamentosArray(data);
                }
            })
            .catch(errorCallback);
    }

}
function cargarListadoDepartamentosArray(data) {
    departamentos.splice(0, departamentos.length);//limpia el array
    data.departamentos.forEach(element => { if (departamentos.indexOf(element) <0) { departamentos.push(element); } }); //alert("carga de departamentos completada");
}
function listadoEnvios() {
    document.querySelector("#tablaTbodyenvios").innerHTML = "";//limpia la tabla

    if (envios && envios.length > 0) {
        // Si hay envios completo y muestro la tabla.
        let filas = ``;
        for (let i = 0; i < envios.length; i++) {
            let unEnvio = envios[i];
            filas += `<tr> <td>${unEnvio.ciudad_origen}</td>
                           <td>${unEnvio.ciudad_destino}</td>
                           <td>${unEnvio.precio}</td>
                           <td>${unEnvio.id_categoria}</td>
                           <td><input type="button" value="Detalles"  id="${unEnvio.id}" class="btnDetallesEnvio"></td>
                           <td><input type="button" value="Eliminar"  id="${unEnvio.id}" class="btnEliminarEnvio"></td></tr>`;
        }

        document.querySelector("#tablaTbodyenvios").innerHTML = (filas);//agrego los datos a la tabla
        document.querySelector("#tablaEnvios").style.display = 'block';//muestro la tabla
        //navego a la pantalla de listado de envios
        const botonesDetalle = document.querySelectorAll(".btnDetallesEnvio");//busco los botones de detalles
        const botonesEliminar = document.querySelectorAll(".btnEliminarEnvio");//busco los botones de eliminar
        for (let i = 0; i < botonesDetalle.length; i++) {//recorro los botones
            botonesDetalle[i].addEventListener('click', btnEnvioDetalleHandler);//agrego el evento click a cada boton
        }
        for (let i = 0; i < botonesEliminar.length; i++) {//recorro los botones
            botonesEliminar[i].addEventListener('click', btnEliminarEnvioHandler);//agrego el evento click a cada boton
        }

    } else {
        // Si no hay recetas, aviso que no hay recetas.
        document.querySelector("#pMensajeLista").innerHTML = ("No se encontraron envios.");
    }
}
function cargarListadoEnviosArray(dataEnvios) {
    envios.splice(0, envios.length);//limpio el array
    dataEnvios.envios.forEach(element => { if (envios.indexOf(element) < 0) { envios.push(element); } });
    //alert("carga de envios completada");
}
// Revisa si el envio está o
function btnEnvioDetalleHandler() {
    let ideEnvio = this.getAttribute("id");//obtengo el id del envio
    envio = obtenerEnvioDetallePorID(ideEnvio);//obtengo el envio
    //alert("tengo el envio");//muestro el envio
    cargarDetalle(envio);//cargo el detalle del envio

}
function btnEliminarEnvioHandler() {
    let ideEnvio = this.getAttribute("id");//obtengo el id del envio
    eliminarEnvio(ideEnvio);//elimino el envio
}
//cargaDetalles
function cargarDetalle(env) {
    //crear   envio
    document.querySelector("#bodydetalles").value = "";//limpio el body
    let filas = ``;//creo la variable para las filas
    filas += `<tr><td>${env.id_usuario}</td>
                <td>${env.ciudad_origen}</td>
                <td>${env.ciudad_destino}</td>
                <td>${env.peso}</td>
                <td>${env.distancia}</td>
                <td>${env.precio}</td>
                <td>${env.id_categoria}</td>
                <td><input type="button" value="Compartir"  id="${env.id}" class="btncompartir"></td></tr>`;


    document.querySelector("#bodydetalles").innerHTML = (filas);
    document.querySelector("#tablaDetalles").style.display = 'block';
    navegar("pantalla-Detalles");//navego a la pantalla de detalles
   // alert("carga de detalles completada");
    // boton.addEventListener('click', compartir);
}
function obtenerEnvioDetallePorID(ide) {
    //recorrer envios y buscar el id que coincida con el id que se le pasa
    for (let i = 0; i < envios.length; i++) {
        if (envios[i].id === Number(ide)) { //si el id del envio es igual al id que se le pasa
            return envios[i];//devuelvo el envio
        }
    }
}
function errorCallback(error) {
    alert(error);
}

function obtenerEnvioPorID(idEnvio) {
    envios.forEach(element => { if (element.id === idEnvio) { return element; } });
    return null;
}

//#endregion 

async function compartirEnvio() {
    if (Capacitor.isNativePlatform()) {
        Capacitor.Plugins.Share.share({
            title: 'Compartir',
            text: 'buscador de envios',
            url: 'http://www.google.com',
            dialogTitle: 'Compartir',
        });
    } else {
        mostrarMensaje("ERROR", null, "Funcionalidad accesible desde un dispositivo móvil", 5000);
    }
}
