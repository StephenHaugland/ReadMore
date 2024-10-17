module.exports.searchByTerm = async (term)=>{
    const searchResult = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${term}&key=${process.env.API_KEY}`);
    const books = await searchResult.json();
    bookArray = books.items;
    return bookArray;

}

// module.exports.getVolumeData = async (volumeArray) =>{
//     let result = [];
//     for (let i of volumeArray.items) {
//         let vID = i.id;
//         let vInfo = await fetch(`https://www.googleapis.com/books/v1/volumes/${vID}`);
//         result.push(vInfo)
//     }
//     return result;
// }

// module.exports.getSingleVolumeData = async (vID) => {
//     let vInfo = await fetch(`https://www.googleapis.com/books/v1/volumes/${vID}`);
//     return vInfo;

// }