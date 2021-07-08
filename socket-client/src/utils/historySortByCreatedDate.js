const historySortByCreatedDate = (historyArr) => {
  console.log("historyArr", historyArr)
  historyArr.sort((a, b) => (Date.parse(a.createdat) > Date.parse(b.createdat) ? 1 : Date.parse(a.createdat) < Date.parse(b.createdat) ? -1 : 0))
}

export default historySortByCreatedDate;