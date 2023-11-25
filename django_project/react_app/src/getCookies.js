import SERVER_ADDR from "./serverAddress"
export default function getCookie(val) {
  let arr = document.cookie.split(";")
  for (let i = 0; i < arr.length; i++) {
    let tokens = arr[i].split("=")
    if (tokens[0].replaceAll(" ", "") === val) {
      return tokens[1]
    }
  }


}

export function refreshCookies(callback) {
  let refresh = getCookie('refresh')
  let response = fetch(`${SERVER_ADDR}auth/refresh-token/`, {
    method: 'POST',
    body: JSON.stringify({ refresh }),
    headers: { 'Content-Type': 'application/json' }
  }).then((res) => {
    if (res.ok) {
      return res.json()
    }
    else {
      alert("Refresh token did not work, please log in :(")
      console.log(res)
    }
  }).then((json) => {
    console.log(json)
    document.cookie = `access=${json.access}`
  })
    .finally(() => {
      callback();
    });
  return response
}