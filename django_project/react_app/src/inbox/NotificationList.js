import 'bootstrap/dist/css/bootstrap.css';



export default function NotificationList(props) {

  const makeListItems = () => {
    return props.comments.map((item) => {
      //todo, render maybe a proxy post here
      return (
        <li className='list-group-item'>
          <div className='container'>
            <div className='row'>
              <div className='column pt-2'>
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" class="bi bi-person-circle" viewBox="0 0 16 16">
                  <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                  <path fill-rule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z" />
                </svg>
              </div>
              <div className='column pt-2'>
                {item.type == "comment" && <div style={{ display: "flex", flexDirection: "row" }}>

                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chat-square-dots" viewBox="0 0 16 16">
                    <path d="M14 1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-2.5a2 2 0 0 0-1.6.8L8 14.333 6.1 11.8a2 2 0 0 0-1.6-.8H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2.5a1 1 0 0 1 .8.4l1.9 2.533a1 1 0 0 0 1.6 0l1.9-2.533a1 1 0 0 1 .8-.4H14a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z" />
                    <path d="M5 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
                  </svg>
                  <p className='ps-2'>{item.displayName} commented "{item.comment}" on </p>
                </div>}
                {item.type == "like" && <div style={{ display: "flex", flexDirection: "row" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chat-square-heart" viewBox="0 0 16 16">
                    <path d="M14 1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-2.5a2 2 0 0 0-1.6.8L8 14.333 6.1 11.8a2 2 0 0 0-1.6-.8H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12ZM2 0a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2.5a1 1 0 0 1 .8.4l1.9 2.533a1 1 0 0 0 1.6 0l1.9-2.533a1 1 0 0 1 .8-.4H14a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2Z" />
                    <path d="M8 3.993c1.664-1.711 5.825 1.283 0 5.132-5.825-3.85-1.664-6.843 0-5.132Z" />
                  </svg>
                  <p className='ps-2'>{item.displayName} liked your post! </p>
                </div>}
              </div>

            </div>
            <div className='row justify-content-center'>
              <div className='card' style={{ width: "18rem", overflow: "hidden", textOverflow: "ellipsis" }}>
                <div className='card-body' >
                  <p className='card-text'>{item.post.text}</p>
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
        <h1> NOTIFICATIONS </h1>
        {props.comments.length == 0 && <h2> Nobody has commented or liked any of your posts </h2>}
        <ul className="list-group">
          {makeListItems()}
        </ul>
      </div >
    </>
  )
}

