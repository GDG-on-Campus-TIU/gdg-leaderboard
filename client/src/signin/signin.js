let signin = () =>
    /*html*/`
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Document</title>
                <link rel="stylesheet" href="/styles/signin/output.css">   
                <link rel="stylesheet" href="/styles/signin/styles.css"> 
                <script src="/scripts/script-signin.js" ></script>
            </head>
            <h1 class="main-heading">SIGN IN TO GDG</h1>
            <div class="container right-panel-active" id="container" > 
                <!-- //TODO: remove right-panel-active default class -->
                <div class="mobile-view-container" >
                    <div class="form-container sign-up-container">
                        <form id="signupForm" method="POST">
                            <h1>Create Account</h1>
                            <div class="pfp-wrapper">
                                <input
                                    name="pfp"
                                    type="file" 
                                    class="pfp-input" 
                                    id="fileInput" onchange="pfp_check()"
                                    accept=".png, .jpg, .jpeg"
                                    >
                            </div>
                            <label for="fileInput" class="pfp-input-label">Upload a <i>1:1</i> image for best results, or drag it here
                                <div class=" flex justify-center sub-text">only .jpg/.jpeg/.png is accepted</div>
                            </label>
                            <div class="input-collection">
                            <div class="input-line1">
                                <input type="text" name="name" placeholder="Name" />
                                <input type="text" name="clgId" placeholder="College ID" />
                            </div>   
                            <div class="input-line2">
                                <input type="email" name="email" placeholder="Email" />
                                <input type="password" name="password" placeholder="Password" />
                            </div> 
                            </div>
                            <!-- <button onclick="handleSignup()">Sign Up</button> -->
                            <button type="submit">Sign Up</button>
                        </form>
                    </div>
                    <div class="form-container sign-in-container">
                        <form action="#">
                            <h1>Sign in</h1>
                            <input type="email" placeholder="Email" />
                            <input type="password" placeholder="Password" />
                            <a href="#">Forgot your password?</a>
                            <button class="sign-in-button">Sign In</button>
                        </form>
                    </div>
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
        </html>
    `
export default signin;