let followers = [];
let following = [];
let pending = [];

let notFollowing = [];
let fans = [];

let currentTab = "notfollow";
let currentResults = [];



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
        name.includes("instagram") ||
        name.includes(" ")
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



    doc.querySelectorAll("h2")
    .forEach(el=>{


        let u =
        cleanUsername(
            el.textContent
        );


        if(u)
        users.push(u);


    });




    doc.querySelectorAll("a")
    .forEach(a=>{


        let href =
        a.href;


        let match =
        href.match(
        /instagram\.com\/_u\/([^\/?]+)/i
        );


        if(match){

            users.push(
                cleanUsername(match[1])
            );

        }


    });



    return [
        ...new Set(
            users.filter(Boolean)
        )
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
                .forEach(x=>{


                    if(x.value){

                        let u =
                        cleanUsername(
                            x.value
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



    return [
        ...new Set(users)
    ];

}








function getType(filename){


    let f =
    filename.toLowerCase();



    if(
        f.includes("followers")
    )
    return "followers";



    if(
        f.includes("following")
    )
    return "following";



    if(
        f.includes("pending") ||
        f.includes("request")
    )
    return "pending";



    return null;

}








async function readZip(file){


    followers=[];
    following=[];
    pending=[];



    const zip =
    await JSZip.loadAsync(file);



    for(
        const name of Object.keys(zip.files)
    ){


        const type =
        getType(name);



        if(!type)
        continue;



        const content =
        await zip.files[name]
        .async("string");



        let users=[];



        if(name.endsWith(".json")){


            users =
            extractJSON(
                JSON.parse(content)
            );


        }
        else{


            users =
            extractHTML(content);


        }



        if(type==="followers")
            followers.push(...users);



        if(type==="following")
            following.push(...users);



        if(type==="pending")
            pending.push(...users);



    }



    followers =
    [...new Set(followers)];

    following =
    [...new Set(following)];

    pending =
    [...new Set(pending)];

}








compareBtn.onclick = async ()=>{


    let file =
    zipInput.files[0];


    if(!file){

        alert(
        "Carica lo ZIP Instagram"
        );

        return;

    }



    resultBox.innerHTML =
    "⏳ Analisi archivio...";



    await readZip(file);




    followersCount.textContent =
    followers.length;


    followingCount.textContent =
    following.length;


    pendingCount.textContent =
    pending.length;





    let followerSet =
    new Set(followers);



    notFollowing =
    following.filter(
        x =>
        !followerSet.has(x)
    );



    let followingSet =
    new Set(following);



    fans =
    followers.filter(
        x =>
        !followingSet.has(x)
    );



    notFollowCount.textContent =
    notFollowing.length;



    showTab("notfollow");


};








function showTab(tab){


    currentTab=tab;



    if(tab==="pending")
        currentResults=pending;


    if(tab==="notfollow")
        currentResults=notFollowing;


    if(tab==="fans")
        currentResults=fans;



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
        +user+"/";


        a.target="_blank";


        a.innerHTML =
        "@" + user;



        div.appendChild(a);


        resultBox.appendChild(div);



    });


}







document.querySelectorAll(".tab")
.forEach(btn=>{


    btn.onclick=()=>{


        document
        .querySelectorAll(".tab")
        .forEach(x=>
            x.classList.remove("active")
        );


        btn.classList.add("active");


        showTab(
            btn.dataset.tab
        );


    };


});








search.oninput=()=>{


    let q =
    search.value.toLowerCase();



    render(
        currentResults.filter(
            x=>x.includes(q)
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
        .map(x=>"@"+x)
        .join("\n")
    );

};







document.getElementById("downloadBtn").onclick=()=>{


    let blob =
    new Blob(
        [
        currentResults
        .map(x=>"@"+x)
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
    "lista_instagram.txt";


    a.click();

};
