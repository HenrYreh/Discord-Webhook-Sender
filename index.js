const webhookForm = document.querySelector(".webhookListForm");            //method assigning varibles from specified elements in HTML     
const inputBox = document.querySelector(".input");
const webhookListUL = document.querySelector(".webhookList");

const embedTextArea = document.querySelector(".embed");

const buttonSender = document.querySelector(".sendButton")


let webhookList  = JSON.parse(localStorage.getItem("webhooks"));            //load local save webhook list array and calls addwebhook
console.log(webhookList)
if (webhookList){
    webhookList.forEach((webhook)=>{
        addWebhook(webhook);
    });
}

let embed = JSON.parse(localStorage.getItem("embed"));                      //load local save embed and apply to textarea
console.log("Embed:",embed);
document.getElementsByClassName("embed")[0].value = embed;


webhookForm.addEventListener("submit", (event)=>{                           //listener for input to addWebhook
    event.preventDefault();
    addWebhook()
})

function addWebhook(webhook){                                               //addWebhook Function
    let newWebhook = inputBox.value;
    if (webhook){                                                           //check for saved webhooks
        newWebhook = webhook;
    }


    const list = document.createElement("li");                              //Create new li Element with the input inside and appended under, text removed from input box
    list.innerText = newWebhook;
    webhookListUL.appendChild(list)
    inputBox.value="";

    const deleteButton = document.createElement("div")                      //Create Delete Button in the list which will remove list when clicked, storage updated
    deleteButton.innerHTML = `<i class="fa-solid fa-xmark"></i>`;
    list.appendChild(deleteButton);
    deleteButton.addEventListener("click", ()=>{
        list.remove();
        console.log("Removed Webhook:",list.innerText)
        notify("change","Webhook Removed.")
        updateListStorage()
    })

    console.log("Added Webhook:",list.innerText)                            //Storage Updated
    notify("change","Webhook Added.")
    updateListStorage()
}

function updateListStorage(){                                               //Add webhooks in list to array to local storage
    console.log("Updating Webhook(s) Storage")
    const allWebhooks = document.querySelectorAll("li");   
    webhookArray = [];
    allWebhooks.forEach((webhook)=>{
        webhookArray.push(webhook.outerText)
    })
    localStorage.setItem("webhooks", JSON.stringify(webhookArray));  
}

embedTextArea.addEventListener("input", function(){                         //Checks for input in embedTextArea which then is saved to local storage
    let newTaskEmbed = embedTextArea.value;
    notify("change","Embed Added/Appended.")
    localStorage.setItem("embed", JSON.stringify(newTaskEmbed));
})

buttonSender.addEventListener("click", function() {                        //When button is pressed, calls postWebhook
    console.log("Button Pressed.");
    console.log(webhookArray);
    console.log(embedTextArea.value);
    postWebhook()
  });

async function postWebhook(){                                               //data in embedTextArea POST asynchronously to all saved URLs
    console.log("Attempt Send.")
    try{
        let responses = await Promise.all(webhookArray.map((url) => fetch(url,{
            method: 'POST',
            headers: {
              'Accept': 'application/json, text/plain, */*',
              'Content-Type': 'application/json'
            },
          body: embedTextArea.value
          })))

    console.log("Attempted POST Webhooks")

    
    for (let x = 0; x < responses.length; x++){                         //Check all responses for okay response
        if (!responses[x].ok){
            notify("error","POST Response Error on Webhook(s)")
        }
        else{
            notify("success","Webhooks Sent Success")
        }
    }
    } 
    catch (err){
    console.log("Error POST Webhooks:", err)
    notify("error","POST Request Error on Webhook(s)")
}
}



function notify(severity,message){                                      //Creates Notifcation with severity assigning colour in CSS and message applying message in notification

    if (!['error', 'change', 'success'].includes(severity)) {
        console.log('Invalid Severity')
        return
    }

    const notifyBox = document.querySelector(".notifcationContainer")
    notifyBox.innerText = message;

    notifyBox.classList.add('notifcationContainer--' + severity)

    setTimeout(() => {  notifyBox.className='notifcationContainer' }, 2000);        //Timeout for how long notification stays before becoming not visible
}

