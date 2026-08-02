let followers = [];
let following = [];
let pending = [];

let notFollowing = [];
let fans = [];

let currentResults = [];
let currentTab = "notfollow";


const zipInput = document.getElementById("instagramZip");
const compareBtn = document.getElementById("compareBtn");


const followersCount = document.getElementById("followersCount");
const followingCount = document.getElementById("followingCount");
const notFollowCount = document.getElementById("notFollowCount");
const pendingCount = document.getElementById("pendingCount");


const resultBox = document.getElementById("resultBox");
const search = document.getElementById("search");





function cleanUsername(name){

    if(!name) return null;

    name = name
    .trim()
    .replace("@","")
    .toLowerCase();


    if(
        name.length < 2 ||
        name.includes(" ") ||
        name.includes("instagram")
    ){
        return null;
    }


    return name;

}








function extractHTML(html){

    let users=[];


    const doc =
    new DOMParser()
    .parseFromString(
        html,
        "text/html"
    );



    // Instagram export attuale

    doc.querySelectorAll("h2")
    .forEach(el=>{

        let user =
        cleanUsername(
            el.textContent
        );


        if(user)
            users.push(user);

    });




    // Backup tramite link

    doc.querySelectorAll("a")
    .forEach(a=>{


        let href =
        a.getAttribute("href");


        if(href){


            let match =
            href.match(
            /instagram\.com\/_u\/([^\/?]+)/i
            );


            if(match){

                let user =
                cleanUsername(
                    match[1]
                );


                if(user)
                    users.push(user);

            }

        }


    });



    return [
        ...new Set(users)
    ];

}









function extractJSON(json){

    let users=[];


    function scan(obj){


        if(!obj)
            return;


        if(Array.isArray(obj)){

            obj.forEach(scan);

        }
        else if(typeof obj==="object"){


            if(obj.string_list_data){


                obj.string_list_data
                .forEach(item=>{


                    if(item.value){

                        let user =
                        cleanUsername(
                            item.value
                        );


                        if(user)
                            users.push(user);

                    }


                });

            }


            Object.values(obj)
            .forEach(scan);

        }

    }


    scan(json);


    return [
        ...new Set(users)
    ];

}









// CORRETTA: controlla solo il nome file

function getType(filename){


    let fileName =
    filename
    .toLowerCase()
    .split("/")
    .pop();



    if(
        fileName.startsWith("followers_")
    ){

        return "followers";

    }



    if(
        fileName === "following.html"
    ){

        return "following";

    }



    if(
        fileName.includes("pending") ||
        fileName.includes("request")
    ){

        return "pending";

    }



    return null;

}









async function readZip(file){


    followers=[];
    following=[];
    pending=[];



    const zip =
    await JSZip.loadAsync(file);



    for(
        const filename of Object.keys(zip.files)
    ){



        const type =
        getType(filename);



        if(!type)
            continue;



        const content =
        await zip.files[filename]
        .async("string");



        let users=[];



        if(
            filename.endsWith(".json")
        ){


            users =
            extractJSON(
                JSON.parse(content)
            );


        }
        else{


            users =
            extractHTML(content);

        }




        if(type==="followers"){

            followers.push(...users);

        }



        if(type==="following"){

            following.push(...users);

        }



        if(type==="pending"){

            pending.push(...users);

        }


    }



    followers =
    [...new Set(followers)];


    following =
    [...new Set(following)];


    pending =
    [...new Set(pending)];


}









compareBtn.onclick = async ()=>{


    const file =
    zipInput.files[0];



    if(!file){

        alert(
        "Seleziona lo ZIP Instagram"
        );

        return;

    }



    resultBox.innerHTML =
    "Analisi archivio...";



    await readZip(file);



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
        u =>
        !followerSet.has(u)
    );





    const followingSet =
    new Set(following);



    fans =
    followers.filter(
        u =>
        !followingSet.has(u)
    );





    notFollowCount.textContent =
    notFollowing.length;



    showTab("notfollow");


};









function showTab(tab){


    currentTab = tab;


    if(tab==="notfollow")
        currentResults = notFollowing;


    if(tab==="pending")
        currentResults = pending;


    if(tab==="fans")
        currentResults = fans;



    render(currentResults);

}









function render(list){


    resultBox.innerHTML="";



    if(list.length===0){

        resultBox.innerHTML =
        "Nessun risultato";

        return;

    }




    list.forEach(user=>{


        let div =
        document.createElement("div");


        div.className="user";



        let a =
        document.createElement("a");


        a.href =
        "https://www.instagram.com/"
        + user
        + "/";


        a.target="_blank";


        a.textContent =
        "@" + user;



        div.appendChild(a);


        resultBox.appendChild(div);



    });


}








document.querySelectorAll(".tab")
.forEach(tab=>{


    tab.onclick=()=>{


        document
        .querySelectorAll(".tab")
        .forEach(t=>
            t.classList.remove("active")
        );


        tab.classList.add("active");


        showTab(
            tab.dataset.tab
        );


    };


});









search.oninput=()=>{


    let q =
    search.value
    .toLowerCase();



    render(
        currentResults.filter(
            u =>
            u.includes(q)
        )
    );


};








document.getElementById("sortAZ").onclick=()=>{

    currentResults.sort();

    render(currentResults);

};




document.getElementById("sortZA").onclick=()=>{

    currentResults.sort().reverse();

    render(currentResults);

};





document.getElementById("copyBtn").onclick=()=>{


    navigator.clipboard.writeText(
        currentResults
        .map(u=>"@"+u)
        .join("\n")
    );

};





document.getElementById("downloadBtn").onclick=()=>{


    let blob =
    new Blob(
        [
            currentResults
            .map(u=>"@"+u)
            .join("\n")
        ],
        {
            type:"text/plain"
        }
    );


    let a =
    document.createElement("a");


    a.href =
    URL.createObjectURL(blob);


    a.download =
    "instagram_lista.txt";


    a.click();

};