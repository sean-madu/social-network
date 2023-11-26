/*
The react component to show friend requests
props{
  requests: List of JSON objects of friend requests
  setRequests: Fuction that sets the props of the parent component
}
*/
import 'bootstrap/dist/css/bootstrap.css';
import { useState } from 'react';
import getCookie, { refreshCookies } from '../getCookies';


export default function FriendRequestsList(props) {

  let requests = props.friendRequests
  let setRequests = props.setRequests


  //TODO actually send stuff to the db
  //TODO add react transitions to these
  const handleReject = (id) => {
    const remainingRequests = requests.filter((request) => id !== request.id);
    setRequests(remainingRequests);

  }
  const acceptFollow = (item, redo = true) => {
    console.log(item.actor)
    fetch(`${item.object}followers/${item.actor.slice(item.actor.indexOf("authors/") + 8)}`,
      {
        method: "PUT",
        body: JSON.stringify({
          "type": "follow",
          "summary": "Follow request from team==good (sorry to fix)",
          "actor": item.actor,
          "object": item.object,
        }),
        headers: {
          'Authorization': `Bearer ${getCookie("access")}`,
          'Content-Type': 'application/json',
        }
      })
      .then((res) => {
        if (res.status == 401 && redo) {
          refreshCookies(() => {
            acceptFollow(item, false)
          })
        }
        else if (res.ok) { alert("Request accepted!") }
        else {
          console.log(res)
          res.json().then((j) => console.log(j))
        }
      })


  }

  const handleAccept = (item) => {
    acceptFollow(item)
  }

  //Map friend requests to react components for the UI
  const makeListItems = () => {
    return requests.map((item) => {
      console.log(item)

      return (
        <li key={item.id} className='list-group-item'>
          <div className='container'>
            <div className='row'>
              <div className='column pt-2'>
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" class="bi bi-person-circle" viewBox="0 0 16 16">
                  <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                  <path fill-rule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z" />
                </svg>
              </div>
              <div className='column pt-2'>
                <p> Friend Request from {item.actor.slice(0, 20)}... (display name eventually) </p>
                <div className='btn-group' role='group'>
                  <button type="button" onClick={(e) => { handleAccept(item) }} class="btn btn-outline-success">
                    <span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-hand-thumbs-up-fill" viewBox="0 0 16 16">
                        <path d="M6.956 1.745C7.021.81 7.908.087 8.864.325l.261.066c.463.116.874.456 1.012.965.22.816.533 2.511.062 4.51a9.84 9.84 0 0 1 .443-.051c.713-.065 1.669-.072 2.516.21.518.173.994.681 1.2 1.273.184.532.16 1.162-.234 1.733.058.119.103.242.138.363.077.27.113.567.113.856 0 .289-.036.586-.113.856-.039.135-.09.273-.16.404.169.387.107.819-.003 1.148a3.163 3.163 0 0 1-.488.901c.054.152.076.312.076.465 0 .305-.089.625-.253.912C13.1 15.522 12.437 16 11.5 16H8c-.605 0-1.07-.081-1.466-.218a4.82 4.82 0 0 1-.97-.484l-.048-.03c-.504-.307-.999-.609-2.068-.722C2.682 14.464 2 13.846 2 13V9c0-.85.685-1.432 1.357-1.615.849-.232 1.574-.787 2.132-1.41.56-.627.914-1.28 1.039-1.639.199-.575.356-1.539.428-2.59z" />
                      </svg>
                      <p>ACCEPT </p>
                    </span>
                  </button>

                  <button type="button" onClick={(e) => { handleReject(item) }} class="btn btn-outline-danger">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-hand-thumbs-down-fill" viewBox="0 0 16 16">
                      <path d="M6.956 14.534c.065.936.952 1.659 1.908 1.42l.261-.065a1.378 1.378 0 0 0 1.012-.965c.22-.816.533-2.512.062-4.51.136.02.285.037.443.051.713.065 1.669.071 2.516-.211.518-.173.994-.68 1.2-1.272a1.896 1.896 0 0 0-.234-1.734c.058-.118.103-.242.138-.362.077-.27.113-.568.113-.856 0-.29-.036-.586-.113-.857a2.094 2.094 0 0 0-.16-.403c.169-.387.107-.82-.003-1.149a3.162 3.162 0 0 0-.488-.9c.054-.153.076-.313.076-.465a1.86 1.86 0 0 0-.253-.912C13.1.757 12.437.28 11.5.28H8c-.605 0-1.07.08-1.466.217a4.823 4.823 0 0 0-.97.485l-.048.029c-.504.308-.999.61-2.068.723C2.682 1.815 2 2.434 2 3.279v4c0 .851.685 1.433 1.357 1.616.849.232 1.574.787 2.132 1.41.56.626.914 1.28 1.039 1.638.199.575.356 1.54.428 2.591z" />
                    </svg>
                    <p>REJECT</p></button>
                </div>


              </div>
            </div>
          </div>
        </li>
      )
    })
  }



  return (
    <>
      <div style={{ display: "flex", height: "70vh", alignItems: "center", flexDirection: "column" }} className='p-5'>
        <h1> FRIEND REQUESTS </h1>
        {requests.length == 0 && <h2> You don't have any friend requests </h2>}
        <ul className="list-group">
          {makeListItems()}
        </ul>
      </div >
    </>
  )
}