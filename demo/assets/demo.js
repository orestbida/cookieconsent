/**
 * The file is for demo purposes,
 * don't use in your configuration!
 */

const message = '❗ If you see this message, it means that you are viewing this demo file directly! You need a webserver to test cookies! <br><br><em>Ensure that the URL begins with "<i>http</i>" rather than "<i>file</i>"!</em>'

if(location.protocol.slice(0, 4) !== 'http'){
    var warning = document.createElement('p');
    warning.innerHTML = message;
    warning.className = 'warning';
    document.body.appendChild(warning);
}

var cookieSettingsBtn = document.querySelector('[data-cc="show-preferencesModal"]');
var resetCookiesBtn = document.createElement('button');
resetCookiesBtn.type = 'button';
resetCookiesBtn.className = 'btn';
resetCookiesBtn.innerText = 'Reset cookieconsent';
cookieSettingsBtn.parentNode.insertBefore(resetCookiesBtn, cookieSettingsBtn.nextSibling);

resetCookiesBtn.addEventListener('click', function(){
    cc.acceptCategory([]);
    cc.eraseCookies(['cc_cookie_demo1', 'cc_cookie_demo2', 'cc_cookie_demo3','cc_youtube', 'cc_cookie']);
    window.location.reload();
});