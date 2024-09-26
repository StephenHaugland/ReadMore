(function () {
  
    const backButton = document.querySelector('#backButton');
    if (backButton){
        backButton.addEventListener("click", () => {
         history.back();
        })
    }

    

    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const readShelf = document.querySelector('#read')
    const readingShelf = document.querySelector('#Reading')
    const wantToReadShelf = document.querySelector('#WantToRead')

    if(readShelf){
        readShelf.addEventListener("click",()=>{readShelf.closest('form').submit()})
        readingShelf.addEventListener("click",()=>{readingShelf.closest('form').submit()})
        wantToReadShelf.addEventListener("click",()=>{wantToReadShelf.closest('form').submit()})
    }
  })()