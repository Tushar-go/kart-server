import dotenv from "dotenv";
import Product from "./models/product.js";
import Category from "./models/category.js";
import mongoose from "mongoose";
import { categoriesData, productData } from "./seedData.js";


dotenv.config()

// "postinstall" in script means when we run npm i it will runs automaticallly

async function seedDatabase() {
    try {
        await mongoose.connect(process.env.MONGO_URI)

        //Deleting all data from product and categories
        await Product.deleteMany({})
        await Category.deleteMany({})

        const categoryDocs =  await Category.insertMany(categoriesData)

        const categoryMap = categoryDocs.reduce((map,category)=>{
            map[category.name] = category._id
            return map
        })

        const productWithCategoryIds = productData.map((product)=>({
            ...product,
            category:categoryMap[product.category]
        }))

        await Product.insertMany(productWithCategoryIds)


        console.log("DATABASE SEEDED SUCCESSFULLY")
        
    } catch (error) {
        console.error("Error seeding database:", error)
    } finally {
        mongoose.connection.close()
    }
}

seedDatabase()