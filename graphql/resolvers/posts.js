const Post = require('../../models/Post')
const checkAuth = require('../../util/check-auth')
const {AuthenticationError,UserInputError} = require('apollo-server')

module.exports={
     Query:{
        async getPosts(){
            try {
                const posts = await Post.find().sort({createdAt:-1})
                return posts
            } catch (error) {
                throw new Error(error)
            }
        },
        async getPost(parent,{postId}){
            try {
                const post = await Post.findById(postId)
                if(post)
                    return post

                throw new Error('Post not found')
              
            } catch (error) {
                throw new Error({error})
            }
        }     
        
    },
    Mutation:{
        async createPost(parent,{body,token},context){
            const user = checkAuth(context)

            if(body.trim()==='')
                throw new UserInputError('Post body must not be empty')
          
            const newPost = new Post({
                body,
                user:user.id,
                username:user.username,
                createdAt:new Date().toISOString()
            })

            const post = await newPost.save()

            context.pubsub.publish('NEW_POST',{
                newPost:post
            })

            return post

        },
        async deletePost(parent,{postId},context){
            const user = checkAuth(context)

            try {
                const post = await Post.findById(postId)
                if(user.username===post.username){
                    await post.delete()
                    return 'Post deleted successfully'
                }

                throw new AuthenticationError('Action not allowed')

            } catch (error) {
                throw new Error(error)
            }
        }
    },
    // Subscription:{
    //     newPost:{
    //         subscribe:(parent,args,{pubsub})=> pubsub.asyncIterator(['NEW_POST'])      
    //     }
    // }
}