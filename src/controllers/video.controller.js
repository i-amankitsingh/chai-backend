import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    
    //TODO: get all videos based on query, sort, pagination

    try {
        const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    
        sortBy = req.query.sortBy || "createdAt"
        sortType = req.query.sortType === "desc"? -1 : 1
    
        const skip = (page - 1) * limit;
    
        const sortOptions = {}
        sortOptions[sortBy] = sortType;

        const video = await Video.find().skip(skip).limit(limit);

        const total = await Video.countDocuments()

        const totalPages = Math.ceil(total / limit);

        return res
        res.status(200)
        .json(
            new ApiResponse(200, {video, totalPages}, "Video data fetched successfully")
        )

    } catch (error) {
        return res
        .status(500)
        .json(
            new ApiError(500, "Failed to fetch data from server")
        )
    }



})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body

    if([title, description].some((field) => field.trim() === "")){
        throw new ApiError(401, "All field are required")
    }

    const videoFileLocalPath = req.files?.videoFile[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path 

    if(!videoFileLocalPath || !thumbnailLocalPath){
        throw new ApiError(401, "Video file and thumbnail both are required!")
    }

    const videoFile = await uploadOnCloudinary(videoFileLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if(!videoFile || !thumbnail){
        throw new ApiError(500, "Something went wrong white fetching video and thumbnail from cloud!")
    }

    const videoData = await Video.create({
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        title,
        description,
        duration: videoFile.duration,
        views: 0,
        isPublished: true,
        owner: req.user?._id
    })

    return res
    .status(200)
    .json(
        new ApiResponse(200, videoData, "Video uploaded successfully")
    )


    // TODO: get video, upload to cloudinary, create video
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!isValidObjectId(videoId)){
        throw new ApiError(404, "Video ID not match the record")
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404, "Video not found!")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, video, "Video found")
    )
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video ID")
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404, "Video not found")
    }

    const {title, description} = req.body;

    if([title, description].some((field) => field.trime() === "")){
        throw new ApiError(401, "All field are required")
    }

    const thumbnailLocalPath = req.files?.thumbnail[0]?.path 

    if(!thumbnailLocalPath){
        throw new ApiError(401, "thumbnail are required!")
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if(!thumbnail){
        throw new ApiError(500, "Something went wrong white fetching thumbnail from cloud!")
    }


    await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                title,
                description,
                thumbnail: thumbnail.url
            }
        }, 
        {new: true}
    )

    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "Video details updated successfully")
    )


    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if(!isValidObjectId(videoId)){
        throw new ApiError(401, "Invalid video id")
    }

    await Video.findByIdAndDelete(videoId, (err, doc) => {
        if(err){
            throw new ApiError(500, "Failed to delete video")
        }
    })

    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "Video deleted successfully")
    )

    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if(!isValidObjectId(videoId)){
        throw new ApiError(401, "Invalid video id")
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404, "Video not found!")
    }

    const publisState = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                isPublished: {
                    $not : "$isPublished"
                }
            }
        },
        {new: true}
    ).select('isPublished')

    
    return res
    .status(200)
    .json(
        new ApiResponse(200, {isPublished: publisState}, "Video pushlish state updated successfully")
    )

})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
