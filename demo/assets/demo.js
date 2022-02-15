/**
 * Just demo things
 */

if(location.protocol.slice(0, 4) !== 'http'){
    var warning = document.createElement('p');
    warning.innerText = '❗ If you are seeing this message, it means that you are viewing this demo file directly! You need a web server to test cookies!'
    warning.className = 'warning';
    document.body.appendChild(warning);
}