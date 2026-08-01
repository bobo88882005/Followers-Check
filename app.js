let followers = [];
let following = [];
let result = [];


const followersInput = document.getElementById("followersFile");
const followingInput = document.getElementById("followingFile");


const resultBox = document.getElementById("resultBox");



async function readFile(file) {

    if (!file) return [];


    if (file.name.toLowerCase().endsWith(".zip")) {

        return await readZip(file);

    }


    const text = await file.text();

    return extractUsers(text, file.name);

}




async function readZip(file) {

    const zip = await JSZip.loadAsync(file);

    let users = [];


    for (const filename of Object.keys(zip.files)) {


        const lower = filename.toLowerCase();


        if (
            lower.includes("followers") ||
            lower.includes("following")
        ) {


            const content =
            await zip.files[filename].async("text");


            users.push(
                ...extractUsers(
                    content,
                    filename
                )
            );

        }

    }


    return clean(users);

}




function extractUsers(text, filename="") {


    let users = [];



    // JSON Instagram

    if (
        filename.endsWith(".json") ||
        text.trim().startsWith("{") ||
        text.trim().startsWith("[")
    ) {


        const matches =
        text.match(
            /"value"\s*:\s*"([^"]+)"/g
        );


        if(matches){

            matches.forEach(item=>{

                let u =
                item
                .replace(/.*"value"\s*:\s*"/,"")
                .replace(/"/,"");

                users.push(u);

            });

        }

    }



    // HTML Instagram

    const links =
    text.match(
        /instagram\.com\/([^"\/?]+)/gi
    );


    if(links){

        links.forEach(link=>{

            let user =
            link
            .split("/")
            .pop()
            .replace(
                /[^a-zA-Z0-9._]/g,
                ""
            );


            if(user)
                users.push(user);

        });

    }



    // TXT

    text
    .split(/\r?\n/)
    .forEach(line=>{


        let u =
        line
        .trim()
        .replace(/^@/,"");


        if(
            u &&
            !u.includes("<") &&
            !u.includes("{")
        ){

            users.push(u);

        }

    });



    return clean(users);

}




function clean(list){

    return [
        ...new Set(
            list
            .map(
                x =>
                x.trim().toLowerCase()
            )
            .filter(
                x =>
                x.length > 1
            )
        )
    ];

}




document
.getElementById("compareBtn")
.onclick = async()=>{


    followers =
    await readFile(
        followersInput.files[0]
    );


    following =
    await readFile(
        followingInput.files[0]
    );



    result =
    following.filter(
        user =>
        !followers.includes(user)
    );



    updateStats();

    showResult();

};





function updateStats(){

document.getElementById("followersCount")
.textContent =
followers.length;


document.getElementById("followingCount")
.textContent =
following.length;


document.getElementById("notFollowCount")
.textContent =
result.length;

}





function showResult(list=result){


    if(list.length===0){

        resultBox.innerHTML =
        "Nessun risultato";

        return;

    }


    resultBox.innerHTML =
    list
    .map(
        user =>
        `<div class="user">@${user}</div>`
    )
    .join("");

}





document
.getElementById("sortAZ")
.onclick=()=>{

    result.sort();

    showResult();

};




document
.getElementById("sortZA")
.onclick=()=>{

    result.sort().reverse();

    showResult();

};





document
.getElementById("search")
.oninput=e=>{


    let text =
    e.target.value
    .toLowerCase();


    showResult(
        result.filter(
            u =>
            u.includes(text)
        )
    );

};





document
.getElementById("copyBtn")
.onclick=()=>{


navigator.clipboard.writeText(
    result.join("\n")
);


alert(
"Lista copiata"
);


};





document
.getElementById("downloadBtn")
.onclick=()=>{


const blob =
new Blob(
[
result.join("\n")
],
{
type:"text/plain"
}
);



const a =
document.createElement("a");


a.href =
URL.createObjectURL(blob);


a.download =
"non_ti_seguono.txt";


a.click();


};





document
.getElementById("clearBtn")
.onclick=()=>{


followers=[];
following=[];
result=[];


updateStats();


resultBox.innerHTML =
"Carica nuovi file";

};