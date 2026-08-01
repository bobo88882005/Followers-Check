let followers = [];
let following = [];
let results = [];

const zipInput = document.getElementById("instagramZip");
const compareBtn = document.getElementById("compareBtn");

const followersCount = document.getElementById("followersCount");
const followingCount = document.getElementById("followingCount");
const notFollowCount = document.getElementById("notFollowCount");

const resultBox = document.getElementById("resultBox");

const search = document.getElementById("search");

const sortAZ = document.getElementById("sortAZ");
const sortZA = document.getElementById("sortZA");

const copyBtn = document.getElementById("copyBtn");
const downloadBtn = document.getElementById("downloadBtn");

const clearBtn = document.getElementById("clearBtn");



function cleanUsername(name){

    if(!name) return null;

    name = name
    .trim()
    .replace("@","")
    .toLowerCase();


    if(
        name.length < 2 ||
        name.includes(" ") ||
        name.includes(".com")
    ){
        return null;
    }


    return name;

}





function extractFromHTML(html){


    let users=[];


    const parser =
    new DOMParser();


    const doc =
    parser.parseFromString(
        html,
        "text/html"
    );


    doc.querySelectorAll("a")
    .forEach(a=>{


        let user =
        cleanUsername(
            a.textContent
        );


        if(user)
        users.push(user);


    });


    return users;

}






function extractFromJSON(json){


    let users=[];


    function scan(obj){


        if(!obj) return;


        if(Array.isArray(obj)){


            obj.forEach(scan);


        }
        else if(typeof obj==="object"){


            if(
            obj.string_list_data
            ){


                obj.string_list_data
                .forEach(item=>{


                    if(item.value){

                        let u =
                        cleanUsername(
                            item.value
                        );

                        if(u)
                        users.push(u);

                    }


                });


            }


            Object.values(obj)
            .forEach(scan);

        }


    }


    scan(json);


    return users;

}







function detectFile(name){


    name =
    name.toLowerCase();


    if(
    name.includes("followers")
    ){

        return "followers";

    }


    if(
    name.includes("following")
    ||
    name.includes("followings")
    ){

        return "following";

    }


    return null;

}







async function readZip(file){


    resultBox.innerHTML =
    "⏳ Analisi archivio Instagram...";


    const zip =
    await JSZip.loadAsync(file);



    followers=[];
    following=[];



    for(
    const filename of Object.keys(zip.files)
    ){


        const type =
        detectFile(filename);



        if(!type)
        continue;



        const entry =
        zip.files[filename];



        let content =
        await entry.async("string");



        let users=[];



        if(
        filename.endsWith(".json")
        ){

            try{

                users =
                extractFromJSON(
                    JSON.parse(content)
                );

            }
            catch(e){}


        }
        else{


            users =
            extractFromHTML(
                content
            );


        }



        if(type==="followers"){

            followers.push(...users);

        }


        if(type==="following"){

            following.push(...users);

        }


    }



    followers =
    [...new Set(followers)];

    following =
    [...new Set(following)];



}







compareBtn.onclick = async ()=>{


    const file =
    zipInput.files[0];


    if(!file){

        alert(
        "Seleziona prima lo ZIP Instagram"
        );

        return;

    }



    await readZip(file);



    followersCount.textContent =
    followers.length;


    followingCount.textContent =
    following.length;




    results =
    following.filter(
        user =>
        !followers.includes(user)
    );



    notFollowCount.textContent =
    results.length;



    showResults(results);


};








function showResults(list){


    resultBox.innerHTML="";


    if(list.length===0){

        resultBox.innerHTML =
        "✅ Nessun utente trovato";

        return;

    }



    list.forEach(user=>{


        const div =
        document.createElement("div");


        div.className="user";



        const link =
        document.createElement("a");


        link.href =
        "https://www.instagram.com/"
        + user
        + "/";


        link.target="_blank";

        link.innerHTML =
        "❌ @" + user;



        div.appendChild(link);


        resultBox.appendChild(div);


    });


}






search.addEventListener(
"input",
()=>{


    const text =
    search.value.toLowerCase();


    showResults(
        results.filter(
            u =>
            u.includes(text)
        )
    );


});







sortAZ.onclick=()=>{


    results.sort();


    showResults(results);


};




sortZA.onclick=()=>{


    results.sort()
    .reverse();


    showResults(results);


};







copyBtn.onclick=()=>{


    navigator.clipboard.writeText(
        results
        .map(
        u=>"@"+u
        )
        .join("\n")
    );


    alert(
    "Lista copiata"
    );


};







downloadBtn.onclick=()=>{


    const blob =
    new Blob(
        [
        results
        .map(
        u=>"@"+u
        )
        .join("\n")
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







clearBtn.onclick=()=>{


    followers=[];
    following=[];
    results=[];


    followersCount.textContent=0;
    followingCount.textContent=0;
    notFollowCount.textContent=0;


    resultBox.innerHTML =
    "Nessun risultato";


};