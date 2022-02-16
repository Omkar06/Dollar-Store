window.onload = function () {

    //there will be one span element for each input field
    // when the page is loaded, we create them and append them to corresponding input elements 
    // they are initially empty and hidden

    var username = document.getElementById("username");
    var usernamespan = document.createElement("span");
    usernamespan.style.display = "none"; //hide the span element
    username.parentNode.appendChild(usernamespan);

    var email = document.getElementById("email");
    var emailspan = document.createElement("span");
    emailspan.style.display = "none"; //hide the span element
    email.parentNode.appendChild(emailspan);


    var password = document.getElementById("password");
    var passwordspan = document.createElement("span");
    passwordspan.style.display = "none"; //hide the span element
    password.parentNode.appendChild(passwordspan);


    var confirmpassword = document.getElementById("confirm");
    var confirmpasswordspan = document.createElement("span");
    confirmpasswordspan.style.display = "none"; //hide the span element
    confirmpassword.parentNode.appendChild(confirmpasswordspan);


    email.onfocus = function () {
        emailspan.innerHTML = "Enter email address in the format: abcd@efg.hij";
        email.classList.remove("error");
        emailspan.style.display = "block";
    }

    email.onblur = function () {
        emailspan.style.display = "none";

    }

    password.onfocus = function () {
        passwordspan.innerHTML = "Enter password in the format which contain at least six characters, one uppercase letter, one number and one special character.";
        password.classList.remove("error");
        passwordspan.style.display = "block";

    }

    password.onblur = function () {
        passwordspan.style.display = "none";

    }

    confirmpassword.onfocus = function () {
        confirmpasswordspan.innerHTML = "Enter your password again";
        confirmpassword.classList.remove("error");
        confirmpasswordspan.style.display = "block";
    }

    confirmpassword.onblur = function () {
        confirmpasswordspan.style.display = "none";
    }

    var form = document.getElementById("myForm");
    form.onsubmit = function (e) {

        const emailPattern = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        const number_check = /[0-9]/g;

        const uppercaseletter_check = /[A-Z]/g;

        const specialcharacters_check = /\W|_/g;

        passwordspan.innerHTML = "";

        let bool_preventdefault = false;

        if (!email.value.match(emailPattern)) {

            email.classList.add("error");
            emailspan.style.display = "block";
            emailspan.innerHTML = "Please enter a valid email address in correct format.";
            bool_preventdefault = true;

        }

        if (password.value.length < 6) {

            password.classList.add("error");
            passwordspan.style.display = "block";
            passwordspan.innerHTML = "Please enter password of atleast 6 characters. ";
            bool_preventdefault = true;

        }

        if (!password.value.match(number_check)) {

            password.classList.add("error");
            passwordspan.style.display = "block";
            passwordspan.innerHTML = passwordspan.innerHTML + "Atleast one number should be included. ";
            bool_preventdefault = true;

        }

        if (!password.value.match(uppercaseletter_check)) {

            password.classList.add("error");
            passwordspan.style.display = "block";
            passwordspan.innerHTML = passwordspan.innerHTML + "Atleast one uppercase should be included. ";
            bool_preventdefault = true;

        }


        if (!password.value.match(specialcharacters_check)) {

            password.classList.add("error");
            passwordspan.style.display = "block";
            passwordspan.innerHTML = passwordspan.innerHTML + "Atleast one special character should be included.";
            bool_preventdefault = true;

        }



        if (password.value != confirmpassword.value) {

            password.classList.add("error");
            confirmpassword.classList.add("error");
            confirmpasswordspan.style.display = "block";
            confirmpasswordspan.innerHTML = "Please enter correct password again.";
            bool_preventdefault = true;

        }



        e.preventDefault();

        if (bool_preventdefault) {
        }
        else{
            $.ajax({
                type: "POST",
                url: "/register",
                data: $("#myForm").serialize(),
                success: function(data){
                    if(data){

                        window.location="/login";
                
                    }
                    else{
                        alert("Email id already use. Please try other email id");
                    }
                },
                Error: function(data){alert("error")},
            });
        }




    }


}