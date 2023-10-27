import 'bootstrap/dist/css/bootstrap.css';


export default function ProfilePage() {

  let profilePicDim = "150"
  let getProfilePic = () => {
    return <svg xmlns="http://www.w3.org/2000/svg" width={profilePicDim} height={profilePicDim} fill="currentColor" class="bi bi-person-fill" viewBox="0 0 16 16">
      <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3Zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
    </svg>
  }
  return (
    <>
      <div className='container p-5'>
        <div className='row'>
          <div className='col'>

            <div class="card" style={{ width: "30rem" }}>
              <div className='row'>
                {getProfilePic()}
              </div>
              <div className='row'>
                <div className='col'>
                  <div class="card-body">
                    <p class="card-title "> <small class="text-body-secondary">DISPLAY NAME</small></p>
                    <p class="card-text">default</p>
                  </div>
                </div>
                <div className='col'>
                  <div class="card-body">
                    <p class="card-title ">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-github" viewBox="0 0 16 16">
                        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
                      </svg> <small class="text-body-secondary">

                        RECENT GITHUB ACTIVITY</small></p>
                    <p class="card-text">The activity will do here. Maybe make the top a dropdown menu</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
          <div className='col'>
            <div className='d-flex flex-column  align-items-center'>
              <h3> POSTS</h3>
              <h4> 0</h4>
            </div>
          </div>
          <div className='col'>
            <div className='d-flex flex-column  align-items-center'>
              <h3> FRIENDS</h3>
              <h4> 0</h4>
            </div>
          </div>
        </div>
        <div className='row'>
          <h1> Here is where the posts from the user will go</h1>
        </div>

      </div>
    </>
  )
}