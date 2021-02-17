/*
* The following lines of code are for demo purposes (show api functions)
*/ 
if(document.addEventListener){
    document.getElementById("btn1").addEventListener('click', function(){
        autorun();
    });

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
    });
}else{
    document.getElementById("btn1").attachEvent('onclick', function(){
        autorun();
    });

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
        document.body.classList.toggle('c_darkmode');
    });
}