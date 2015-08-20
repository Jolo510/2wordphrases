WordPhrases = new Mongo.Collection("phrases"); 

if (Meteor.isServer) {
  Meteor.publish("words", function() {
      return WordPhrases.find({}); 
  })
}

if (Meteor.isServer) {
  Meteor.methods({
    processWebsite: function(website) {
      this.unblock(); 
      try {
        var result = HTTP.call("GET", website); 

        // Removing HTML tags 
        var stripped = TagStripper.strip(result.content);  
        // Creating an array of elements 
        var arrayOfElements = stripped.split(/\s*\b\s*/);

        var arrayLength = arrayOfElements.length -1; 
        var currentWord, nextWord, phrase; 

        var listOfPhrases = {}; 
        var arrayOfPhrases = []; 
        var arrayOfTopPhrases = []; 

        var numOfTopPhrases = 10; 

        // Getting the number of 2 word phrases 
        for (var i=0; i < arrayLength; i++) {
          currentWord = arrayOfElements[i].toLowerCase(); 
          nextWord = arrayOfElements[i+1].toLowerCase(); 

          if (/^[a-zA-Z]+$/.test(currentWord) && /^[a-zA-Z]+$/.test(nextWord)) {
            phrase = currentWord + " " + nextWord; 
            // If phrase already exists, add one to its count 
            if (listOfPhrases[phrase]) {
              listOfPhrases[phrase] += 1;
            } else if (listOfPhrases[phrase] === undefined) {
              // Create an entry with initial value 1
              listOfPhrases[phrase] = 1; 
            } 
          }
        }

        for(var key in listOfPhrases) {
          if (listOfPhrases.hasOwnProperty(key)) {
            arrayOfPhrases.push(listOfPhrases[key] + " " + key); 
          }
        }

        // Sorting the array of elements 
        arrayOfPhrases.sort(); 

        for(var j=arrayOfPhrases.length-1; j > arrayOfPhrases.length-numOfTopPhrases-1; j--) {
          if (arrayOfPhrases[j] === undefined) {
          // If out of bounds we leave the loop 
          break;
          }
          // Add to top array 
          arrayOfTopPhrases.push(arrayOfPhrases[j]); 
        }

        WordPhrases.update({url: website},{ 
          url: website, 
          topPhrases: arrayOfTopPhrases, 
          createdAt: new Date()
        }, function(error, result){
          if (error) console.log(error); 
          console.log(result);
          // If result is 0, means the entry doesn't exists
          if (result === 0) {
            // Insert the entry 
            WordPhrases.insert({ 
              url: website, 
              topPhrases: arrayOfTopPhrases, 
              createdAt: new Date()
            }); 
          }
        }); 
        return arrayOfTopPhrases;
      } catch (e) {
        return false; 
      }
    }
  });
}

if (Meteor.isClient) {
  Template.body.events({
    "submit .process-website": function(event) {
      // Prevents default broswer form submit
      event.preventDefault(); 

      // Clearing the list
      $("#phrase-list").empty();
      $("#phrase-list").append("<li class='list-group-item'>Two Words Phrases<span class='badge'>Phrase Count</span></li>");

      // Disable forms on input 
      $(".disableOnSubmit").prop("disabled", true);
      // Gets value from from element 
      var website = event.target.website.value; 

      // Process URL 
      Meteor.call("processWebsite", website, function(error, result) {
        var splitResult; 
        for (var i=0; i < result.length; i++) { 
          splitResult = result[i].split(" "); 
          $("#phrase-list").append( "<li class='list-group-item'>" + splitResult[1] + " " + splitResult[2] + "<span class='badge'>"+splitResult[0]+"</span>" +"</li>" );
        }
        // Enable Form
        $(".disableOnSubmit").prop("disabled", false);
      }); 
      // Clear form
      event.target.website.value = ""; 
    }
  }); 
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
