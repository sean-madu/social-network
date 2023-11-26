import { useEffect, useState } from "react"
import SERVER_ADDR from "../serverAddress";
import { refreshCookies } from "../getCookies";
import getCookie from "../getCookies";
import { json } from "react-router-dom";
export default function AuthorList(props) {
  const [authors, setAuthors] = useState([]);
  const userID = `${SERVER_ADDR}authors/${new URLSearchParams(window.location.search).get('user')}`
  const checkFollowing = (authors, redo = true) => {

    fetch(`${userID}/followers`, { headers })
      .then((res) => {
        if (res.status == 401 && redo) {
          refreshCookies(() => {
            headers = { 'Authorization': `Bearer ${getCookie("access")}` }
            checkFollowing(authors, false);
          })
        }
        else if (res.ok) {
          res.json().then((json) => {
            console.log(json, "results")
            json.forEach((follower) => {
              let temp = authors
              temp.forEach((e) => {
                if (e.id == follower.actor) {
                  e['following'] = true
                }
                else if (e.id == userID) {
                  e['following'] = false
                }
                else if (e['following'] == null) {
                  //True never gets set back to false
                  e['following'] = false

                }

              })
              setAuthors(temp)

            })

          })
        }
        else {
          res.json().then((json) => {
            console.log("failed to get author followers", json)
          })
        }
      })

  }
  let headers = { 'Authorization': `Bearer ${getCookie("access")}` }
  //TODO add thing to fetch remote authors
  const fetchAuthors = (redo = true) => {
    fetch(`${SERVER_ADDR}authors/`, { headers })
      .then((res) => {
        if (res.ok) {
          res.json().then((json) => {
            //checkFollowing(json.results); TODO reccorect to work properly 
            setAuthors(json.results);

          })
        }
        else if (res.status == 401 && redo) {
          refreshCookies(() => {
            headers = { 'Authorization': `Bearer ${getCookie("access")}` }
            fetchAuthors(false)

          })
        }
        else {
          res.json().then((j) => console.log(j, "fetch in author list failed"))
        }
      })
  }


  useEffect(() => {

    fetchAuthors();


  }, []);


  const handleSumbitReq = (authorID, redo = true) => {
    if (authorID.startsWith(SERVER_ADDR)) {
      headers = { 'Authorization': `Bearer ${getCookie("access")}` }
    }
    else {
      //TODO 
    }
    fetch(`${authorID}inbox`,
      {
        method: "POST",
        body: JSON.stringify({
          "type": "Follow",
          "summary": "Follow request from team==good (sorry to fix)",
          "actor": userID,
          "object": authorID
        }),
        headers
      })
      .then((res) => {
        if (res.ok) {
          alert('REQUEST SENT')
        }
        else if (res.status == 401 && redo) {
          refreshCookies(() => {
            headers = { 'Authorization': `Bearer ${getCookie("access")}` }
            handleSumbitReq(authorID, false)
          })
        }
      })
  }
  return <>
    <div style={{ display: "flex", height: "70vh", alignItems: "center", flexDirection: "column", marginLeft: "5%" }} className='p-5'>
      <div className='container p-5'>
        <div className="row">
          <h1> AUTHOR LIST</h1>
          <h3> Maybe follow a couple...</h3>
        </div>
        <div className="row">
          <ul class="list-group">
            {authors.map((author) => {
              return <li class="list-group-item" key={author.id}>

                <div className="p-2">{author.displayName}</div>
                {!author.following && <button type="button" onClick={(e) => { handleSumbitReq(author.id) }} class="btn btn-primary">SEND FOLLOW REQUEST</button>}
              </li>
            })}
          </ul>
        </div>
      </div>

    </div>
  </>
} 