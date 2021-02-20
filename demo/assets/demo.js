if(cc.validCookie('cc_cookie')){
    //if cookie is set => disable buttons
    disableBtn('btn2');
    disableBtn('btn3');
}

function disableBtn(id){
    document.getElementById(id).disabled = true;
    document.getElementById(id).className = "styled_btn disabled";
}

function themeText(){
    if(!darkmode){
        document.getElementById('theme').innerText = 'dark theme';
        darkmode = true;
    }else{
        document.getElementById('theme').innerText = 'light theme';
        darkmode = false;
    }
}

var darkmode = false;

/*
* The following lines of code are for demo purposes (show api functions)
*/ 
if(document.addEventListener){

    document.getElementById("btn2").addEventListener('click', function(){
        cc.show(0);
    });

    document.getElementById("btn3").addEventListener('click', function(){
        cc.hide();
    });

    document.getElementById("btn5").addEventListener('click', function(){
        cc.showSettings(0);  
    });

    document.getElementById("btn6").addEventListener('click', function(){
        document.body.classList.toggle('c_darkmode');
        themeText();
    });
}else{
    document.getElementById("btn2").attachEvent('onclick', function(){
        cc.show(0);
    });

    document.getElementById("btn3").attachEvent('onclick', function(){
        cc.hide();
    });

    document.getElementById("btn5").attachEvent('onclick', function(){
        cc.showSettings(0);  
    });

    document.getElementById("btn6").attachEvent('onclick', function(){
        document.body.className='d_mode c_darkmode';
    });
}