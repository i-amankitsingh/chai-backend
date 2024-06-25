import mongoose, { isValidObjectId } from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query
    

})

const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if(!isValidObjectId(videoId)){
        throw new ApiError(401, "Invalid video ID!")
    }

    const { content } = req.body

    if(!content){
        throw new ApiError(401, "Empty comment, please comment something");
    }

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user?._id
    })

    return res
    .status(200)
    .json(
        new ApiResponse(200, comment, "Comment added successfully")
    )
    // TODO: add a comment to a video
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const { commentId } = req.params

    if(!isValidObjectId(commentId)){
        throw new ApiError(401, "Invalid comment ID!")
    }

    const { content } = req.body

    const comment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set: {
                content,
            }
        },
        {
            new: true
        }

    )

    return res
    .status(200)
    .json(
        new ApiResponse(200,comment, "Comment updated succesfully" )
    )
})

const deleteComment = asyncHandler(async (req, res) => {

    const { commentId } = req.params

    if(!isValidObjectId(commentId)){
        throw new ApiError(401, "Invalid comment ID!")
    }

    await Comment.findByIdAndDelete(commentId, (err, doc) => {
        if(err){
             throw new ApiError(500, "Failed to delete comment")
        }
    })

    return res
    .status(200)
    .json(
        new ApiResponse(200, "Comment deleted successfully")
    )
 
    // TODO: delete a comment
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
}
