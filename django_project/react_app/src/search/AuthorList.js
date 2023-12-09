import { useEffect, useState, useRef, version } from "react"
import SERVER_ADDR from "../serverAddress";
import { refreshCookies } from "../getCookies";
import getCookie from "../getCookies";
import { json } from "react-router-dom";
import * as NODES from "../Nodes"
import Posts from "../stream/Stream";


export default function AuthorList(props) {

  const [authors, setAuthors] = useState([]);
  const [viewing, setViewing] = useState("");
  const [posts, setPosts] = useState([]);
  const userID = `${SERVER_ADDR}authors/${new URLSearchParams(window.location.search).get('user')}`

  let headers = { 'Authorization': `Bearer ${getCookie("access")}` }
  const fetchAuthors = (redo = true) => {
    fetch(`${SERVER_ADDR}service/authors`, { headers })
      .then((res) => {
        if (res.ok) {
          res.json().then((json) => {

            setAuthors(json.items)
            NODES.executeOnRemote((json) => {

              let nodeAuthors = json.items


              setAuthors(prev => {

                let arr = [...prev, ...nodeAuthors]

                return arr
              })


            }, "GET", "authors/", true)

          })
        }
        else if (res.status == 401 && redo) {
          refreshCookies(() => {
            headers = { 'Authorization': `Bearer ${getCookie("access")}` }
            fetchAuthors(false)
            //Get all authors anf log it out

          })
        }
        else {
          res.text().then((t) => console.log(t, "fetxh in uth list failed"))
          //res.json().then((j) => console.log(j, "fetch in author list failed"))
        }
      })
  }


  useEffect(() => {

    fetchAuthors();


  }, []);

  const getPosts = (redo = true) => {
    console.log(viewing, "VIEWING THING")
    if (viewing == "") {
      setPosts([])
    }
    else if (viewing.startsWith(SERVER_ADDR)) {
      console.log("loal viewing thing")
      let headers = { 'Authorization': `Bearer ${getCookie("access")}` }
      fetch(viewing + "/posts/", {
        headers
      })
        .then((res) => {
          if (res.ok) {
            res.json().then((j) => {

              setPosts(j.items.filter((val, index, arr) => { return val.visibility == "PUBLIC" }))
            })
          }
          else if (res.status == 401 && redo) {
            refreshCookies(() => {
              getPosts(false)
            })
          }
          else {
            console.log(res)
            res.text().then((t) => console.log(t))
          }
        })
    }
    else {
      NODES.executeOnRemote((j) => { setPosts(j.items.filter((val, index, arr) => { return val.visibility.toUpperCase() == "PUBLIC" })); console.log("Got remote post", j) }, 'GET', viewing + "/posts/", false, null, viewing)
    }

  }
  useEffect(() => {

    getPosts()

  }, [viewing]);

  //For some reaso, fetching authors runs more than once...
  const filterArr = (arr) => {
    let copy = arr.slice(0)
    copy = copy.map((element) => {
      return JSON.stringify(element)
    });
    let unique = Array.from(new Set(copy))
    unique = unique.map((elem) => {

      return JSON.parse(elem)
    })
    return unique
  }



  const getActor = (id, redo = true) => {
    headers = { 'Authorization': `Bearer ${getCookie("access")}` }
    return fetch(userID + "/", { headers })
      .then((res) => {
        if (res.status == 401 && redo) {
          refreshCookies(() => {
            getActor(id, false)
          })
        }
        else if (res.ok) {
          return res.json()
        }
      })
      .then((json) => {

        handleSumbitReq(id, json)

      })
  }


  const handleSumbitReq = (authorID, actor, redo = true) => {

    let object = authors.find((elem) => elem.id == authorID)
    let req = JSON.stringify({
      "type": "Follow",
      "summary": `${actor.displayName} wants to follow ${object.displayName}`,
      "actor": actor,
      "object": object
    })
    if (authorID.startsWith(SERVER_ADDR)) {
      let url = `${authorID}/inbox`
      headers = { 'Authorization': `Bearer ${getCookie("access")}`, 'Content-Type': 'application/json' }

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
            res.text().then((t) => console.log(t))
          }
        })
    }
    else {
      let path = authorID + "/inbox"
      NODES.executeOnRemote((j) => { alert(`Request sent to remote server!`) }, 'POST', path, false, req, object.host)
    }



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
            { //For some reason fetch authors runs twice so we need to fiilter it

              filterArr(authors)
                .map((author) => {

              return <li class="list-group-item" key={author.id}>

                <div className="p-2">{author.displayName}</div>
                {!author.following && <button type="button" onClick={(e) => { getActor(author.id) }} class="btn btn-primary">SEND FOLLOW REQUEST</button>}
                <button type="button" onClick={(e) => {
                  if (viewing == author.id) {
                    setViewing("")
                  }
                  else { setViewing(author.id) }
                }} className="btn btn-primary m-2"> SEE PUBLIC POSTS </button>
                {viewing === author.id && <Posts posts={posts} ></Posts>}
              </li>
            })}
          </ul>
        </div>
      </div>

    </div>
  </>
} 