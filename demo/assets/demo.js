/**
 * Just demo things
 */

if(location.protocol.slice(0, 4) !== 'http'){
    var warning = document.createElement('p');
    warning.innerHTML = '❗ If you see this message, it means that you are viewing this demo file directly! You need a webserver to test cookies! <br><br>Ensure that the URL begins with "<i>http</i>" rather than "<i>file</i>"!';
    warning.className = 'warning';
    document.body.appendChild(warning);
}