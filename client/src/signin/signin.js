let signin = () =>
    /*html*/`
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Document</title>
                <link rel="stylesheet" href="/styles/signin/styles.css"> 
                <link rel="stylesheet" href="/styles/signin/output.css">   
                <script src="/scripts/script-signin.js" ></script>
            </head>
            <h1>SIGN IN TO GDG</h1>
            <div class="container right-panel-active" id="container" > 
                <!-- //TODO: remove right-panel-active default class -->
                <div class="form-container sign-up-container">
                    <form id="signupForm" method="POST">
                        <h1>Create Account</h1>
                        <div class="pfp-wrapper">
                            <input
                                type="file" 
                                class="pfp-input" 
                                id="fileInput" onchange="pfp_check()"
                                accept=".png, .jpg, .jpeg"
                                >
                        </div>
                        <label for="fileInput" class="pfp-input-label">Choose an image, or drag it here
                            <sub class=" flex justify-center">only .jpg/.jpeg/.png is accepted</sub>
                        </label>
                        <input type="text" placeholder="Name" />
                        <input type="email" placeholder="Email" />
                        <input type="password" placeholder="Password" />
                        <button>Sign Up</button>
                    </form>
                </div>
                <div class="form-container sign-in-container">
                    <form action="#">
                        <h1>Sign in</h1>
                        <div class="social-container">
                            <a href="#" class="social"><i class="fab fa-facebook-f"></i></a>
                            <a href="#" class="social"><i class="fab fa-google-plus-g"></i></a>
                            <a href="#" class="social"><i class="fab fa-linkedin-in"></i></a>
                        </div>
                        <span>or use your account</span>
                        <input type="email" placeholder="Email" />
                        <input type="password" placeholder="Password" />
                        <a href="#">Forgot your password?</a>
                        <button>Sign In</button>
                    </form>
                </div>
                <div class="overlay-container">
                    <div class="overlay">
                        <div class="overlay-panel overlay-left">
                            <h1>Welcome Back!</h1>
                            <p>To keep connected with us please login with your personal info</p>
                            <button class="ghost" id="signIn">Sign In</button>
                        </div>
                        <div class="overlay-panel overlay-right">
                            <h1>Hello, Student!</h1>
                            <p>Enter your personal details and start journey with us</p>
                            <button class="ghost" id="signUp">Sign Up</button>
                        </div>
                    </div>
                </div>
            </div>
            <script>

                const form = document.getElementById('signupForm');
                form.addEventListener('submit', async function (e) 
                {
                    e.preventDefault();
                    // Extract data for JSON
                    const formData = new FormData(form);
                    const jsonData = {
                        name: formData.get('name'),
                        email: formData.get('email'),
                        password: formData.get('password'),
                        clgId: formData.get('clgId')
                    };
                    const signupRes = await fetch ('https://gdg-leaderboard-server-1019775793519.us-central1.run.app/api/v1', {
                        method: "POST",
                        headers:{
                            'Content-Type': 'application/json',
                            'HX-Request': 'true'
                        }
                        body: JSON.stringify(jsonData)
                    });
                    if (!signupRes.ok) {
                        console.log('Signup failed!');
                        return;
                    }
                    else{
                        console.log("signup done")
                    }
                })
            </script>
        </html>
    `
export default signin;