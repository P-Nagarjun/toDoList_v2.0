//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _= require("lodash");

const app = express();

const day = date.getDate();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
let pwd = process.env.PWD_ID;
mongoose.connect("mongodb+srv://admin-Nagarjun:"+pwd+"@my-cluster-it-is-bpdhq.mongodb.net/toDoListDB",{ useNewUrlParser: true });

/* const items = ["Buy Food", "Cook Food", "Eat Food"];
const workItems = []; */

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item",itemsSchema);

const Item1 = new Item({
  name:"Welcome to your ToDoList"
});

const Item2 = new Item({
  name:"Hit + to add an Item"
});

const Item3 = new Item({
  name:"<-- To Delete an item"
});

defaultItems = [Item1,Item2,Item3];

listSchema ={
  name:String,
  items: [itemsSchema]
};

const List= mongoose.model("List",listSchema);

app.get("/", function(req, res) {

  Item.find({}, function (err,foundItems) {
    if (foundItems.length===0) {
      // console.log(err);
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);
        }
        else{
          console.log("Successfully added Items to toDoListDB");
        }
      });

      res.redirect("/");
    }
    else{
      // console.log(foundItems);
      const day = date.getDate();

      res.render("list", {listTitle: day, newListItems: foundItems});
    }
  });

/*const day = date.getDate();

  res.render("list", {listTitle: day, newListItems: items});*/

});

app.get('/:customListName', function (req, res) {
  // res.send(req.params.topic);
  // console.log(req.params.topic);

  // const requestedTitle = _.lowerCase(req.params.topic);
  const customListName =_.capitalize(req.params.customListName);

//   posts.forEach(function(post) {
//     const storedTitle = _.lowerCase(post.title);
//
//     if(storedTitle===requestedTitle){
//       res.render("post",{title: post.title,
//       content: post.content});
//     }
// });
  List.findOne({name:customListName},function(err,foundList){
    if(!err){
      if(!foundList){
    //Create a new List
    // console.log("Doesn't Exists");

      const list = new List({
        name: customListName,
        items: defaultItems
      });

      list.save();
      res.redirect("/"+customListName);
      }else{
          //Show an Existing List
          // console.log("Exists");
        res.render("list",{listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });


});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item( {name : itemName
  });

  if(listName===day)
{
  item.save();

  res.redirect("/");
}else{
  List.findOne({name:listName},function(err,foundList){
    foundList.items.push(item);
    foundList.save();
    res.redirect("/"+listName);
  });
}
  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});

app.post("/delete",function(req,res){
  const checkedItemId=req.body.checkbox;
  const listName = req.body.listName;

  if(listName===day){
    Item.findByIdAndRemove(checkedItemId, function (err){
      if(err){
        console.log(err);
      }
      else{
        console.log("Deleted");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name:listName},{$pull: {items:{_id:checkedItemId}}},function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }



});


// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;      //changed from 8000 to 3000
}
app.listen(port, function() {
  console.log("Server started on port 3000");
});
