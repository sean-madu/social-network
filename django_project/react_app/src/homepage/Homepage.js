
import 'bootstrap/dist/css/bootstrap.css';
import NotificationList from '../inbox/NotificationList';
import FriendRequestsList from '../inbox/FriendRequestsList';
import { useState } from 'react';


export default function Homepage() {


  //We should query for the actual things here
  //Maybe recheck these every couple seconds?
  let testNotifs = [
    { type: "comment", displayName: "sean", post: { text: "I love React so so so so so much so sos os os " }, comment: "Yoo this looks fire" },
    { type: "comment", displayName: "sean2", post: { text: "I love React" }, comment: "Wow please delete your account" },
    { type: "like", displayName: "sham1", post: { text: "Setting up React is a pain" } }

  ];
  let testFollows = [{ id: "1", displayName: "sean" }, { id: "2", displayName: "-250 IQ points" }];

  const [friendRequests, setFriendRequests] = useState(testFollows);
  const [activeNav, setActiveNav] = useState(1);


  const handleSelectActiveTab = (val) => {
    setActiveNav(val);
  }

  const makeButton = (num, svg, name, alertNum) => {
    return (
      <button className={activeNav == num ? "nav-link  active" : " nav-link"} onClick={(e) => { handleSelectActiveTab(num) }} id="v-pills-home-tab" data-bs-toggle="pill" data-bs-target="#v-pills-home" type="button" role="tab" aria-controls="v-pills-home" aria-selected="true">
        <div className='container'>
          <div className='row align-items-center'>
            <div className='col'>
              {svg()}
            </div>
            <div className='col'>
              {name}
            </div>
            <div className='col'>
              {alertNum > 99 && <span class="badge rounded-pill text-bg-danger">99+</span>}
              {alertNum > 0 && alertNum < 99 && <span class="badge rounded-pill text-bg-danger">{alertNum}</span>}
            </div>
          </div>

        </div>
      </button>
    )
  }

  let homePic = () => {
    return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-house-door-fill" viewBox="0 0 16 16">
      <path d="M6.5 14.5v-3.505c0-.245.25-.495.5-.495h2c.25 0 .5.25.5.5v3.5a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.146-.354L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 7.5v7a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5Z" />
    </svg>
  }

  let inboxPic = () => {
    return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-inbox-fill" viewBox="0 0 16 16">
      <path d="M4.98 4a.5.5 0 0 0-.39.188L1.54 8H6a.5.5 0 0 1 .5.5 1.5 1.5 0 1 0 3 0A.5.5 0 0 1 10 8h4.46l-3.05-3.812A.5.5 0 0 0 11.02 4H4.98zm-1.17-.437A1.5 1.5 0 0 1 4.98 3h6.04a1.5 1.5 0 0 1 1.17.563l3.7 4.625a.5.5 0 0 1 .106.374l-.39 3.124A1.5 1.5 0 0 1 14.117 13H1.883a1.5 1.5 0 0 1-1.489-1.314l-.39-3.124a.5.5 0 0 1 .106-.374l3.7-4.625z" />
    </svg>
  }

  let friendRequestsPic = () => {
    return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-person-plus-fill" viewBox="0 0 16 16">
      <path d="M1 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
      <path fill-rule="evenodd" d="M13.5 5a.5.5 0 0 1 .5.5V7h1.5a.5.5 0 0 1 0 1H14v1.5a.5.5 0 0 1-1 0V8h-1.5a.5.5 0 0 1 0-1H13V5.5a.5.5 0 0 1 .5-.5z" />
    </svg>
  }

  let profileSettingPic = () => {
    return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-person-fill-gear" viewBox="0 0 16 16">
      <path d="M11 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm-9 8c0 1 1 1 1 1h5.256A4.493 4.493 0 0 1 8 12.5a4.49 4.49 0 0 1 1.544-3.393C9.077 9.038 8.564 9 8 9c-5 0-6 3-6 4Zm9.886-3.54c.18-.613 1.048-.613 1.229 0l.043.148a.64.64 0 0 0 .921.382l.136-.074c.561-.306 1.175.308.87.869l-.075.136a.64.64 0 0 0 .382.92l.149.045c.612.18.612 1.048 0 1.229l-.15.043a.64.64 0 0 0-.38.921l.074.136c.305.561-.309 1.175-.87.87l-.136-.075a.64.64 0 0 0-.92.382l-.045.149c-.18.612-1.048.612-1.229 0l-.043-.15a.64.64 0 0 0-.921-.38l-.136.074c-.561.305-1.175-.309-.87-.87l.075-.136a.64.64 0 0 0-.382-.92l-.148-.045c-.613-.18-.613-1.048 0-1.229l.148-.043a.64.64 0 0 0 .382-.921l-.074-.136c-.306-.561.308-1.175.869-.87l.136.075a.64.64 0 0 0 .92-.382l.045-.148ZM14 12.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0Z" />
    </svg>
  }



  const renderActiveTabs = () => {
    return (
      <div class="d-flex align-items-center w-75">
        <div class="nav flex-column nav-pills" id="v-pills-tab" role="tablist" aria-orientation="vertical">
          {makeButton(0, homePic, "Home", 0)}
          {makeButton(1, inboxPic, "Inbox", 100)}
          {makeButton(2, friendRequestsPic, "Friend Requests", friendRequests.length)}
          {makeButton(3, profileSettingPic, "Profile Settings", 0)}
        </div>
        <div class="tab-content  mx-auto" id="v-pills-tabContent">
          <div className={activeNav == 1 ? "tab-pane fade show active" : "tab-pane fade"} id="v-pills-home" role="tabpanel" aria-labelledby="v-pills-home-tab" tabindex="0">
            <NotificationList comments={testNotifs} />
          </div>
          <div className={activeNav == 2 ? "tab-pane fade show active" : "tab-pane fade"} id="v-pills-profile" role="tabpanel" aria-labelledby="v-pills-profile-tab" tabindex="0">
            <FriendRequestsList friendRequests={friendRequests} setRequests={setFriendRequests} />
          </div>
        </div>
      </div >)

  }
  //Todo change some of these default values to work with the username
  return (
    <>
      {renderActiveTabs()}
    </>
  )
}

