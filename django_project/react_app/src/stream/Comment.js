
import { useState } from "react";
import SERVER_ADDR from "../serverAddress";


export default function Comment(props) {


  [author, setAuthor] = useState("")
  [comment, setComment] = useState("")

  fetch(props.comment.author)
    .then((res) => {
      if (res.ok) {
        res.json().then(
          (json) => {
            setAuthor(json.displayName)
          }
        )
      }
    })

  fetch(props.comment.id)
    .then((res) => {
      if (res.ok) {
        res.json().then(
          (json) => {
            setAuthor(json.displayName)
          }
        )
      }
    })
  return (
    <>
      <div className="col">
        <div className="row">
          <i className="bi bi-person-circle" style={{ fontSize: '2rem', marginRight: '10px' }}></i>
        </div>

        <div className="row">
          PEsrons 1
        </div>
      </div>
      <div className="col">
        Some comment for now
      </div>
    </>

  )
}