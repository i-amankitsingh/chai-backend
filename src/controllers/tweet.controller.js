import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {

    const { content } = req.body
    console.log(content)
    if(!content){
        throw new ApiError(401, "Empty tweet, please write something in tweet.")
    }

    const tweet = await Tweet.create({
        content,
        owner: req.user?._id
    })

    return res
    .status(200)
    .json(
        new ApiResponse(200, tweet, "Tweet created successfully")
    )
    //TODO: create tweet
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets

    const { userId } = req.params

    if(!isValidObjectId(userId)){
        throw new ApiError(401, "Invalid user ID!")
    }
    const query = {"owner" : userId}
    const tweet = await Tweet.find(query)

    return res
    .status(200)
    .json(
        new ApiResponse(200, tweet, "Tweet fetched successfully")
    )

})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet

    // const {userId} = req.param

    // if(!isValidObjectId(userId)){
    //     throw new ApiError(401, "Unauthorized request")
    // }

    const { tweetId } = req.params

    if(!isValidObjectId(tweetId)){
        throw new ApiError(401, "Tweet ID not found!")
    }

    const {content} = req.body

    if(!content){
        throw new ApiError(401, "Please write something in tweet!")
    }

    const tweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set: {
                content
            }
        },
        {new: true}
    )

    return res
    .status(200)
    .json(
        new ApiResponse(200, tweet, "Tweet updated successfully!")
    )

})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet

    const {tweetId} = req.params

    if(!isValidObjectId(tweetId)){
        throw new ApiError(401, "Tweet ID not found!")
    }

    await Tweet.findByIdAndDelete(tweetId)

    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "Tweet Deleted!")
    )

})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
