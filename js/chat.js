var makeMessage = function(data, names){

  source = $('#message-template').html();
  // source = $('#message-response-template').html();

  // Register a helper
  Handlebars.registerHelper('ifEqual', function(s, options){
    // str is the argument passed to the helper when called
<<<<<<< HEAD
    console.log("***"+s+"+++"+name[0]+"***");
    if(s != names[0]) {
=======
    // console.log("***"+s+"+++"+name[0]+"***");
    if(s == names[0]) {
>>>>>>> e0f5cf7fd02d151e2d7c859ce3669b37e5cb5442
      return options.fn(this);
    }
    else {
      return options.inverse(this);
    }
  });

  var template = Handlebars.compile(source);
  var context = {'data':data};
  // var context = {'time' : data[0]['_d'],
  //                'name' : data[1],
  //                'message' : data[2]
  //               };
  var html = template(context);

  $('.chat-history-list').html(template(context));
}
