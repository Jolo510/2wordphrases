if (Meteor.isClient) {

  Template.body.events({
    "submit .process-website": function(event) {
      // Prevents default broswer form submit
      event.preventDefault(); 

      // $(".disableOnSubmit").prop("disabled", true); 

      // Gets value from from element 
      var website = event.target.website.value; 

      // Process URL 
      Meteor.call("processWebsite", website, function(err, result) {
        if (err) console.log(err); 

        console.log("printing result in the callback " + result); 
        // $(".disableOnSubmit").prop("disabled", false);
      });

      // Clear form
      event.target.website.value = ""; 
    }
  }); 

}



if (Meteor.isServer) {
  Meteor.methods({
    processWebsite: function(website) {
      this.unblock(); 
      Meteor.http.call("GET", website, function(error, result) {
        if (error) {
          console.log(error);
        } else {
          console.log(result.content);
        }
      }); 
      return website;
    }
  })
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
