/*Profile homepage of user
props {
  notUser : bool to know if the person viewing this component is the currentUser
  getAuthor: Function to tell parent component to refresh authour
  username: String for the username of the profile person
  userPosts: The posts of the user 
  getUserPosts: Function to tell prent to refresh page with updated user posts 
}
 */
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/js/dist/collapse';
import 'bootstrap/js/dist/offcanvas';
import { useState, useEffect } from 'react';
import Posts from '../stream/Stream';
import SERVER_ADDR from '../serverAddress';
export default function ProfilePage(props) {


  let notUser = props.notUser
  const [selectedImage, setSelectedImage] = useState(null);
  const urlParams = new URLSearchParams(window.location.search);
  const userID = urlParams.get('user');


  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files && e.target.files[0];
    setSelectedImage(file);
  };

  let profilePicDim = "150"
  //TODO fetch the actual profile, if no profile then display this
  let getProfilePic = () => {
    return <svg xmlns="http://www.w3.org/2000/svg" width={profilePicDim} height={profilePicDim} fill="currentColor" class="bi bi-person-fill" viewBox="0 0 16 16">
      <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3Zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
    </svg>
  }


  const handleProfileSubmit = (e) => {
    e.preventDefault()
    fetch(`${SERVER_ADDR}authors/${userID}/`,
      {
        method: "POST",
        body: JSON.stringify({
          displayName: document.getElementById('profile-username-input').value

        }),
        headers: {
          "Content-type": "application/json; charset=UTF-8"
        }
      })
      .then((res) => {
        if (res.ok) {
          props.getAuthor()
          alert("Profile updated!")

        }
      })


  }

  let editProfileDiv = () => {
    return (
      <>
        <div style={{ position: 'fixed', top: "10%", left: "25%", backgroundColor: "white", width: "50%" }} className='d-flex justify-content-center'>

          <form className='p-5'>
            <div class="mb-3">
              <label for="exampleFormControlInput1" class="form-label">Username</label>
              <input type="" class="form-control" id="profile-username-input" placeholder="enter new username..." />
            </div>
            <div class="mb-3">
              <label for="exampleFormControlInput1" class="form-label">Password</label>
              <input type="email" class="form-control" id="exampleFormControlInput1" placeholder="name@example.com" />
            </div>
            <div class="mb-3">
              <label for="exampleFormControlInput1" class="form-label">Link GitHub Activity with username</label>
              <input type="email" class="form-control" id="exampleFormControlInput1" placeholder="Or however we do this" />
            </div>
            {/* Image Upload */}
            <div className="mb-3">
              <label className="mb-0">Upload Image:</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="form-control"
              />
            </div>

            {/* Display selected image */}
            {selectedImage && (
              <div className="mb-3">
                <img
                  src={URL.createObjectURL(selectedImage)}
                  alt="Selected"
                  className="img-fluid"
                />
              </div>
            )}

            <button onClick={(e) => handleProfileSubmit(e)} class="btn btn-primary mb-5">SUBMIT</button>


          </form>

        </div>
      </>
    )
  }

  const userOptions = () => {
    return (
      <>

        <div className='row justify-content-center'>
          <div className='card-header' />
          <div className='card-body'>
            <button className='btn btn-primary' type='button' data-bs-toggle="offcanvas" data-bs-target="#offcanvasTop" aria-controls="offcanvasTop">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-fill" viewBox="0 0 16 16">
                <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z" />
              </svg>
              EDIT PROFILE
            </button>

            <div class="offcanvas offcanvas-top" tabindex="-1" id="offcanvasTop" aria-labelledby="offcanvasTopLabel" style={{ backgroundColor: "black" }}>
              <div class="offcanvas-header">
                <h5 class="offcanvas-title" id="offcanvasExampleLabel" style={{ color: "wheat" }}>Edit Profile</h5>
                <button type="button" class="btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close" ></button>
              </div>
              <div class="offcanvas-body">
                {editProfileDiv()}
              </div>
            </div>

          </div>
        </div>

        <div className='row justify-content-center'>
          <div className='card-header' />
          <div className='card-body'>

            <button class="btn btn-primary" type="button" data-bs-toggle="collapse" data-bs-target="#collapseExample" aria-expanded="false" aria-controls="collapseExample">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-gear-fill" viewBox="0 0 16 16">
                <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z" />
              </svg> SETTINGS
            </button>
            <div className='collapse p-2' id='collapseExample'>
              <button className='btn btn-secondary' type='button'> SIGN OUT </button>
            </div>


          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div style={{ display: "flex", height: "70vh", alignItems: "center", flexDirection: "column", marginLeft: "5%" }} className='p-5'>
        <div className='container p-5'>
        <div className='row'>
            <div class="card" >
              <div class="card-body">
                <div className='container text-center'>
                  <div className='row'>
                    <div className='col'>
                      {getProfilePic()}
                    </div>
                    <div className='col'>
                      <div className='container text-center'>
                        <div className='row'>
                          <h6 class="card-subtitle mb-2 text-body-secondary">USERNAME</h6>
                        </div>
                        <div className='row justify-content-center'>
                          {props.username}
                        </div>
                      </div>
                    </div>
                    <div className='col'>
                      <div className='container text-center'>
                        <div className='row'>
                          <h6 class="card-subtitle mb-2 text-body-secondary">FOLLOWING</h6>
                        </div>
                        <div className='row justify-content-center'>
                          0
                        </div>
                      </div>
                    </div>
                    <div className='col'>
                      <div className='container text-center'>
                        <div className='row'>
                          <h6 class="card-subtitle mb-2 text-body-secondary">FOLLOWERS</h6>
                        </div>
                        <div className='justify-content-center'>
                          0
                        </div>
                      </div>
                    </div>
                    <div className='col'>
                      {notUser && <button className='btn btn-primary'> SEND A FOLLOW REQUEST</button>}
                    </div>

                  </div>
                  <div className='row justify-content-center'>
                    <div className='card-header' />
                    <div className='card-body'>
                      <button class="btn btn-primary" type="button" data-bs-toggle="collapse" data-bs-target="#gitHubActivityContent" aria-expanded="false" aria-controls="gitHubActivityContent">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-github" viewBox="0 0 16 16">
                          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
                        </svg> GitHub Activity
                      </button>
                      <div className='collapse' id='gitHubActivityContent'>
                        <h1>THIS IS WHERE THE GITHUB CONTENT WILL BE ONCE WE GET THE API</h1>
                      </div>

                    </div>
                  </div>
                  {/** Only allow editing when the viewer is the user */}
                  {!notUser && userOptions()}
                </div>
            </div>
          </div>
        </div>
          {/* Posts by the User */}
          <div className='row' >
            <Posts posts={props.userPosts} getPosts={props.getUserPosts} proxy={true} user={true} />
          </div>
        </div>
      </div>
    </>
  )
}