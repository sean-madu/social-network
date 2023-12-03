import SERVER_ADDR from "./serverAddress"
import getCookie from "./getCookies"
import { refreshCookies } from "./getCookies"

export const executeOnRemote = (callback, method, path, all = false, body = null, ip = "", redo = true) => {
  let headers = { 'Authorization': `Bearer ${getCookie("access")}` }
  fetch(`${SERVER_ADDR}nodes/`, { headers })
    .then((res) => {
      if (res.status == 401 && redo) {
        refreshCookies(() => {
          executeOnRemote(false)
        })
      }
      else if (res.ok) {
        res.json().then((json) => {
          for (let i = 0; i < json.length; i++) {
            //Check to see if ip and server host name are similar
            if (all || json[i].remote_ip.indexOf(ip) != -1 || ip.indexOf(json[i].remote_ip) != -1) {
              if (body !== null) {
                executeRemote(json[i], path, method, callback, body)
              }
              else {
                executeRemoteNoBody(json[i], path, method, callback)
              }

            }

          }
        })
      }

    })
}

const executeRemote = (node = { password: "cmput404", username: "teamgood", remote_ip: "https://www.google.com" }, path, methods, callback, body, redo = true) => {

  let headers = {
    "Content-type": "application/json; charset=UTF-8",
    'Authorization': 'Basic ' + btoa(node.username + ":" + node.password)
  }

  fetch(node.remote_ip + path, {
    body: body,
    method: methods,
    headers

  })
    .then((res) => {
      if (res.ok) {
        res.json().then((json) => {
          callback(json)
        })
      }
      else if (res.status == 500 && redo) {
        //We can get this depending on how people interpreted the inconsistent api we will retry with or without slash
        if (path.endsWith("/")) {
          executeRemote(node, path.slice(0, path.length - 1), methods, callback, body, false)
        }
        else {
          executeRemote(node, path + "/", methods, callback, body, false)
        }
      }
      else {
        console.log(res)
        res.text().then((t) => console.log(t))
        console.log("could not fetch", node.remote_ip, methods)
      }
    })
    .catch((err) => {
      console.log(err, "Error from node", path, node)
    })
}


const executeRemoteNoBody = (node = { password: "cmput404", username: "teamgood", remote_ip: "https://www.google.com" }, path, methods, callback, redo = true) => {

  let headers = {
    "Content-type": "application/json; charset=UTF-8",
    'Authorization': 'Basic ' + btoa(node.username + ":" + node.password)
  }

  fetch(node.remote_ip + path, {
    method: methods,
    headers

  })
    .then((res) => {
      if (res.ok) {
        res.json().then((json) => {
          callback(json)
        })
      }
      else if (res.status == 500 && redo) {
        //We can get this depending on how people interpreted the inconsistent api we will retry with or without slash
        if (path.endsWith("/")) {
          executeRemoteNoBody(node, path.slice(0, path.length - 1), methods, callback, false)
        }
        else {
          executeRemoteNoBody(node, path + "/", methods, callback, false)
        }
      }
      else {
        console.log("could not fetch", node.remote_ip, node.method)
      }
    })
    .catch((err) => {
      console.log(err, "Error from node", path, node)
    })
}