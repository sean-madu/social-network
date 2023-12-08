import "./LoginForm.css"
import { Link } from "react-router-dom";
import SERVER_ADDR from "../serverAddress";
import { useState } from "react";
export default function SignupForm() {


  //TODO the form tag work with django, fill in the action and method part of form

  const [error, setError] = useState("")




  const getWarning = () => {
    return error.length != 0 && <div class="alert alert-danger" role="alert">
      <p>Error! Your username might be in use already!</p>&#128547; Do you mean to<Link to="/" class="alert-link" > Login instead? </Link>
    </div>
  }


  //TODO handle the case that display name already exists
  //TODO allow the users to add their own pfp
  const handleSubmit = (e) => {
    e.preventDefault()
    fetch(`${SERVER_ADDR}service/register/`,
      {
        method: "POST",
        body: JSON.stringify(
          {
            Username: `${document.getElementById("loginUsername").value}`,
            Password: `${document.getElementById("loginPassword").value}`,

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
            alert("Sucessful signup! Wait for an admin to verify you")
            setError("")
            window.location.href = `/`
          })
        }
        else {
          res.json().then((json) => { setError(json.error) })
        }
      })
  }

  return (
    <div style={{ display: "flex", height: "70vh", justifyContent: "center", alignItems: "center" }}>
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
            <div class="d-grid gap-2">
              <button onClick={(e) => { handleSubmit(e) }} class="btn btn-primary">SIGN UP</button>
              <Link to="/" class="btn btn-secondary" > OR LOGIN</Link>
            </div>

          </form>
        </div>


      </div >

    </div>
  )

}