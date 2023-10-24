
import 'bootstrap/dist/css/bootstrap.css';
import NotificationList from '../inbox/NotificationList';
import FriendRequestsList from '../inbox/FriendRequestsList';
import { useState } from 'react';


export default function Homepage() {
  //TODO make the number actually change when user uses it 
  //We should query for the actual things here
  let testNotifs = [
    { type: "comment", displayName: "sean", post: { text: "I love React so so so so so much so sos os os " }, comment: "Yoo this looks fire" },
    { type: "comment", displayName: "sean2", post: { text: "I love React" }, comment: "Wow please delete your account" },
    { type: "like", displayName: "sham1", post: { text: "Setting up React is a pain" } }

  ];
  let testFollows = [{ id: "1", displayName: "sean" }, { id: "2", displayName: "-250 IQ points" }];

  const [activeNav, setActiveNav] = useState(1);





  const handleSelectActiveTab = (val) => {
    setActiveNav(val);
  }
  const renderActiveTabs = () => {
    return (
      <div class="d-flex align-items-start">
        <div class="nav flex-column nav-pills me-3" id="v-pills-tab" role="tablist" aria-orientation="vertical">
          <button className={activeNav == 1 ? "nav-link  active" : " nav-link"} onClick={(e) => { handleSelectActiveTab(1) }} id="v-pills-home-tab" data-bs-toggle="pill" data-bs-target="#v-pills-home" type="button" role="tab" aria-controls="v-pills-home" aria-selected="true">
            <div className='container'>
              <div className='row align-items-center'>
                <div className='col'>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-inbox-fill" viewBox="0 0 16 16">
                    <path d="M4.98 4a.5.5 0 0 0-.39.188L1.54 8H6a.5.5 0 0 1 .5.5 1.5 1.5 0 1 0 3 0A.5.5 0 0 1 10 8h4.46l-3.05-3.812A.5.5 0 0 0 11.02 4H4.98zm-1.17-.437A1.5 1.5 0 0 1 4.98 3h6.04a1.5 1.5 0 0 1 1.17.563l3.7 4.625a.5.5 0 0 1 .106.374l-.39 3.124A1.5 1.5 0 0 1 14.117 13H1.883a1.5 1.5 0 0 1-1.489-1.314l-.39-3.124a.5.5 0 0 1 .106-.374l3.7-4.625z" />
                  </svg>
                </div>
                <div className='col'>
                  Inbox
                </div>
                <div className='col'>
                  <span class="badge rounded-pill text-bg-danger">99+</span>
                </div>
              </div>

            </div>
          </button>
          <button className={activeNav == 2 ? "nav-link active" : "nav-link"} onClick={(e) => { handleSelectActiveTab(2) }} id="v-pills-profile-tab" data-bs-toggle="pill" data-bs-target="#v-pills-profile" type="button" role="tab" aria-controls="v-pills-profile" aria-selected="false">
            <div className='container'>
              <div className='row align-items-center'>
                <div className='col'>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-person-plus-fill" viewBox="0 0 16 16">
                    <path d="M1 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                    <path fill-rule="evenodd" d="M13.5 5a.5.5 0 0 1 .5.5V7h1.5a.5.5 0 0 1 0 1H14v1.5a.5.5 0 0 1-1 0V8h-1.5a.5.5 0 0 1 0-1H13V5.5a.5.5 0 0 1 .5-.5z" />
                  </svg>
                </div>
                <div className='col'>
                  Friend Requests
                </div>
                <div className='col'>
                  <span class="badge rounded-pill text-bg-danger">2</span>
                </div>
              </div>

            </div>
          </button>
        </div>
        <div class="tab-content" id="v-pills-tabContent">
          <div className={activeNav == 1 ? "tab-pane fade show active" : "tab-pane fade"} id="v-pills-home" role="tabpanel" aria-labelledby="v-pills-home-tab" tabindex="0">
            <NotificationList comments={testNotifs} />
          </div>
          <div className={activeNav == 2 ? "tab-pane fade show active" : "tab-pane fade"} id="v-pills-profile" role="tabpanel" aria-labelledby="v-pills-profile-tab" tabindex="0">
            <FriendRequestsList friendRequests={testFollows} />
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

