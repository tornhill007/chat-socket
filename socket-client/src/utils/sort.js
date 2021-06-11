export const sortByPosition = (arr) => {
    arr.sort((a, b) => a.position - b.position);
}

export const sortByCreatedDate = (arr) => {
    arr.sort((a, b) => new Date(a.createdat).getTime() - new Date(b.createdat).getTime());
}