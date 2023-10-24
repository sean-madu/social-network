
import 'bootstrap/dist/css/bootstrap.css';
import NotificationList from '../inbox/NotificationList';
import FriendRequestsList from '../inbox/FriendRequestsList';
import { useState } from 'react';


export default function Homepage() {

  const [activeNav, setActiveNav] = useState(1);

  //We should query for the actual things here
  let testNotifs = [
    { type: "comment", displayName: "sean", post: { text: "I love React so so so so so much so sos os os " }, comment: "Yoo this looks fire" },
    { type: "comment", displayName: "sean2", post: { text: "I love React" }, comment: "Wow please delete your account" },
    { type: "like", displayName: "sham1", post: { text: "Setting up React is a pain" } }

  ];
  let testFollows = [{ id: "1", displayName: "sean" }, { id: "2", displayName: "-250 IQ points" }];

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

