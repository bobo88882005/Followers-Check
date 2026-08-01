let followers = [];
let following = [];
let result = [];


const zipInput = document.getElementById("instagramZip");
const followersInput = document.getElementById("followersFile");
const followingInput = document.getElementById("followingFile");

const resultBox = document.getElementById("resultBox");



async function readAnyFile(file) {

    if (!file) return [];

    if (file.name.toLowerCase().endsWith(".zip")) {

        return await readInstagramZip(file);

    }


    const text = await file.text();

    return extractUsers(text, file.name);

}





async function readInstagramZip(file) {


    const zip =
    await JSZip.loadAsync(file);


    let followersData = [];
    let followingData = [];


    for (const filename of Object.keys(zip.files)) {


        const lower =
        filename.toLowerCase();



        if (
            lower.includes("followers") ||
            lower.includes("following")
        ) {


            const content =
            await zip.files[filename]
            .async("text");



            const users =
            extractUsers(
                content,
                filename
            );



            if (
                lower.includes("followers")
            ) {

                followersData.push(...users);

            }


            if (
                lower.includes("following")
            ) {

                followingData.push(...users);

            }

        }

    }


    followers = clean(followersData);

    following = clean(followingData);


}







function extractUsers(text, filename="") {


    let users=[];



    // JSON Instagram

    if (
        filename.endsWith(".json") ||
        text.includes('"string_list_data"')
    ) {


        const matches =
        text.match(
            /"value"\s*:\s*"([^"]+)"/g
        );


        if(matches){

            matches.forEach(item=>{

                users.push(
                    item
                    .replace(
                        /.*"value"\s*:\s*"/,
                        ""
                    )
                    .replace(
                        /"/g,
                        ""
                    )
                );

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

            users.push(
                link
                .split("/")
                .pop()
                .replace(
                    /[^a-zA-Z0-9._]/g,
                    ""
                )
            );

        });

    }




    // TXT

    text
    .split(/\r?\n/)
    .forEach(line=>{


        let value =
        line
        .trim()
        .replace(/^@/,"");



        if(
            value &&
            !value.includes("<") &&
            !value.includes("{")
        ){

            users.push(value);

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
                x.length>1
            )
        )
    ];

}







document
.getElementById("compareBtn")
.onclick =
async()=>{


    if(zipInput.files[0]){


        await readInstagramZip(
            zipInput.files[0]
        );


    } else {


        followers =
        await readAnyFile(
            followersInput.files[0]
        );


        following =
        await readAnyFile(
            followingInput.files[0]
        );

    }



    result =
    following.filter(
        user =>
        !followers.includes(user)
    );



    updateStats();

    showResult();

};







function updateStats(){

document
.getElementById("followersCount")
.textContent =
followers.length;


document
.getElementById("followingCount")
.textContent =
following.length;


document
.getElementById("notFollowCount")
.textContent =
result.length;

}







function showResult(list=result){


if(list.length===0){

resultBox.innerHTML =
"Nessun utente trovato";

return;

}



resultBox.innerHTML =
list
.map(
u =>
`<div class="user">❌ @${u}</div>`
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


const text =
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


const file =
new Blob(
[
result.join("\n")
],
{
type:"text/plain"
}
);



const link =
document.createElement("a");


link.href =
URL.createObjectURL(file);


link.download =
"non_ti_seguono.txt";


link.click();

};







document
.getElementById("clearBtn")
.onclick=()=>{


followers=[];
following=[];
result=[];


updateStats();


resultBox.innerHTML =
"Nessun risultato";

};