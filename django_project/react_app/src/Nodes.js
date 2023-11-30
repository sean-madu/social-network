import SERVER_ADDR from "./serverAddress"
import getCookie from "./getCookies"
import { refreshCookies } from "./getCookies"

export const getNodes = (redo = true) => {
  let headers = { 'Authorization': `Bearer ${getCookie("access")}` }
  fetch(`${SERVER_ADDR}nodes/`, { headers })
    .then((res) => {
      if (res.status == 401 && redo) {
        refreshCookies(() => {
          getNodes(false)
        })
      }
      else if (res.ok) {
        res.json().then((json) => {
          console.log(json, "Nodes")
        })
      }

    })
}