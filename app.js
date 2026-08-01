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
        name.includes("instagram")
    ){

        return null;

    }


    return name;

}







function extractFromHTML(html){


    let users = [];


    const parser = new DOMParser();


    const doc =
    parser.parseFromString(
        html,
        "text/html"
    );



    // Metodo Instagram attuale
    // legge i titoli h2

    doc.querySelectorAll("h2")
    .forEach(h2=>{


        let user =
        cleanUsername(
            h2.textContent
        );


        if(user)
        users.push(user);


    });





    // Backup: legge i link Instagram _u/

    doc.querySelectorAll("a")
    .forEach(a=>{


        let href =
        a.getAttribute("href");


        if(href){


            let match =
            href.match(
            /instagram\.com\/_u\/([^\/\?]+)/i
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








function extractFromJSON(json){


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








function detectFile(name){


    name =
    name.toLowerCase();



    if(
        name.includes("followers_")
    ){

        return "followers";

    }



    if(
        name.includes("following")
    ){

        return "following";

    }



    return null;

}








async function readZip(file){


    followers=[];
    following=[];



    resultBox.innerHTML =
    "⏳ Lettura archivio Instagram...";



    const zip =
    await JSZip.loadAsync(file);





    for(
        const filename of Object.keys(zip.files)
    ){



        const type =
        detectFile(filename);



        if(!type)
        continue;



        const content =
        await zip.files[filename]
        .async("string");



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
        else
        {


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
        "Seleziona lo ZIP Instagram"
        );

        return;

    }




    await readZip(file);




    followersCount.textContent =
    followers.length;



    followingCount.textContent =
    following.length;





    const followerSet =
    new Set(
        followers.map(
            x=>x.toLowerCase()
        )
    );





    results =
    following.filter(
        user =>
        !followerSet.has(
            user.toLowerCase()
        )
    );





    notFollowCount.textContent =
    results.length;



    showResults(results);


};









function showResults(list){


    resultBox.innerHTML="";



    if(list.length===0){


        resultBox.innerHTML =
        "✅ Nessun risultato";


        return;

    }





    list.forEach(user=>{


        let row =
        document.createElement("div");


        row.className="user";



        let link =
        document.createElement("a");



        link.href =
        "https://www.instagram.com/"
        + user
        + "/";



        link.target="_blank";



        link.innerHTML =
        "❌ @" + user;



        row.appendChild(link);



        resultBox.appendChild(row);



    });


}








search.addEventListener(
"input",
()=>{


    let text =
    search.value
    .toLowerCase();



    showResults(
        results.filter(
            u=>u.includes(text)
        )
    );


});









sortAZ.onclick=()=>{

    results.sort();

    showResults(results);

};





sortZA.onclick=()=>{

    results.sort().reverse();

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



    const link =
    document.createElement("a");



    link.href =
    URL.createObjectURL(blob);



    link.download =
    "non_ti_seguono.txt";



    link.click();


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