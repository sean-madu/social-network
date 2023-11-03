/** This component displays the comments on a post
 * 
 * props {
 *  comment: JSON object of the comment
 *   
 * }
 */
import { useState, useEffect } from "react";
import SERVER_ADDR from "../serverAddress";


export default function Comment(props) {


  const [author, setAuthor] = useState("")
  const [comment, setComment] = useState("")

  useEffect(() => {
    fetch(`${SERVER_ADDR}authors/${props.comment.author}/`)
    .then((res) => {
      if (res.ok) {
        res.json().then(
          (json) => {
            setAuthor(json.displayName)
          }
        )
      }
    })

    fetch(`${SERVER_ADDR}authors/${props.comment.author}/posts/${props.comment.post}/comments/${props.comment.id}`)
    .then((res) => {
      if (res.ok) {
        res.json().then(
          (json) => {
            setComment(json.comment)
          }
        )
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