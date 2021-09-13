const Post = require('../../models/Post')
const {UserInputError,AuthenticationError} = require('apollo-server')
const checkAuth = require('../../util/check-auth')

module.exports = {
    Mutation:{
        createComment: async (parent,{postId,body},context)=>{
            const {username} = checkAuth(context)
            if(body.trim()==='')
                throw  new UserInputError('Empty comment',{
                    errors:{
                        body:'Comment body must not empty'
                    }
                })

                const post = await Post.findById(postId)

                if(post){

                    post.comments.unshift({
                        body,
                        username,
                        createdAt: new Date().toISOString()
                    })
                    
                    await post.save()
                    return post
                }

                throw new UserInputError('Post not found')

        },

        async deleteComment(parent,{postId,commentId},context){
            const {username} = checkAuth(context)
            const post = await Post.findById(postId)

            if(post){
         
                const commentIndex = post.comments.findIndex(c => c.id===commentId)

                if(post.comments[commentIndex].username === username){

                    post.comments.splice(commentIndex,1)
                    await post.save()
                    return post

                }    
                
                throw new AuthenticationError('Action is not allowed')
                
            }

            throw new UserInputError('Post not found')

        },
        async likePost(parent,{postId},context){

            const {username} = checkAuth(context)
            const post = await Post.findById(postId)

            if(post){

                if(post.likes.find(like=>like.username === username)){
                    //Post already likes, unlike it
                    post.likes = post.likes.filter(like => like.username !== username)
                    return await post.save()

                }

                post.likes.push({
                    username,
                    createdAt: new Date().toISOString()
                })

                return await post.save()

            }

            throw new UserInputError('Post not found')

        }

    }
}