document.addEventListener('DOMContentLoaded', () => {
    const signUpButton = document.getElementById('signUp');
    const signInButton = document.getElementById('signIn');
    const container = document.getElementById('container');

    signUpButton.addEventListener('click', () => {
        container.classList.add("right-panel-active");
    });

    signInButton.addEventListener('click', () => {
        container.classList.remove("right-panel-active");
    });
});

function pfp_check() {
    const input = document.getElementById("fileInput");
    const file = input.files[0];
    if(file){
        console.log("FILE name:", file.name); 
        let extension = file.name.split('.').pop().toLowerCase();
        console.log("Extension=",extension);
        if(!(extension==="jpg" || extension==="jpeg" || extension==="png")){
            console.log("Hello");
            alert("only .jpg, .jpeg and .png files are supported! Try again!");
            location.reload();
        }
        var reader = new FileReader();
        reader.onload = function (e) {
          console.log("CALLED!");
          var htmlPreview =
          '<img width="200" src="' + e.target.result + '" />' +
          '<p>' + input.files[0].name + '</p>';
          var wrapperZone = $(input).parent();
          var previewZone = $(input).parent().parent().find('.preview-zone');
          var boxZone = $(input).parent().parent().find('.preview-zone').find('.box').find('.box-body');
    
          wrapperZone.removeClass('dragover');
          previewZone.removeClass('hidden');
          boxZone.empty();
          boxZone.append(htmlPreview);
        };
    
        reader.readAsDataURL(input.files[0]);
    }
}