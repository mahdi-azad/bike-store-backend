const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;
const bcrypt = require('bcrypt');
const saltRounds = 10;

//Middleware
app.use(cors())
app.use(express.json())

const uri = "mongodb+srv://bike-store-backend:JsKXOcY5cXqSzlBj@cluster0.z89qg.mongodb.net/bikestoreDB?retryWrites=true&w=majority&appName=Cluster0";
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const userCollection = client.db().collection("user");
    const productCollection = client.db().collection("products");
    const cartCollection = client.db().collection("cart");
    const serviceCollection = client.db().collection("service");
//PRODUCTS CRUD OPERATIONS
    //product creation
    app.post("/createproduct", async(req, res) => {
      const {name, imageUrl, description, price, rating, category, featured} = req.body;
      const newProduct = { 
          name, 
          imageUrl, 
          description, 
          price, 
          rating, 
          category, 
          featured,
      }
      console.log(newProduct);
      const result = await productCollection.insertOne(newProduct);
      res.send({
          data: result,
          status: 200,
          message: "Product created successfully"
      });
  });

    
    //product display, retrieve all products
    app.get("/displayproduct", async (req, res) => {
      try {
        const products = await productCollection.find({}).toArray();
        res.status(200).send({ data: products, status: 200, message: "Products fetched successfully" });
      } catch (error) {
        res.status(500).send({ status: 500, message: "Error fetching products", error });
      }
    });

    //find one product using the object id
    app.get("/displayproduct/:id", async (req, res) => {
      const { id } = req.params;

      try {
        const result = await productCollection.findOne({ _id: new ObjectId(id) })
        
        res.status(200).send({ data: result, status: 200, message: "Product fetched successfully" });
      } catch (error) {
        res.status(500).send({ status: 500, message: "Error fetching product", error });
      }
    })

    // Delete a product
    app.delete("/displayproduct/:id", async (req, res) => {
      const { id } = req.params;
    
      try {
        const result = await productCollection.deleteOne({ _id: new ObjectId(id) }); //new ObjectId(id) Converts the string id (from the route parameter req.params.id) into an ObjectId.
        if (result.deletedCount === 1) {
          res.status(200).send({ status: 200, message: "Product deleted successfully" });
        } else {
          res.status(404).send({ status: 404, message: "Product not found" });
        }
      } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).send({ status: 500, message: "Error deleting product", error });
      }
    });

    // Edit a product
    app.put("/displayproduct/:id", async (req, res) => {
      const { id } = req.params;
      const updatedProduct = req.body;
      const filter = {_id: id}
      try {
        const result = await productCollection.updateOne(
          { _id: new ObjectId(id) }, // Use the product ID to find the document
          { $set: {
            name: updatedProduct.name,
            image: updatedProduct.image,
            description: updatedProduct.description,
            price: updatedProduct.price,
            rating: updatedProduct.rating,
            category: updatedProduct.category,
            featured: updatedProduct.featured
          } } // Update the product with new values
        );
        res.status(200).send({ data: result, status: 200, message: "Product updated successfully" });
      } catch (error) {
        res.status(500).send({ status: 500, message: "Error updating product", error });
      }
    });
//CART CRUD OPERATION
    //add to cart for products
    app.post("/cart-products", async (req, res) => {
      const { productId, name, image, description, price, rating, category, featured, email } = req.body;
      const updatedCart = {
          productId,
          name, 
          image, 
          description, 
          price, 
          rating, 
          category, 
          featured,
          email
      }
      const result = await cartCollection.insertOne(updatedCart);
      
       res.send({
          data: result,
          status: 200,
          message: "Order added successfully to cart"
      });
      
    })
    //add to cart for services
    app.post("/cart-services", async (req, res) => {
      const { productId, name, image, description, price, rating, featured, email } = req.body;
      const updatedCart = {
          productId,
          name, 
          image, 
          description, 
          price, 
          rating, 
          featured,
          email
      }
      const result = await cartCollection.insertOne(updatedCart);
      
       res.send({
          data: result,
          status: 200,
          message: "Order added successfully to cart"
      });
      
    })
    //retrieve cart items based on email
    //how post??
    app.get("/cart-list", async (req, res) => {
     
      const {email} = req.query;
      console.log(email);
      const result = await cartCollection.find({email: email}).toArray();
      
      res.send({
        data: result,
        status: 200,
        message: `Cart List for ${email}`
    });
    })
    //delete product cart items based on email
    app.delete("/cart-list/:orderId", async (req, res) => {
      
      const { orderId } = req.params;
  
      try {
        const result = await cartCollection.deleteOne({ _id: new ObjectId(orderId) });
        if (result.deletedCount === 1) {
          res.status(200).send({ status: 200, message: "Product deleted from cart successfully" });
        } else {
          res.status(404).send({ status: 404, message: "Product not found" });
        }
      } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).send({ status: 500, message: "Error deleting product from cart", error });
      }})
      
    
      
//jason azad
//JasonAzad123!
//USER CRUD OPERATION
    //user signup and signin
    app.post("/signup", async(req, res) => {
        const {fullName, role, imageUrl, email, password} = req.body;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const newUser = {
            fullName,
            role: "user", 
            imageUrl,
            email,
            password: hashedPassword
        }
        console.log(newUser);
        const result = await userCollection.insertOne(newUser);
        res.send({
            data: result,
            status: 200,
            message: "user created successfully"
        });
    });

    app.post("/signin", async (req, res) => {
        const {email, password} = req.body
        const userFromDatabase = await userCollection.findOne({email: email})
        if(!userFromDatabase) {
            return res.status(404).send({status: 404, message: "User not found"})
        }
        const isPasswordMatch = await bcrypt.compare(password, userFromDatabase.password)
        console.log(userFromDatabase)
        console.log(isPasswordMatch)
        if(isPasswordMatch) {
            return res.send({
                data: userFromDatabase,
                status: 200,
                message: "User Logged In Successfully"
            })
        } else {
            res.status(404).send({status: 404, message: "Invalid Credentials"})
        }
    })
//Services Crud operations

//Service creation
app.post("/create-service", async(req, res) => {
  const {name, image, description, price, rating, featured} = req.body;
  const newService = { 
      name, 
      image, 
      description, 
      price, 
      rating,  
      featured,
  }
  console.log(newService);
  const result = await serviceCollection.insertOne(newService);
  res.send({
      data: result,
      status: 200,
      message: "Service created successfully"
  });
});


//Service display, retrieve all services
app.get("/display-service", async (req, res) => {
  try {
    const services = await serviceCollection.find({}).toArray();
    res.status(200).send({ data: services, status: 200, message: "Services fetched successfully" });
  } catch (error) {
    res.status(500).send({ status: 500, message: "Error fetching services", error });
  }
});

//find one service using the object id
app.get("/display-service/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await serviceCollection.findOne({ _id: new ObjectId(id) })
    
    res.status(200).send({ data: result, status: 200, message: "Service fetched successfully" });
  } catch (error) {
    res.status(500).send({ status: 500, message: "Error fetching service", error });
  }
})
//Update a service 
app.put("/display-service/:id", async (req, res) => {
  const { id } = req.params;
  const updatedService = req.body;
  const filter = {_id: id}
  try {
    const result = await serviceCollection.updateOne(
      { _id: new ObjectId(id) }, // Use the service ID to find the document
      { $set: {
        name: updatedService.name,
        image: updatedService.image,
        description: updatedService.description,
        price: updatedService.price,
        rating: updatedService.rating,
        featured: updatedService.featured
      } } // Update the service with new values
    );
    res.status(200).send({ data: result, status: 200, message: "Service updated successfully" });
  } catch (error) {
    res.status(500).send({ status: 500, message: "Error updating service", error });
  }
});
// Delete a service
app.delete("/display-service/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await serviceCollection.deleteOne({ _id: new ObjectId(id) }); //new ObjectId(id) Converts the string id (from the route parameter req.params.id) into an ObjectId.
    if (result.deletedCount === 1) {
      res.status(200).send({ status: 200, message: "Service deleted successfully" });
    } else {
      res.status(404).send({ status: 404, message: "Service not found" });
    }
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).send({ status: 500, message: "Error deleting Service", error });
  }
});

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello World! me ')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})