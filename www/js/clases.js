class Usuario {
    constructor(
        pId,
        pUsuario,
       
        pPassword
    ) {
        this._id = pId;
        this.usu = pUsuario;
        this.password = pPassword;
    }
}

class Envio {
    constructor (
        pId,
        pciudadOrigen,
        pciudadDestino,
        pCategoria,
        pPeso,
        pDistancia,
        pCosto
    ) {
        this._id = pId;
        this.ciudadOPrigen = pciudadOrigen;
        this.ciudadDestino = pciudadDestino;
        this.categoria = pCategoria;
        this.peso = pPeso;
        this.distancia = pDistancia;
        this.costo = pCosto;
    }
}

function Dist(lat1, lon1, lat2, lon2) {
    rad = function (x) {
        return x * Math.PI / 180;
    }
    var R = 6378.137;//Radio de la tierra en km
    var dLat = rad(lat2 - lat1);
    var dLong = rad(lon2 - lon1);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLong / 2) * Math.sin(dLong / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d.toFixed(3);//Retorna tres decimales
}

//aca va lo que presisamos para loguin y registro 
/*



function validar_clave(contrasenia){
    if(contrasenia.length >= 4)//largo de la clave minimo 4
    {		
        let mayuscula = false;
        let minuscula = false;
        let numero = false;
        
        for(let i = 0;i<contrasenia.length;i++)//recorro la misma 
        {
            if(contrasenia.charCodeAt(i) >= 65 && contrasenia.charCodeAt(i) <= 90)
            {
                mayuscula = true;//uso los charcode para saber si tiene mayusculas
            }
            else if(contrasenia.charCodeAt(i) >= 97 && contrasenia.charCodeAt(i) <= 122)
            {
                minuscula = true;//uso los charcode para saber si tiene minusculas
            }
            else if(contrasenia.charCodeAt(i) >= 48 && contrasenia.charCodeAt(i) <= 57)
            {
                numero = true;////uso los charcode para saber si tiene numeros
            }
        }
        if(mayuscula == true && minuscula == true &&  numero == true)//si tiene todo
        {
            return true;//es verdadero
        }
    }
    return false;//si no falso
}


*/