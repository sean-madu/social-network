import "./LoginForm.css"
import { Link } from "react-router-dom";
import SERVER_ADDR from "../serverAddress";
import { useState } from "react";
import getCookie from "../getCookies";
export default function LoginForm() {

  let [error, setError] = useState(false)

  //If not found then display a warning
  const getWarning = () => {
    return <div class="alert alert-danger" role="alert">
      Combination of Username and Password not found! If you have not made an account consider <Link to="/register" class="alert-link" > making one here </Link>
    </div>
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    fetch(`${SERVER_ADDR}auth/login/`,
      {
        method: "POST",
        body: JSON.stringify(
          {
            username: `${document.getElementById("loginUsername").value}`,
            password: `${document.getElementById("loginPassword").value}`,

          }
        ),
        headers: {
          "Content-type": "application/json; charset=UTF-8"
        }
      })
      .then((res) => {
        if (res.ok) {
          //Sucessfully posted
          res.json().then((json) => {
            console.log(json)
            //Save cookies
            document.cookie = `access=${json.access};`
            document.cookie = `refresh=${json.refresh};`
            window.location.href = "homepage/"
          })
        }
        else {
          setError(true)
          res.json().then((json) => { console.log(json) })
        }
      })
  }

  return (
    <div style={{ display: "flex", height: "70vh", justifyContent: "center", alignItems: "center" }}>
      <div class="container">

        <div class="row">
          <div class="col align-self-center">
            <h1>
              LOG INTO THE SOCIAL NETWORK

            </h1>
            {error && getWarning()}
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
              <button onClick={(e) => { handleSubmit(e) }} class="btn btn-primary">LOG IN</button>
              <Link to="/register" class="btn btn-secondary" > OR SIGN UP </Link>
              <Link to="/defaultUser" > Place holder till user backend is finished</Link>

            </div>

          </form>
        </div>


      </div >

    </div >
  )

}