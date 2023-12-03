/*
Homepage of an individual user
*/
import 'bootstrap/dist/css/bootstrap.css';
import NotificationList from '../inbox/NotificationList';
import FriendRequestsList from '../inbox/FriendRequestsList';
import AuthorList from '../search/AuthorList';
import ProfilePage from '../profilePage/Profile';
import { useState, useEffect } from 'react';
import Post from '../createPost/Post';
import Posts from '../stream/Stream';
import SERVER_ADDR from '../serverAddress';
import getCookie from '../getCookies';
import { refreshCookies } from '../getCookies';



export default function Homepage() {

  const urlParams = new URLSearchParams(window.location.search);
  const userID = urlParams.get('user');
  let accessCookie = getCookie("access");
  if (!accessCookie) {
    alert("Accessing page without logging in, this page will not work properly, please log in first")
  }
  let headers = { 'Authorization': `Bearer ${accessCookie}` }


  //We should query for the actual things here
  //Maybe recheck these every couple seconds?
  //Consider breaking down into components if this gets to big
  // Places to break it dowm. Navbar buttons can be one component. Whole navbar can be one component
  let testNotifs = [
    {
      type: "comment", displayName: "sean", post: {
        id: SERVER_ADDR + "author/Obama/posts/sjdfnskjdfnksjdfn/comments/jsdfjhsdjfh",
        content: 'This is the content of post 1.',
        liked: false,
        author: 'Obama',
        proxy: true
      }, comment: "Yoo this looks fire"
    },
    {
      type: "comment", displayName: "sean2", post: {
        id: SERVER_ADDR + "author/Rando123/posts/sjdfnskjdfnksjdfn/comments/jsdfjhsdjfhs",
        content: 'This is the content of post 2.',
        liked: true,
        author: 'Rando123',
        proxy: true
      }, comment: "Wow please delete your account"
    },
    {
      type: "like", displayName: "sham1", post: {
        id: SERVER_ADDR + "author/Rando123/posts/sjdfnskjdfnksjdfn/comments/jsdfjhsdjfh",
        content: 'This is the content of post 3.',
        liked: true,
        author: 'Rando123',
        proxy: true
      }
    }

  ];

  //Props
  const [friendRequests, setFriendRequests] = useState([]); //TODO hook this up with the database
  const [activeNav, setActiveNav] = useState(0);
  const [userPosts, setUserPosts] = useState([]);
  const [username, setUsername] = useState("");
  const [posts, setPosts] = useState([]);
  const [notifs, setNotifs] = useState([]);

  const fetchAuthor = () => {
    return fetch(`${SERVER_ADDR}service/authors/${userID}`, { headers })
      .then((res) => {
        if (res.ok) {
          return res.json().then((json) => setUsername(json.displayName))
        } else {
          if (res.status == 401)
            refreshCookies(
              () => {
                headers = { 'Authorization': `Bearer ${getCookie("access")}` }
                return fetch(`${SERVER_ADDR}authors/${userID}`, { headers })
                  .then((res) => {
                    if (res.ok) {
                      return res.json().then((json) => {
                        setUsername(json.displayName)
                      })
                    }
                  })
              }
            )

        }
      })
  }

  const fetchAuthorPosts = () => {
    return fetch(`${SERVER_ADDR}service/authors/${userID}/posts`, { headers })
      .then((res) => {
        if (res.ok) {
          return res.json().then((json) => setUserPosts(json.items))
        }
        else {
          if (res.status == 401)
            refreshCookies(
              () => {
                headers = { 'Authorization': `Bearer ${getCookie("access")}` }
                return fetch(`${SERVER_ADDR}service/authors/${userID}/posts`, { headers })
                  .then((res) => {
                    if (res.ok) {
                      return res.json().then((json) => {
                        setUserPosts(json.items)
                      })
                    }
                  })
              }
            )

        }

      })
  }

  const fetchInbox = (redo = true) => {
    return fetch(`${SERVER_ADDR}service/authors/${userID}/inbox`, { headers })
      .then((res) => {
        if (res.ok) {
          return res.json().then((json) => {
            let followRequests = []
            let posts = []
            let notifs = []
            json.items.forEach((elem) => {
              if (elem.type == "Follow")
                followRequests.push(elem)
              else if (elem.type == 'post')
                posts.push(elem)
              else
                notifs.push(elem)
            })
            setFriendRequests(followRequests)
            setPosts(posts)
            setNotifs(notifs)
          })
        }
        else {
          if (res.status == 401 && redo)
            refreshCookies(
              () => {
                headers = { 'Authorization': `Bearer ${getCookie("access")}` }
                fetchInbox(false)
              }
            )

        }

      })
  }
  //Effects
  useEffect(() => {
    fetchAuthor();
    fetchAuthorPosts();
    fetchInbox();
  }, []);


  const handleSelectActiveTab = (val) => {
    setActiveNav(val);
  }


  //Makes all the navbar buttons
  const makeButton = (num, svg, name, alertNum) => {
    return (
      <button className={activeNav === num ? "nav-link  active" : " nav-link"} onClick={(e) => { handleSelectActiveTab(num) }} id="v-pills-home-tab" data-bs-toggle="pill" data-bs-target="#v-pills-home" type="button" role="tab" aria-controls="v-pills-home" aria-selected="true">
        <div className='container'>
          <div className='row align-items-center'>
            <div className='col'>
              {svg()}
            </div>
            <div className='col'>
              {name}
            </div>
            <div className='col'>
              {alertNum > 99 && <span className="badge rounded-pill text-bg-danger">99+</span>}
              {alertNum > 0 && alertNum < 99 && <span className="badge rounded-pill text-bg-danger">{alertNum}</span>}
            </div>
          </div>

        </div>
      </button>
    )
  }


  //--- Nav Bar pictures
  let homePic = () => {
    return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-house-door-fill" viewBox="0 0 16 16">
      <path d="M6.5 14.5v-3.505c0-.245.25-.495.5-.495h2c.25 0 .5.25.5.5v3.5a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.146-.354L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 7.5v7a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5Z" />
    </svg>
  }

  let inboxPic = () => {
    return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-inbox-fill" viewBox="0 0 16 16">
      <path d="M4.98 4a.5.5 0 0 0-.39.188L1.54 8H6a.5.5 0 0 1 .5.5 1.5 1.5 0 1 0 3 0A.5.5 0 0 1 10 8h4.46l-3.05-3.812A.5.5 0 0 0 11.02 4H4.98zm-1.17-.437A1.5 1.5 0 0 1 4.98 3h6.04a1.5 1.5 0 0 1 1.17.563l3.7 4.625a.5.5 0 0 1 .106.374l-.39 3.124A1.5 1.5 0 0 1 14.117 13H1.883a1.5 1.5 0 0 1-1.489-1.314l-.39-3.124a.5.5 0 0 1 .106-.374l3.7-4.625z" />
    </svg>
  }

  let friendRequestsPic = () => {
    return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-person-plus-fill" viewBox="0 0 16 16">
      <path d="M1 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
      <path fillRule="evenodd" d="M13.5 5a.5.5 0 0 1 .5.5V7h1.5a.5.5 0 0 1 0 1H14v1.5a.5.5 0 0 1-1 0V8h-1.5a.5.5 0 0 1 0-1H13V5.5a.5.5 0 0 1 .5-.5z" />
    </svg>
  }

  let createPic = () => {
    return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-plus-square-fill" viewBox="0 0 16 16">
      <path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2zm6.5 4.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3a.5.5 0 0 1 1 0z" />
    </svg>
  }

  let navProfilePic = () => {
    return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-person-fill" viewBox="0 0 16 16">
      <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3Zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
    </svg>
  }

  let searchPic = () => {
    return <i class="bi bi-search"></i>
  }
  //Makes the navbar content
  const renderActiveTabs = () => {
    return (
      <div className="d-flex align-items-center w-100 h-100">
        <div className="nav flex-column nav-pills h-100 " style={{ width: "15%", position: "fixed", left: "0%", top: "30%" }} id="v-pills-tab" role="tablist" aria-orientation="vertical">
          {makeButton(0, homePic, "Home", posts.length)}
          {makeButton(1, inboxPic, "Inbox", notifs.length)}
          {makeButton(2, friendRequestsPic, "Friend Requests", friendRequests.length)}
          {makeButton(3, createPic, "Create Post", 0)}
          {makeButton(4, navProfilePic, "Profile", 0)}
          {makeButton(5, searchPic, "Find Friends", 0)}

        </div>

        <div className="tab-content  mx-auto" style={{ width: "85%" }} id="v-pills-tabContent">
          <div className={activeNav === 0 ? "tab-pane fade show active" : "tab-pane fade"} id="v-pills-profile" role="tabpanel" aria-labelledby="v-pills-profile-tab" tabIndex="0">
            <Posts posts={posts} />
          </div>
          <div className={activeNav === 1 ? "tab-pane fade show active" : "tab-pane fade"} id="v-pills-home" role="tabpanel" aria-labelledby="v-pills-home-tab" tabIndex="0">
            <NotificationList comments={notifs} />
          </div>
          <div className={activeNav === 2 ? "tab-pane fade show active" : "tab-pane fade"} id="v-pills-profile" role="tabpanel" aria-labelledby="v-pills-profile-tab" tabIndex="0">
            <FriendRequestsList friendRequests={friendRequests} setRequests={setFriendRequests} />
          </div>
          <div className={activeNav === 3 ? "tab-pane fade show active" : "tab-pane fade"} id="v-pills-profile" role="tabpanel" aria-labelledby="v-pills-profile-tab" tabIndex="0">
            <Post getPosts={fetchAuthorPosts} editing={false} />
          </div>
          <div className={activeNav === 4 ? "tab-pane fade show active" : "tab-pane fade"} id="v-pills-profile" role="tabpanel" aria-labelledby="v-pills-profile-tab" tabIndex="0">
            <ProfilePage userPosts={userPosts} getUserPosts={fetchAuthorPosts} username={username} notUser={false} getAuthor={fetchAuthor} />
          </div>
          <div className={activeNav === 5 ? "tab-pane fade show active" : "tab-pane fade"} id="v-pills-profile" role="tabpanel" aria-labelledby="v-pills-profile-tab" tabIndex="0">
            <AuthorList />
          </div>

        </div>
      </div >)

  }
  return (
    <>
      {renderActiveTabs()}
    </>
  )
}

