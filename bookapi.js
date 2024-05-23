module.exports.searchByTerm = async (term)=>{
    const searchResult = await fetch(`https://openlibrary.org/search.json?q=${term}`);
    const books = await searchResult.json();
    return books;
}