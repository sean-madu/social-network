import "./LoginForm.css"
import { Link } from "react-router-dom";
export default function LoginForm() {

  //TODO the form tag work with django, fill in the action and method part of form
  let fragments = window.location.hash;
  console.log(fragments);
  const getWarning = () => {
    return fragments.length != 0 && <div class="alert alert-danger" role="alert">
      Combination of Username and Password not found! If you have not made an account consider <Link to="/register" class="alert-link" > making one here </Link>
    </div>
  }
  return (
    <div style={{ display: "flex", height: "70vh", justifyContent: "center", alignItems: "center" }}>
      <div class="container">

        <div class="row">
          <div class="col align-self-center">
            <h1>
              LOG INTO THE SOCIAL NETWORK

            </h1>
            {getWarning()}
          </div>
        </div>

        <div class="row">
          <form action="" method="">
            <div class="mb-3 form-floating">

              <input type="text" id="loginUsername" placeholder="username" class="form-control" required />
              <label for="loginUsername" class="form-label " >Username</label>
            </div>
            <div class="mb-3 form-floating">
              <input type="password" class="form-control" id="loginPassword" placeholder="password" required />
              <label for="loginPassword" class="form-label" >Password</label>
            </div>
            <div class="d-grid gap-2">
              <button type="submit" class="btn btn-primary">LOG IN</button>
              <Link to="/register" class="btn btn-secondary" > OR SIGN UP </Link>
            </div>

          </form>
        </div>


      </div >

    </div >
  )

}