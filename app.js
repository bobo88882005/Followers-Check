let followers = [];
let following = [];
let pending = [];

let notFollowing = [];
let fans = [];

let currentResults = [];



const zipInput = document.getElementById("instagramZip");
const compareBtn = document.getElementById("compareBtn");

const followersCount = document.getElementById("followersCount");
const followingCount = document.getElementById("followingCount");
const notFollowCount = document.getElementById("notFollowCount");
const pendingCount = document.getElementById("pendingCount");

const resultBox = document.getElementById("resultBox");
const search = document.getElementById("search");






function cleanUsername(value) {

    if (!value)
        return null;


    let user = value
        .trim()
        .toLowerCase();


    user = user
        .replace("@", "")
        .replace("https://www.instagram.com/_u/", "")
        .replace("https://www.instagram.com/", "")
        .replace("/", "");



    if (
        user.length < 2 ||
        user.includes("instagram") ||
        user.includes(" ")
    ) {
        return null;
    }


    return user;

}







function extractHTML(html) {


    const users = new Set();


    const parser =
        new DOMParser();


    const doc =
        parser.parseFromString(
            html,
            "text/html"
        );



    /*
      Instagram export recente:
      <a href="https://www.instagram.com/_u/nomeutente">
    */


    doc.querySelectorAll("a")
    .forEach(link => {


        const href =
            link.getAttribute("href");


        if (!href)
            return;



        const match =
            href.match(
                /instagram\.com\/_u\/([^\/?]+)/i
            );



        if (match) {


            const username =
                cleanUsername(
                    match[1]
                );


            if (username)
                users.add(username);


        }


    });




    /*
       Backup per formati diversi
    */


    if (users.size === 0) {


        doc.querySelectorAll("h2")
        .forEach(title => {


            const username =
                cleanUsername(
                    title.textContent
                );


            if(username)
                users.add(username);


        });


    }



    return [...users];

}








function getFileType(path) {


    const file =
        path
        .toLowerCase()
        .split("/")
        .pop();



    if (
        file.startsWith("followers_") &&
        file.endsWith(".html")
    ) {

        return "followers";

    }



    if (
        file === "following.html"
    ) {

        return "following";

    }



    if (
        file.includes("pending") ||
        file.includes("follow_requests") ||
        file.includes("requests")
    ) {

        return "pending";

    }



    return null;

}








async function readInstagramZip(file) {


    followers = [];
    following = [];
    pending = [];



    const zip =
        await JSZip.loadAsync(file);



    for (
        const filename of Object.keys(zip.files)
    ) {



        const type =
            getFileType(filename);



        if (!type)
            continue;




        const content =
            await zip.files[filename]
            .async("string");



        const users =
            extractHTML(content);



        console.log(
            filename,
            type,
            users.length
        );



        if(type === "followers")
            followers.push(...users);



        if(type === "following")
            following.push(...users);



        if(type === "pending")
            pending.push(...users);



    }



    followers =
        [...new Set(followers)];


    following =
        [...new Set(following)];


    pending =
        [...new Set(pending)];



    console.log(
        "RISULTATI FINALI",
        {
            followers:
            followers.length,

            following:
            following.length,

            pending:
            pending.length
        }
    );


}

// ===============================
// ANALISI ZIP
// ===============================


compareBtn.onclick = async () => {


    const file =
        zipInput.files[0];


    if(!file){

        alert(
            "Seleziona lo ZIP Instagram"
        );

        return;

    }



    resultBox.innerHTML =
        "⏳ Analisi archivio...";



    await readInstagramZip(file);




    followersCount.textContent =
        followers.length;


    followingCount.textContent =
        following.length;


    pendingCount.textContent =
        pending.length;




    const followerSet =
        new Set(followers);



    notFollowing =
        following.filter(
            user =>
            !followerSet.has(user)
        );



    const followingSet =
        new Set(following);



    fans =
        followers.filter(
            user =>
            !followingSet.has(user)
        );



    notFollowCount.textContent =
        notFollowing.length;



    currentResults =
        notFollowing;



    renderResults(
        currentResults
    );


};








// ===============================
// TAB
// ===============================


document
.querySelectorAll(".tab")
.forEach(button => {


    button.onclick = () => {


        document
        .querySelectorAll(".tab")
        .forEach(tab => {

            tab.classList.remove(
                "active"
            );

        });



        button.classList.add(
            "active"
        );



        const tab =
            button.dataset.tab;



        if(tab === "notfollow"){

            currentResults =
                notFollowing;

        }



        if(tab === "pending"){

            currentResults =
                pending;

        }



        if(tab === "fans"){

            currentResults =
                fans;

        }



        renderResults(
            currentResults
        );


    };


});









// ===============================
// VISUALIZZAZIONE UTENTI
// ===============================


function renderResults(list){


    resultBox.innerHTML = "";



    if(!list || list.length === 0){


        resultBox.innerHTML =
            "Nessun risultato";


        return;

    }



    list.forEach(user => {


        const row =
            document.createElement(
                "div"
            );


        row.className =
            "user";



        const link =
            document.createElement(
                "a"
            );


        link.href =
            "https://www.instagram.com/"
            + user
            + "/";



        link.target =
            "_blank";



        link.innerHTML =
            "@" + user
            +
            " ↗";



        row.appendChild(
            link
        );



        resultBox.appendChild(
            row
        );


    });


}









// ===============================
// RICERCA
// ===============================


search.oninput = () => {


    const text =
        search.value
        .toLowerCase();



    const filtered =
        currentResults.filter(
            user =>
            user.includes(text)
        );



    renderResults(
        filtered
    );

};









// ===============================
// ORDINAMENTO
// ===============================


document
.getElementById("sortAZ")
.onclick = () => {


    currentResults.sort();


    renderResults(
        currentResults
    );


};






document
.getElementById("sortZA")
.onclick = () => {


    currentResults.sort()
    .reverse();


    renderResults(
        currentResults
    );


};









// ===============================
// COPIA
// ===============================


document
.getElementById("copyBtn")
.onclick = () => {


    navigator.clipboard.writeText(

        currentResults
        .map(
            user =>
            "@" + user
        )
        .join("\n")

    );


};









// ===============================
// DOWNLOAD
// ===============================


document
.getElementById("downloadBtn")
.onclick = () => {


    const file =
        new Blob(

            [
                currentResults
                .map(
                    user =>
                    "@" + user
                )
                .join("\n")
            ],

            {
                type:
                "text/plain"
            }

        );



    const link =
        document.createElement(
            "a"
        );



    link.href =
        URL.createObjectURL(
            file
        );



    link.download =
        "instagram_risultati.txt";



    link.click();


};








// ===============================
// RESET
// ===============================


const clearBtn =
document.getElementById(
    "clearBtn"
);



if(clearBtn){


clearBtn.onclick = () => {


    followers = [];
    following = [];
    pending = [];

    notFollowing = [];
    fans = [];

    currentResults = [];



    followersCount.textContent = 0;
    followingCount.textContent = 0;
    notFollowCount.textContent = 0;
    pendingCount.textContent = 0;



    resultBox.innerHTML =
        "Nessun risultato";


};

