const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const date = require(__dirname+"/date.js")
const lodash = require('lodash');

mongoose.connect("mongodb+srv://adminDilshan:Te$t123@cluster0-bp2zo.mongodb.net/todolistDB",
{useNewUrlParser: true ,useUnifiedTopology: true }); //connection string

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
const day = date();

const itemsSchema = new mongoose.Schema({
    item: {
        type: String,
        required:true
    },
    checked: String
}); 
const Item = mongoose.model("Item", itemsSchema);

const listSchema = new mongoose.Schema({
    name: {
        type: String,
        required:true
    },
    items: [itemsSchema]
}); 
const List = mongoose.model("List", listSchema);

const item1 = new Item({
    item:"Welcome To Do List!!!"
});
const item2 = new Item({
    item:"< -- Click here to cross out an Item !!!"
});

app.get("/", function(req,res){
    
    Item.find({}, function(err, foundItems){
        if (err) {
            console.log(err);
        } else {
            if (foundItems.length === 0) {
              
                Item.insertMany([item1,item2], function(err){
                    errorFunction(err);
                }); 
            }
            res.render('list', {listTitle: day, newItems: foundItems});
        }
    })
    
});

function errorFunction(err){
    if (err) {
        console.log(err);
    } else {
        console.log("Success")
    }
}

app.post("/delete", function(req, res){
    const listName = req.body.listName;
    if ( listName == day){
        Item.findByIdAndRemove(req.body.check, function(err){
            errorFunction(err);
        })
        res.redirect("/");
    }
    else{
        List.findOneAndUpdate({name: listName},{$pull: {items: {_id:req.body.check}}}, 
            function(err, result){
            errorFunction(err);
            res.redirect("/"+ listName);
        });
        
    }

    
});

app.get("/:customListName", function(req,res){
    // console.log(req.params.customListName);
    const givenTitle = lodash.lowerCase([string=req.params.customListName])
    List.findOne({name:givenTitle}, function(err,foundLists){
        if (!foundLists){
            const list = new List({
                name: givenTitle,
                items:[item1, item2]
              });
            list.save();
            res.redirect("/"+givenTitle);
        }
        else{
            res.render('list', {listTitle: foundLists.name, newItems: foundLists.items});
        } 
    });
});


app.post("/", function(req,res){
    const listName = req.body.listName;
    if ( listName == day){
        const newItem = new Item({
            item: req.body.newInput
        })
        newItem.save();
        res.redirect("/");
    }
    else{
        List.findOne({name: listName}, function(err, result){
            const newItem = new Item({
                item: req.body.newInput
            });
            result.items.push(newItem);
            result.save();
        });
        res.redirect("/"+ listName);
    }
    
});

app.listen(3000, function(){
    console.log("Server online at port 3000");
}); 