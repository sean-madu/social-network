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
    headers = { 'Authorization': `Bearer ${getCookie("access")}` }
  }


  return (
    <>
      <div className="col">
        <div className="row">
          <i className="bi bi-person-circle" style={{ fontSize: '2rem', marginRight: '10px' }}></i>
        </div>

        <div className="row">
          {props.comment.author.displayName}
        </div>
      </div>
      <div className="col">
        {props.comment.comment}
      </div>
    </>

  )
}