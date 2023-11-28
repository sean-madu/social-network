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
            setAuthors(json.results)
            //fetchAuthorWill(json.results);
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

  const fetchAuthorWill = (authors) => {
    const url = 'https://social-distribution-backend-f20f02be801f.herokuapp.com/service/authors';
    const username = 'teamgood';
    const password = 'cmput404';

    const headers = new Headers();
    headers.append('Authorization', 'Basic ' + btoa(username + ":" + password));

    fetch(url, { method: 'GET', headers: headers })
      .then(response => response.json())
      .then(data => {
        console.log(data)
        fetchAuthorWill2(data.items.concat(authors));
      })
      .catch((error) => console.error('Error:', error));

  }

  const demoPost = (id) => {

    const username = 'teamgood';
    const password = 'cmput404';

    const headers = new Headers();
    headers.append('Authorization', 'Basic ' + btoa(username + ":" + password));
    fetch(`${id}/posts`, { headers })
      .then((res) => { console.log(res); return res.json() })
      .then((j) => j)
  }
  const fetchAuthorWill2 = (authors) => {
    const url = 'https://whoiswill-3e3036d66f5f.herokuapp.com/service/authors/';
    const username = 'teamgood';
    const password = 'cmput404';

    const headers = new Headers();
    headers.append('Authorization', 'Basic ' + btoa(username + ":" + password));

    fetch(url)
      .then(response => {
        console.log(response, "will2")
        if (response.ok)
          return response.json()
        else {

          console.log(response, "will2")
        }
      })
      .then(data => {
        console.log(authors, "willa")
        let all = data.items.concat(authors)
        setAuthors(all)
      })
      .catch((error) => console.error('Error:', error));

  }


  useEffect(() => {

    fetchAuthors();


  }, []);



  const getActor = (id) => {
    headers = { 'Authorization': `Bearer ${getCookie("access")}` }
    console.log(userID)
    return fetch(userID, { headers })
      .then((res) => res.json())
      .then((json) => {
        handleSumbitReq(id, json)

      })
  }

  const handleSumbitReq = (authorID, actor, redo = true) => {
    let url
    if (authorID.startsWith(SERVER_ADDR)) {
      headers = { 'Authorization': `Bearer ${getCookie("access")}`, 'Content-Type': 'application/json' }
      url = `${authorID}inbox/`
    }
    else {
      const username = 'teamgood';
      const password = 'cmput404';


      headers = { 'Authorization': 'Basic ' + btoa(username + ":" + password), 'Content-Type': 'application/json' };
      url = `${authorID}/inbox`
    }
    console.log(userID)
    console.log(authorID)
    let req = JSON.stringify({
      "type": "Follow",
      "summary": "Follow request from team==good (sorry to fix)",
      "actor": actor,
      "object": authors.find((elem) => elem.id == authorID)
    })
    console.log(req)
    fetch(url,
      {
        method: "POST",
        body: req, headers
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
        else {
          console.log(res)
          //res.json().then((j) => (console.log(j)))
          res.text().then((t) => console.log(t))
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
                {!author.following && <button type="button" onClick={(e) => { getActor(author.id); demoPost(author.id) }} class="btn btn-primary">SEND FOLLOW REQUEST</button>}

              </li>
            })}
          </ul>
        </div>
      </div>

    </div>
  </>
} 