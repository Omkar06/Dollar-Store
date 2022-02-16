// var express = require('express');
// var router = express.Router();
// var monk = require('monk');


// /* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('signup',);
// });



// module.exports = router;
var express = require('express');
var app = express.Router();
var parser = require('body-parser');
var urlencodedParser = parser.urlencoded({ extended: false });
var passport = require('passport');
var Account = require('../models/account');
var monk = require('monk');
const { urlencoded } = require('express');
var db = monk('localhost:27017/Project');
var collection = db.get('user_data');
var collection1 = db.get('Products');
var collection2 = db.get('cart');
var collection3 = db.get('orderhistory');


app.get('/', function (req, res, next) {
  res.redirect('/login');
});

app.get('/home', function (req, res) {
  // console.log(req.user);
  collection1.find({ isDeleted: false }, function (err, Products) {
    if (err) throw err;
    res.render('index', { results: Products, user: req.user });
  });
});


app.get('/viewprodadm', function (req, res) {
  // console.log(req.user);
  collection1.find({ isDeleted: true }, function (err, Products) {
    if (err) throw err;
    res.render('admview', { results: Products, user: req.user });
  });
});

app.get('/register', function (req, res) {
  res.render('register', {});
});

// app.get('/', function(req, res) {
//     collection1.find({}, function(err, Products){
//         if(err) throw err;
//         res.render('index',{results : Products});
//         //res.json(Products);
//         // res.send("hello");  
//     });
// });

app.get('/home/:id', function (req, res) {
  collection1.findOne({ _id: req.params.id }, function (err, video) {
    if (err) throw err;
    res.render('itemdetails', { video: video, user: req.user });
  });
});

app.get('/viewprodadm/:id', function (req, res) {

  collection1.findOne({ _id: req.params.id }, function (err, video) {
    // console.log(video);
    if (err) throw err;
    res.render('admitemdetail', { video: video, user: req.user });
  });
});

app.post('/register', function (req, res) {

  //code if no user with entered email was found
  Account.register(new Account({ username: req.body.email, Full_name: req.body.name }), req.body.password, function (err, account) {
    if (err) {
      res.send(false);

      // return res.render('register', { account : account });
    }
    passport.authenticate(urlencodedParser, 'local')(req, res, function () {
      res.send(true)
    });
  });
  // console.log(req.body);

});

app.get('/login', function (req, res) {
  res.render('login');
  // console.log(req.body);
});

app.post('/login', passport.authenticate('local'), function (req, res) {
  res.redirect('/home');
});

app.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/login');
});


app.post('/home', function (req, res, next) {
  collection1.find({ isDeleted: false }, function (err, Products) {
    if (err) throw err;
    var store_output = []
    var length_collection = Products.length;
    var name = req.body.name;
    var Category = req.body.Category;
    // console.log(Category);

    for (let i = 0; i < length_collection; i++) {

      if (name !== '' && Category !== 'select') {
        if (Products[i].name.toLowerCase().includes(name.toLowerCase()) && Products[i].Category.toLowerCase().includes(Category.toLowerCase())) {
          store_output.push(Products[i]);
        }
      }

      else {
        if ((name !== '' && Products[i].name.toLowerCase().includes(name.toLowerCase()))) {
          store_output.push(Products[i])
        }
        else if (Products[i].Category.toLowerCase().includes(Category.toLowerCase())) {
          store_output.push(Products[i]);
        }
      }
    }

    if (name === '' && Category === 'select') {
      res.redirect('/home');
    }
    else {
      videos = store_output;

      res.render('index', { results: videos, user: req.user });
    }
  });
});

app.get('/home/:id/edit', function (req, res) {
  collection1.findOne({ _id: req.params.id }, function (err, Products) {
    if (err) throw err;
    res.render('edit', { videos: Products, user: req.user });
  });
});


app.put('/home/:id', function (req, res) {
  collection1.update({ _id: req.params.id },
    {
      $set: {
        name: req.body.name,
        price: req.body.price,
        Category: req.body.Category,
        quantity: req.body.quantity,
        description: req.body.description,
        image: req.body.image
      }
    },
    function (err, Products) {
      if (err) throw err;
      res.redirect('/home');
    })
});


let cal_price = 0;


app.post('/addtocart/:id', function (req, res) {

  // console.log("useris", req.user);
  // console.log("received prod id is", req.params.id);


  collection1.findOne({ _id: req.params.id }, function (err, Product) {
    if (err) throw err;
    let quant_find = parseInt(req.body.quantity);
    let price_item = parseFloat(Product.price);
    let total_price = quant_find * price_item;
    cal_price = total_price + cal_price;
    // console.log(cal_price);
    let date_time = new Date();

    var obj1 = {
      userId: req.user._id,
      total_price_calculated: cal_price,
      buy_items: [{
        product_id: Product._id,
        product_available_qty: Product.quantity,
        product_name: Product.name,
        product_image: Product.image,
        product_category: Product.Category,
        product_price: Product.price,
        product_total_price: total_price,
        product_quantity: req.body.quantity,
        product_created: date_time
      }]

    }

    var obj2 = {
      userId: req.user._id,
      buy_items: [{
        product_id: Product._id,
        product_available_qty: Product.quantity,
        product_name: Product.name,
        product_image: Product.image,
        product_category: Product.Category,
        product_price: Product.price,
        product_total_price: total_price,
        product_quantity: req.body.quantity,
        product_created: date_time
      }]

    }
    // console.log("obj1 buy items", obj1)

    collection2.findOne({ userId: req.user._id }, function (err, cartexist) {
      if (err) throw err;
      if (cartexist != undefined) {
        var arr = cartexist.buy_items

        var existcart = false;
        var prevcartqty = 0;
        var q = 0;

        for (var i = 0; i < arr.length; i++) {
          if (arr[i].product_id == req.params.id) {
            existcart = true
            prevcartqty = arr[i].product_quantity
            q = i;
          }
        }

        if (existcart) {
          obj2.buy_items[0].product_quantity = parseInt(quant_find) + parseInt(prevcartqty)
          let price_item1 = parseFloat(obj2.buy_items[0].product_price);
          let total_price2 = obj2.buy_items[0].product_quantity * price_item1;
          obj2.buy_items[0].product_total_price = total_price2
          let cal_price2 = 0;
          cal_price2 = parseInt(total_price2) + parseInt(arr.total_price_calculated);
          // console.log("hello");
          arr.splice(q, 1)
        }

        // console.log(total_price);

        // console.log(cartexist.total_price_calculated);



        let cal_price1 = total_price + cartexist.total_price_calculated;
        // console.log("new price");
        // console.log(cal_price1);
        arr.push(obj2.buy_items[0])

        collection2.update({ userId: req.user._id }, {
          $set: {
            userId: req.user._id,
            total_price_calculated: cal_price1,
            buy_items: arr
          }
        }, function (err) {
          if (err) throw err
          res.redirect('/cart');
        })

      }
      else {
        collection2.insert(obj1, function (err) {
          if (err) throw err
          res.redirect('/cart');
        });
      }
    });
  });



  // collection2.findOne({ user_id: req.user._id }, function(err, user_data){
  //   if (err) throw err;

  //   if(user_id==true){
  //     collection2.update({_id:req.params.id},
  //       {$set: {
  //       isDeleted: true
  //       }},
  //       function(err, Products){
  //       if(err) throw err;
  //       res.redirect('/all_products');
  //   })
  //   }
  //   else{

  //   collection2.insert({
  //     user_id: req.user._id,

  //   },function (err, cart){ 
  //     if (err) throw err;
  //     res.redirect('/all_products');
  //   });

  //   }

  //   }
  // });

});


// app.get('/home/:id', function (req, res) {


//   collection1.findOne({ _id: req.params.id }, function (err, video) {
//     if (err) throw err;




//     // var obj1={
//     //   buy_items:{
//     //     product_id: Product._id,
//     //     product_name:Product.name,
//     //     product_price:Product.price,
//     //     product_quantity:req.body.quantity
//     //   }
//     // }  

//   });

// });


app.delete('/home/:id', function (req, res) {
  collection1.update({ _id: req.params.id },
    {
      $set: {
        isDeleted: true
      }
    },
    function (err, Products) {
      if (err) throw err;
      res.redirect('/home');
    })
});


app.get('/new', function (req, res) {
  // console.log(req.user);
  res.render('new', { user: req.user });
});

// app.get('/home/new', function(req, res, next) {
//   res.render('add_items', {user : req.user});
// });


app.post('/home/add_items', function (req, res, next) {
  collection1.insert({
    name: req.body.name,
    price: req.body.price,
    Category: req.body.Category,
    quantity: req.body.quantity,
    description: req.body.description,
    image: req.body.image,
    isDeleted: false
  }, function (err, video) {
    if (err) throw err;
    res.redirect('/home');
  });
});

app.get('/cart', function (req, res) {
  // console.log("logged in user is : ", req.user);

  var list = []
  collection2.find({ userId: req.user._id }, function (err, res1) {
    if (err) throw err;

    if (res1 != undefined) {
      res.render('cart', { result: res1, user: req.user });
    } else {
      res.render('cart', { result: list, user: req.user });
    }


  });
});


app.get('/checkout', function (req, res) {
  // console.log("logged in user is : ", req.user);
  collection2.findOne({ userId: req.user._id }, function (err, cartexist) {
    if (err) throw err;
    var today = new Date();
    var year = today.getFullYear();
    var mon = today.getMonth() + 1;
    var date_get = today.getDate();
    var fin_op = mon + "/" + date_get + "/" + year;
    let z = cartexist.total_price_calculated;
    var arr1 = cartexist.buy_items;

    arr1.forEach(item => {

      collection1.update({ _id: item.product_id }, {
        $set: {
          quantity: parseInt(item.product_available_qty) - parseInt(item.product_quantity)
        }, function(err) {
          if (err) throw err;


        }

      })
    });

  collection3.insert({ ...cartexist, order_created: fin_op, total_price_calculated: z }, function (err) {
    if (err) throw err
    collection2.remove({ userId: req.user._id }, function (err) {
      if (err) throw err;
      cal_price = 0;
      res.redirect("/home");
    });
  });
});
});


app.get('/myorders', function (req, res) {
  // console.log("logged in user is : ", req.user._id);

  var list = []

  collection3.find({ userId: req.user._id }, function (err, orderhis) {
    if (err) throw err;
    // console.log(orderhis)
    if (orderhis != undefined) {
      res.render('orders', { result: orderhis, user: req.user });
    } else {
      res.render('orders', { result: list, user: req.user });
    }

  });
});



app.get('/deletefromcart/:id', function (req, res) {
  // console.log("logged in user is : ", req.user._id);

  collection2.findOne({ userId: req.user._id }, function (err, cart) {
    var arr = cart.buy_items

    var index = 0
    for (var i = 0; i < arr.length; i++) {
      if (arr[i].product_id == req.params.id) {
        index = i
      }
    }
    // console.log(index);
    // console.log(cart.buy_items[index]);
    let tot_price_prod = (cart.buy_items[index].product_total_price);
    let tot_amt = cart.total_price_calculated;
    let amt_diff = tot_amt - tot_price_prod;

    // console.log(req.params.id);
    arr.splice(index, 1);

    collection2.update({ userId: req.user._id }, {
      $set: {
        userId: req.user._id,
        total_price_calculated: amt_diff,
        buy_items: arr
      }
    }, function (err) {
      if (err) throw err;


      res.redirect('/home')
    })


  })

});

app.post('/chgqty/:id', function (req, res) {

  let qty = parseInt(req.body.quantity);
  // console.log(qty);

  collection2.findOne({ userId: req.user._id }, function (err, cart) {

    var arr = cart.buy_items
    var index = 0
    for (var i = 0; i < arr.length; i++) {
      if (arr[i].product_id == req.params.id) {

        arr[i].product_quantity = qty;


        let x = parseInt(cart.buy_items[i].product_total_price)
        let z = parseInt(cart.total_price_calculated)
        let y = z - x

        let per_qty_price = parseInt(cart.buy_items[i].product_price)
        let new_price_qty = qty * per_qty_price
        let new_total_price = y + new_price_qty

        arr[i].product_total_price = new_price_qty

        collection2.update({ userId: req.user._id }, {
          $set: {
            buy_items: arr,
            total_price_calculated: new_total_price
          }
        }, function (err) {
          if (err) throw err;


          res.redirect('/home')
        })


      }
    }


  })



});

module.exports = app;