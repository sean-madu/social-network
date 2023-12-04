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

export const executeRemote = (node = { password: "cmput404", username: "teamgood", remote_ip: "https://www.google.com" }, path, methods, callback, body, redo = true) => {

  let headers = {
    "Content-type": "application/json; charset=UTF-8",
    'Authorization': 'Basic ' + btoa(node.username + ":" + node.password)
  }
  let url = node.remote_ip + path
  if (path.indexOf(node.remote_ip) != -1) {
    url = path
  }

  fetch(url, {
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
        console.log("could not fetch (new)", node.remote_ip, methods, url)
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
  console.log(node, "node log")
  let url = node.remote_ip + path
  if (path.indexOf(node.remote_ip) != -1) {
    url = path
  }
  fetch(url, {
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
        console.log(res)
        res.text().then((t) => console.log(t))
        console.log("could not fetch (new body service)", node.remote_ip, methods, url)
      }
    })
    .catch((err) => {
      console.log(err, "Error from node", path, node)
    })
}