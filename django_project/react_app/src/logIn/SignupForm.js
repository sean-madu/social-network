import "./LoginForm.css"

export default function SignupForm() {

  //TODO the form tag work with django, fill in the action and method part of form
  let fragments = window.location.hash;
  console.log(fragments);
  const getWarning = () => {
    return fragments.length != 0 && <div class="alert alert-danger" role="alert">
      Username in use &#128547; Do you mean to <a href="#" class="alert-link"> Login instead?</a>
    </div>
  }
  return (
    <>
      <div class="container">

        <div class="row">
          <div class="col align-self-center">
            <h1>
              SIGN UP FOR THE SOCIAL NETWORK
            </h1>
            {getWarning()}
          </div>
        </div>

        <div class="row">
          <form action="" method="">
            <div class="mb-3">
              <div className="form-floating">
                <input type="text" id="loginUsername" placeholder="username" class="form-control" required />
                <label for="loginUsername" class="form-label ">Username</label>
              </div>

            </div>
            <div class="mb-3 form-floating">

              <input type="password" class="form-control" placeholder="username" id="loginPassword" required />
              <label for="loginPassword" class="form-label" >Password</label>
            </div>
            <div class="mb-3 form-floating">
              <input type="text" id="signupName" class="form-control" placeholder="username" required />
              <label for="signupName" class="form-label ">Name</label>
            </div>
            <div class="d-grid gap-2">
              <button type="submit" class="btn btn-primary">SIGN UP</button>
            </div>

          </form>
        </div>


      </div >

    </>
  )

}