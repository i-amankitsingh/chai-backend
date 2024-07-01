import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    //TODO: toggle like on video

    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(401, "Invalid video ID!")
    }

    const likeData = await Like.findOne({ video: videoId, likedBy: req.user?._id })

    if (!likeData) {
        const likedVideo = await Like.create({
            video: videoId,
            likedBy: req.user?._id
        })

        return res
            .status(200)
            .json(
                new ApiResponse(200, likedVideo, "You liked this video!")
            )
    }

    const likedVideo = await Like.deleteOne({ video: videoId, likedBy: req.user?._id })

    return res
        .status(200)
        .json(
            new ApiResponse(200, likedVideo, "You unliked this video!")
        )


})

const toggleCommentLike = asyncHandler(async (req, res) => {
    //TODO: toggle like on comment

    const { commentId } = req.params

    if (!isValidObjectId(commentId)) {
        throw new ApiError(401, "Invalid comment ID!")
    }

    const likeData = await Like.findOne({ comment: commentId, likedBy: req.user?._id })

    if (!likeData) {
        const likedVideo = await Like.create({
            comment: commentId,
            likedBy: req.user?._id
        })

        return res
            .status(200)
            .json(
                new ApiResponse(200, likedVideo, "You liked this comment!")
            )
    }

    const likedVideo = await Like.deleteOne({ comment: commentId, likedBy: req.user?._id })

    return res
        .status(200)
        .json(
            new ApiResponse(200, likedVideo, "You unliked this comment!")
        )

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    //TODO: toggle like on tweet

    const { tweetId } = req.params

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(401, "Invalid tweet ID!")
    }

    const likeData = await Like.findOne({ tweet: tweetId, likedBy: req.user?._id })

    if (!likeData) {
        const likedVideo = await Like.create({
            tweet: tweetId,
            likedBy: req.user?._id
        })

        return res
            .status(200)
            .json(
                new ApiResponse(200, likedVideo, "You liked this tweet!")
            )
    }

    const likedVideo = await Like.deleteOne({ tweet: tweetId, likedBy: req.user?._id })

    return res
        .status(200)
        .json(
            new ApiResponse(200, likedVideo, "You unliked this tweet!")
        )

}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos

    const userId = req.user?._id

    if(!userId){
        throw new ApiError(401, "Unauthrized request!")
    }

    const videos = await Like.find({
        likedBy: userId,
        video: {$exists: true}
    })

    if(!videos.length){
        throw new ApiError(404, "No liked video found!")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, videos, "Liked videos fetched successfully!")
    )

})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}