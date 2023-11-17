export default function getCookie(val) {
  let arr = document.cookie.split(";")
  for (let i = 0; i < arr.length; i++) {
    let tokens = arr[i].split("=")
    console.log(tokens)
    if (tokens[0].replaceAll(" ", "") === val) {
      return tokens[1]
    }
  }

}