console.log("loaded cookie_test.js");

var _setCookie = function(name, value) {

    var date = new Date();
    date.setTime(date.getTime() + (1000 * ( 30 * 24 * 60 * 60)));
    var expires = "; expires=" + date.toUTCString();

    var cookieStr = name + "=" + (value || "") + expires + "; Path=/demo;";
    cookieStr += " SameSite=Lax;";

    // assures cookie works with localhost (=> don't specify domain if on localhost)
    if(location.hostname.indexOf(".") > -1){
        cookieStr += " Domain=" + window.location.hostname + ";";
    }

    if(location.protocol === "https:") {
        cookieStr += " Secure;";
    }

    document.cookie = cookieStr;
}

_setCookie("_my_cookie", "ciao=212");

window.myObject = {
    write: function(msg){
        console.log(msg, "this message is printed from cookie_test.js: myObject.write()");
    }
}