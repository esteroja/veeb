//console.log("Juhhei")

window.onload = function() {
    let allThumbs = document.querySelector(".gallery").querySelectorAll(".thumbs");
    //console.log(allThumbs); tuleb nodelist, mis array sarnane
    for (let i=0; i < allThumbs.length; i++){
        allThumbs[i].addEventListener("click", openModal); //kuulaja mis reageerib klikile, siit kohe saadetakse ns info
    };
    document.querySelector("#modalClose").addEventListener("click", closeModal);
    document.querySelector("#modalImage").addEventListener("click", closeModal);
};

function openModal (e) { //event püüdakse kinni (siinkohal klikk openmodal), ei pea panema e siis ei püüta kinni sest palju asju on millele klikkide
    document.querySelector("#modalImage").src = "gallery/normal/" + e.target.dataset.filename;
    document.querySelector("#modalCaption").innerHTML = e.target.alt  //innerhtmliga saab sisse kirjutada
    document.querySelector("#modal").showModal();
};

function closeModal () { //ei pea e-d panema, sest ainult üks asi on millele klikkida
    document.querySelector("#modal").close();
    document.querySelector("#modalImage").src = "pics/empty.png";
    document.querySelector("#modalCaption").innerHTML = "Galeriipilt";
}

