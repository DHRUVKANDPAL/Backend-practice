import mongoose,{Schema} from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
const userSchema = new Schema(
   {
       username: {
           type: String,
           required: true,
           unique: true,
           lowercase: true,
           trim: true, 
           index: true
       },
       email: {
           type: String,
           required: true,
           unique: true,
           lowecase: true,
           trim: true, 
       },
       fullName: {
           type: String,
           required: true,
           trim: true, 
           index: true
       },
       avatar: {
           type: String, // cloudinary url
           required: true,
       },
       coverImage: {
           type: String, // cloudinary url
       },
       watchHistory: [
           {
               type: Schema.Types.ObjectId,
               ref: "Video"
           }
       ],
       password: {
           type: String,
           required: [true, 'Password is required']
       },
       refreshToken: {
           type: String
       }

   },
   {
       timestamps: true
   }
)

// ENCRYPTING PASSWORD
userSchema.pre("save",async function(next){
   if(!this.isModified("password")) return next();
   this.password=bcrypt.hash(this.password,10); // password will be saved in encypted form in databse after completing 10 hash rounds 
   next();
})

userSchema.methods.isPasswordCorrect =async function(password){
   return await bcrypt.compare(password,this.password);
}

/* 

   *   //METHOD TO MODIFY PASSWORD
   *  userSchema.methods.modifyPassword = async function (currentPassword, newPassword) {
   *     // Verify current password
   *     const isMatch = await bcrypt.compare(currentPassword, this.password);
   *     if (!isMatch) {
   *     throw new Error("Current password is incorrect");
   *     }
   *  
   *     // Hash and set the new password
   *     this.password = await bcrypt.hash(newPassword, 10);
   *     await this.save();
   *  };
 */


userSchema.methods.generateAccessToken = function(){
   return jwt.sign(
       {
           _id: this._id,
           email: this.email,
           username: this.username,
           fullName: this.fullName
       },
       process.env.ACCESS_TOKEN_SECRET,
       {
           expiresIn: process.env.ACCESS_TOKEN_EXPIRY
       }
   )
}
userSchema.methods.generateRefreshToken = function(){
   return jwt.sign(
       {
           _id: this._id,
           
       },
       process.env.REFRESH_TOKEN_SECRET,
       {
           expiresIn: process.env.REFRESH_TOKEN_EXPIRY
       }
   )
}

export const User=mongoose.model("User",userSchema)