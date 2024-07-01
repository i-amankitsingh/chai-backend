import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    // TODO: toggle subscription

    const {channelId} = req.params

    if(!isValidObjectId(channelId)){
        throw new ApiError(401, "Channel ID not found!")
    }

    const isSubscribed = await Subscription.findOne({subscriber: req.user?._id, channel: channelId})

    if(!isSubscribed){
       const subscription = await Subscription.create({
        subscriber: req.user?._id,
        channel: channelId
       })

       return res
       .status(200)
       .json(
            new ApiResponse(200, subscription, "You subscribed this channel!")
       )
    }

    const subscription = await Subscription.deleteOne({subscriber: req.user?._id, channel: channelId})

    return res
    .status(200)
    .json(
        new ApiResponse(200, subscription, "You unsubscribed this channel!")
    )

})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params


    if(!isValidObjectId(channelId)){
        throw new ApiError(401, "Channel ID not found!")
    }

    const subscriber = await Subscription.find({channel: channelId})
    
    if(!subscriber.length){
        throw new ApiError(400, "No subscriber found!")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, {subscriber: subscriber.length, subscribers: subscriber}, "Subscriber fetched successfully!")
    )

})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if(!isValidObjectId(subscriberId)){
        throw new ApiError(401, "Invalid User ID!")
    }

    const channel = await Subscription.find({subscriber: subscriberId})

    if(!channel.length){
        throw new ApiError(404, "No channel subscribed!")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, channel, "Subscribed channel data fetched successfully!")
    )

})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}