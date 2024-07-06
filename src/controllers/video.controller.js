import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { destroyCloudinaryImage, destroyCloudinaryVideo, uploadOnCloudinary } from "../utils/cloudinary.js"





const getAllVideos = asyncHandler(async (req, res) => {
    try {
        let { page = 1, limit = 10, query = '{}', sortBy = 'createdAt', sortType = 'asc', userId } = req.query;

        // Parse and validate query
        query = JSON.parse(query);
        if (typeof query !== 'object') {
            throw new ApiError(401, "Invalid query object!");
        }

        sortType = sortType === 'desc' ? -1 : 1;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const sortOptions = {};
        sortOptions[sortBy] = sortType;

        // Fetch videos based on query, sort, and pagination
        const videos = await Video.find(query).sort(sortOptions).skip(skip).limit(parseInt(limit));

        if (!videos.length) {
            throw new ApiError(400, "No data found!");
        }

        // Count total documents matching the query
        const total = await Video.countDocuments(query);

        if (!total) {
            throw new ApiError(400, "No videos found!");
        }

        const totalPages = Math.ceil(total / limit);

        return res.status(200).json(
            new ApiResponse(200, { videos, totalPages }, "Video data fetched successfully")
        );

    } catch (error) {
        return res.status(500).json(
            new ApiError(500, "Failed to fetch data from server", error.message)
        );
    }
});


const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body

    if ([title, description].some((field) => field.trim() === "")) {
        throw new ApiError(401, "All field are required")
    }

    const videoFileLocalPath = req.files?.videoFile[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path

    if (!videoFileLocalPath || !thumbnailLocalPath) {
        throw new ApiError(401, "Video file and thumbnail both are required!")
    }

    const videoFile = await uploadOnCloudinary(videoFileLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    // console.log("cloudinary data :: ", videoFile)

    if (!videoFile || !thumbnail) {
        throw new ApiError(500, "Something went wrong white fetching video and thumbnail from cloud!")
    }

    const videoData = await Video.create({
        videoFile: {
            url: videoFile.playback_url,
            publicId: videoFile.public_id
        },
        thumbnail: {
            url: thumbnail.secure_url,
            publicId: thumbnail.public_id
        },
        title,
        description,
        duration: videoFile.duration,
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

    if (!isValidObjectId(videoId)) {
        throw new ApiError(404, "Video ID not match the record")
    }

    const video = await Video.findById(videoId)

    if (!video) {
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
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    const { title, description } = req.body;

    if ([title, description].some((field) => field.trim() === "")) {
        throw new ApiError(401, "All field are required")
    }

    const thumbnailLocalPath = req.file?.path

    if (!thumbnailLocalPath) {
        throw new ApiError(401, "Thumbnail image required!")
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if (!thumbnail) {
        throw new ApiError(500, "Something went wrong while fetching thumbnail from cloud!")
    }

    // const oldThumbnail = video.thumbnail

    await destroyCloudinaryImage(video.thumbnail.publicId)

    const videoData = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                title,
                description,
                thumbnail: {
                    url: thumbnail.secure_url,
                    publicId: thumbnail.public_id
                }
            }
        },
        { new: true }
    )

    return res
        .status(200)
        .json(
            new ApiResponse(200, videoData, "Video details updated successfully")
        )


    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(401, "Invalid video id")
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404, "Video not found!")
    }

    const thumbnailPublicId = video.thumbnail.publicId
    const videoPublicId = video.videoFile.publicId

    await Video.findByIdAndDelete(videoId)


    const imageDelete = await destroyCloudinaryImage(thumbnailPublicId)
    const videoDelete = await destroyCloudinaryVideo(videoPublicId)

    return res
        .status(200)
        .json(
            new ApiResponse(200, {imageDelete, videoDelete}, "Video deleted successfully")
        )

    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(401, "Invalid video id")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found!")
    }

    const publisState = await Video.findByIdAndUpdate(
        videoId,
        [
            {
                $set: {
                    isPublished: { $not: "$isPublished" }
                }
            }
        ],
        { new: true }
    ).select('isPublished')


    return res
        .status(200)
        .json(
            new ApiResponse(200, { isPublished: publisState }, "Video pushlish state updated successfully")
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
