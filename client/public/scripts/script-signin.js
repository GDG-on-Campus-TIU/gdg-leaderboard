document.addEventListener('DOMContentLoaded', () => {
    const signUpButton = document.getElementById('signUp');
    const signInButton = document.getElementById('signIn');
    const container = document.getElementById('container');

    signUpButton.addEventListener('click', () => {
        container.classList.add("right-panel-active");
        if(window.innerWidth<=425){
            let leftOverlay = document.querySelector(".overlay-left");
            leftOverlay.style.display="flex";
            let rightOverlay = document.querySelector(".overlay-right");
            rightOverlay.style.display="none";
            let signUpContainer = document.querySelector(".sign-up-container");
            signUpContainer.style.display="block";
            let signInContainer = document.querySelector(".sign-in-container");
            signInContainer.style.display="none";
        }
    });
    
    signInButton.addEventListener('click', () => {
        container.classList.remove("right-panel-active");
        if(window.innerWidth<=425){
            let leftOverlay = document.querySelector(".overlay-left");
            leftOverlay.style.display="none";
            let rightOverlay = document.querySelector(".overlay-right");
            rightOverlay.style.display="flex";
            let signUpContainer = document.querySelector(".sign-up-container");
            signUpContainer.style.display="none";
            let signInContainer = document.querySelector(".sign-in-container");
            signInContainer.style.display="block";
        }
    });
});

function pfp_check() {
    const input = document.getElementById("fileInput");
    const file = input.files[0];
    if (file) {
        let extension = file.name.split('.').pop().toLowerCase();
        if (!(extension === "jpg" || extension === "jpeg" || extension === "png")) {
            console.log("Hello");
            alert("only .jpg, .jpeg and .png files are supported! Try again!");
            location.reload();
        }
        var reader = new FileReader();
        reader.onload = function (e) {
            console.log("CALLED!");
            let htmlPreview =
                '<img class="preview-img" src="' + e.target.result + '" />' ;
            let boxZone = document.querySelector(".pfp-wrapper");
            boxZone.innerHTML = "";
            boxZone.insertAdjacentHTML("beforeend", htmlPreview);
        };

        reader.readAsDataURL(input.files[0]);
    }
}

function handleSignup(){
    const form = document.getElementById('signupForm');
    form.addEventListener('submit', async function (e) 
    {
        e.preventDefault();
        // Extract data for JSON
        const formData = new FormData(form);
        console.log(formData);
        
        const jsonData = {
            name: formData.get('name'),
            email: formData.get('email'),
            password: formData.get('password'),
            clgId: formData.get('clgId')
        };
        console.log(jsonData);
        const signupRes = await fetch ('https://gdg-leaderboard-server-1019775793519.us-central1.run.app/api/v1/auth/signup', {
            method: "POST",
            headers:{
                'Content-Type': 'application/json',
                'HX-Request': 'true'
            },
            body: JSON.stringify(jsonData)
        });
        if (!signupRes.ok) {
            console.log('Signup failed!');
            return;
        }
        else{
            console.log("signup done")
            const pfpFormData = new FormData(form);
            pfpFormData.append('file', formData.get('pfp'));
            pfpFormData.append('clg_id', formData.get('clgId'));
            console.log(pfpFormData);
            const sendPfpRes = await fetch ('https://gdg-leaderboard-server-1019775793519.us-central1.run.app/api/v1/upload/pfp', {
                method: "POST",
                body: pfpFormData
            });
            if (!sendPfpRes.ok) {
                console.log('PFP failed!');
                return;
            }
            else{
                console.log("PFP done")
            }
        }
    })

}