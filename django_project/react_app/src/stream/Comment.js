/** This component displays the comments on a post
 * 
 * props {
 *  comment: JSON object of the comment
 *   
 * }
 */
import { useState, useEffect } from "react";
import SERVER_ADDR from "../serverAddress";
import { refreshCookies } from "../getCookies";
import getCookie from "../getCookies";
export default function Comment(props) {

  const remote = !props.comment.id.startsWith(SERVER_ADDR)
  const [author, setAuthor] = useState("")
  const [comment, setComment] = useState("")
  let headers;
  if (!remote) {
    headers = { 'Authorization': getCookie("access") }
  }


  useEffect(() => {
    fetch(`${props.comment.id.split(0, "/auth")}authors/${props.comment.author}/`, { headers })
      .then((res) => {
        if (res.ok) {
          res.json().then(
            (json) => {
              setAuthor(json.displayName)
            }
          )
        }
        else if (res.status == 401) {
          refreshCookies(() => {
            headers = { 'Authorization': getCookie("access") }
            fetch(`${SERVER_ADDR}authors/${props.comment.author}/`, { headers })
              .then((res) => {
                if (res.ok) {
                  res.json().then(
                    (json) => {
                      setAuthor(json.displayName)
                    }
                  )
                }
              })
          })
      }
    })

    fetch(`${props.comment.id}`, { headers })
      .then((res) => {
        if (res.ok) {
          res.json().then(
            (json) => {
              setComment(json.comment)
            }
          )
        }
        else if (res.status == 401) {
          refreshCookies(() => {
            headers = { 'Authorization': getCookie("access") }
            fetch(`${props.comment.id}`)
              .then((res) => {
                if (res.ok) {
                  res.json().then(
                    (json) => {
                      setComment(json.comment)
                    }
                  )
                }
              })
          })
      }
    })
  }, []);

  return (
    <>
      <div className="col">
        <div className="row">
          <i className="bi bi-person-circle" style={{ fontSize: '2rem', marginRight: '10px' }}></i>
        </div>

        <div className="row">
          {author}
        </div>
      </div>
      <div className="col">
        {comment}
      </div>
    </>

  )
}