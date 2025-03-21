// ------------------------  Basic checks ------------------------  //
// A sanity check that this .js file is linked to your HTML
console.log("main.js is loaded");

// A sanity check that Onsen framework is loaded, as well as deviceready
ons.ready(function() {
    console.log("Onsen UI is ready!");
}); // END .ons.ready() checker

// If Onsen is running, detect if we are running on a certain platform
if(ons.platform.isIPhoneX()) {
    document.documentElement.setAttribute('onsflag-iphonex-portrait', '');
    document.documentElement.setAttribute('onsflag-iphonex-landscape', '');
    console.log("Running on iPhone");
} else if(ons.platform.isAndroid()) {
    // or check if Android is running
    console.log("Running on Android");
}; // END ons.platform() checker

// Create a generic DB reference for future use by every user; Global Scope Variable
let myDB;

// Function to create (first time) or load (subsequent times) a user's personal database
function initDB(){
    console.log("initDB() is running");
    
    // Check who is last logged in
    let emailForDB = localStorage.getItem("rememberMe");
    // Create or connect to a database, based on their email
    myDB = new PouchDB(emailForDB);
    // Show results, using the Promise syntax
    // .then() (result of a true success result)
    // .catch() (result of fasle catch a failure)
    myDB.info().then(function(greatJob){console.log("Db records: " + greatJob.doc_count);}).catch(function(aMistake){console.log(aMistake);});
}; // END initDB()

// ------------------------  Remember Me Auto Login Section ------------------------  //
    // Check who last logged in, via localStorage Object
    let uid = localStorage.getItem("rememberMe");
    // Conditional Statement to check some possibilities
    if(uid === null || uid == undefined || uid == false || uid === "" || uid === "null") { 
        console.log("No one last logged in, send them to WELCOME");
        loadPage("welcome.html");
    } else { 
        console.log("There IS a user: " + uid);

        // Get the returning User's record from localStorage Object, .parse() it to use as JavaScript
        let tmploginUser = JSON.parse(localStorage.getItem(uid));
        // Conditional Statement to swtich between user types
        switch(tmploginUser.age) {
            case true:
                document.querySelector("#appNav").resetToPage("homeParent.html");
                break;
            case false:
                document.querySelector("#appNav").resetToPage("homeChild.html");
                break;
            case "Admin":
                document.querySelector("#appNav").resetToPage("homeOwner.html");
                break;
            default:
                console.log(tmploginUser.age);
                break;
        }; // END switch() to detect account type
        
        // No matter the User Type, initialize their Database
        initDB();
    }; // END If..Else redirector
// ------------------------  END Remember Me Auto Login Section --------------------  //

// Variable to keep track of which comic we're viewing/edit/deleting
let comicCurrent = "";

// Function to move from screen to screen; takes an id of a <template>; nav from a regular button
function loadPage(pageID){
    console.log("loadPage() about to load " + pageID);
    // Load the pageID into <ons-navigator> container via Onsen's .bringPageTop(), keeping a History
    document.querySelector("#appNav").bringPageTop(pageID);
}; // END loadPage()

// Function to move from screen to screen; takes an id of a <template> and the Menu's id; nav from a side menu button
function loadPageViaMenu(pageID, menuID){
    console.log("loadPageViaMenu() is running. About to open: " + pageID);
    // Close any previously-open Menus
    document.querySelector(menuID).close();
    // Note, updated with .then().catch() to detect if we go to the Collection screen, to show the inventory
    document.querySelector("#appNav").bringPageTop(pageID).then(function(){
        console.log("Loaded: " + pageID);
        // Detect when we move to Collection screen or not
        if(pageID === "collectionParent.html") {
            // Update the table
            comicShowTable();
        } else {
            // Some other screen, no table update
            console.log("A non collection screen was loaded");
        }; // END If..Else for updating tble or not
    }).catch(function(theError){console.log(theError);});
}; // END loadPageViaMenu()


// temporary code to show the welcome; REMOVE it when the rest of the process is coded
// no need for a hashmark, because we're just feeding it a String, which happens to be an ID
// loadPage("welcome.html"); // REMOVED AFTER REMEMBER ME CODE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!


// Function to clear Sign Up Form
function fnClearSignUp(){
    console.log("fnClearSignUp() is running");
    document.querySelector("#signupEmail").value = "";  // "" has NO SPACE
    document.querySelector("#signupPWD").value = "";
    document.querySelector("#signupPWDConfirm").value = "";
    document.querySelector("#signupAgeTrue").checked = false;
}; // END fnClearSignUp()

// Sign up for an account subroutine
function fnSignUp(){
    console.log("fnSignUp() is running");

    // Create a Constant Object (that doesn't change) instead of a Let Object (that can change)
    // Strong password pattern based on a Regular Expression
    // Where we expect a-z (upper AND lower), as well numbers, and special chara, and at least 7 long
    const strongPWD = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[\!\@\#\$\^\*\;\-])(?=.{7,})");

    // Read the Values of the fields
    let valsignupEmail =        document.querySelector("#signupEmail").value;
    let valsignupPWD =          document.querySelector("#signupPWD").value;
    let valsignupPWDConfirm =   document.querySelector("#signupPWDConfirm").value;

    // By default, app assumes a Child account
    let valsignupAge = false;
    // Then based in their interaction, flip it
    if(document.querySelector("#signupAgeTrue").checked) {
        console.log("YES, they are old enough");
        valsignupAge = true;
    } else {
        console.log("NO, they are under 13");
        valsignupAge = false;
    }; // END of age checker

    console.log(valsignupEmail, valsignupPWD, valsignupPWDConfirm);
    // JavaScript's localStorage Object is a way to save simple data in a simple "database"
    // 1. Check PWD strength    2. All fields complete      3. Check PWDs match     4. Check if account exists  5. Create account
    // First level, check if PWD is strong
    // .test() method will compare a pattern
    if(strongPWD.test(valsignupPWD)) { 
        console.log("Password IS STRONG");
        // Second level, check if all fields are filled in
        if(valsignupEmail === "" || valsignupPWD === "" || valsignupPWDConfirm === "") { 
            // Onsen-powered Alert Popup
            ons.notification.alert("Please fill all fields!");
        } else { 
            // Third level, check if passwords match
            if(valsignupPWD !== valsignupPWDConfirm) {
                // Popup and clear fields for them to try again
                ons.notification.alert("Passwords don't match!");
                document.querySelector("#signupPWD").value = "";
                document.querySelector("#signupPWDConfirm").value = "";
            } else {
                // Convert their email to lowercase so we don't have problems later
                let tmpvalsignupEmail = valsignupEmail.toLowerCase();
                // Fourth level, check if account exists
                if(localStorage.getItem(tmpvalsignupEmail) === null) {
                    // Changed our subroutine to also store more data, not just email and password
                    // Bundle the multiple pieces of data into one unit, using JSON format
                    let tmpUser = {
                            "_id":       tmpvalsignupEmail,
                            "pwd":       valsignupPWD,
                            "age":       valsignupAge,
                            "genres":    null,
                            "storeOwner":false
                        }; // END of bundle of data of an account

                    console.log("Creating account: " + tmpvalsignupEmail);
                    // Example of saving simple data to localStorage
                    // localStorage.setItem(tmpvalsignupEmail, valsignupPWD);
                    // Save the JSON (complex) data to localStorage by converting it to "simple" via JSON.stringify()
                    // Fifth level, save the User account to localStorage
                    localStorage.setItem(tmpUser._id, JSON.stringify(tmpUser));
                    ons.notification.alert("Account created!");
                    // All works, clear fields to create a new account
                    fnClearSignUp();
                } else {
                    console.log("Account already exists");
                    ons.notification.alert("You already have an account!");
                    // To-do: add password reset; or log-in with that
                }; // END Check if acct exists
            }; // END Check if passwords match
        }; // END of All Fields Filled checker
    } else {
        console.log("WEAK password");
        // Make an Onsen popup to let them know they are weak
        ons.notification.alert("Weak password!");
        // Clear all fields
        fnClearSignUp();
    }; // END PWD strength checker
}; // END fnSignUp()

// Function to log in
function fnLogIn(){
    console.log("fnLogIn() is running.");
    // NOTE: Global Scope variables (that are created OUTSIDE functions) are always running
    //       Local Scope variables (that are created INSIDE functions) only run temporarily
    let valloginEmail = document.querySelector("#loginEmail").value;
    let valloginPWD   = document.querySelector("#loginPWD").value;
    let tmploginEmail = valloginEmail.toLowerCase();
    console.log(valloginEmail, valloginPWD, tmploginEmail);
    // 1. Check if accts exists     2. If Passwords match   3. Log in to child or parent account (home)     4. Init their db
    // First level, check if account exists in localStorage
    if(localStorage.getItem(tmploginEmail) == null) {
        ons.notification.alert("Account doesn't exist!");
    } else {
        // Retrieve the stringified (simplified) data in the memory location
        // and start using it again as "real" (complex), parsed data
        let tmploginUser = JSON.parse(localStorage.getItem(tmploginEmail));
        console.log(tmploginUser._id, "Account DOES exist, proceed to check if PWDs match");
        // Second level, check if password matches in localStorage
        if(valloginPWD === tmploginUser.pwd) { 
            // Third level, switch between acount types 
            switch(tmploginUser.age) {
                case true:
                    document.querySelector("#appNav").resetToPage("homeParent.html");
                    break;
                case false:
                    document.querySelector("#appNav").resetToPage("homeChild.html");
                    break;
                case "Admin":
                    document.querySelector("#appNav").resetToPage("homeOwner.html");
                    break;
                default:
                    console.log(tmploginUser.age);
                    break;
            }; // END switch() to detect which account to log into
            // Now, keep track of who logged in, for auto-login (Remember Me) subroutine
            localStorage.setItem("rememberMe", tmploginUser._id);
            // After setting rememberMe, then init their database
            initDB();
        } else {
            // Pop up error message
            ons.notification.alert("Wrong password!");
            // To-do: clear fields? reset password?
        }; // END Check if password matches in localStorage
    }; // END Check if account exists in localStorage
}; // END fnLogIn()

// Function to log out
function fnLogOut() {
    console.log("fnLogOut() is running");
    // To-do: play a sound? vibrate?
    // Confirm if they really want to log out
    // Conditional statement of switch() to make the decision
    // Using the Onsen .confirm() Method and a Promise (.then().catch())
    ons.notification.confirm("Are you sure?").then(function(onsResponse) {
        switch(onsResponse){
            case 0:
                // To-do: play a Happy Sound
                console.log("They DON'T want to log out");
                break;
            case 1:
                // To-do: make it vibrate
                console.log("They DO WANT to log out");
                // Move to Welcome screen
                document.querySelector("#appNav").resetToPage("welcome.html");
                // Clear rememberMe
                localStorage.setItem("rememberMe", null);
                // And close any menus
                document.querySelector("#menuParent").close();
                document.querySelector("#menuChild").close();
                break;
            case 2:
                // To-do: canceled but moved to Profile
                break;
            default:
                console.log(onsResponse);
                break;
        }; // END switch()
    }); // END .comfirm()
}; // END fnLogOut()

// Function to open a side medu, based on an ID
function sideMenuOpen(menuID){
    console.log("sideMenuOpen() is running. About to open: " + menuID);
    document.querySelector(menuID).open();
}; // END sideMenuOpen()

// Function to gather and prepare the comic data for saving to the DB (PouchDB)
function comicPrep(){
    console.log("comicPrep() is running");
    
    // Read the info in all the input boxes of Save Comic section
    let valInSaveTitle  = document.querySelector("#inSaveTitle").value,
        valInSaveNumber = document.querySelector("#inSaveNumber").value,
        valInSaveYear   = document.querySelector("#inSaveYear").value,
        valInSaveNote   = document.querySelector("#inSaveNote").value;
    
    console.log(valInSaveTitle, valInSaveNumber, valInSaveYear, valInSaveNote);
    
    // All data saved to Pouch must be in JSON format and use "_id" as the first KEY
    
    // Set up the _id entry based on Title + Year + Number = _id
    // Spider-Man 1991 01 = "_id":"spiderman19911"
    // Spider-Man 2019 01 = "_id":"spiderman20191"
    let tmp_id = valInSaveTitle.replace(/\W/g,"").toLowerCase() + valInSaveYear + valInSaveNumber;
    console.log("_id is" + tmp_id);

    // Then bundle all the data into JSON format
    let tmpComic = {
        "_id":      tmp_id,
        "cTitle":   valInSaveTitle,
        "cYear":    valInSaveYear,
        "cNum":     valInSaveNumber,
        "cNote":    valInSaveNote,
        "cImage":   null
    }; // END tmpComic JSON object
    console.log("JSON Object is: " + tmpComic);
    // Power user trick: show a list of KEYS of a JSON object!
    console.log("Keys are: " + Object.keys(tmpComic));
    // Access the record of an individual Key of a certain database entry
    console.log("JSOn _id is: " + tmpComic.cTitle);

    // Return the bundled data to th rest of the app
    return tmpComic;
}; // END comicPrep()

// Function to save a comic
function comicSave(){
    console.log("comicSave() is running");

    // Go off and gather the data to be able to save to the DB
    let aComic = comicPrep();
    console.log("About to save a comic: " + aComic._id);

    // Save the comic to Pouch
    myDB.put(aComic).then(function(pSuccess){
        console.log("Saved comic! " + pSuccess.rev);
        ons.notification.alert("You saved a comic!");
        document.querySelector("#inSaveTitle").value    = "";
        document.querySelector("#inSaveYear").value     = "";
        document.querySelector("#inSaveNumber").value   = "";
        document.querySelector("#inSaveNote").value     = "";
        // Then update the list of comics on-screen
        comicShowTable();
    }).catch(function(pErr){
         console.log(pErr.message);
         ons.notification.alert(pErr.message);
        }); // END .put()
}; // END comicSave()

// Function to show the data onscreen (table view)
function comicShowTable(){
    console.log("comicShowTable() is running");

    // Get all of the _ids to be able to manipulate the data
    myDB.allDocs({"ascending":true, "include_docs":true}).then(function(pSuccess){
         // First, check if there are comics in the DB
         if(pSuccess.rows[0] === undefined) {
             // If no data
             console.log("First run of app; no data yet!");
             document.querySelector("#divComicCollection").innerHTML = "No comics, yet. Save some!";
         } else {
             // If YES data
            console.log("Total comics: " + pSuccess.total_rows);
            console.log("First comic: " + pSuccess.rows[0].doc.cTitle);

            // Show the comics as a Table. Example: 
            // <table> <tr><th>Title</th> <th>Num</th></tr> <tr><td>Spider-Man</td><td>1</td></tr> </table>
            let comicData = "<table border='1'> <tr><th>Title</th> <th>Number</th></tr>";
            
            // Condtional Statement to loop for x number of times, based on x number of comics
            for(let i = 0; i < pSuccess.total_rows; i++){
            // Build every row with the comic data USING += !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            // Each of these items (rows) is clickable, which make a popup appear
            // Each class & id should not use "  (use '    or `)
            comicData += "<tr class='btnComicInfo' id='" + pSuccess.rows[i].doc._id + "'> <td>" + 
                pSuccess.rows[i].doc.cTitle + "</td> <td>" + 
                pSuccess.rows[i].doc.cNum + "</td> </tr>"; // END a row of data <tr>
            }; // END for() loop     
            
            // end <table>
            comicData += "</table>";

            // Display the Table on-screen
            document.querySelector("#divComicCollection").innerHTML = comicData;

            // Then make every row clickable, by gathering all class'ifed rows. NOTE: .querySelectorAll()
            let rowsOfComics = document.querySelectorAll(".btnComicInfo");
            for(let aRow of rowsOfComics){
                aRow.addEventListener("click", function(){comicEditInfo(this);});
            }; // END for() to make each row clickable, then run a function
         }; // END If..Else checker for comic data
        }).catch(function(pErr){console.log("Error: " + pErr);});
}; // END comicShowTable()

// Function to make a Popup with that comic's info
function comicEditInfo(thisRow) {
    // Confirm the id of the row of the comic, which is _id in Pouch
    console.log("id of the comic is: " + thisRow.id);

    // Get that DB entry, based on row's id
    myDB.get(thisRow.id).then(function(pComic){
        console.log("Comic details of: ", pComic._id, Object.keys(pComic));

        // Prep the popup screen <templat> in memory
        let popComicDetail = document.querySelector("#comicDetail");
        // Check to create and show the screen or just show the screen
        if(popComicDetail){
            // We have previously accessed the popup, so just repopulate
            document.querySelector("#inputEditTitle").value     = pComic.cTitle;
            document.querySelector("#inputEditNumber").value    = pComic.cNum;
            document.querySelector("#inputEditYear").value      = pComic.cYear;
            document.querySelector("#inputEditNote").value      = pComic.cNote;
            // Then show the screen
            document.querySelector("#comicDetail").show();
            // Note which comic we're viewing, for editing later
            comicCurrent = pComic._id;
        } else {
            // If the popup has not been accessed before, make it, and populate fields
            ons.createElement("comicDetail.html", {"append":true}).then(function(pSuccess){
                document.querySelector("#inputEditTitle").value     = pComic.cTitle;
                document.querySelector("#inputEditNumber").value    = pComic.cNum;
                document.querySelector("#inputEditYear").value      = pComic.cYear;
                document.querySelector("#inputEditNote").value      = pComic.cNote;
                pSuccess.show();
                comicCurrent = pComic._id;
            }); // .createElement()
        }; // END .get()
    }).catch(function(pErr){console.log(pErr);});
}; // END comicEditInfo()

// For closing the popup
function comicEditInfoClose(){
    console.log("comicEditInfoClose() is running");
    // Use the id of the <ons-dialog> NOT the <template> 
    document.querySelector("#comicDetail").hide();
}; // END comicEditInfoClose()

// For deleting one comic (from the database)
function comicEditDelete() {
    console.log("comicEditDelete() is running upon " + comicCurrent);
    // To delete an entry, first retreive it from the DB, then .remove()
    myDB.get(comicCurrent).then(function(pSuccess){
        // Ask to confrim delection
        ons.notification.confirm("Are you sure?").then(function(response){
            switch(response){
                case 0: 
                    console.log("Never mind");
                    break;
                case 1:
                    myDB.remove(pSuccess).then(function(result){
                        console.log("Single comic deleted: " + result.ok);
                        // Redraw the table
                        comicShowTable();
                        // Close info poopup
                        comicEditInfoClose();
                        // No comic selected any more
                        comicCurrent = "";
                    }); // END .remove()
                    break;
                default: 
                    console.log(response);
                    break;
            }; // END switch()
        }); // END .confirm()
    }).catch(function(pErr){
        console.log(pErr);
    }); // .get()
}; // END comicEditDelete()

// For updating an entry
function comicEditUpdate() {
    console.log("About to update: " + comicCurrent);

    // Read (or re-read) the current fields to insert (re-insert) into the DB
    let tmpInTitle = document.querySelector("#inputEditTitle").value,
        tmpInNumber =  document.querySelector("#inputEditNumber").value,
        tmpInYear = document.querySelector("#inputEditYear").value,
        tmpInNote = document.querySelector("#inputEditNote").value;
    console.log(tmpInTitle, tmpInNumber, tmpInYear, tmpInNote);

    // Get the current entry to check/update the _rev number
    myDB.get(comicCurrent).then(function(pSuccess){
        myDB.put(
            {
             "cTitle": tmpInTitle,
             "cNum"  : tmpInNumber,
             "cYear" : tmpInYear,
             "cNote" : tmpInNote,
             "_id"   : pSuccess._id,
             "_rev"  : pSuccess._rev
            }
        ).then(function(result){
            comicShowTable();
            comicEditInfoClose();
        });
    }).catch(function(pErr){console.log(pErr)});
}; // END comicEditUpdate()

// Delete (reset) database
function comicDeleteColl(){
    console.log("About to delete: " + uid);
    ons.notification.confirm("Are you sure you want to delete your whole collection?").then(function(pSuccess){
        switch(pSuccess){
            case 0:
                console.log("Never mind");
                break;
            case 1:
                //DOUBLE CHECK
                ons.notification.confirm("Are you sure? THERE IS NO UNDO!").then(function(reslt){
                    myDB.destroy().then(function(){initDB();});
                }); // 2nd .confirm()
                break;
        } // END switch of 1st confirm
    }).catch(function(pErr){console.log(pErr)});
}; // END comicDeleteColl();